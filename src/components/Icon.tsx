type IconName =
  | "activity"
  | "alert"
  | "archive"
  | "chart"
  | "check"
  | "clipboard"
  | "download"
  | "file"
  | "filter"
  | "flame"
  | "grid"
  | "home"
  | "menu"
  | "people"
  | "plus"
  | "printer"
  | "refresh"
  | "search"
  | "shield"
  | "x"
  | "zoomIn"
  | "zoomOut";

const paths: Record<IconName, JSX.Element> = {
  activity: <path d="M3 12h4l3-8 4 16 3-8h4" />,
  alert: <path d="M12 3 2.8 19h18.4L12 3Zm0 5v5m0 3v.1" />,
  archive: <path d="M4 5h16v4H4V5Zm2 4v10h12V9m-8 4h4" />,
  chart: <path d="M4 18 9 12l4 3 7-9m-4 0h4v4" />,
  check: <path d="m5 12 4 4L19 6" />,
  clipboard: <path d="M9 5h6m-5-2h4l1 2h3v16H6V5h3l1-2Zm0 7h4m-4 4h4m-4 4h3" />,
  download: <path d="M12 3v12m-4-4 4 4 4-4M4 19h16" />,
  file: <path d="M6 3h8l4 4v14H6V3Zm8 0v5h5M9 13h6m-6 4h6" />,
  filter: <path d="M3 5h18l-7 8v6l-4 2v-8L3 5Z" />,
  flame: <path d="M12 22c3.9 0 7-2.7 7-6.7 0-2.8-1.5-4.8-3.8-7.1-.8 2-2 3.1-3.5 3.9.3-2.9-.7-5.6-3.2-8.1C8.2 7.3 5 9.8 5 15.3 5 19.3 8.1 22 12 22Zm0-3.5c1.5 0 2.7-1 2.7-2.5 0-1.1-.5-1.9-1.5-2.8-.3.8-.8 1.3-1.5 1.7.1-1.2-.3-2.2-1.2-3.1-.2 1.4-1.2 2.4-1.2 4.2 0 1.5 1.2 2.5 2.7 2.5Z" />,
  grid: <path d="M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z" />,
  home: <path d="M3 11 12 4l9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1v-9Z" />,
  menu: <path d="M4 7h16M4 12h16M4 17h16" />,
  people: <path d="M16 19c0-2.2-1.8-4-4-4s-4 1.8-4 4m4-7a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm6 7c0-1.6-1-3-2.5-3.7m.5-3.8a2.5 2.5 0 1 0 0-5" />,
  plus: <path d="M12 5v14m-7-7h14" />,
  printer: <path d="M7 9V3h10v6M7 17H5a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2m-10-3h10v7H7v-7Z" />,
  refresh: <path d="M20 11a8 8 0 0 0-14.5-4L3 9m0-5v5h5m-4 4a8 8 0 0 0 14.5 4L21 15m0 5v-5h-5" />,
  search: <path d="m20 20-4-4m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Z" />,
  shield: <path d="M12 3 19 6v5c0 4.6-3 8.2-7 10-4-1.8-7-5.4-7-10V6l7-3Zm-3 9 2 2 4-4" />,
  x: <path d="M6 6 18 18M18 6 6 18" />,
  zoomIn: <path d="m20 20-4-4m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-7-3v6m-3-3h6" />,
  zoomOut: <path d="m20 20-4-4m2-5a7 7 0 1 1-14 0 7 7 0 0 1 14 0Zm-10 0h6" />,
};

export function Icon({ name, size = 18 }: { name: IconName; size?: number }) {
  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill="none"
      height={size}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="1.8"
      viewBox="0 0 24 24"
      width={size}
    >
      {paths[name]}
    </svg>
  );
}
