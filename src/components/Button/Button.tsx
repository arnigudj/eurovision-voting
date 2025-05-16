import s from "./Button.module.scss";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export default function Button({ children, className = "", ...props }: Props) {
  return (
    <button className={`${s.button} ${className}`} {...props}>
      {children}
    </button>
  );
}
