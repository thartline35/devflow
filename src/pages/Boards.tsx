"use client";
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Plus, MoreHorizontal, User, Calendar } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { useBoard } from "../context/BoardContext";
import { useToast } from "../components/ui/use-toast";
import { useAuth } from "../context/AuthContext";

interface WorkItem {
  id: string;
  title: string;
  type: "Feature" | "Bug" | "Task";
  assignee: string;
  priority: "Critical" | "High" | "Medium" | "Low";
  storyPoints: number;
  tags: string[];
  description?: string;
}

type Column = { title: string; items: WorkItem[] };

const typeColors = {
  Feature: "default",
  Bug: "destructive",
  Task: "secondary",
} as const;

const priorityColors = {
  Critical: "destructive",
  High: "default",
  Medium: "secondary",
  Low: "outline",
} as const;

const columns: Column[] = [
  {
    title: "To Do",
    items: [
      {
        id: "1",
        title: "Implement user authentication",
        type: "Feature",
        assignee: "JD",
        priority: "High",
        storyPoints: 8,
        tags: ["Frontend", "Security"],
      },
      {
        id: "2",
        title: "Design system documentation",
        type: "Task",
        assignee: "SW",
        priority: "Medium",
        storyPoints: 3,
        tags: ["Documentation"],
      },
    ],
  },
  {
    title: "In Progress",
    items: [
      {
        id: "3",
        title: "API rate limiting",
        type: "Feature",
        assignee: "MC",
        priority: "High",
        storyPoints: 5,
        tags: ["Backend", "Performance"],
      },
      {
        id: "4",
        title: "Fix login redirect bug",
        type: "Bug",
        assignee: "JD",
        priority: "Critical",
        storyPoints: 2,
        tags: ["Frontend", "Bug"],
      },
    ],
  },
  {
    title: "In Review",
    items: [
      {
        id: "5",
        title: "Dashboard analytics",
        type: "Feature",
        assignee: "SW",
        priority: "Medium",
        storyPoints: 13,
        tags: ["Frontend", "Analytics"],
      },
    ],
  },
  {
    title: "Done",
    items: [
      {
        id: "6",
        title: "Setup CI/CD pipeline",
        type: "Task",
        assignee: "MC",
        priority: "High",
        storyPoints: 8,
        tags: ["DevOps", "Infrastructure"],
      },
      {
        id: "7",
        title: "Database migration script",
        type: "Task",
        assignee: "JD",
        priority: "Medium",
        storyPoints: 5,
        tags: ["Backend", "Database"],
      },
    ],
  },
];

function WorkItemCard({ item, columnIndex }: { item: WorkItem; columnIndex: number }) {
  const { moveItem, addActivity } = useBoard();

  const handleMove = (toColumn: number) => {
    moveItem(item.id, columnIndex, toColumn);
    addActivity({
        type: "move",
        title: `Moved "${item.title}" to ${columns[toColumn].title}`,
        user: "You",
        status: "success",
        _id: "",
        timestamp: new Date()
    });
  };

  return (
    <Card className="mb-3 cursor-pointer hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-2">
          <Badge variant={typeColors[item.type]}>{item.type}</Badge>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem>Edit</DropdownMenuItem>
              <DropdownMenuItem>Assign</DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleMove( (columnIndex + 1) % 4 )}>Move to Next</DropdownMenuItem> {/* Simple move to next */}
              <DropdownMenuItem className="text-destructive">Delete</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        
        <h3 className="font-medium mb-3 text-sm leading-tight">{item.title}</h3>
        
        <div className="flex flex-wrap gap-1 mb-3">
          {item.tags.map((tag: string) => (
            <Badge key={tag} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
        
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Avatar className="h-6 w-6">
              <AvatarFallback className="text-xs">{item.assignee}</AvatarFallback>
            </Avatar>
            <Badge 
              variant={priorityColors[item.priority]}
              className="text-xs"
            >
              {item.priority}
            </Badge>
          </div>
          <div className="flex items-center space-x-1 text-xs text-muted-foreground">
            <User className="h-3 w-3" />
            <span>{item.storyPoints}</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Boards() {
  const { columns, addItem, addActivity } = useBoard();
  const [newItem, setNewItem] = useState<Partial<WorkItem>>({});
  const { toast } = useToast();
  const { user } = useAuth();

  // Add check for user
  if (!user) return <div>Please log in</div>;

  const addNewItem = () => {
    if (!newItem.title || !newItem.type || !newItem.priority) return;

    const item: WorkItem = {
      id: Date.now().toString(),
      title: newItem.title,
      type: newItem.type,
      assignee: newItem.assignee || "Unassigned",
      priority: newItem.priority,
      storyPoints: newItem.storyPoints || 1,
      tags: newItem.tags || [],
      description: newItem.description,
    };

    addItem(item, 0); // Add to To Do

    addActivity({
        type: "create",
        title: `Created new ${item.type}: "${item.title}"`,
        user: user.username || "Anonymous",
        status: "success",
        _id: "",
        timestamp: new Date()
    });

    setNewItem({});
    toast({ title: "Item added", description: "New work item created successfully." });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Sprint Board</h1>
          <p className="text-muted-foreground">
            Sprint 24 - Authentication & Dashboard Features
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            <Calendar className="h-4 w-4 mr-2" />
            Sprint Settings
          </Button>
          <Button size="sm">
            <Plus className="h-4 w-4 mr-2" />
            New Work Item
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column, colIndex) => (
          <div key={column.title} className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold text-sm">{column.title}</h2>
              <Badge variant="secondary">{column.items.length}</Badge>
            </div>
            
            <div className="space-y-3">
              {column.items.map((item, itemIndex) => (
                <WorkItemCard key={item.id} item={item} columnIndex={colIndex} />
              ))}
              
              <Button 
                variant="ghost" 
                className="w-full border-2 border-dashed border-muted-foreground/25 h-12"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add item
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}