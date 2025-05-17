import styles from "./Callout.module.scss";
import { InfoCircledIcon } from "@radix-ui/react-icons";
import { ReactNode } from "react";

interface Props {
  children: ReactNode;
}

export default function Callout({ children }: Props) {
  return (
    <div className={styles.callout}>
      <InfoCircledIcon className={styles.icon} />
      <div className={styles.content}>{children}</div>
    </div>
  );
}
