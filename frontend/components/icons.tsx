import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Line({ size = 24, children, ...rest }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.7}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export function AppMark({ size = 22, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 22 22"
      fill="none"
      aria-hidden="true"
      {...rest}
    >
      <rect x="3" y="12" width="4" height="7" rx="1" fill="#F4F4F5" />
      <rect x="9" y="8" width="4" height="11" rx="1" fill="#F4F4F5" />
      <rect x="15" y="4" width="4" height="15" rx="1" fill="#FF7A3C" />
    </svg>
  );
}

export function IconBackspace(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M20 6H10l-6 6 6 6h10a1 1 0 0 0 1-1V7a1 1 0 0 0-1-1z" />
      <path d="M16 10l-4 4M12 10l4 4" />
    </Line>
  );
}

export function IconAlert(props: IconProps) {
  return (
    <Line {...props}>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v6M12 16.5v.01" />
    </Line>
  );
}

export function IconLogout(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M9 4.5H5.5A1.5 1.5 0 0 0 4 6v12a1.5 1.5 0 0 0 1.5 1.5H9" />
      <path d="M15.5 8.5L19 12l-3.5 3.5M19 12H9" />
    </Line>
  );
}

export function IconWallet(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M3 7a2 2 0 0 1 2-2h12v4" />
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <circle cx="16" cy="13" r="1.3" fill="currentColor" stroke="none" />
    </Line>
  );
}

export function IconMoon(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M20 14.5A8 8 0 0 1 9.5 4 7 7 0 1 0 20 14.5z" />
    </Line>
  );
}

export function IconGrid(props: IconProps) {
  return (
    <Line {...props}>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </Line>
  );
}

export function IconHabits(props: IconProps) {
  return (
    <Line {...props}>
      <rect x="3.2" y="3.2" width="7.2" height="7.2" rx="1.9" />
      <rect x="13.6" y="3.2" width="7.2" height="7.2" rx="1.9" />
      <rect x="3.2" y="13.6" width="7.2" height="7.2" rx="1.9" />
      <path d="M14.2 17.4l2.1 2.1 4.4-4.9" />
    </Line>
  );
}

export function IconFlame(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M12 3c.4 2.6 2.2 3.9 3.4 5.4A5.5 5.5 0 1 1 6.6 12c0-1.7.7-3 1.7-4 .1 1.1.7 1.9 1.7 2.2C9.2 8 10 5.4 12 3z" />
    </Line>
  );
}

export function IconHome(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M4 11.5 12 4l8 7.5" />
      <path d="M6 10.5V20h12v-9.5" />
      <path d="M10 20v-4.5h4V20" />
    </Line>
  );
}

export function IconBanknote(props: IconProps) {
  return (
    <Line {...props}>
      <rect x="2.5" y="6.5" width="19" height="11" rx="2.5" />
      <circle cx="12" cy="12" r="2.4" />
      <path d="M6.2 9.9v4.2M17.8 9.9v4.2" />
    </Line>
  );
}

export function IconReceipt(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M6.5 3.5h11v15.5l-2.2 1.6-2.2-1.6-2.2 1.6-2.2-1.6-2.2 1.6z" />
      <path d="M9.6 8.2h4.8M9.6 11.8h4.8" />
    </Line>
  );
}

export function IconSliders(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M4 8h16M4 16h16" />
      <circle cx="9" cy="8" r="2.3" />
      <circle cx="15" cy="16" r="2.3" />
    </Line>
  );
}

export function IconChevrons(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M13 6l-5 6 5 6" />
      <path d="M18 6l-5 6 5 6" />
    </Line>
  );
}

export function IconChevronLeft(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M14.5 6 8.5 12l6 6" />
    </Line>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M9.5 6l6 6-6 6" />
    </Line>
  );
}

export function IconPlus(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M12 5v14M5 12h14" />
    </Line>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <Line {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="M20.5 20.5l-4-4" />
    </Line>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Line>
  );
}

export function IconClose(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M6.2 6.2l11.6 11.6M17.8 6.2 6.2 17.8" />
    </Line>
  );
}

export function IconPencil(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M4 20l.9-3.7L16.3 5a2.1 2.1 0 0 1 3 3L7.7 19.1z" />
    </Line>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M4.5 7h15M9.6 7V4.8h4.8V7M6.9 7l.9 12.3a1.6 1.6 0 0 0 1.6 1.5h5.2a1.6 1.6 0 0 0 1.6-1.5L17.1 7" />
    </Line>
  );
}

