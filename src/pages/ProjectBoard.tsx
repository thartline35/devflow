import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { DragDropContext, Droppable, Draggable, DropResult } from 'react-beautiful-dnd';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { Plus } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';
import { CreateWorkItemDialog } from '../components/Dashboard/CreateWorkItemDialog';
import { ViewWorkItemDialog } from '../components/Dashboard/ViewWorkItemDialog';
import { ManageMembersDialog } from '../components/Dashboard/ManageMembersDialog';
import { useProjects } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { Avatar, AvatarFallback, AvatarImage } from '../components/ui/avatar';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../components/ui/tooltip';

// Define the structure of a work item based on our new model
interface Comment {
  _id: string;
  content: string;
  user: {
    _id: string;
    username: string;
  };
  createdAt: string;
}
interface WorkItem {
  _id: string;
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Done' | 'Backlog' | 'Cancelled';
  comments: Comment[];
  assignedTo?: {
    _id: string;
    username: string;
  };
  // Add other fields as needed, e.g., createdBy
}

interface Member {
  _id: string;
  username: string;
}

// Define the structure for columns on the board
interface Column {
  id: string;
  title: 'Backlog' | 'To Do' | 'In Progress' | 'Done' | 'Cancelled';
  items: WorkItem[];
}

const initialColumns: { [key: string]: Column } = {
  'backlog': { id: 'backlog', title: 'Backlog', items: [] },
  'todo': { id: 'todo', title: 'To Do', items: [] },
  'inprogress': { id: 'inprogress', title: 'In Progress', items: [] },
  'done': { id: 'done', title: 'Done', items: [] },
  'cancelled': { id: 'cancelled', title: 'Cancelled', items: [] },
};

