'use client';

import { User } from '@/app/api/users/types';
import { createContext, useContext, useEffect, useState } from 'react';

type UserContextType = {
  user?: User;
  setUser: (user: User) => void;
  logout: () => void;
};

const UserContext = createContext<UserContextType>({
  user: undefined,
  setUser: () => {},
  logout: () => {}
});

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUserState] = useState<User>();

  useEffect(() => {
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.id) setUserState(parsed);
      } catch {
        localStorage.removeItem('user');
      }
    }
  }, []);

  const setUser = (user: User) => {
    localStorage.setItem('user', JSON.stringify(user));
    setUserState(user);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUserState(undefined);
  };

  return (
    <UserContext.Provider value={{ user, setUser, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
