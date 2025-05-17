"use client";

import { useEffect, useState } from "react";
import styles from "./SelectParty.module.scss";

interface Group {
  id: string;
  name: string;
}

interface Props {
  selected?: string;
  onChange: (groupId: string) => void;
}

export default function SelectParty({ selected, onChange }: Props) {
  const [groups, setGroups] = useState<Group[]>([]);

  useEffect(() => {
    const load = async () => {
      const res = await fetch("/api/groups");
      const data = await res.json();
      setGroups(data);
    };
    load();
  }, []);

  return (
    <select
      className={styles.select}
      value={selected || ""}
      onChange={(e) => onChange(e.target.value)}
    >
      <option value="" disabled>
        Select your party
      </option>
      {groups.map((group) => (
        <option key={group.id} value={group.id}>
          {group.name}
        </option>
      ))}
    </select>
  );
}
