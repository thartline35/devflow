import { MetricCard } from "../components/Dashboard/MetricCard";
import { RecentActivity } from "../components/Dashboard/RecentActivity";
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Progress } from "../components/ui/progress";
import { Badge } from "../components/ui/badge";
import { 
  Users, 
  GitBranch, 
  CheckCircle, 
  Clock,
  TrendingUp,
  AlertTriangle,
  Calendar,
  GitCommit,
  Plus
} from "lucide-react";
import React, { useState, useEffect } from "react";
import { useBoard } from "../context/BoardContext";
import axios from "axios";

export default function Dashboard() {
  const { columns } = useBoard();
  const [teamMembersCount, setTeamMembersCount] = useState(0);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/users", { headers: { Authorization: `Bearer ${token}` } });
        setTeamMembersCount(res.data.length);
      } catch (error) {
        console.error("Failed to fetch users:", error);
      }
    };
    fetchUsers();
  }, []);

  const totalItems = columns.reduce((sum, col) => sum + col.items.length, 0);
  const doneItems = columns.find(col => col.title === 'Done')?.items.length || 0;
  const progress = totalItems > 0 ? (doneItems / totalItems) * 100 : 0;

  // Other metrics can be derived similarly

  const handleCreateProject = async () => {
    const name = prompt("Project Name");
    const description = prompt("Description");
    await axios.post("/api/projects", { name, description }, { headers: { Authorization: `Bearer ${localStorage.getItem("token")}` } });
    // Refetch or update
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Overview of your development projects and team activity
          </p>
        </div>
        <Button className="gap-2">
          <Calendar className="h-4 w-4" />
          Sprint Planning
        </Button>
      </div>

      {/* Metrics Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Active Work Items"
          value={totalItems.toString()}
          change="+12% from last sprint"
          changeType="positive"
          icon={CheckCircle}
          trend={[10, 15, 20, 24]}
        />
        <MetricCard
          title="Open Pull Requests"
          value="8"
          change="2 need review"
          changeType="neutral"
          icon={GitBranch}
          trend={[12, 10, 9, 8]}
        />
        <MetricCard
          title="Build Success Rate"
          value="94%"
          change="+2% this week"
          changeType="positive"
          icon={TrendingUp}
          trend={[88, 90, 92, 94]}
        />
        <MetricCard
          title="Team Members"
          value={teamMembersCount.toString()}
          change="Active members"
          changeType="neutral"
          icon={Users}
          trend={[8, 9, 10, teamMembersCount]}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sprint Progress */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Current Sprint Progress</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Sprint 24 - Authentication & Dashboard</span>
                <span className="text-muted-foreground">8 of 15 days</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>
            
            <div className="grid grid-cols-2 gap-4 mt-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">To Do</span>
                  <Badge variant="secondary">{columns.find(c => c.title === 'To Do')?.items.length || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">In Progress</span>
                  <Badge variant="default">{columns.find(c => c.title === 'In Progress')?.items.length || 0}</Badge>
                </div>
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">In Review</span>
                  <Badge variant="outline">{columns.find(c => c.title === 'In Review')?.items.length || 0}</Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Done</span>
                  <Badge className="bg-success">{columns.find(c => c.title === 'Done')?.items.length || 0}</Badge>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button variant="outline" className="w-full justify-start gap-2">
              <CheckCircle className="h-4 w-4" />
              Create Work Item
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <GitBranch className="h-4 w-4" />
              New Branch
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <GitCommit className="h-4 w-4" />
              Create Pull Request
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2" onClick={handleCreateProject}>
              <Plus className="h-4 w-4" />
              Create Project
            </Button>
            <Button variant="outline" className="w-full justify-start gap-2">
              <Clock className="h-4 w-4" />
              Schedule Release
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <RecentActivity />
        
        {/* Build Status */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Builds</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              { name: "main", status: "success", time: "2 min ago", duration: "3m 24s" },
              { name: "feature/auth", status: "success", time: "1 hour ago", duration: "2m 56s" },
              { name: "feature/dashboard", status: "failed", time: "3 hours ago", duration: "1m 12s" },
              { name: "develop", status: "success", time: "6 hours ago", duration: "4m 01s" },
            ].map((build, index) => (
              <div key={index} className="flex items-center justify-between p-3 rounded-lg border">
                <div className="flex items-center space-x-3">
                  {build.status === "success" ? (
                    <CheckCircle className="h-4 w-4 text-success" />
                  ) : (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  )}
                  <div>
                    <p className="font-medium text-sm">{build.name}</p>
                    <p className="text-xs text-muted-foreground">{build.time}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge 
                    variant={build.status === "success" ? "default" : "destructive"}
                    className="mb-1"
                  >
                    {build.status}
                  </Badge>
                  <p className="text-xs text-muted-foreground">{build.duration}</p>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}