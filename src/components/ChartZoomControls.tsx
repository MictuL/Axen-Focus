import { Icon } from "./Icon";

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

  return <div className="chart-zoom-controls" aria-label="Controles de zoom de grafica">
    <button className="secondary-button" disabled={visible <= minVisible} onClick={zoomIn} type="button"><Icon name="zoomIn" size={15} /> Acercar</button>
    <button className="secondary-button" disabled={visible >= total} onClick={zoomOut} type="button"><Icon name="zoomOut" size={15} /> Alejar</button>
    <button className="text-button" disabled={visible >= total} onClick={() => onVisibleChange(total)} type="button">Ver todo</button>
    <span>{Math.min(visible, total)}/{total} puntos</span>
  </div>;
}
