import s from "./ButtonCard.module.scss";
import type { ButtonHTMLAttributes } from "react";

type Props = ButtonHTMLAttributes<HTMLButtonElement>;

export default function ButtonCard({ children, className = "", ...props }: Props) {
  return (
    <button className={`${s.button} ${className}`} {...props}>
      {children}
    </button>
  );
}
