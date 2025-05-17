"use client";

import ContestHeader from "@/components/Contest/ContestHeader";
import SelectParty from "@/components/Group/SelectParty";
import { useContest } from "@/context/ContestContext";
import { useCallback, useEffect, useState } from "react";
import { LeaderboardEntry } from "../api/groups/[id]/leaderboard/types";
import LeaderboardEntryCard from "@/components/Group/LeaderboardEntryCard";
import styles from "./page.module.scss";
import { useRouter, useSearchParams } from "next/navigation";
import { Contestant } from "../api/contestants/types";
import ContestantCard from "@/components/Contestant/ContestantCard";
import Score from "@/components/Score/Score";
import { GroupVoteResult } from "../api/groups/[id]/top10/types";

export type RankedContestant = Partial<Contestant> & GroupVoteResult;

export default function LeaderboardsPage() {
  const { contest } = useContest();
  const [selected, setSelected] = useState<string>();
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [group10, setGroup10] = useState<RankedContestant[]>([]);
  const [top10Rank, setTop10Rank] = useState<(Contestant | undefined)[]>(
    Array(10).fill(null)
  );

  const searchParams = useSearchParams();
  const groupFromQuery = searchParams.get("group");

  const router = useRouter();

  const handleSelect = (groupId: string) => {
    setSelected(groupId);
    router.push(`?group=${groupId}`, { scroll: false });
  };

  const load = useCallback(async (groupId: string) => {
    if (groupId) {
      const [leaderboardRes, group10Res, contestantsRes, rankRes] =
        await Promise.all([
          fetch(`/api/groups/${groupId}/leaderboard`),
          fetch(`/api/groups/${groupId}/top10`),
          fetch(`/api/contestants/active`),
          fetch(`/api/rank`),
        ]);

      setLeaderboard(await leaderboardRes.json());
      const contestantsData: Contestant[] = await contestantsRes.json();

      const group10Data: GroupVoteResult[] = await group10Res.json();
      const merged = group10Data?.map((g) => {
        const c = contestantsData.find((i) => i.id === g.contestant_id);
        return { ...c, ...g };
      });

      setGroup10(merged);

      const rankData = await rankRes.json();
      if (Array.isArray(rankData.ranking)) {
        const filledRank = Array(10)
          .fill(null)
          .map((_, i) => rankData.ranking[i] || null);

        const top10Contestants = filledRank.map((id) =>
          contestantsData?.find((c) => c.id === id)
        );
        setTop10Rank(top10Contestants);
      }
    }
  }, []);

  useEffect(() => {
    if (groupFromQuery) {
      setSelected(groupFromQuery);
      load(groupFromQuery);
    }
  }, [groupFromQuery, load]);

  useEffect(() => {
    if (!selected) return;

    const interval = setInterval(() => {
      load(selected);
    }, 300000); // 5 minutes

    return () => clearInterval(interval);
  }, [selected, load]);

  return (
    <div>
      <ContestHeader contest={contest}>
        <SelectParty selected={selected} onChange={handleSelect} />
      </ContestHeader>

      <div className={styles.container}>
        <h2>Leaders</h2>
        <div className={styles.row}>
          {leaderboard.map((e) => {
            return (
              <div key={`leaderboard-entry-${e.user_id}-${selected}`}>
                <LeaderboardEntryCard entry={e} />
              </div>
            );
          })}
        </div>
        <h2>Top 10 countries</h2>
        <div className={styles.row}>
          {top10Rank?.map((c, i) => (
            <div key={`top-10-${i}`}>
              <ContestantCard contestant={c}>
                <Score label="Place" value={i + 1} />
              </ContestantCard>
            </div>
          ))}
        </div>
        <h2>The Party&apos;s favorite 10</h2>
        <div className={styles.row}>
          {group10?.map((c, i) => (
            <div key={`group-10-${i}`}>
              <ContestantCard contestant={c as Contestant}>
                <div className={styles.numbers}>
                  <Score label="Points" value={c.points} />
                  <Score label="Place" value={c.rank} />
                </div>
              </ContestantCard>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
