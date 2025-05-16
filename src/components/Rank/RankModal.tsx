import { Contestant } from "@/app/api/contestants/types";
import ContestantCard from "../Contestant/ContestantCard";
import styles from "./RankModal.module.scss";
import RankNumber from "./RankNumber";
import Button from "../Button/Button";
import { Cross1Icon } from "@radix-ui/react-icons";

interface Props {
  selected: Contestant;
  onRank: (rank: number) => void;
  onClose?: () => void;
}

export default function RankModal({ selected, onRank, onClose }: Props) {
  return (
    <div className={styles.rankModal}>
      <div className={styles.rankModalContent}>
        <div className={styles.closeBtn}>
          <Button onClick={onClose}>
            <Cross1Icon />
          </Button>
        </div>
        <ContestantCard contestant={selected}></ContestantCard>
        <div className={styles.rankModalActions}>
          {Array.from({ length: 10 }, (_, i) => (
            <button
              className={styles.rankBtn}
              key={i}
              onClick={() => {
                onRank(i);
              }}
            >
              <RankNumber rank={i + 1} />
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
