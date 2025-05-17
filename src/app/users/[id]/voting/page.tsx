"use client";

import { use, useCallback, useEffect, useState } from "react";
import { Contestant } from "../../../api/contestants/types";
import { sortContestants } from "@/lib/contestants";
import ContestantRanking from "@/components/Contestant/ContestantRanking";
import { useUser } from "@/context/UserContext";
import GroupSelection from "@/components/Group/GroupSelection";
import styles from "./page.module.scss";
import GroupScoring from "@/components/Group/GroupScoring";
import { useUserGroup } from "@/context/UserGroupContext";
import { useContest } from "@/context/ContestContext";
import Callout from "@/components/Callout/Callout";

export default function VotingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { joined, userGroups, isLoading: isUserGroupLoading } = useUserGroup();

  const { id: userId } = use(params);
  const { user } = useUser();
  const { contest } = useContest();
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [top10, setTop10] = useState<(string | null)[]>(Array(10).fill(null));
  const [top10Rank, setTop10Rank] = useState<(string | null)[]>(
    Array(10).fill(null)
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  const load = useCallback(async () => {
    const [contestantsRes, voteRes] = await Promise.all([
      fetch(`/api/contestants/active`),
      fetch(`/api/votes?user_id=${userId}`),
    ]);

    setContestants(sortContestants(await contestantsRes.json()));

    const vote: string[] = await voteRes.json();
    if (Array.isArray(vote)) {
      const filled = Array(10)
        .fill(null)
        .map((_, i) => vote[i] || null);
      setTop10(filled);
    }

    setIsLoading(false);
  }, [userId]);

  const loadRank = useCallback(async () => {
    const rankRes = await fetch(`/api/rank`);
    const rankData = await rankRes.json();

    if (Array.isArray(rankData.ranking)) {
      const filledRank = Array(10)
        .fill(null)
        .map((_, i) => rankData.ranking[i] || null);
      setTop10Rank(filledRank);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (contest?.votes_locked) {
      loadRank();
    }
  }, [loadRank, contest?.votes_locked]);

  const handleRanking = async (ranking: (string | null)[]) => {
    const res = await fetch(`/api/votes`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        user_id: user!.id,
        ranking: ranking.filter(Boolean),
      }),
    });

    const data = await res.json();
    if (!res.ok) {
      alert(data.error || "Error saving vote");
      await load();
      triggerRefresh();
    }
  };

  if (isUserGroupLoading) {
    return;
  }

  if (userGroups.length <= 0 && joined.length <= 0) {
    return <GroupSelection />;
  }

  if (isLoading) return;

  const numTop10Rank = top10Rank?.filter((t) => !!t).length || [];

  return (
    <div>
      {contest?.votes_locked && numTop10Rank === 10 && (
        <div className={styles.scoring}>
          {joined?.map((j) => {
            return (
              <GroupScoring
                key={`leaderboard-${j.id}`}
                group={j}
                userId={user!.id}
              />
            );
          })}
        </div>
      )}
      {contest?.votes_locked && numTop10Rank !== 10 && (
        <Callout>Waiting for first results. Voting has been locked.</Callout>
      )}

      <div className={styles.panel}>
        <ContestantRanking
          votesLocked={contest?.votes_locked}
          safeOnRank
          refreshKey={refreshKey}
          contestants={contestants}
          ranking={top10}
          onRank={handleRanking}
        />
        {contest?.votes_locked && numTop10Rank === 10 && (
          <ContestantRanking
            safeOnRank
            label="Current top 10"
            votesLocked
            refreshKey={refreshKey}
            contestants={contestants}
            ranking={top10Rank}
          />
        )}
      </div>
    </div>
  );
}
