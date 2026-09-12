"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import { AppMark, IconChevrons } from "@/components/icons";
import { useShell } from "@/components/shell/ShellContext";
import {
  PRIMARY,
  MODULES,
  FOOTER,
  LOGOUT,
  isActive,
  type NavItem,
} from "@/components/shell/nav";

interface Props {
  collapsed: boolean;
  onToggle: () => void;
  onLogout: () => void;
}

export default function Sidebar({ collapsed, onToggle, onLogout }: Props) {
  const pathname = usePathname();
  const { counts } = useShell();

  return (
    <motion.aside
      initial={false}
      animate={{ width: collapsed ? 64 : 236 }}
      transition={{ duration: 0.24, ease: [0.2, 0.7, 0.2, 1] }}
      className="hidden shrink-0 flex-col border-r border-border bg-[#17181c] p-3.5 lg:flex"
    >
      <div className="flex items-center gap-2.5 px-1.5 pb-1">
        <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-white/10 bg-[#1c1d23]">
          <AppMark size={17} />
        </span>
        <AnimatePresence initial={false}>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex-1 truncate font-display text-sm font-semibold tracking-wide text-[#e7e7ea]"
            >
              Regjistri
            </motion.span>
          )}
        </AnimatePresence>
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? "Zgjero menunë" : "Mbyll menunë"}
          className="flex h-[26px] w-[26px] shrink-0 items-center justify-center rounded-[7px] border border-white/10 text-text-lo transition-colors hover:text-text-mid"
        >
          <motion.span
            animate={{ rotate: collapsed ? 180 : 0 }}
            transition={{ duration: 0.24 }}
            className="flex"
          >
            <IconChevrons size={15} />
          </motion.span>
        </button>
      </div>

      <div className="h-3.5" />

      <Row
        item={PRIMARY}
        active={isActive(pathname, PRIMARY.href)}
        collapsed={collapsed}
      />

      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="px-3 pb-2 pt-4 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#6f6f79]"
          >
            Module
          </motion.div>
        )}
      </AnimatePresence>
      {collapsed && <div className="mx-auto my-2 h-px w-5 bg-white/10" />}

      <div className="flex flex-col gap-0.5">
        {MODULES.map((item) => (
          <Row
            key={item.href}
            item={item}
            active={isActive(pathname, item.href)}
            collapsed={collapsed}
            count={item.countKey ? counts[item.countKey] : undefined}
          />
        ))}
      </div>

      <div className="flex-1" />

      <div className="flex flex-col gap-0.5">
        {FOOTER.map((item) => (
          <Row
            key={item.href}
            item={item}
            active={isActive(pathname, item.href)}
            collapsed={collapsed}
            muted
          />
        ))}
        <button
          type="button"
          onClick={onLogout}
          aria-label={collapsed ? LOGOUT.label : undefined}
          className="group relative flex h-[38px] items-center gap-3 rounded-[10px] px-3 text-[#9a9aa4] transition-colors hover:bg-white/5 hover:text-text-mid"
        >
          <span className="flex shrink-0 transition-transform duration-200 group-hover:scale-110">
            <LOGOUT.icon size={18} />
          </span>
          {!collapsed && (
            <span className="text-[12.5px]">{LOGOUT.label}</span>
          )}
          {collapsed && <CollapsedTip label={LOGOUT.label} />}
        </button>
      </div>
    </motion.aside>
  );
}

function Row({
  item,
  active,
  collapsed,
  count,
  muted,
}: {
  item: NavItem;
  active: boolean;
  collapsed: boolean;
  count?: number;
  muted?: boolean;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      aria-label={collapsed ? item.label : undefined}
      className={cn(
        "group relative flex h-10 items-center gap-3 rounded-[10px] px-3 transition-colors",
        active
          ? "bg-accent/16 text-text-hi"
          : muted
            ? "text-[#9a9aa4] hover:bg-white/5 hover:text-text-mid"
            : "text-text-mid hover:bg-white/5 hover:text-text-hi",
      )}
    >
      {active && (
        <span className="absolute -left-3.5 bottom-2 top-2 w-[3px] rounded-r bg-accent" />
      )}
      <span
        className={cn(
          "flex shrink-0 transition-transform duration-200 group-hover:scale-110",
          active && "text-accent",
        )}
      >
        <Icon size={19} />
      </span>
      {!collapsed && (
        <>
          <span className="flex-1 truncate text-[13px]">{item.label}</span>
          {count != null && (
            <span className="font-mono text-[11px] text-text-lo">{count}</span>
          )}
        </>
      )}
      {collapsed && <CollapsedTip label={item.label} count={count} />}
    </Link>
  );
}

function CollapsedTip({ label, count }: { label: string; count?: number }) {
  return (
    <span
      role="tooltip"
      className="rp-glass-tooltip pointer-events-none absolute left-[calc(100%+10px)] top-1/2 z-50 -translate-y-1/2 whitespace-nowrap rounded-md px-2 py-1 text-[12px] text-text-hi opacity-0 shadow-lg transition-opacity duration-150 group-hover:opacity-100"
    >
      {label}
      {count != null && (
        <span className="ml-1.5 font-mono text-[11px] text-text-lo">{count}</span>
      )}
    </span>
  );
}
