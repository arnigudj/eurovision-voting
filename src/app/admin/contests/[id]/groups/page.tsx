"use client";

import { Contest } from "@/app/api/contests/types";
import ContestHeader from "@/components/Contest/ContestHeader";
import Link from "next/link";
import { useEffect, useState, use } from "react";

type Group = {
  id: string;
  name: string;
};

export default function GroupsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: contestId } = use(params);
  const [groups, setGroups] = useState<Group[]>([]);
  const [contest, setContest] = useState<Contest>();
  const [name, setName] = useState("");

  useEffect(() => {
    const load = async () => {
      const [groupsRes, contestRes] = await Promise.all([
        fetch(`/api/groups?contest_id=${contestId}`),
        fetch(`/api/contests/${contestId}`),
      ]);

      setGroups(await groupsRes.json());
      setContest(await contestRes.json());
    };
    load();
  }, [contestId]);

  const createGroup = async () => {
    if (!name.trim()) return;

    const res = await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, contest_id: contestId }),
    });

    const data = await res.json();
    if (res.ok) {
      setGroups((prev) => [...prev, data]);
      setName("");
    } else {
      alert(data.error);
    }
  };

  return (
    <div style={{ padding: 24 }}>
      <ContestHeader contest={contest}>
        <Link href="/admin">Home</Link>
        <Link href={`/admin/contests/${contestId}/edit`}>Edit</Link>
        <Link href={`/admin/contests/${contestId}/groups`}>Groups</Link>
      </ContestHeader>
      <h1>Groups for Contest {contestId}</h1>

      <div style={{ marginBottom: 24 }}>
        <input
          type="text"
          placeholder="New group name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button onClick={createGroup} style={{ marginLeft: 8 }}>
          Create Group
        </button>
      </div>

      <ul>
        {groups.map((g) => (
          <li key={g.id} style={{ marginBottom: 8 }}>
            <input
              defaultValue={g.name}
              onBlur={async (e) => {
                const newName = e.target.value.trim();
                if (newName && newName !== g.name) {
                  const res = await fetch(`/api/groups/${g.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ name: newName }),
                  });
                  const data = await res.json();
                  if (res.ok) {
                    setGroups((prev) =>
                      prev.map((group) =>
                        group.id === g.id
                          ? { ...group, name: data.name }
                          : group
                      )
                    );
                  } else {
                    alert(data.error);
                  }
                }
              }}
            />
            <button
              style={{ marginLeft: 8 }}
              onClick={async () => {
                const confirmed = confirm(`Delete group "${g.name}"?`);
                if (!confirmed) return;

                const res = await fetch(`/api/groups/${g.id}`, {
                  method: "DELETE",
                });
                if (res.ok) {
                  setGroups((prev) =>
                    prev.filter((group) => group.id !== g.id)
                  );
                } else {
                  const data = await res.json();
                  alert(data.error);
                }
              }}
            >
              Delete
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}
