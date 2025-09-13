import { Card, CardContent, CardHeader, CardTitle } from "../../components/ui/card";
import { Avatar, AvatarFallback } from "../../components/ui/avatar";
import { Badge } from "../../components/ui/badge";
import { GitCommit, GitPullRequest, AlertCircle, CheckCircle } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useBoard } from "../../context/BoardContext";
import axios from "axios";
import { Activity } from "../../context/BoardContext";
import { format } from "date-fns";

export function RecentActivity() {
  const { activities } = useBoard();
  const [activitiesData, setActivities] = useState<Activity[]>([]);

  useEffect(() => {
    const fetchActivities = async () => {
      const token = localStorage.getItem("token");
      const res = await axios.get("/api/activities", { headers: { Authorization: `Bearer ${token}` } });
      setActivities(res.data);
    };
    fetchActivities();
  }, []);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {activitiesData.map((activity) => (
          <div key={activity._id} className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
              </div>
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium truncate">{activity.title}</p>
                <Badge 
                  variant={
                    // Use "default" for success, "destructive" for error, otherwise "secondary"
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
                <span className="text-xs text-muted-foreground">{format(activity.timestamp, "hh:mm a")}</span>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}