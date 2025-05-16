import Label from "../Label/Label";
import styles from "./DropDown.module.scss";

type Option = {
  value: string;
  label: string;
};

type Props = {
  id: string;
  label: string;
  value: string;
  options: Option[];
  onChange: (value: string) => void;
};

export default function DropDown({
  id,
  label,
  value,
  options,
  onChange,
}: Props) {
  return (
    <div className={styles.wrapper}>
      <Label htmlFor={id} className={styles.label}>
        {label}
      </Label>
      <select
        id={id}
        className={styles.select}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
