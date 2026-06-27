import { cx } from "../lib/classNames";
import { Icon } from "./Icon";
import { Button } from "./ui/Button";

export function ChartZoomControls({
  total,
  visible,
  onVisibleChange,
}: {
  total: number;
  visible: number;
  onVisibleChange: (value: number) => void;
}) {
  if (total <= 1) return null;
  const minVisible = 1;
  const zoomIn = () => onVisibleChange(Math.max(minVisible, Math.floor(visible * 0.65)));
  const zoomOut = () => onVisibleChange(Math.min(total, Math.ceil(visible / 0.65)));
  const zoomButtonClass = "max-[720px]:w-full";

  return (
    <div
      aria-label="Controles de zoom de grafica"
      className={cx(
        "chart-zoom-controls flex flex-wrap items-center justify-end gap-2 rounded-[var(--radius-sm,6px)]",
        "border border-[var(--line)] bg-[var(--paper-2)] p-[5px]",
        "max-[720px]:grid max-[720px]:grid-cols-1 max-[720px]:justify-items-stretch",
      )}
    >
      <Button $compact className={zoomButtonClass} disabled={visible <= minVisible} onClick={zoomIn}>
        <Icon name="zoomIn" size={15} /> Acercar
      </Button>
      <Button $compact className={zoomButtonClass} disabled={visible >= total} onClick={zoomOut}>
        <Icon name="zoomOut" size={15} /> Alejar
      </Button>
      <Button $compact $variant="text" className={zoomButtonClass} disabled={visible >= total} onClick={() => onVisibleChange(total)}>
        Ver todo
      </Button>
      <span className="text-[10px] font-extrabold uppercase tracking-[0.06em] text-[var(--muted)]">
        {Math.min(visible, total)}/{total} puntos
      </span>
    </div>
  );
}
