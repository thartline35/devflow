import { cn } from "../../libs/utils";
import { Button } from "../../components/ui/button";
import { 
  Home, 
  GitBranch, 
  Package, 
  Users, 
  Settings, 
  BarChart3,
  FileText,
  Zap
} from "lucide-react";
import { useLocation, Link } from "react-router-dom";
import React from "react";

const navigation = [
  { name: "Dashboard", href: "/", icon: Home },
  { name: "Boards", href: "/boards", icon: BarChart3 },
  { name: "Repos", href: "/repos", icon: GitBranch },
  { name: "Pipelines", href: "/pipelines", icon: Zap },
  { name: "Artifacts", href: "/artifacts", icon: Package },
  { name: "Wiki", href: "/wiki", icon: FileText },
  { name: "Team", href: "/team", icon: Users },
  { name: "Settings", href: "/settings", icon: Settings },
];

export function Sidebar() {
  const location = useLocation();

  return (
    <div className="flex h-screen w-64 flex-col bg-sidebar">
      {/* Logo/Header */}
      <div className="flex h-16 items-center px-6 border-b border-sidebar-border">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-sidebar-primary flex items-center justify-center">
            <GitBranch className="h-5 w-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-sidebar-foreground">DevFlow</h1>
            <p className="text-xs text-sidebar-foreground/60">Development Platform</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = location.pathname === item.href;
          return (
            <Link key={item.name} to={item.href}>
              <Button
                variant="ghost"
                className={cn(
                  "w-full justify-start gap-3 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                  isActive && "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90"
                )}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Button>
            </Link>
          );
        })}
      </nav>

      {/* User section */}
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center space-x-3 px-3 py-2">
          <div className="h-8 w-8 rounded-full bg-sidebar-primary flex items-center justify-center">
            <span className="text-sm font-medium text-sidebar-primary-foreground">JD</span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">John Doe</p>
            <p className="text-xs text-sidebar-foreground/60 truncate">john@company.com</p>
          </div>
        </div>
      </div>
    </div>
  );
}