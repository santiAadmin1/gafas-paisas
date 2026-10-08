import type { ReactNode } from "react";

export type IconName =
  | "instagram" | "camera" | "phone" | "arrow-right" | "arrow-up-right" | "lock"
  | "check" | "sparkles" | "upload" | "shopping-bag" | "photo" | "heart"
  | "chevron-left" | "chevron-right" | "sliders" | "close" | "layers"
  | "shield" | "external" | "eye" | "info" | "refresh";

type Props = { name: IconName; size?: number; className?: string; strokeWidth?: number };

export function UiIcon({ name, size = 20, className = "", strokeWidth = 1.8 }: Props) {
  const paths: Record<IconName, ReactNode> = {
    instagram: <><rect x="2" y="2" width="20" height="20" rx="6" /><circle cx="12" cy="12" r="4" /><circle cx="18" cy="6" r="1" fill="currentColor" stroke="none" /></>,
    camera: <><path d="M14 4H9l-2 3H3a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h18a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-4l-3-3Z" transform="translate(1 -1) scale(.92)" /><circle cx="12" cy="13" r="4" /></>,
    phone: <><rect x="6" y="2" width="12" height="20" rx="2.8" /><path d="M11 18h2" /></>,
    "arrow-right": <><path d="M5 12h14M13 6l6 6-6 6" /></>,
    "arrow-up-right": <><path d="M6 18 18 6M8 6h10v10" /></>,
    lock: <><rect x="5" y="10" width="14" height="11" rx="2" /><path d="M8 10V7a4 4 0 0 1 8 0v3" /></>,
    check: <path d="m5 12 4 4L19 6" />,
    sparkles: <><path d="m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2L12 2Z" /><path d="M20 2v4M18 4h4" /></>,
    upload: <><path d="M12 16V3m-5 5 5-5 5 5" /><path d="M4 16v3a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-3" /></>,
    "shopping-bag": <><path d="M4 8h16l-1 13H5L4 8Z" /><path d="M9 9V6a3 3 0 0 1 6 0v3" /></>,
    photo: <><rect x="3" y="3" width="18" height="18" rx="3" /><circle cx="8.5" cy="8.5" r="1.4" /><path d="m3 17 5-5 4 4 3-3 6 6" /></>,
    heart: <path d="M20.8 8.6c0 4.8-8.8 10.4-8.8 10.4S3.2 13.4 3.2 8.6a4.6 4.6 0 0 1 8.8-1.8 4.6 4.6 0 0 1 8.8 1.8Z" />,
    "chevron-left": <path d="m14.5 5-7 7 7 7" />,
    "chevron-right": <path d="m9.5 5 7 7-7 7" />,
    sliders: <><path d="M4 7h16M4 17h16" /><circle cx="9" cy="7" r="2" fill="currentColor" stroke="none" /><circle cx="16" cy="17" r="2" fill="currentColor" stroke="none" /></>,
    close: <path d="M5 5 19 19M19 5 5 19" />,
    layers: <><path d="m12 3 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 16l9 5 9-5" /></>,
    shield: <><path d="m12 2 9 4v6c0 6-4.3 9-9 10-4.7-1-9-4-9-10V6l9-4Z" /><path d="m8 12 3 3 5-6" /></>,
    external: <><path d="M13 5h6v6M19 5l-9 9" /><path d="M19 14v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h4" /></>,
    eye: <><path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6S2 12 2 12Z" /><circle cx="12" cy="12" r="2.7" /></>,
    info: <><circle cx="12" cy="12" r="10" /><path d="M12 11v6M12 7h.01" /></>,
    refresh: <><path d="M20 7V3l-4 4M4 17v4l4-4" /><path d="M20 7a8 8 0 0 0-14-2M4 17a8 8 0 0 0 14 2" /></>,
  };
  return <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={strokeWidth} strokeLinecap="round" strokeLinejoin="round" className={`shrink-0 ${className}`} aria-hidden="true">{paths[name]}</svg>;
}
