"use client";

import { Contestant } from "@/app/api/contestants/types";
import { Contest } from "@/app/api/contests/types";
import { Rank } from "@/app/api/rank/types";
import ContestHeader from "@/components/Contest/ContestHeader";
import ContestantCard from "@/components/Contestant/ContestantCard";
import RankNumber from "@/components/Rank/RankNumber";
import { finalContestants, sortContestants } from "@/lib/contestants";
import { assignRank } from "@/lib/rank";
import Link from "next/link";
import { useEffect, useState, use } from "react";
import styles from "./page.module.scss";
import Button from "@/components/Button/Button";

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

  const handleRank = async () => {
    const res = await fetch(`/api/rank`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contest_id: contestId,
        ranking: top10.filter(Boolean),
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

  const top10Contestants = top10.map((id) =>
    contestants.find((c) => c.id === id)
  );
  const remaining = contestants.filter((c) => !top10.includes(c.id));
  if (!contest) return <h1>Loading...</h1>;
  return (
    <div style={{ padding: 24 }}>
      <ContestHeader contest={contest}>
        <Link href="/admin">Home</Link>
        <Link href={`/admin/contests/${contest.id}/edit`}>Edit</Link>
        <Link href={`/admin/contests/${contest.id}/groups`}>Groups</Link>
      </ContestHeader>

      <div className={styles.contestants}>
        <h2>My top 10</h2>
        {top10Contestants.map((c, i) => (
          <div key={i} onClick={() => c && setSelected(c)}>
            <ContestantCard contestant={c}>
              <RankNumber rank={i + 1} />
            </ContestantCard>
          </div>
        ))}
      </div>
      <div className={styles.actions}>
        <Button onClick={handleRank} style={{ marginTop: 24 }}>
          Save Ranking
        </Button>
      </div>
      <hr style={{ margin: "24px 0" }} />

      <div className={styles.contestants}>
        <h2>My losers</h2>
        {sortContestants(remaining).map((c) => (
          <div key={c.id} onClick={() => c && setSelected(c)}>
            <ContestantCard contestant={c}></ContestantCard>
          </div>
        ))}
      </div>

      {selected && (
        <div className={styles.rankModal}>
          <div className={styles.rankModalContent}>
            <ContestantCard contestant={selected}></ContestantCard>
            <div className={styles.rankModalActions}>
              {Array.from({ length: 10 }, (_, i) => (
                <button
                  className={styles.rankBtn}
                  key={i}
                  onClick={() => setRank(i)}
                >
                  <RankNumber rank={i + 1} />
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