const ProjectBoard = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const [columns, setColumns] = useState<{ [key: string]: Column }>(initialColumns);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [projectName, setProjectName] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isMembersDialogOpen, setIsMembersDialogOpen] = useState(false);
  const [selectedWorkItem, setSelectedWorkItem] = useState<WorkItem | null>(null);
  const { projects, createWorkItem, updateWorkItem, addComment, addMember, removeMember } = useProjects();
  const { user } = useAuth();

  const currentProject = projects.find(p => p._id === projectId);
  const isCreator = currentProject?.createdBy._id === user?._id;

  const fetchWorkItems = async () => {
    if (!projectId) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3001/api/projects/${projectId}/workitems`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      
      const projectRes = await axios.get(`http://localhost:3001/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const currentProj = projectRes.data.find((p: any) => p._id === projectId);
      if (currentProj) {
        setProjectName(currentProj.name);
      }

      // Group work items by status
      const newColumns = { ...initialColumns };
      Object.keys(newColumns).forEach(key => newColumns[key] = { ...newColumns[key], items: [] });

      res.data.forEach((item: WorkItem) => {
        const columnKey = item.status.toLowerCase().replace(' ', '');
        if (newColumns[columnKey]) {
          newColumns[columnKey].items.push(item);
        }
      });

      setColumns(newColumns);
      setError(null);
    } catch (err) {
      setError('Failed to fetch work items.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWorkItems();
  }, [projectId]);

  const handleCreateWorkItem = async (title: string, description: string, assignedTo?: string) => {
    if (!projectId) return;
    try {
      await createWorkItem(projectId, title, description, assignedTo);
      setIsCreateDialogOpen(false);
      await fetchWorkItems(); // Refresh work items
    } catch (error) {
      console.error("Failed to create work item:", error);
      // Optionally show an error to the user
    }
  };

  const handleUpdateWorkItem = async (workItemId: string, updates: { title?: string, description?: string, assignedTo?: string }) => {
    if (!projectId) return;
    try {
      await updateWorkItem(projectId, workItemId, updates);
      await fetchWorkItems(); // Refresh
    } catch (error) {
      console.error("Failed to update work item:", error);
    }
  };

  const handleAddComment = async (workItemId: string, content: string) => {
    if (!projectId) return;
    try {
      await addComment(projectId, workItemId, content);
      await fetchWorkItems(); // Refresh to see the new comment
      // Also update the selected work item to show the new comment immediately
      if (selectedWorkItem && selectedWorkItem._id === workItemId) {
        const res = await axios.get(`http://localhost:3001/api/projects/${projectId}/workitems`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` },
        });
        const updatedItems: WorkItem[] = res.data;
        const updatedItem = updatedItems.find(item => item._id === workItemId);
        setSelectedWorkItem(updatedItem || null);
      }
    } catch (error) {
      console.error("Failed to add comment:", error);
    }
  };

  const handleAddMember = async (email: string) => {
    if (!projectId) return;
    try {
      await addMember(projectId, email);
      // The project context will refetch projects, which will update the component
    } catch (error) {
      console.error("Failed to add member:", error);
    }
  };

  const handleRemoveMember = async (memberId: string) => {
    if (!projectId) return;
    try {
      await removeMember(projectId, memberId);
    } catch (error) {
      console.error("Failed to remove member:", error);
    }
  };

  const handleWorkItemClick = (item: WorkItem) => {
    setSelectedWorkItem(item);
    setIsViewDialogOpen(true);
  };

  const onDragEnd = (result: DropResult) => {
    const { source, destination } = result;
    if (!destination) return;

    // Moving within the same column
    if (source.droppableId === destination.droppableId) {
      // Not implemented: Reordering within a column
      return;
    }

    // Moving to a different column
    const sourceColumn = columns[source.droppableId];
    const destColumn = columns[destination.droppableId];
    const sourceItems = [...sourceColumn.items];
    const destItems = [...destColumn.items];
    const [removed] = sourceItems.splice(source.index, 1);
    destItems.splice(destination.index, 0, removed);

    // Update the item's status
    const newStatus = destColumn.title;
    const updatedItem = { ...removed, status: newStatus };

    setColumns({
      ...columns,
      [source.droppableId]: { ...sourceColumn, items: sourceItems },
      [destination.droppableId]: { ...destColumn, items: destItems },
    });

    // API call to update the work item status
    const updateStatus = async () => {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:3001/api/projects/${projectId}/workitems/${updatedItem._id}`, 
          { status: newStatus },
          { headers: { Authorization: `Bearer ${token}` } }
        );
      } catch (error) {
        console.error("Failed to update work item status:", error);
        // Revert state on failure
        setColumns(columns); 
      }
    };
    updateStatus();
  };

  if (loading) {
    return <div className="p-4"><Skeleton className="h-96 w-full" /></div>;
  }

  if (error) {
    return <div className="text-red-500 p-4">{error}</div>;
  }

  return (
    <div className="p-4 space-y-4">
      <CreateWorkItemDialog
        open={isCreateDialogOpen}
        onOpenChange={setIsCreateDialogOpen}
        onSubmit={handleCreateWorkItem}
        members={currentProject?.members || []}
      />
      <ViewWorkItemDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        workItem={selectedWorkItem}
        onUpdate={handleUpdateWorkItem}
        onAddComment={handleAddComment}
        members={currentProject?.members || []}
      />
      {currentProject && (
        <ManageMembersDialog
          open={isMembersDialogOpen}
          onOpenChange={setIsMembersDialogOpen}
          members={currentProject.members}
          onAddMember={handleAddMember}
          onRemoveMember={handleRemoveMember}
        />
      )}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">{projectName}</h1>
          <p className="text-muted-foreground">
            Drag and drop to organize your work items.
          </p>
        </div>
        <div className="flex gap-2">
          {isCreator && (
            <Button variant="outline" onClick={() => setIsMembersDialogOpen(true)}>
              Manage Members
            </Button>
          )}
          <Button className="gap-2" onClick={() => setIsCreateDialogOpen(true)}>
            <Plus className="h-4 w-4" />
            Add Work Item
          </Button>
        </div>
      </div>

      <DragDropContext onDragEnd={onDragEnd}>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 items-start">
          {Object.values(columns).map(column => (
            <Droppable key={column.id} droppableId={column.id}>
              {(provided, snapshot) => (
                <Card className={`flex flex-col ${snapshot.isDraggingOver ? 'bg-muted/50' : ''}`}>
                  <CardHeader>
                    <CardTitle className="text-base">{column.title} ({column.items.length})</CardTitle>
                  </CardHeader>
                  <CardContent 
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                    className="flex-grow min-h-[400px] p-2 space-y-2"
                  >
                    {column.items.map((item, index) => (
                      <Draggable key={item._id} draggableId={item._id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            {...provided.dragHandleProps}
                            className="p-3 rounded-md border bg-card text-card-foreground shadow-sm cursor-pointer"
                            onClick={() => handleWorkItemClick(item)}
                          >
                            <p className="font-medium">{item.title}</p>
                            {item.assignedTo && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Avatar className="h-6 w-6 mt-2">
                                      <AvatarImage src={`https://github.com/${item.assignedTo.username}.png`} alt={item.assignedTo.username} />
                                      <AvatarFallback>{item.assignedTo.username.charAt(0).toUpperCase()}</AvatarFallback>
                                    </Avatar>
                                  </TooltipTrigger>
                                  <TooltipContent>
                                    <p>Assigned to {item.assignedTo.username}</p>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </CardContent>
                </Card>
              )}
            </Droppable>
          ))}
        </div>
      </DragDropContext>
    </div>
  );
};

export default ProjectBoard;
