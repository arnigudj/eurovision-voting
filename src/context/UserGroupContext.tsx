"use client";

import { Group } from "@/app/api/groups/types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { useUser } from "./UserContext";
import { UserGroup } from "@/app/api/users/[id]/groups/types";
import { useGroup } from "./GroupContext";

type UserGroupContextType = {
  userGroups: UserGroup[];
  joined: Group[];
  setJoined: (j: Group[]) => void;
  isLoading?: boolean;
  isLoadError?: boolean;
};

const UserGroupContext = createContext<UserGroupContextType>({
  userGroups: [],
  joined: [],
  setJoined: () => {},
  isLoading: true,
  isLoadError: false,
});

export function UserGroupProvider({ children }: { children: React.ReactNode }) {
  const { user } = useUser();
  const { groups } = useGroup();
  const [userGroups, setUserGroups] = useState<UserGroup[]>([]);
  const [joined, setJoinedState] = useState<Group[]>([]);
  const [isLoadError, setIsLoadError] = useState<boolean>(false);
  const [isUserGroupsLoading, setIsUserGroupsLoading] = useState<boolean>(true);

  const setJoined = (j: Group[]) => {
    setJoinedState(j);
  };

  const loadUserGroups = useCallback(async (userId: string) => {
    try {
      setIsUserGroupsLoading(true);
      const userGroupsRes = await fetch(`/api/users/${userId}/groups`);
      const userGroupsData: UserGroup[] = await userGroupsRes.json();
      setUserGroups(userGroupsData);
    } catch (error) {
      console.error(error);
      setIsLoadError(true);
    } finally {
      setIsUserGroupsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.id) {
      loadUserGroups(user.id);
    }
  }, [user?.id, loadUserGroups]);

  useEffect(() => {
    if (userGroups.length > 0 && groups.length > 0) {
      const myGroups = groups.filter((g) =>
        userGroups.find((j) => j.group_id === g.id)
      );
      setJoinedState(myGroups);
    }
  }, [userGroups, groups]);

  return (
    <UserGroupContext.Provider
      value={{
        userGroups,
        joined,
        isLoading: isUserGroupsLoading,
        isLoadError,
        setJoined,
      }}
    >
      {children}
    </UserGroupContext.Provider>
  );
}

export function useUserGroup() {
  return useContext(UserGroupContext);
}
