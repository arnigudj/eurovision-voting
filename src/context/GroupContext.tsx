"use client";

import { Group } from "@/app/api/groups/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

type GroupContextType = {
  groups: Group[];
  isLoading?: boolean;
  isLoadError?: boolean;
};

const GroupContext = createContext<GroupContextType>({
  groups: [],
  isLoading: true,
  isLoadError: false,
});

export function GroupProvider({ children }: { children: React.ReactNode }) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoadError, setIsLoadError] = useState<boolean>(false);
  const [isGroupsLoading, setIsGroupsLoading] = useState<boolean>(true);

  const loadGroups = useCallback(async () => {
    try {
      setIsGroupsLoading(true);
      const groupRes = await fetch(`/api/groups`);
      const groupData: Group[] = await groupRes.json();
      setGroups(groupData);
    } catch (error) {
      console.error(error);
      setIsLoadError(true);
    } finally {
      setIsGroupsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadGroups();
  }, [loadGroups]);

  return (
    <GroupContext.Provider
      value={{
        groups,
        isLoading: isGroupsLoading,
        isLoadError,
      }}
    >
      {children}
    </GroupContext.Provider>
  );
}

export function useGroup() {
  return useContext(GroupContext);
}
