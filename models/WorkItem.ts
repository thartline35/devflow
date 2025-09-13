import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  text: string;
  author: mongoose.Schema.Types.ObjectId;
  createdAt: Date;
}

const CommentSchema: Schema = new Schema({
  text: { type: String, required: true },
  author: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
});

export interface IWorkItem extends Document {
  title: string;
  description: string;
  status: 'To Do' | 'In Progress' | 'Done' | 'Backlog' | 'Cancelled';
  projectId: mongoose.Schema.Types.ObjectId;
  assignedTo?: mongoose.Schema.Types.ObjectId;
  createdBy: mongoose.Schema.Types.ObjectId;
  comments: IComment[];
}

const WorkItemSchema: Schema = new Schema({
  title: { type: String, required: true },
  description: { type: String, default: '' },
  status: { 
    type: String, 
    enum: ['To Do', 'In Progress', 'Done', 'Backlog', 'Cancelled'], 
    default: 'To Do' 
  },
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  comments: [CommentSchema],
});

export default mongoose.model<IWorkItem>('WorkItem', WorkItemSchema);
