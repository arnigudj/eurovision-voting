import Label from '../Label/Label';
import styles from './RadioButton.module.scss';

type Props = {
  id: string;
  name: string;
  label: string;
  checked: boolean;
  onChange: () => void;
};

export default function RadioButton({ id, name, label, checked, onChange }: Props) {
  return (
    <Label htmlFor={id} className={styles.radio}>
      <input
        id={id}
        type="radio"
        name={name}
        checked={checked}
        onChange={onChange}
      />
      <span className={styles.circle} />
      <span className={styles.label}>{label}</span>
    </Label>
  );
}
