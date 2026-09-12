"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

const noop = () => () => {};

const VIDEO_SOURCES = ["/entry.webm", "/entry.mp4"];

function formatToday(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}`;
}

function SidebarMark() {
  return (
    <svg width={19} height={19} viewBox="0 0 22 22" fill="none" aria-hidden="true">
      <rect x="3" y="12" width="4" height="7" rx="1" fill="#B8B8BF" />
      <rect x="9" y="8" width="4" height="11" rx="1" fill="#B8B8BF" />
      <rect x="15" y="4" width="4" height="15" rx="1" fill="#FF7A3C" />
    </svg>
  );
}

export default function EntrySidebar() {
  const today = useSyncExternalStore(noop, formatToday, () => "");
  const [videoSrc, setVideoSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      for (const src of VIDEO_SOURCES) {
        try {
          const res = await fetch(src, { method: "HEAD" });
          if (res.ok) {
            if (!cancelled) setVideoSrc(src);
            return;
          }
        } catch {
          // asnjë skedar — mbetet ambienti me gradient
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <aside className="relative hidden w-[600px] shrink-0 flex-col justify-between overflow-hidden border-r border-white/[0.06] bg-[#121316] p-14 lg:flex">
      {videoSrc ? (
        <>
          <video
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
            autoPlay
            muted
            loop
            playsInline
            src={videoSrc}
            onError={() => setVideoSrc(null)}
          />
          <div className="pointer-events-none absolute inset-0 bg-black/55" />
        </>
      ) : (
        <>
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background:
                "radial-gradient(680px 520px at 22% 32%,rgba(255,122,60,0.20),transparent 68%),radial-gradient(620px 520px at 96% 108%,rgba(124,127,224,0.20),transparent 70%)",
            }}
          />
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-[#121316] opacity-55"
          />
        </>
      )}

      <div className="relative flex items-center gap-3.5">
        <span className="flex h-10 w-10 items-center justify-center rounded-[11px] border border-white/[0.14] bg-[#1c1d23]">
          <SidebarMark />
        </span>
        <span className="font-display text-[12px] font-medium uppercase tracking-[0.22em] text-text-mid">
          Regjistri Personal
        </span>
      </div>

      <div className="relative">
        <div className="font-display text-[46px] font-semibold leading-[1.05] tracking-[-0.02em] text-[#F4F4F5]">
          Ermir
          <br />
          Haxhia
        </div>
        <div className="mt-5 h-0.5 w-10 bg-accent" />
        <div className="mt-4 font-mono text-[13px] tracking-[0.08em] text-text-mid">
          regjistri personal · 2026
        </div>
      </div>

      <div className="relative font-mono text-[12px] tracking-[0.06em] text-[#7c7c87]">
        {today}
      </div>
    </aside>
  );
}
