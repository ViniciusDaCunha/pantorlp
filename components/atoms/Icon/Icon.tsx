import React, { JSX } from "react";

type IconName =
  | "bolt"
  | "search"
  | "rocket"
  | "plug"
  | "ship"
  | "satellite"
  | "check"
  | "sync"
  | "hourglass"
  | "folder"
  | "money"
  | "construction"
  | "gift"
  | "map"
  | "celebration";

interface IconProps {
  name: IconName;
  className?: string;
  title?: string;
}

const iconPaths: Record<IconName, JSX.Element> = {
  bolt: <path d="M13 2L3 14h8l-1 8 10-12h-8l1-8z" fill="currentColor" />, // stylized
  search: (
    <>
      <path
        d="M11 4a7 7 0 104.9 12.1l4.5 4.5 1.4-1.4-4.5-4.5A7 7 0 0011 4zm0 2a5 5 0 110 10 5 5 0 010-10z"
        fill="currentColor"
      />
    </>
  ),
  rocket: (
    <path
      d="M9 21s1.5-3 4.5-3 4.5 3 4.5 3 2-5-2-9-5-7-7-7-6 3-6 7 2 9 2 9z"
      fill="currentColor"
    />
  ),
  plug: (
    <path
      d="M8 2v7h1v3a1 1 0 001 1h6a1 1 0 001-1V9h1V2h-2v4H10V2H8zM9 5h4V3H9v2z"
      fill="currentColor"
    />
  ),
  ship: (
    <path
      d="M4 17l4-5 4 5 4-5 4 5v3H4v-3zM4 14h16v-2l-2-4H6l-2 4v2zM10 6h4v3h-4V6z"
      fill="currentColor"
    />
  ),
  satellite: (
    <path
      d="M4 8l4-4 2 2-4 4-2-2zm16 12l-4 4-2-2 4-4 2 2zM7 17l6-6 3 3-6 6-3-3zM13 11l4-4 2 2-4 4-2-2z"
      fill="currentColor"
    />
  ),
  check: <path d="M3 12l4 4 10-10" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  sync: <path d="M4 12a8 8 0 0114-4.9L16 9m0-4v4h4" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  hourglass: <path d="M6 2h12l-3 6 3 6H6l3-6-3-6z" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />,
  folder: <path d="M3 7a2 2 0 012-2h4l2 2h8a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V7z" fill="currentColor" />,
  money: <>
    <path d="M4 8h16v8H4z" stroke="currentColor" strokeWidth="2" fill="none" />
    <circle cx="12" cy="12" r="2" fill="currentColor" />
  </>,
  construction: <>
    <path d="M4 16l8-8 8 8v5H4v-5z" fill="currentColor" />
    <path d="M8 16h8" stroke="#fff" strokeWidth="2" />
  </>,
  gift: <>
    <path d="M4 9h16v9H4V9zm8-5a3 3 0 00-3 3v2h6V7a3 3 0 00-3-3z" stroke="currentColor" strokeWidth="2" fill="none" />
    <path d="M12 4v14" stroke="currentColor" strokeWidth="2" />
  </>,
  map: <path d="M4 6l5-2 5 2 5-2v14l-5 2-5-2-5 2V6z" stroke="currentColor" strokeWidth="2" fill="none" />,
  celebration: <path d="M12 2l1.5 4.5L18 7l-3.5 2 1.5 4.5L12 10l-3 3 1.5-4.5L7 7l4.5-.5L12 2z" fill="currentColor" />,
};

export function Icon({ name, className = "", title }: IconProps) {
  const iconPath = iconPaths[name];

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
