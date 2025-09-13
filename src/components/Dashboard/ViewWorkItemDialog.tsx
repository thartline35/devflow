import React, { useState, useEffect } from 'react';
import { Button } from '../ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

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
  status: string;
  comments: Comment[];
  assignedTo?: {
    _id: string;
    username: string;
  };
}

interface Member {
  _id: string;
  username: string;
}

interface ViewWorkItemDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workItem: WorkItem | null;
  onUpdate: (id: string, updates: { title?: string, description?: string, assignedTo?: string }) => void;
  onAddComment: (id: string, content: string) => void;
  members: Member[];
}

export function ViewWorkItemDialog({
  open,
  onOpenChange,
  workItem,
  onUpdate,
  onAddComment,
  members,
}: ViewWorkItemDialogProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [assignedTo, setAssignedTo] = useState<string | undefined>(undefined);
  const [newComment, setNewComment] = useState('');

  useEffect(() => {
    if (workItem) {
      setTitle(workItem.title);
      setDescription(workItem.description);
      setAssignedTo(workItem.assignedTo?._id);
    }
  }, [workItem]);

  if (!workItem) return null;

  const handleUpdate = () => {
    const updates: { title?: string, description?: string, assignedTo?: string } = {};
    if (title !== workItem.title) updates.title = title;
    if (description !== workItem.description) updates.description = description;
    if (assignedTo !== workItem.assignedTo?._id) updates.assignedTo = assignedTo === 'unassigned' ? undefined : assignedTo;
    
    if (Object.keys(updates).length > 0) {
      onUpdate(workItem._id, updates);
    }
  };

  const handleAddComment = () => {
    if (newComment.trim()) {
      onAddComment(workItem._id, newComment);
      setNewComment('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-2xl font-bold border-none focus:ring-0 p-0"
            />
          </DialogTitle>
          <Badge>{workItem.status}</Badge>
          {workItem.assignedTo && (
            <div className="text-sm text-muted-foreground mt-2">
              Assigned to: <Badge variant="secondary">{workItem.assignedTo.username}</Badge>
            </div>
          )}
        </DialogHeader>
        <div className="py-4 space-y-6">
          <div>
            <Label htmlFor="description" className="font-semibold">Description</Label>
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="mt-2"
              rows={6}
            />
            <div className="flex justify-between items-center mt-2">
              <div className="w-1/2">
                <Label htmlFor="assignee" className="font-semibold">Assign To</Label>
                <Select value={assignedTo || 'unassigned'} onValueChange={setAssignedTo}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Unassigned" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unassigned">Unassigned</SelectItem>
                    {members.map((member) => (
                      <SelectItem key={member._id} value={member._id}>
                        {member.username}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button onClick={handleUpdate}>Save Changes</Button>
            </div>
          </div>
          <div className="space-y-4">
            <h3 className="font-semibold">Comments</h3>
            <div className="space-y-3">
              {workItem.comments.map((comment) => (
                <div key={comment._id} className="flex items-start gap-3">
                  <div className="text-sm">
                    <p className="font-bold">{comment.user.username}</p>
                    <p>{comment.content}</p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(comment.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Add a comment..."
              />
              <Button onClick={handleAddComment}>Comment</Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
