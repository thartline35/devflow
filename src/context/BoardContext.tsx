import React, { createContext, useContext, useState, ReactNode } from "react";

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

interface Activity {
  id: number;
  type: string;
  title: string;
  user: string;
  time: string;
  status: string;
}

interface BoardContextType {
  columns: Column[];
  addItem: (item: WorkItem, columnIndex: number) => void;
  moveItem: (itemId: string, fromColumn: number, toColumn: number) => void;
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

  const addItem = (item: WorkItem, columnIndex: number) => {
    setColumns((prev) => {
      const newCols = [...prev];
      newCols[columnIndex].items.push(item);
      return newCols;
    });
  };

  const moveItem = (itemId: string, fromColumn: number, toColumn: number) => {
    setColumns((prev) => {
      const newCols = [...prev];
      const itemIndex = newCols[fromColumn].items.findIndex((i) => i.id === itemId);
      if (itemIndex !== -1) {
        const [item] = newCols[fromColumn].items.splice(itemIndex, 1);
        newCols[toColumn].items.push(item);
      }
      return newCols;
    });
  };

  const addActivity = (activity: Omit<Activity, "id" | "time">) => {
    setActivities((prev) => [
      ...prev,
      {
        ...activity,
        id: Date.now(),
        time: new Date().toLocaleTimeString(),
      },
    ]);
  };

  return (
    <BoardContext.Provider value={{ columns, addItem, moveItem, activities, addActivity }}>
      {children}
    </BoardContext.Provider>
  );
};

export const useBoard = () => {
  const context = useContext(BoardContext);
  if (!context) throw new Error("useBoard must be used within BoardProvider");
  return context;
};
