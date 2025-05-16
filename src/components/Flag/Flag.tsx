import Image from "next/image";
import styles from "./Flag.module.scss";

type Props = {
  code: string; // e.g. 'IS', 'DE', 'FR'
  size?: number; // optional pixel size, default to 24
};

export default function Flag({ code, size = 24 }: Props) {
  const src = `/flags/1x1/${code.toLowerCase()}.svg`;

  return (
    <Image
      width={size}
      height={size}
      src={src}
      alt={`${code} flag`}
      className={styles.flag}
      style={{ width: size, height: size }}
    />
  );
}
