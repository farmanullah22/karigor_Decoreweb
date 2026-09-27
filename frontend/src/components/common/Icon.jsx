/**
 * Inline SVG icon set - keeps the bundle dependency-free.
 * All icons are 24x24, stroke-based, and inherit currentColor.
 *
 * Usage: <Icon name="phone" size={18} />
 */

const PATHS = {
  // --- Navigation / UI ---
  menu: <path d="M4 6h16M4 12h16M4 18h16" />,
  close: <path d="M18 6 6 18M6 6l12 12" />,
  'arrow-right': <path d="M5 12h14m-6-6 6 6-6 6" />,
  'arrow-left': <path d="M19 12H5m6 6-6-6 6-6" />,
  'arrow-up-right': <path d="M7 17 17 7M8 7h9v9" />,
  'chevron-down': <path d="m6 9 6 6 6-6" />,
  'chevron-left': <path d="m15 6-6 6 6 6" />,
  'chevron-right': <path d="m9 6 6 6-6 6" />,
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </>
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  minus: <path d="M5 12h14" />,
  check: <path d="m5 12 5 5L20 7" />,
  'check-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8.5 12 2.5 2.5 4.5-5" />
    </>
  ),
  'x-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m9 9 6 6m0-6-6 6" />
    </>
  ),
  'alert-circle': (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v4.5M12 16h.01" />
    </>
  ),
  info: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 11v5M12 8h.01" />
    </>
  ),
  refresh: <path d="M21 12a9 9 0 1 1-2.6-6.4M21 3v6h-6" />,
  filter: <path d="M4 6h16M7 12h10M10 18h4" />,
  eye: (
    <>
      <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </>
  ),
  'eye-off': (
    <>
      <path d="M3 3l18 18M10.6 5.8A9.8 9.8 0 0 1 12 5.5c6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3 3.9M6.6 6.6A16.6 16.6 0 0 0 2.5 12S6 18.5 12 18.5a9.6 9.6 0 0 0 4.5-1.1" />
    </>
  ),
  edit: <path d="M4 20h4L19.5 8.5a2.1 2.1 0 0 0-3-3L5 17v3ZM13.5 6.5l3 3" />,
  trash: <path d="M5 7h14M10 11v6M14 11v6M6.5 7l1 13h9l1-13M9 7V4.5A1.5 1.5 0 0 1 10.5 3h3A1.5 1.5 0 0 1 15 4.5V7" />,
  star: <path d="m12 3.5 2.6 5.4 5.9.8-4.3 4.1 1 5.9-5.2-2.8-5.2 2.8 1-5.9L3.5 9.7l5.9-.8Z" />,
  upload: <path d="M12 16V4m0 0L7 9m5-5 5 5M4 20h16" />,
  image: (
    <>
      <rect x="3" y="4" width="18" height="16" rx="2" />
      <circle cx="9" cy="10" r="1.6" />
      <path d="m4 18 5-5 4 4 3-3 4 4" />
    </>
  ),
  grid: (
    <>
      <rect x="4" y="4" width="7" height="7" rx="1.5" />
      <rect x="13" y="4" width="7" height="7" rx="1.5" />
      <rect x="4" y="13" width="7" height="7" rx="1.5" />
      <rect x="13" y="13" width="7" height="7" rx="1.5" />
    </>
  ),
  list: <path d="M8 6h13M8 12h13M8 18h13M3.5 6h.01M3.5 12h.01M3.5 18h.01" />,
  'external-link': <path d="M14 4h6v6M20 4 10 14M18 13v6a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h6" />,
  lock: (
    <>
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </>
  ),

  // --- Admin nav ---
  dashboard: (
    <>
      <rect x="3.5" y="3.5" width="7" height="9" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="5.5" rx="1.5" />
      <rect x="13.5" y="12.5" width="7" height="8" rx="1.5" />
      <rect x="3.5" y="16" width="7" height="4.5" rx="1.5" />
    </>
  ),
  package: <path d="M12 3 4 7v10l8 4 8-4V7l-8-4Zm0 0v18m8-14-8 4-8-4" />,
  folder: <path d="M4 6.5A1.5 1.5 0 0 1 5.5 5h4l2 2.5h7A1.5 1.5 0 0 1 20 9v8.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 17.5v-11Z" />,
  briefcase: (
    <>
      <rect x="3.5" y="7.5" width="17" height="12" rx="2" />
      <path d="M9 7.5V6a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v1.5M3.5 12.5h17" />
    </>
  ),
  inbox: <path d="M4 12.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v6.5M4 12.5h4.5l1.5 2.5h4l1.5-2.5H20M4 12.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-5.5" />,
  'file-text': (
    <>
      <path d="M6 3.5h8L19 8.5v11a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-15a1 1 0 0 1 1-1Z" />
      <path d="M14 3.5v5h5M9 13h6M9 16.5h6" />
    </>
  ),
  'user-plus': (
    <>
      <circle cx="10" cy="8" r="3.5" />
      <path d="M4 20c0-3.3 2.7-6 6-6s6 2.7 6 6M19 8v6M16 11h6" />
    </>
  ),
  users: (
    <>
      <circle cx="9" cy="8.5" r="3.2" />
      <path d="M3.5 19.5c0-3 2.5-5.5 5.5-5.5s5.5 2.5 5.5 5.5M16 5.6a3.2 3.2 0 0 1 0 5.9M17.5 14.4c1.8.8 3 2.5 3 4.6" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2.8 13.6 5l2.6-.7 1 2.5 2.6.9-.6 2.6 1.8 1.9-1.8 1.9.6 2.6-2.6.9-1 2.5-2.6-.7L12 21.2 10.4 19l-2.6.7-1-2.5-2.6-.9.6-2.6L3 11.8l1.8-1.9-.6-2.6 2.6-.9 1-2.5 2.6.7Z" />
    </>
  ),
  home: <path d="m4 11 8-7 8 7v8.5a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19.5V11Z" />,
  'log-out': <path d="M14 4h4a1 1 0 0 1 1 1v14a1 1 0 0 1-1 1h-4M10 8l-4 4 4 4M6 12h11" />,
  user: (
    <>
      <circle cx="12" cy="8" r="3.6" />
      <path d="M5 20c0-3.6 3.1-6.5 7-6.5s7 2.9 7 6.5" />
    </>
  ),
  key: (
    <>
      <circle cx="8" cy="15" r="4" />
      <path d="m11 12 8-8m-3 3 3 3m-6 0 2 2" />
    </>
  ),

  // --- Contact ---
  phone: <path d="M5 4h4l1.5 4.5L8 10a13 13 0 0 0 6 6l1.5-2.5L20 15v4a1.5 1.5 0 0 1-1.7 1.5A17.5 17.5 0 0 1 3.5 5.7 1.5 1.5 0 0 1 5 4Z" />,
  mail: (
    <>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2" />
      <path d="m4.5 7.5 7.5 6 7.5-6" />
    </>
  ),
  'map-pin': (
    <>
      <path d="M12 21s-7-6-7-11.5a7 7 0 0 1 14 0C19 15 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),
  send: <path d="m4 12 16-8-5 16-4-6-7-2Z" />,

  // --- Social ---
  whatsapp: (
    <path d="M12 3.5A8.5 8.5 0 0 0 4.6 16.3L3.5 20.5l4.3-1.1A8.5 8.5 0 1 0 12 3.5Zm4.3 12c-.2.5-1.1 1-1.6 1.1-.4 0-.9 0-1.5-.2a12 12 0 0 1-4.3-2.9 9.4 9.4 0 0 1-1.9-3.3c-.2-.7 0-1.6.5-2.1.2-.2.4-.3.6-.3h.5c.2 0 .4 0 .5.4l.7 1.7c0 .2 0 .3-.1.5l-.4.5c-.1.2-.2.3 0 .5a8.6 8.6 0 0 0 2 2.4c.7.5 1.2.8 1.6.9.2 0 .4 0 .5-.2l.6-.7c.2-.2.3-.2.5-.1l1.7.8c.2.1.3.2.4.3v.9Z" />
  ),
  facebook: <path d="M14.5 8.5H17V5.4h-2.6c-2.2 0-3.9 1.7-3.9 3.9v1.9H8v3.1h2.5v6.3h3.3v-6.3h2.6l.5-3.1h-3.1V9.6c0-.7.3-1.1.7-1.1Z" />,
  instagram: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="4.5" />
      <circle cx="12" cy="12" r="3.6" />
      <path d="M16.8 7.2h.01" />
    </>
  ),
  tiktok: <path d="M15 4.5c.4 2 1.7 3.4 3.8 3.6v2.7c-1.4 0-2.7-.4-3.8-1.2v5.6a5.6 5.6 0 1 1-5.6-5.6c.3 0 .6 0 .9.1v2.8a2.9 2.9 0 1 0 2 2.7V4.5H15Z" />,
  youtube: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="3.5" />
      <path d="m10.5 9.5 4.5 2.5-4.5 2.5v-5Z" />
    </>
  ),
  linkedin: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="2.5" />
      <path d="M8 10.5V16M8 7.8v.01M12 16v-3a1.8 1.8 0 0 1 3.6 0v3M12 10.5V16" />
    </>
  ),

  // --- Why-us / values ---
  award: (
    <>
      <circle cx="12" cy="9" r="5" />
      <path d="m8.8 13.5-1.3 6 4.5-2.5 4.5 2.5-1.3-6" />
    </>
  ),
  tool: <path d="M14.5 6.5a4.6 4.6 0 0 0-6 6L4 17l3 3 4.5-4.5a4.6 4.6 0 0 0 6-6l-3 3-2.5-.5-.5-2.5 3-3Z" />,
  ruler: <path d="m4 17 13-13 3 3L7 20l-3-3Zm4-1 1.5 1.5M10.5 12.5 12 14M14 9l1.5 1.5" />,
  shield: (
    <>
      <path d="M12 3 5 5.7v5.2c0 4.3 3 8.2 7 9.6 4-1.4 7-5.3 7-9.6V5.7L12 3Z" />
      <path d="m9 11.5 2 2 4-4.5" />
    </>
  ),
  tag: (
    <>
      <path d="M4 4h6.5l9.5 9.5a2 2 0 0 1 0 2.8l-3.7 3.7a2 2 0 0 1-2.8 0L4 10.5V4Z" />
      <circle cx="8" cy="8" r="1.3" />
    </>
  ),
  layers: <path d="m12 3 9 5-9 5-9-5 9-5Zm-6.5 8.6L12 15l6.5-3.4M5.5 15.6 12 19l6.5-3.4" />,
  heart: <path d="M12 20s-7.5-4.6-7.5-10A4.3 4.3 0 0 1 12 7.2 4.3 4.3 0 0 1 19.5 10c0 5.4-7.5 10-7.5 10Z" />,
  sparkle: <path d="M12 3v4m0 10v4m-9-9h4m10 0h4m-3-6-2.8 2.8M8.8 15.2 6 18m12 0-2.8-2.8M8.8 8.8 6 6" />,

  // --- Service icons ---
  window: (
    <>
      <rect x="4" y="4" width="16" height="16" rx="1.5" />
      <path d="M12 4v16M4 12h16M9 12l1.8 3H7.2L9 12Z" />
    </>
  ),
  door: (
    <>
      <rect x="6" y="3" width="12" height="18" rx="1" />
      <circle cx="15" cy="12" r="0.9" />
      <path d="M3.5 21h17" />
    </>
  ),
  glass: (
    <>
      <path d="m7 4 10 0-2 16H9L7 4Z" />
      <path d="M7.6 9.5h8.8" />
    </>
  ),
  partition: (
    <>
      <rect x="4" y="4" width="7" height="16" rx="1" />
      <rect x="13" y="4" width="7" height="16" rx="1" />
      <path d="M13 4l-2 16M4 12h7M13 12h7" />
    </>
  ),
  shower: (
    <>
      <path d="M6 20v-8a5 5 0 0 1 10 0v8" />
      <path d="M8 8.5 9.5 3M12 8.5 12 3m2.5 5.5L16 3M4.5 20h15" />
    </>
  ),
  interior: (
    <>
      <path d="M5 10a7 7 0 0 1 14 0v9a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-9Z" />
      <path d="M5 13h14M10 20v-3M14 20v-3" />
    </>
  ),
  fabricate: (
    <>
      <rect x="3.5" y="9" width="17" height="9" rx="1.5" />
      <path d="M7 9V6.5A2.5 2.5 0 0 1 9.5 4h5A2.5 2.5 0 0 1 17 6.5V9M8 18v2m8-2v2" />
    </>
  ),
  design: (
    <>
      <path d="M3.5 20.5 9 19l10.4-10.4a2.1 2.1 0 0 0-3-3L6 16l-2.5 4.5Z" />
      <path d="M14.5 6.5l3 3" />
    </>
  ),
  office: (
    <>
      <path d="M4 20V5.5A1.5 1.5 0 0 1 5.5 4h9A1.5 1.5 0 0 1 16 5.5V20M16 9h2.5A1.5 1.5 0 0 1 20 10.5V20M3 20h18" />
      <path d="M7.5 8h3M7.5 12h3M7.5 16h3" />
    </>
  ),
  custom: (
    <>
      <path d="M12 3v3m0 12v3M3 12h3m12 0h3M5.6 5.6l2.1 2.1m8.6 8.6 2.1 2.1m0-12.8-2.1 2.1M7.7 16.3l-2.1 2.1" />
      <circle cx="12" cy="12" r="3.2" />
    </>
  ),
};

export default function Icon({ name, size = 20, strokeWidth = 1.8, className = '', ...rest }) {
  const path = PATHS[name] || PATHS.info;
  const isFilled = name === 'whatsapp' || name === 'facebook' || name === 'tiktok';

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={isFilled ? 'currentColor' : 'none'}
      stroke={isFilled ? 'none' : 'currentColor'}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
      focusable="false"
      {...rest}
    >
      {path}
    </svg>
  );
}
