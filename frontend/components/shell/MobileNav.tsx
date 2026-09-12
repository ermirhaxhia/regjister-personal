"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/cn";
import {
  AppMark,
  IconMenu,
  IconClose,
  IconPlus,
} from "@/components/icons";
import { useShell } from "@/components/shell/ShellContext";
import {
  PRIMARY,
  MODULES,
  FOOTER,
  LOGOUT,
  isActive,
  titleForPath,
  type NavItem,
} from "@/components/shell/nav";

export default function MobileNav({ onLogout }: { onLogout: () => void }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const { counts, addAction } = useShell();
  const title = titleForPath(pathname);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <>
      <header className="sticky top-0 z-30 flex h-13 items-center gap-3 border-b border-border bg-bg px-3.5 lg:hidden">
        <button
          type="button"
          onClick={() => setOpen(true)}
          aria-label="Hap menunë"
          className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] border border-white/10 text-text-mid"
        >
          <IconMenu size={17} />
        </button>
        <span className="flex-1 truncate font-display text-[15px] font-semibold tracking-tight text-text-hi">
          {title}
        </span>
        {addAction && (
          <button
            type="button"
            onClick={addAction.run}
            aria-label={addAction.label}
            className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] bg-accent text-bg"
          >
            <IconPlus size={16} />
          </button>
        )}
      </header>

      <AnimatePresence>
        {open && (
          <motion.div
            key="scrim"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            onClick={() => setOpen(false)}
            className="rp-glass-scrim fixed inset-0 z-40 lg:hidden"
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {open && (
          <motion.nav
            key="drawer"
            initial={{ x: "-100%" }}
            animate={{ x: 0 }}
            exit={{ x: "-100%" }}
            transition={{ duration: 0.32, ease: [0.2, 0.8, 0.2, 1] }}
            className="rp-glass-drawer fixed inset-y-0 left-0 z-50 flex w-[270px] flex-col p-3.5 lg:hidden"
          >
              <div className="flex items-center gap-2.5 px-1.5 pb-1">
                <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[10px] border border-white/10 bg-[#1c1d23]">
                  <AppMark size={17} />
                </span>
                <span className="flex-1 font-display text-sm font-semibold text-[#e7e7ea]">
                  Regjistri
                </span>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  aria-label="Mbyll menunë"
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-white/10 text-text-lo"
                >
                  <IconClose size={14} />
                </button>
              </div>

              <div className="h-3.5" />

              <DrawerLink
                item={PRIMARY}
                active={isActive(pathname, PRIMARY.href)}
                onNavigate={() => setOpen(false)}
              />

              <div className="px-3 pb-2 pt-4 text-[9.5px] font-semibold uppercase tracking-[0.14em] text-[#6f6f79]">
                Module
              </div>
              {MODULES.map((item) => (
                <DrawerLink
                  key={item.href}
                  item={item}
                  active={isActive(pathname, item.href)}
                  count={item.countKey ? counts[item.countKey] : undefined}
                  onNavigate={() => setOpen(false)}
                />
              ))}

              <div className="flex-1" />

              {FOOTER.map((item) => (
                <DrawerLink
                  key={item.href}
                  item={item}
                  active={isActive(pathname, item.href)}
                  muted
                  onNavigate={() => setOpen(false)}
                />
              ))}
              <button
                type="button"
                onClick={onLogout}
                className="flex h-10 items-center gap-3 rounded-[10px] px-3 text-[#9a9aa4]"
              >
                <LOGOUT.icon size={18} />
                <span className="text-[12.5px]">{LOGOUT.label}</span>
              </button>
          </motion.nav>
        )}
      </AnimatePresence>
    </>
  );
}

function DrawerLink({
  item,
  active,
  count,
  muted,
  onNavigate,
}: {
  item: NavItem;
  active: boolean;
  count?: number;
  muted?: boolean;
  onNavigate: () => void;
}) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      onClick={onNavigate}
      className={cn(
        "relative flex h-[42px] items-center gap-3 rounded-[10px] px-3",
        active
          ? "bg-accent/16 text-text-hi"
          : muted
            ? "text-[#9a9aa4]"
            : "text-text-mid",
      )}
    >
      {active && (
        <span className="absolute -left-3.5 bottom-2.5 top-2.5 w-[3px] rounded-r bg-accent" />
      )}
      <span className={cn("flex shrink-0", active && "text-accent")}>
        <Icon size={19} />
      </span>
      <span className="flex-1 text-[13px]">{item.label}</span>
      {count != null && (
        <span className="font-mono text-[11px] text-text-lo">{count}</span>
      )}
    </Link>
  );
}
