import type { ComponentType } from "react";
import {
  IconHome,
  IconCalendar,
  IconSpark,
  IconGrid,
  IconReceipt,
  IconBanknote,
  IconMoon,
  IconHabits,
  IconActivity,
  IconUsers,
  IconBriefcase,
  IconSliders,
  IconLogout,
  IconWeekReview,
} from "@/components/icons";

export interface NavItem {
  href: string;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
  countKey?: "expenses" | "income" | "sleep" | "habits" | "fitness" | "hr";
}

export const PRIMARY: NavItem = {
  href: "/panel",
  label: "Kryesore",
  icon: IconHome,
};

export const MODULES: NavItem[] = [
  { href: "/panel/dita", label: "Dita", icon: IconCalendar },
  { href: "/panel/zbulime", label: "Zbulime", icon: IconSpark },
  { href: "/panel/dashboard", label: "Dashboard", icon: IconGrid },
  { href: "/panel/shpenzime", label: "Shpenzime", icon: IconReceipt, countKey: "expenses" },
  { href: "/panel/te-ardhura", label: "Të ardhura", icon: IconBanknote, countKey: "income" },
  { href: "/panel/gjumi", label: "Gjumi", icon: IconMoon, countKey: "sleep" },
  { href: "/panel/zakone", label: "Zakone", icon: IconHabits, countKey: "habits" },
  { href: "/panel/aktivitet", label: "Aktivitet", icon: IconActivity, countKey: "fitness" },
  { href: "/panel/ore-pune", label: "Orë Pune", icon: IconBriefcase },
  { href: "/panel/burime-njerezore", label: "Burime Njerëzore", icon: IconUsers, countKey: "hr" },
  { href: "/panel/rishikimi-javor", label: "Rishikimi Javor", icon: IconWeekReview },
];

export const FOOTER: NavItem[] = [
  { href: "/panel/cilesime", label: "Cilësime", icon: IconSliders },
];

export const LOGOUT = { label: "Dil", icon: IconLogout };

export function titleForPath(pathname: string): string {
  if (pathname === "/panel") return "Faqja kryesore";
  const all = [...MODULES, ...FOOTER];
  const hit = all.find((i) => pathname.startsWith(i.href));
  return hit ? hit.label : "Regjistri";
}

export function isActive(pathname: string, href: string): boolean {
  if (href === "/panel") return pathname === "/panel";
  return pathname === href || pathname.startsWith(`${href}/`);
}
