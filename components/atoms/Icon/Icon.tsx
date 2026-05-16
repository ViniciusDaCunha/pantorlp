import React, { JSX } from "react";

type IconName =
  | "bolt"
  | "search"
  | "rocket"
  | "plug"
  | "ship"
  | "satellite"
  | "telescope"
  | "cloud"
  | "globe"
  | "check"
  | "sync"
  | "hourglass"
  | "clock"
  | "folder"
  | "money"
  | "construction"
  | "gift"
  | "map"
  | "celebration"
  | "capture";

interface IconProps {
  name: IconName;
  className?: string;
  title?: string;
}

const iconPaths: Partial<Record<IconName, JSX.Element>> = {
  bolt: <path d="M13 2L7 10h5l-4 8 8-8h-5l4-8z" fill="currentColor" />,
  search: (
    <>
      <circle cx="11" cy="11" r="6" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M16 16l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  rocket: (
    <>
      <path d="M12 3c-2.5 0-4.5 2-4.5 4.5v4.5C7.5 15.4 8 16 8 16s1.5 1 4 1 4-1 4-1-.5-.6-.5-3V7.5C16.5 5 14.5 3 12 3z" fill="currentColor" />
      <path d="M9 10h6" stroke="#fff" strokeWidth="1.5" strokeLinecap="round" />
      <path d="M8 17l-2 3v1h4l2-4-4-.5z" fill="currentColor" />
    </>
  ),
  plug: (
    <>
      <path d="M8 2h2v6h4V2h2v6h2v4a4 4 0 01-4 4h-2a4 4 0 01-4-4V8h2V2z" fill="currentColor" />
      <path d="M10 2v4M14 2v4" stroke="#fff" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  ship: (
    <>
      <path d="M3 16l3-6 4 4 4-4 3 6 3-2v4H3v-2z" fill="currentColor" />
      <path d="M3 16h18" stroke="#fff" strokeWidth="1.5" />
    </>
  ),
  satellite: (
    <>
      <path d="M6 5l4 4M14 13l4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8 7l2 2 6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 14l3 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="12" cy="6" r="3" fill="currentColor" />
    </>
  ),
  telescope: (
    <>
      <path d="M5 19l10-6 2 3-10 6-2-3z" fill="currentColor" />
      <path d="M13 7l4 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 3l4 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M9 15l6-8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M10 11l8-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  globe: (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 5v4M12 15v4M5 12h4M15 12h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <path d="M8.5 8.5l7 7M8.5 15.5l7-7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="7.5" cy="7.5" r="1.2" fill="currentColor" />
      <circle cx="16.5" cy="7.5" r="1.2" fill="currentColor" />
      <circle cx="16.5" cy="16.5" r="1.2" fill="currentColor" />
      <circle cx="7.5" cy="16.5" r="1.2" fill="currentColor" />
    </>
  ),
  cloud: (
    <>
      <path d="M7 14a5 5 0 010-10 6 6 0 0111.62 1.61A4 4 0 0117 14H7z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  check: <path d="M4 12l5 5 11-11" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  sync: (
    <>
      <path d="M4 12a8 8 0 0114-4.9" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M16 3v4h4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M20 12a8 8 0 01-14 4.9" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M8 21v-4H4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
    </>
  ),
  hourglass: (
    <>
      <path d="M8 2h8v4l-4 4 4 4v4H8v-4l4-4-4-4V2z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M8 6h8M8 18h8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 7v5l3 2" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  folder: (
    <>
      <path d="M3 8a2 2 0 012-2h5l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 8V6a2 2 0 012-2h4l2 2h7" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </>
  ),
  money: (
    <>
      <rect x="4" y="8" width="16" height="8" rx="2" stroke="currentColor" strokeWidth="2" fill="none" />
      <circle cx="12" cy="12" r="2" fill="currentColor" />
      <path d="M7 10v4M17 10v4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  construction: (
    <>
      <path d="M12 3l9 16H3L12 3z" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 9v4M12 17h.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  gift: (
    <>
      <path d="M6 10h12v7H6z" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M9 10V7a3 3 0 013-3 3 3 0 013 3v3" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" />
      <path d="M12 10v7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  map: (
    <>
      <path d="M4 5l5-2 5 2 5-2v14l-5 2-5-2-5 2V5z" stroke="currentColor" strokeWidth="2" fill="none" />
      <path d="M12 6v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </>
  ),
  celebration: <path d="M12 2l2.5 7H22l-5.5 4 2.5 7L12 16l-6.5 4 2.5-7L2 9h7.5L12 2z" fill="currentColor" />,
  capture: (
    <path
      d="m12.47 4.6c3.41 3.36 3.41 7.88 0 11.24m-4.85-2.05c2.62-1.87 6.14-1.87 8.76 0m-4.75-9.24c-3.43 3.38-3.43 7.93 0 11.31m.34-11.31c-3.12.02-5.65 2.56-5.63 5.69.02 3.12 2.56 5.65 5.68 5.63 3.13-.02 5.65-2.56 5.63-5.69-.02-3.1-2.53-5.61-5.62-5.63h-.06zm.03 0v11.32m5.65-5.66H6.34m1.28-3.4c2.62 1.87 6.14 1.87 8.76 0"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  ),
};

export function Icon({ name, className = "", title }: IconProps) {
  const iconPath = iconPaths[name] ?? <></>;

  return (
    <svg
      className={className}
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="img"
    >
      {title ? <title>{title}</title> : null}
      {iconPath}
    </svg>
  );
}

export type { IconName };
