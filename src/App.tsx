import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { MainLayout } from "./components/Layout/MainLayout";
import Dashboard from "./pages/Dashboard";
import ProjectBoard from "./pages/ProjectBoard";
import NotFound from "./pages/NotFound";
import React from "react";
import { AuthProvider } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import UserManagement from "./pages/Admin/UserManagement";
import PrivateRoute from './components/PrivateRoute';
import SetPassword from "./pages/SetPassword";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <ProjectProvider>
        <TooltipProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/signup" element={<Signup />} />
              <Route path="/set-password" element={<SetPassword />} />
              <Route
                path="/*"
                element={
                  <PrivateRoute>
                    <MainLayout>
                      <Routes>
                        <Route path="/" element={<Dashboard />} />
                        <Route path="/projects/:projectId/board" element={<ProjectBoard />} />
                        <Route path="/admin/users" element={
                          <PrivateRoute roles={['admin']}>
                            <UserManagement />
                          </PrivateRoute>
                        } />
                        <Route path="*" element={<NotFound />} />
                      </Routes>
                    </MainLayout>
                  </PrivateRoute>
                }
              />
            </Routes>
          </BrowserRouter>
        </TooltipProvider>
      </ProjectProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;