export function IconCheck(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M4.5 12.3l5 5 10-10.6" />
    </Line>
  );
}

export function IconClock(props: IconProps) {
  return (
    <Line {...props}>
      <circle cx="12" cy="12" r="8.4" />
      <path d="M12 7.2v5.2l3.2 1.9" />
    </Line>
  );
}

export function IconCalendar(props: IconProps) {
  return (
    <Line {...props}>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M3.5 9.6h17M8.4 3v4M15.6 3v4" />
    </Line>
  );
}

export function IconTrendUp(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M4 15 10 9l4 4 6-6" />
      <path d="M16 7h4v4" />
    </Line>
  );
}

export function IconTrendDown(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M4 9 10 15l4-4 6 6" />
      <path d="M16 17h4v-4" />
    </Line>
  );
}

export function IconArrowUpRight(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M7 17 17 7M8 7h9v9" />
    </Line>
  );
}

export function IconArrowDownRight(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M7 7l10 10M17 8v9H8" />
    </Line>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <Line {...props}>
      <circle cx="9" cy="8" r="3.3" />
      <path d="M3.4 20a5.6 5.6 0 0 1 11.2 0" />
      <path d="M16.1 5.5a3.3 3.3 0 0 1 0 6" />
      <path d="M17.6 14.4a5.6 5.6 0 0 1 3 5.6" />
    </Line>
  );
}

export function IconPhone(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M6.5 4.5h3l1.4 3.6-2 1.4a10 10 0 0 0 5.1 5.1l1.4-2 3.6 1.4v3a2 2 0 0 1-2.2 2A15.5 15.5 0 0 1 4.5 6.7a2 2 0 0 1 2-2.2z" />
    </Line>
  );
}

export function IconMail(props: IconProps) {
  return (
    <Line {...props}>
      <rect x="3.5" y="5.5" width="17" height="13" rx="2.5" />
      <path d="M4.5 7.5l7.5 5.5 7.5-5.5" />
    </Line>
  );
}

export function IconLock(props: IconProps) {
  return (
    <Line {...props}>
      <rect x="4" y="10" width="16" height="11" rx="2.5" />
      <path d="M8 10V7a4 4 0 0 1 8 0v3" />
      <path d="M12 14.4v2.8" />
    </Line>
  );
}

export function IconActivity(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M8 3.5c1.9 0 3 2 3 4.7S9.9 12.6 8 12.6 5 11 5 8.2 6.1 3.5 8 3.5Z" />
      <path d="M5.4 15c0 2 1 3.3 2.9 3.3S11 17.1 11 15.5c0-1.4-.8-2.2-2.7-2.2S5.4 13.4 5.4 15Z" />
      <path d="M16 7.4c1.9 0 3 2 3 4.7s-1.1 4.4-3 4.4-3-1.6-3-4.4 1.1-4.7 3-4.7Z" />
      <path d="M13.4 18.9c0 2 1 3.3 2.9 3.3s2.7-1.2 2.7-2.8c0-1.4-.8-2.2-2.7-2.2s-2.9.1-2.9 1.7Z" />
    </Line>
  );
}

export function IconBook(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M12 6.2C10.4 4.9 8.2 4.3 5.5 4.3v14.4c2.7 0 4.9.6 6.5 1.9 1.6-1.3 3.8-1.9 6.5-1.9V4.3c-2.7 0-4.9.6-6.5 1.9Z" />
      <path d="M12 6.2v14.4" />
    </Line>
  );
}

export function IconBriefcase(props: IconProps) {
  return (
    <Line {...props}>
      <rect x="3" y="8" width="18" height="11.5" rx="2" />
      <path d="M8.5 8V6a2 2 0 0 1 2-2h3a2 2 0 0 1 2 2v2" />
      <path d="M3 13.2h18" />
      <path d="M10.5 13.2v1.6h3v-1.6" />
    </Line>
  );
}

export function IconSpark(props: IconProps) {
  return (
    <Line {...props}>
      <path d="M10 3c.5 4 2.4 5.9 6.4 6.4-4 .5-5.9 2.4-6.4 6.4-.5-4-2.4-5.9-6.4-6.4C7.6 8.9 9.5 7 10 3Z" />
      <path d="M17.6 13.6c.2 1.9 1.1 2.8 2.9 3-1.8.2-2.7 1.1-2.9 3-.2-1.9-1.1-2.8-2.9-3 1.8-.2 2.7-1.1 2.9-3Z" />
    </Line>
  );
}
