import styles from "./RankNumber.module.scss";

interface Props {
  rank: number;
}

export default function RankNumber({ rank }: Props) {
  return (
    <div className={styles.container}>
      <strong>{rank}</strong>
    </div>
  );
}
