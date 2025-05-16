import { Contest } from "@/app/api/contests/types";
import styles from "./ContestHeader.module.scss";
import Flag from "../Flag/Flag";

interface Props {
  contest: Contest;
  children?: React.ReactNode;
}

export default function ContestHeader({ contest, children }: Props) {
  return (
    <div className={styles.header}>
      <div className={styles.title}>
        {contest?.host && <Flag code={contest.host} size={42} />}
        <h1>{contest.id}</h1>
      </div>
      <nav className={styles.nav}>{children}</nav>
    </div>
  );
}
