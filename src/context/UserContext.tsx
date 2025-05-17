"use client";

import { User } from "@/app/api/users/types";
import { createContext, useContext, useEffect, useState } from "react";

type UserContextType = {
  user?: User;
  setUser: (user: User) => void;
  logout: () => void;
  isLoading: boolean;
};

const UserContext = createContext<UserContextType>({
  user: undefined,
  setUser: () => {},
  logout: () => {},
  isLoading: true,
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User>();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const stored = localStorage.getItem("user");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.id) setUserState(parsed);
      } catch {
        localStorage.removeItem("user");
      }
    }
    setIsLoading(false);
  }, []);

  const setUser = (user: User) => {
    localStorage.setItem("user", JSON.stringify(user));
    setUserState(user);
  };

  const logout = () => {
    localStorage.removeItem("user");
    setUserState(undefined);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout, isLoading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
