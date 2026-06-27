import type { ButtonHTMLAttributes } from "react";
import { cx } from "../../lib/classNames";

export type ButtonVariant = "primary" | "secondary" | "text" | "danger";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  $compact?: boolean;
  $variant?: ButtonVariant;
};

const variantClasses: Record<ButtonVariant, string> = {
  primary: "border-[var(--axen-blue)] bg-[var(--axen-blue)] text-white shadow-[0_14px_28px_rgba(0,113,206,0.18)] hover:bg-[var(--orange-deep)]",
  secondary: "border-[var(--line)] bg-white text-[var(--ink)] hover:bg-[#f8fbfd] hover:text-[var(--ink-deep)]",
  text: "border-transparent bg-transparent text-[var(--orange-deep)] hover:bg-transparent hover:text-[var(--ink-deep)]",
  danger: "border-[#b43c33] bg-[#b43c33] text-white hover:bg-[#963128]",
};

export function Button({
  $compact,
  $variant = "secondary",
  className,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cx(
        "inline-flex items-center justify-center gap-2 rounded-[6px] border text-[11px] font-black leading-none",
        "cursor-pointer transition-[color,background-color,border-color,box-shadow,transform,opacity] duration-[180ms] ease-[var(--ease-out,ease)]",
        "hover:-translate-y-px active:translate-y-0 focus-visible:outline-none focus-visible:shadow-[0_0_0_4px_rgba(0,113,206,0.16)]",
        "disabled:cursor-not-allowed disabled:opacity-55 disabled:hover:translate-y-0",
        $compact ? "min-h-[34px]" : "min-h-[42px]",
        $variant === "text" ? ($compact ? "px-1 py-1.5" : "px-1.5 py-2") : ($compact ? "px-[9px] py-[7px]" : "px-3.5 py-2.5"),
        variantClasses[$variant],
        className,
      )}
      type={type}
      {...props}
    />
  );
}
