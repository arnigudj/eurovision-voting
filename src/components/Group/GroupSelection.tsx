"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/context/UserContext";
import { UserGroup } from "@/app/api/users/[id]/groups/types";
import ButtonCard from "../Button/ButtonCard";
import styles from "./GroupSelection.module.scss";
import { Group } from "@/app/api/groups/types";
import Callout from "../Callout/Callout";

interface Props {
    onJoin?: (group:Group) => void;
}

export default function GroupSelection({onJoin}: Props) {
  const { user } = useUser();
  const [groups, setGroups] = useState<Group[]>([]);
  const [joined, setJoined] = useState<UserGroup[]>([]);

  useEffect(() => {
    if (!user) return;

    const load = async () => {
      const [groupsRes, joinedRes] = await Promise.all([
        fetch(`/api/groups`),
        fetch(`/api/users/${user.id}/groups`),
      ]);

      setGroups(await groupsRes.json());
      setJoined(await joinedRes.json());
    };

    load();
  }, [user]);

  const toggleGroup = async (groupId: string, isInGroup: boolean) => {
    const method = isInGroup ? "DELETE" : "POST";
    const url = isInGroup
      ? `/api/groups/leave?user_id=${user?.id}&group_id=${groupId}`
      : `/api/groups/join?user_id=${user?.id}&group_id=${groupId}`;

    const res = await fetch(url, {
      method,
      headers: isInGroup ? undefined : { "Content-Type": "application/json" },
      body: JSON.stringify({ user_id: user?.id, group_id: groupId }),
    });

    if (!res.ok) {
      return;
    }

    const data = await res.json();

    setJoined((prev) => {
      let newSet;
      if (isInGroup) newSet = prev.filter((i) => i.group_id !== groupId);
      else newSet = [...prev, data];
      return newSet;
    });

    if(onJoin && !isInGroup) onJoin(data);
  };

  if (!user) return null;
  // my groups
  const myGroups = groups.filter((g) =>
    joined.find((j) => j.group_id === g.id)
  );
  const otherGroups = groups.filter(
    (g) => !joined.find((j) => j.group_id === g.id)
  );

  return (
    <div className={styles.container}>
      <h2>Your parties</h2>
      <div className={styles.groups}>
        {myGroups.length === 0 && (
          <Callout>
            You are not in any party. <br />
            <strong>Join one to start voting you party pooper!</strong>
          </Callout>
        )}
        {myGroups.map((group) => {
          const isInGroup = !!joined.find((j) => j.group_id === group.id);
          return (
            <ButtonCard
              key={group.id}
              onClick={() => toggleGroup(group.id, isInGroup)}
              className={`${styles.groupCard} ${
                isInGroup ? styles.inGroup : ""
              }`}
            >
              <strong>{group.name}</strong>
              <span>{isInGroup ? "Leave" : "Join"}</span>
            </ButtonCard>
          );
        })}
      </div>
      <div className={styles.groups}>
        <h6>Join a party</h6>
        {otherGroups.map((group) => {
          const isInGroup = !!joined.find((j) => j.group_id === group.id);
          return (
            <ButtonCard
              key={group.id}
              onClick={() => toggleGroup(group.id, isInGroup)}
              className={`${styles.groupCard} ${
                isInGroup ? styles.inGroup : ""
              }`}
            >
              <strong>{group.name}</strong>
              <span>{isInGroup ? "Leave" : "Join"}</span>
            </ButtonCard>
          );
        })}
      </div>
    </div>
  );
}
