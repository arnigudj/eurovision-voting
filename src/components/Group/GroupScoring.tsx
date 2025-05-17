import { LeaderboardEntry } from "@/app/api/groups/[id]/leaderboard/types";
import { useCallback, useEffect, useState } from "react";
import Score from "../Score/Score";
import { Group } from "@/app/api/groups/types";
import ButtonCard from "../Button/ButtonCard";
import styles from "./GroupScoring.module.scss";
import LeaderboardEntryCard from "./LeaderboardEntryCard";
import { Close } from "@mui/icons-material";

interface Props {
  group: Group;
  userId: string;
}

export function formatOrdinal(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;

  if (mod10 === 1 && mod100 !== 11) return `${n}st`;
  if (mod10 === 2 && mod100 !== 12) return `${n}nd`;
  if (mod10 === 3 && mod100 !== 13) return `${n}rd`;
  return `${n}th`;
}

export default function GroupScoring({ group, userId }: Props) {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [user, setUser] = useState<LeaderboardEntry>();
  const [showLeaderboard, setShowLeaderboard] = useState(false);

  const load = useCallback(async () => {
    const leaderBoardRes = await fetch(`/api/groups/${group.id}/leaderboard`);
    if(!leaderBoardRes.ok) return;

    const lb: LeaderboardEntry[] = await leaderBoardRes.json();
    setLeaderboard(lb);
    // get current place
    const entry = lb?.find((u) => userId === u.user_id);
    setUser(entry);
  }, [group.id, userId]);

  useEffect(() => {
    load();
  }, [load]);

  useEffect(() => {
    if (showLeaderboard) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [showLeaderboard]);

  if (!user) return;

  return (
    <div>
      <ButtonCard
        onClick={() => {
          setShowLeaderboard((prev) => !prev);
        }}
      >
        <div className={styles.card}>
          <h6 className={styles.cardTitle}>{`${group.name}`}</h6>
          <div className={styles.cardNumbers}>
            <Score label={`Place`} value={formatOrdinal(user.place)} />
            <Score label={`Score`} value={user.score} />
          </div>
          <small className={styles.cardLeaderboard}>see leaderboard</small>
        </div>
      </ButtonCard>
      {showLeaderboard && (
        <div className={styles.modal}>
          <div className={styles.modalHeader}>
            <h4>{group.name}&apos;s Leaders</h4>
            <ButtonCard
              className={styles.closeBtn}
              onClick={() => {
                setShowLeaderboard(false);
              }}
            >
              <Close />
            </ButtonCard>
          </div>
          <div className={styles.modalContent}>
            {leaderboard.map((e) => {
              return (
                <div key={`leaderboard-entry-${e.user_id}-${group.id}`}>
                  <LeaderboardEntryCard entry={e} />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
