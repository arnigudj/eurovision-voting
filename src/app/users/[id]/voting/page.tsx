"use client";

import { use, useCallback, useEffect, useState } from "react";
import { Contest } from "../../../api/contests/types";
import { Contestant } from "../../../api/contestants/types";
import ContestHeader from "@/components/Contest/ContestHeader";
import UserAvatar from "@/components/User/UserAvatar";
import { sortContestants } from "@/lib/contestants";
import ContestantRanking from "@/components/Contestant/ContestantRanking";
import { useUser } from "@/context/UserContext";
import Link from "next/link";
import { Group } from "@/app/api/groups/types";
import { UserGroup } from "@/app/api/users/[id]/groups/types";
import GroupSelection from "@/components/Group/GroupSelection";
import styles from "./page.module.scss";
import GroupScoring from "@/components/Group/GroupScoring";

export default function VotingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id: userId } = use(params);
  const { user } = useUser();
  const [contest, setContest] = useState<Contest>();
  const [joined, setJoined] = useState<Group[]>([]);
  const [contestants, setContestants] = useState<Contestant[]>([]);
  const [top10, setTop10] = useState<(string | null)[]>(Array(10).fill(null));
  const [top10Rank, setTop10Rank] = useState<(string | null)[]>(
    Array(10).fill(null)
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  const triggerRefresh = () => setRefreshKey((k) => k + 1);

  const load = useCallback(async () => {
    const [contestRes, contestantsRes, voteRes, groupsRes, joinedRes] =
      await Promise.all([
        fetch(`/api/contests/active`),
        fetch(`/api/contestants/active`),
        fetch(`/api/votes?user_id=${userId}`),
        fetch(`/api/groups`),
        fetch(`/api/users/${userId}/groups`),
      ]);
    const contestData: Contest = await contestRes.json();
    setContest(contestData);
    if (contestData.votes_locked) {
      const rankRes = await fetch(`/api/rank`);
      const rankData = await rankRes.json();

      if (Array.isArray(rankData.ranking)) {
        const filledRank = Array(10)
          .fill(null)
          .map((_, i) => rankData.ranking[i] || null);
        setTop10Rank(filledRank);
      }
    }

    setContestants(sortContestants(await contestantsRes.json()));

    const vote: string[] = await voteRes.json();
    if (Array.isArray(vote)) {
      const filled = Array(10)
        .fill(null)
        .map((_, i) => vote[i] || null);
      setTop10(filled);
    }
    const groups: Group[] = await groupsRes.json();
    const userGroups: UserGroup[] = await joinedRes.json();

    const myGroups = groups.filter((g) =>
      userGroups.find((j) => j.group_id === g.id)
    );

    setJoined(myGroups);
    setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

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

  if (isLoading) return;

  return (
    <div>
      <ContestHeader contest={contest}>
        <Link href={`/users/${user?.id}`}>
          <UserAvatar user={user} />
        </Link>
      </ContestHeader>

      {joined.length <= 0 && (
        <GroupSelection
          onJoin={(g) => {
            setJoined([g]);
          }}
        />
      )}

      {contest?.votes_locked && (
        <div className={styles.scoring}>
          {joined?.map((j) => {
            return <GroupScoring key={`leaderboard-${j.id}`}  group={j} userId={user!.id} />;
          })}
        </div>
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
        <ContestantRanking
          safeOnRank
          label="Current top 10"
          votesLocked
          refreshKey={refreshKey}
          contestants={contestants}
          ranking={top10Rank}
        />
      </div>
    </div>
  );
}
