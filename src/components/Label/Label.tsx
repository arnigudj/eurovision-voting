import styles from "./Label.module.scss";

type LabelProps = React.LabelHTMLAttributes<HTMLLabelElement>;

export default function Label(props: LabelProps) {
  return <label className={styles.label} {...props} />;
}
