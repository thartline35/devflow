import React from 'react';
import { Link } from 'react-router-dom';
import { useProjects } from '../context/ProjectContext';
import { MetricCard } from '../components/Dashboard/MetricCard';
import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card';
import { Button } from '../components/ui/button';
import { GitBranch, Users, Plus, FolderKanban } from 'lucide-react';
import { Skeleton } from '../components/ui/skeleton';

export default function Dashboard() {
  const { projects, loading, error, createProject } = useProjects();

  const handleCreateProject = async () => {
    const name = prompt("Enter project name:");
    if (name) {
      const description = prompt("Enter project description:");
      if (description !== null) {
        await createProject(name, description);
      }
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-1/4" />
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
          <Skeleton className="h-32" />
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Skeleton className="lg:col-span-2 h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  const totalProjects = projects.length;
  const uniqueMembers = new Set(projects.flatMap(p => p.members.map(m => m._id)));
  const teamMembersCount = uniqueMembers.size;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your projects and team activity.
          </p>
        </div>
        <Button className="gap-2" onClick={handleCreateProject}>
          <Plus className="h-4 w-4" />
          Create Project
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Projects"
          value={totalProjects.toString()}
          icon={FolderKanban}
        />
        <MetricCard
          title="Team Members"
          value={teamMembersCount.toString()}
          icon={Users}
        />
        <MetricCard
          title="Open Pull Requests"
          value="8"
          change="2 need review"
          changeType="neutral"
          icon={GitBranch}
        />
        <MetricCard
          title="Active Sprints"
          value="3"
          icon={FolderKanban}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>My Projects</CardTitle>
          </CardHeader>
          <CardContent>
            {projects.length > 0 ? (
              <div className="space-y-4">
                {projects.map(project => (
                  <Link to={`/projects/${project._id}/board`} key={project._id} className="block p-4 rounded-lg border hover:bg-muted transition-colors">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold">{project.name}</h3>
                      <span className="text-xs text-muted-foreground">
                        {project.members.length} members
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-1 truncate">{project.description}</p>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No projects yet.</p>
                <Button variant="link" onClick={handleCreateProject}>Create your first project</Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Quick Actions can be repurposed or kept */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2" onClick={handleCreateProject}>
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
            {/* Other quick actions */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}