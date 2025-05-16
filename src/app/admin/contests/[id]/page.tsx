"use client";

import { Contestant } from "@/app/api/contestants/types";
import { Contest } from "@/app/api/contests/types";
import { Rank } from "@/app/api/rank/types";
import ContestHeader from "@/components/Contest/ContestHeader";
import { finalContestants, sortContestants } from "@/lib/contestants";
import { assignRank } from "@/lib/rank";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import RankModal from "@/components/Rank/RankModal";
import ContestantRanking from "@/components/Contestant/ContestantRanking";
import Checkbox from "@/components/Checkbox/Checkbox";

export default function AdminTop10Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: contestId } = use(params);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [contest, setContest] = useState<Contest>();
  const [top10, setTop10] = useState<(string | null)[]>(Array(10).fill(null));
  const [selected, setSelected] = useState<Contestant>();

  const handleUpdate = async (c: Contest) => {
    const res = await fetch(`/api/contests/${contestId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(c),
    });

    const data = await res.json();
    if (!res.ok) alert(data.error || "Error saving");
    else setContest(data);
  };

  const handleRanking = async (ranking: (string | null)[]) => {
    const res = await fetch(`/api/rank`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contest_id: contestId,
        ranking: ranking.filter(Boolean),
      }),
    });

    const data = await res.json();
    if (!res.ok) alert(data.error || "Error saving");
    else alert("Top 10 saved");
  };

  useEffect(() => {
    const load = async () => {
      const [contestantsRes, contestRes, rankRes] = await Promise.all([
        fetch(`/api/contestants?contest_id=${contestId}`),
        fetch(`/api/contests/${contestId}`),
        fetch(`/api/rank?contest_id=${contestId}`),
      ]);

      const contestantsData = (await contestantsRes.json()) as Contestant[];
      const contestData = (await contestRes.json()) as Contest;
      const rankData = (await rankRes.json()) as Rank;

      setContest(contestData);
      setContestants(
        sortContestants(finalContestants(contestantsData, contestData))
      );

      if (Array.isArray(rankData?.ranking)) {
        const filled = Array(10)
          .fill(null)
          .map((_, i) => rankData.ranking[i] || null);
        setTop10(filled);
      }
    };
    load();
  }, [contestId]);

  const setRank = (targetIndex: number) => {
    if (!selected) return;
    setTop10((prev) => assignRank(prev, selected, targetIndex));
    setSelected(undefined);
  };

  if (!contest) return <h1>Loading...</h1>;
  return (
    <div style={{ padding: 24 }}>
      <ContestHeader contest={contest}>
        <Link href="/admin">Home</Link>
        <Link href={`/admin/contests/${contest.id}/edit`}>Edit</Link>
        <Link href={`/admin/contests/${contest.id}/groups`}>Groups</Link>
      </ContestHeader>
      <div>
        <Checkbox 
          id="lock-voting"
          label="Lock voting"
          checked={contest.votes_locked}
          onChange={(locked) => handleUpdate({ ...contest, votes_locked: locked })}
        
        />
      </div>
      <ContestantRanking
        contestants={contestants}
        ranking={top10}
        onRank={handleRanking}
      />

      {selected && (
        <RankModal
          selected={selected}
          onRank={setRank}
          onClose={() => setSelected(undefined)}
        />
      )}
    </div>
  );
}
