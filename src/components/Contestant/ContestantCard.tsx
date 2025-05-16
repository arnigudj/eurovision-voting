/* eslint-disable @next/next/no-img-element */
import { Contestant } from "@/app/api/contestants/types";
import { getCountryName } from "@/lib/countries";
import styles from "./ContestantCard.module.scss";
import Flag from "../Flag/Flag";

interface Props {
  contestant?: Contestant;
  children?: React.ReactNode;
}

export default function ContestantCard({ contestant, children }: Props) {
  return (
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        {contestant?.image_url && (
          <img
            src={contestant.image_url}
            alt={contestant.performer}
            className={styles.image}
          />
        )}
      </div>
      <div className={styles.flagContainer}>
        {contestant?.country && <Flag code={contestant.country} size={42} />}
      </div>
      <div className={styles.infoContainer}>
        <h6 className={styles.country}>{contestant?.country && getCountryName(contestant.country)}</h6>
        <span className={styles.performer}>{contestant?.performer}</span>
        <span className={styles.song}>{contestant?.song}</span>
      </div>
      <div>{children}</div>
    </div>
  );
}
