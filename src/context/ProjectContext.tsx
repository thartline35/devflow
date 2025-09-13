import React, { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import axios from 'axios';
import { useAuth } from './AuthContext';

interface Project {
  _id: string;
  name: string;
  description: string;
  createdBy: {
    _id: string;
    username: string;
  };
  members: {
    _id: string;
    username: string;
  }[];
}

interface ProjectContextType {
  projects: Project[];
  loading: boolean;
  error: string | null;
  createProject: (name: string, description: string) => Promise<void>;
  addMember: (projectId: string, email: string) => Promise<void>;
  removeMember: (projectId: string, memberId: string) => Promise<void>;
  createWorkItem: (projectId: string, title: string, description: string, assignedTo?: string) => Promise<void>;
  updateWorkItem: (projectId: string, workItemId: string, updates: { title?: string; description?: string; status?: string; assignedTo?: string }) => Promise<void>;
  addComment: (projectId: string, workItemId: string, content: string) => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider = ({ children }: { children: ReactNode }) => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { user } = useAuth();

  const fetchProjects = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3001/api/projects', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setProjects(res.data);
      setError(null);
    } catch (err) {
      setError('Failed to fetch projects.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, [user]);

  const createProject = async (name: string, description: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('http://localhost:3001/api/projects', { name, description }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchProjects(); // Refetch to get the new project
    } catch (err) {
      console.error('Failed to create project:', err);
      // Optionally set an error state
    }
  };

  const addMember = async (projectId: string, email: string) => {
    try {
        const token = localStorage.getItem('token');
        await axios.post(`http://localhost:3001/api/projects/${projectId}/members`, { email }, {
            headers: { Authorization: `Bearer ${token}` },
        });
        await fetchProjects(); // Refetch to update members list
    } catch (err) {
        console.error('Failed to add member:', err);
    }
  };

  const removeMember = async (projectId: string, memberId: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`http://localhost:3001/api/projects/${projectId}/members/${memberId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      await fetchProjects(); // Refetch to update members list
    } catch (err) {
      console.error('Failed to remove member:', err);
      throw new Error('Failed to remove member');
    }
  };

  const createWorkItem = async (projectId: string, title: string, description: string, assignedTo?: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3001/api/projects/${projectId}/workitems`, { title, description, assignedTo }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Failed to create work item:', err);
      throw new Error('Failed to create work item');
    }
  };

  const updateWorkItem = async (projectId: string, workItemId: string, updates: { title?: string; description?: string; status?: string; assignedTo?: string }) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(`http://localhost:3001/api/projects/${projectId}/workitems/${workItemId}`, updates, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Failed to update work item:', err);
      throw new Error('Failed to update work item');
    }
  };

  const addComment = async (projectId: string, workItemId: string, content: string) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(`http://localhost:3001/api/projects/${projectId}/workitems/${workItemId}/comments`, { content }, {
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (err) {
      console.error('Failed to add comment:', err);
      throw new Error('Failed to add comment');
    }
  };

  return (
    <ProjectContext.Provider value={{ projects, loading, error, createProject, addMember, removeMember, createWorkItem, updateWorkItem, addComment }}>
      {children}
    </ProjectContext.Provider>
  );
};

export const useProjects = () => {
  const context = useContext(ProjectContext);
  if (context === undefined) {
    throw new Error('useProjects must be used within a ProjectProvider');
  }
  return context;
};
