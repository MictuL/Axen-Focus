import type { ComponentPropsWithoutRef } from "react";
import { cx } from "../../lib/classNames";

export function Panel({ className, ...props }: ComponentPropsWithoutRef<"section">) {
  return (
    <section
      className={cx(
        "bg-[var(--paper)] border border-[var(--line)] rounded-[7px] p-5 shadow-[0_8px_26px_rgba(22,52,58,0.04)]",
        className,
      )}
      {...props}
    />
  );
}
