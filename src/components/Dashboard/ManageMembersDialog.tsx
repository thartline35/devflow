import React, { useState } from 'react';
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
import { Label } from '../ui/label';
import { X } from 'lucide-react';

interface Member {
  _id: string;
  username: string;
}

interface ManageMembersDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  members: Member[];
  onAddMember: (email: string) => void;
  onRemoveMember: (memberId: string) => void;
}

export function ManageMembersDialog({
  open,
  onOpenChange,
  members,
  onAddMember,
  onRemoveMember,
}: ManageMembersDialogProps) {
  const [email, setEmail] = useState('');

  const handleAdd = () => {
    if (email) {
      onAddMember(email);
      setEmail('');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Manage Project Members</DialogTitle>
          <DialogDescription>
            Add or remove members from this project.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div>
            <Label htmlFor="email">Add by Email</Label>
            <div className="flex gap-2 mt-1">
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="member@example.com"
              />
              <Button onClick={handleAdd}>Add</Button>
            </div>
          </div>
          <div>
            <h4 className="font-medium">Current Members</h4>
            <div className="space-y-2 mt-2">
              {members.map((member) => (
                <div key={member._id} className="flex items-center justify-between p-2 rounded-md border">
                  <span>{member.username}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onRemoveMember(member._id)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
