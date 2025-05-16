import { Contestant } from "@/app/api/contestants/types";
import styles from "./ContestantRanking.module.scss";
import { useEffect, useState } from "react";
import ContestantCard from "./ContestantCard";
import RankNumber from "../Rank/RankNumber";
import Button from "../Button/Button";
import { sortContestants } from "@/lib/contestants";
import RankModal from "../Rank/RankModal";
import { assignRank } from "@/lib/rank";
import Callout from "../Callout/Callout";

interface Props {
  contestants?: Contestant[];
  onRank?: (ranking: (string | null)[]) => void;
  ranking?: (string | null)[];
  refreshKey?: number;
  safeOnRank?: boolean;
  votesLocked?: boolean;
  label?: string;
}

export default function ContestantRanking({
  contestants,
  onRank,
  ranking,
  refreshKey,
  safeOnRank,
  votesLocked,
  label = 'My top 10',
}: Props) {
  const [selected, setSelected] = useState<Contestant>();
  const [top10, setTop10] = useState<(string | null)[]>(Array(10).fill(null));

  const setRank = (targetIndex: number) => {
    if (!selected) return;
    const newTop10 = assignRank(top10, selected, targetIndex);
    setTop10(newTop10);
    if (safeOnRank) {
      if (onRank) {
        onRank(newTop10);
      }
    }
    setSelected(undefined);
  };

  useEffect(() => {
    if (Array.isArray(ranking)) {
      const filled = Array(10)
        .fill(null)
        .map((_, i) => ranking[i] || null);
      setTop10(filled);
    }
  }, [ranking, refreshKey, votesLocked]);

  const top10Contestants = top10.map((id) =>
    contestants?.find((c) => c.id === id)
  );

  const placesLeft = top10.filter((t) => !t).length;

  const remaining = contestants?.filter((c) => !top10.includes(c.id));
  return (
    <div>
      <div className={styles.contestants}>
        {placesLeft > 0 && !votesLocked && (
          <Callout>You got {placesLeft} remaining</Callout>
        )}
        <h2>{label}</h2>
        {top10Contestants.map((c, i) => (
          <div key={i} onClick={() => c && setSelected(c)}>
            <ContestantCard contestant={c}>
              <RankNumber rank={i + 1} />
            </ContestantCard>
          </div>
        ))}
      </div>
      {!safeOnRank && (
        <div className={styles.actions}>
          <Button
            onClick={() => {
              if (onRank) {
                onRank(top10);
              }
            }}
            style={{ marginTop: 24 }}
          >
            Save Ranking
          </Button>
        </div>
      )}
      {!votesLocked && (
        <>
          <div className={styles.contestants}>
            <h2>My losers</h2>
            {sortContestants(remaining).map((c) => (
              <div key={c.id} onClick={() => c && setSelected(c)}>
                <ContestantCard contestant={c}></ContestantCard>
              </div>
            ))}
          </div>

          {selected && (
            <RankModal
              selected={selected}
              onRank={setRank}
              onClose={() => setSelected(undefined)}
            />
          )}
        </>
      )}
    </div>
  );
}
