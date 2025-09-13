import React, { createContext, useContext, useState, ReactNode, useEffect } from "react";
import axios from "axios";

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

interface Column {
  title: string;
  items: WorkItem[];
}

export interface Activity {
  _id: string;
  type: string;
  title: string;
  user: string;
  status: string;
  timestamp: Date;
}

interface BoardContextType {
  columns: Column[];
  loading: boolean;
  error: string | null;
  addItem: (item: WorkItem, columnIndex: number) => Promise<void>;
  moveItem: (itemId: string, fromColumn: number, toColumn: number) => Promise<void>;
  deleteItem: (itemId: string, columnIndex: number) => Promise<void>;
  activities: Activity[];
  addActivity: (activity: Omit<Activity, "id" | "time">) => void;
}

const BoardContext = createContext<BoardContextType | undefined>(undefined);

export const BoardProvider = ({ children }: { children: ReactNode }) => {
  const [columns, setColumns] = useState<Column[]>([
    { title: "To Do", items: [] },
    { title: "In Progress", items: [] },
    { title: "In Review", items: [] },
    { title: "Done", items: [] },
  ]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadWorkItems = async () => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/workitems", { headers: { Authorization: `Bearer ${token}` } });
        const workItems = res.data;

        // Group items by column
        const groupedItems: { [key: string]: WorkItem[] } = {
          "To Do": [],
          "In Progress": [],
          "In Review": [],
          "Done": [],
        };

        workItems.forEach((item: any) => {
          const columnName = item.column || "To Do"; // Default to To Do if no column
          if (groupedItems[columnName]) {
            groupedItems[columnName].push({
              id: item._id,
              title: item.title,
              type: item.type,
              assignee: item.assignee,
              priority: item.priority,
              storyPoints: item.storyPoints,
              tags: item.tags,
              description: item.description,
            });
          }
        });

        setColumns([
          { title: "To Do", items: groupedItems["To Do"] },
          { title: "In Progress", items: groupedItems["In Progress"] },
          { title: "In Review", items: groupedItems["In Review"] },
          { title: "Done", items: groupedItems["Done"] },
        ]);
      } catch (error) {
        console.error("Failed to load work items:", error);
        setError("Failed to load work items. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    loadWorkItems();
  }, []);

  const addItem = async (item: WorkItem, columnIndex: number) => {
    try {
      const token = localStorage.getItem("token");
      const columnTitles = ["To Do", "In Progress", "In Review", "Done"];
      const workItemData = {
        title: item.title,
        type: item.type,
        assignee: item.assignee,
        priority: item.priority,
        storyPoints: item.storyPoints,
        tags: item.tags,
        description: item.description,
        column: columnTitles[columnIndex],
      };

      const res = await axios.post("/api/workitems", workItemData, { headers: { Authorization: `Bearer ${token}` } });
      const savedItem = res.data;

      // Add to local state
      setColumns((prev) => {
        const newCols = [...prev];
        newCols[columnIndex].items.push({
          ...item,
          id: savedItem._id,
        });
        return newCols;
      });
    } catch (error) {
      console.error("Failed to add work item:", error);
    }
  };

  const moveItem = async (itemId: string, fromColumn: number, toColumn: number) => {
    try {
      const token = localStorage.getItem("token");
      const columnTitles = ["To Do", "In Progress", "In Review", "Done"];
      await axios.put(`/api/workitems/${itemId}`, { column: columnTitles[toColumn] }, { headers: { Authorization: `Bearer ${token}` } });

      // Update local state
      setColumns((prev) => {
        const newCols = [...prev];
        const itemIndex = newCols[fromColumn].items.findIndex((i) => i.id === itemId);
        if (itemIndex !== -1) {
          const [item] = newCols[fromColumn].items.splice(itemIndex, 1);
          newCols[toColumn].items.push(item);
        }
        return newCols;
      });
    } catch (error) {
      console.error("Failed to move work item:", error);
    }
  };

  const deleteItem = async (itemId: string, columnIndex: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/workitems/${itemId}`, { headers: { Authorization: `Bearer ${token}` } });

      setColumns(prev => {
        const newCols = [...prev];
        newCols[columnIndex].items = newCols[columnIndex].items.filter(item => item.id !== itemId);
        return newCols;
      });
    } catch (error) {
      console.error("Failed to delete item", error);
    }
  };

  const addActivity = (activity: Omit<Activity, "id" | "time">) => {
    setActivities((prev) => [
      ...prev,
      {
        ...activity,
        _id: Date.now().toString(),
        timestamp: new Date(),
      },
    ]);
  };

  return (
    <BoardContext.Provider value={{ columns, loading, error, addItem, moveItem, deleteItem, activities, addActivity }}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) throw new Error("useBoard must be used within BoardProvider");
  return context;
};
