import styles from "./Score.module.scss";

interface Props {
  label: string;
  value: number | string;
}

export default function Score({ value, label }: Props) {
  return (
    <div className={styles.container}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}
