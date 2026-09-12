"use client";

import { Fragment } from "react";
import Link from "next/link";
import { IconChevronRight } from "@/components/icons";

export interface Crumb {
  label: string;
  href?: string;
}

export default function Breadcrumb({ items }: { items: Crumb[] }) {
  return (
    <nav
      aria-label="Shtegu"
      className="flex flex-wrap items-center gap-1.5 text-xs text-text-lo"
    >
      {items.map((item, i) => (
        <Fragment key={`${item.label}-${i}`}>
          {i > 0 && <IconChevronRight size={12} className="shrink-0" />}
          {item.href ? (
            <Link
              href={item.href}
              className="truncate transition-colors hover:text-text-mid"
            >
              {item.label}
            </Link>
          ) : (
            <span className="truncate text-text-mid">{item.label}</span>
          )}
        </Fragment>
      ))}
    </nav>
  );
}
