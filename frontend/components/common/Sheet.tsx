"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IconClose } from "@/components/icons";

interface Props {
  open: boolean;
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}

export default function Sheet({ open, title, onClose, children }: Props) {
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={onClose}
            className="absolute inset-0 rp-glass-scrim"
          />
          <motion.div
            initial={{ y: "100%", opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: "100%", opacity: 0.4 }}
            transition={{ duration: 0.28, ease: [0.2, 0.8, 0.2, 1] }}
            className="rp-glass-sheet relative z-10 max-h-[88dvh] w-full overflow-y-auto overscroll-contain rounded-t-3xl border p-6 sm:w-[min(520px,calc(100vw-24px))] sm:max-w-none sm:rounded-3xl sm:p-7"
            role="dialog"
            aria-modal="true"
            aria-label={title}
          >
            <div className="mb-5 flex items-center justify-between">
              <h2 className="font-display text-base font-semibold text-text-hi">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                aria-label="Mbyll"
                className="flex h-8 w-8 items-center justify-center rounded-lg border border-border text-text-lo transition-colors hover:text-text-hi"
              >
                <IconClose size={15} />
              </button>
            </div>
            {children}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
