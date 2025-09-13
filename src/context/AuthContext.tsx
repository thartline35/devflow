import React, { createContext, useState, useEffect, ReactNode } from "react";
import axios from "axios";
import jwtDecode from "jwt-decode";

interface User {
  id: string;
  role: string;
  username: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string, role: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode<User>(token);
      setUser(decoded);
    }
  }, []);

  const login = async (email: string, password: string) => {
    const res = await axios.post("http://localhost:3001/api/auth/login", { email, password });
    localStorage.setItem("token", res.data.token);
    const decoded = jwtDecode<User>(res.data.token);
    setUser(decoded);
  };

  const signup = async (username: string, email: string, password: string, role: string) => {
    await axios.post("http://localhost:3001/api/auth/signup", { username, email, password, role });
    await login(email, password); // Auto-login after signup
  };

  const logout = () => {
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
