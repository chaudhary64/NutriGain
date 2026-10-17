/**
 * Draw icons for the app chrome — one stroke weight, no emoji.
 * Kept in its own module so the shell stays readable and the sidebar,
 * marketing bar, and mobile menu all draw from the same set.
 */
export default function NavIcon({ name, className = "w-[18px] h-[18px]" }) {
  const paths = {
    feed: (
      <>
        <path d="M3 10.5 12 3l9 7.5" />
        <path d="M5.5 9.5V20h13V9.5" />
      </>
    ),
    /* Fork + knife rather than a steaming bowl: the convention for "eat" reads
       at 18px, where a bowl with curls of steam reads as soup. */
    meal: (
      <>
        <path d="M3 2v7c0 1.1.9 2 2 2h4a2 2 0 0 0 2-2V2" />
        <path d="M7 2v20" />
        <path d="M21 15V2a5 5 0 0 0-5 5v6c0 1.1.9 2 2 2h3Z" />
        <path d="M21 15v7" />
      </>
    ),
    gym: <path d="M6.5 6.5v11M4 9v6M17.5 6.5v11M20 9v6M6.5 12h11" />,
    progress: (
      <>
        <path d="M3 3v18h18" />
        <path d="M6.5 15.5 10 11l3 2.7L18.7 8" />
      </>
    ),
    profile: (
      <>
        <path d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0z" />
        <path d="M4.5 20.25a7.5 7.5 0 0 1 15 0" />
      </>
    ),
    settings: (
      <>
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </>
    ),
    console: (
      <>
        <path d="M4 6h16M4 12h16M4 18h9" />
        <circle cx="18.5" cy="18" r="2" />
      </>
    ),
    /* Canonical log-out geometry (Lucide/Feather, tagged sign-out / exit /
       arrow): a bracket on the left, arrow leaving to the right with its tail
       flush against the door edge. The chevron spans y7-y17 here instead of
       y9-y15, so it still reads at the 18px the footer renders it. */
    logout: (
      <>
        <path d="m16 17 5-5-5-5" />
        <path d="M21 12H9" />
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      </>
    ),
    /* Core disc plus rays — rays alone around an empty middle read as a dashed
       ring at 18px rather than a sun. */
    sun: (
      <>
        <circle cx="12" cy="12" r="5" />
        <path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
      </>
    ),
    moon: (
      <path d="M21.752 15.002A9.718 9.718 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998z" />
    ),
    close: <path d="M6 18 18 6M6 6l12 12" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    arrow: <path d="M5 12h14m0 0-6-6m6 6-6 6" />,
  };
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.8}
      stroke="currentColor"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={className}
    >
      {paths[name]}
    </svg>
  );
}