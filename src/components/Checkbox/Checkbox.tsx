import Label from "../Label/Label";
import styles from "./Checkbox.module.scss";
import type { InputHTMLAttributes } from "react";

type Props = {
  id: string;
  label: string;
  onChange: (checked: boolean) => void;
} & Omit<InputHTMLAttributes<HTMLInputElement>, 'type' | 'onChange'>;

export default function Checkbox({ id, label, checked, onChange, ...rest }: Props) {
  return (
    <Label htmlFor={id} className={styles.checkbox}>
      <input
        id={id}
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        {...rest}
      />
      <span className={styles.box} />
      <span className={styles.label}>{label}</span>
    </Label>
  );
}
