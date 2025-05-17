import type { ButtonHTMLAttributes, ReactNode } from "react";
import clsx from "clsx";
import s from "./Button.module.scss";

type Variant = "contained" | "outlined" | "text";
type Color = "brand" | "secondary" | "success" | "danger";

interface Props extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  color?: Color;
  children: ReactNode;
}

export default function Button({
  variant = "contained",
  color = "brand",
  className,
  children,
  ...props
}: Props) {
  const classes = clsx(
    s.button,
    s[variant],
    s[color],
    props.disabled && s.disabled,
    className
  );

  return (
    <button className={classes} {...props}>
      {children}
    </button>
  );
}
