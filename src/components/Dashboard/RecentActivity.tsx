import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { GitCommit, GitPullRequest, AlertCircle, CheckCircle } from "lucide-react";
import React from "react";
import { useBoard } from "../../context/BoardContext";

export function RecentActivity() {
  const { activities } = useBoard();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activities.map((activity) => (
          <div key={activity.id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate">{activity.title}</p>
                <Badge 
                  variant={
                    activity.status === "success" ? "default" : 
                    activity.status === "error" ? "destructive" : 
                    "secondary"
                  }
                  className="text-xs"
                >
                  {activity.status}
                </Badge>
              </div>
              <div className="flex items-center space-x-2 mt-1">
                <Avatar className="h-4 w-4">
                  <AvatarFallback className="text-xs">
                    {activity.user.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs text-muted-foreground">{activity.user}</span>
                <span className="text-xs text-muted-foreground">•</span>
                <span className="text-xs text-muted-foreground">{activity.time}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}