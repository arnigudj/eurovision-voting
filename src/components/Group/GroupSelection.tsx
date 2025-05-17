"use client";

import { useUser } from "@/context/UserContext";
import ButtonCard from "../Button/ButtonCard";
import styles from "./GroupSelection.module.scss";
import Callout from "../Callout/Callout";
import { useGroup } from "@/context/GroupContext";
import { useUserGroup } from "@/context/UserGroupContext";
import { Group } from "@/app/api/groups/types";

export default function GroupSelection({}) {
  const { user } = useUser();
  const { groups } = useGroup();
  const { joined, setJoined } = useUserGroup();

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

    let newSet: Group[] = [];
    if (isInGroup) newSet = joined.filter((i) => i.id !== groupId);
    else {
      const newGroup = groups.find((g) => g.id === groupId);
      if (newGroup) {
        newSet = [...joined, newGroup];
      }
    }
    setJoined(newSet);
  };

  if (!user) return null;
  // my groups

  const otherGroups = groups.filter((g) => !joined.find((j) => j.id === g.id));

  return (
    <div className={styles.container}>
      <h2>Your parties</h2>
      <div className={styles.groups}>
        {joined.length === 0 && (
          <Callout>
            You are not in any party. <br />
            <strong>Join one to start voting you party pooper!</strong>
          </Callout>
        )}
        {joined.map((group) => {
          return (
            <ButtonCard
              key={group.id}
              onClick={() => toggleGroup(group.id, true)}
              className={`${styles.groupCard} ${styles.inGroup}`}
            >
              <strong>{group.name}</strong>
              <span>Leave</span>
            </ButtonCard>
          );
        })}
      </div>
      <div className={styles.groups}>
        <h6>Join a party</h6>
        {otherGroups.map((group) => {
          return (
            <ButtonCard
              key={group.id}
              onClick={() => toggleGroup(group.id, false)}
              className={`${styles.groupCard}`}
            >
              <strong>{group.name}</strong>
              <span>Join</span>
            </ButtonCard>
          );
        })}
      </div>
    </div>
  );
}
