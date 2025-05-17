/* eslint-disable @next/next/no-img-element */
import styles from "./LeaderboardEntryCard.module.scss";
import Flag from "../Flag/Flag";
import { LeaderboardEntry } from "@/app/api/groups/[id]/leaderboard/types";
import Score from "../Score/Score";

interface Props {
  entry?: LeaderboardEntry;
}

export default function LeaderboardEntryCard({ entry }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.data}>
        <div className={styles.imageContainer}>
          {entry?.image_url && (
            <img
              src={entry.image_url}
              alt={entry.nickname}
              className={styles.image}
            />
          )}
        </div>
        <div className={styles.infoContainer}>
          <h6 className={styles.nickname}>{entry?.nickname}</h6>
          <div className={styles.flags}>
            {entry?.ranking.map((r) => (
              <div
                key={`flag-entry-${entry.user_id}-${r}`}
                className={styles.flagContainer}
              >
                <Flag code={r} size={16} />
              </div>
            ))}
          </div>
        </div>
        <Score label="Points" value={entry!.score} />
        <Score label="Place" value={entry!.place} />
      </div>
    </div>
  );
}
