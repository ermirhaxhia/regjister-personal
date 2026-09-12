"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { isAbortError } from "@/lib/api";

export type LoadStatus = "loading" | "refreshing" | "error" | "ready";

const RETRY_DELAY = 500;

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function useGenLoad<T>(
  fetcher: () => Promise<T>,
  apply: (data: T) => void,
): { status: LoadStatus; reload: () => void; refresh: () => void } {
  const genRef = useRef(0);
  const loadedRef = useRef(false);
  const [status, setStatus] = useState<LoadStatus>("loading");

  const run = useCallback(
    async (hard: boolean) => {
      const gen = ++genRef.current;
      setStatus(hard || !loadedRef.current ? "loading" : "refreshing");

      try {
        const data = await fetcher();
        if (gen !== genRef.current) return;
        loadedRef.current = true;
        apply(data);
        setStatus("ready");
      } catch (err) {
        if (gen !== genRef.current || isAbortError(err)) return;
        await wait(RETRY_DELAY);
        if (gen !== genRef.current) return;
        try {
          const data = await fetcher();
          if (gen !== genRef.current) return;
          loadedRef.current = true;
          apply(data);
          setStatus("ready");
        } catch (err2) {
          if (gen !== genRef.current || isAbortError(err2)) return;
          setStatus("error");
        }
      }
    },
    [fetcher, apply],
  );

  useEffect(() => {
    void run(false);
  }, [run]);

  const reload = useCallback(() => void run(true), [run]);
  const refresh = useCallback(() => void run(false), [run]);

  return { status, reload, refresh };
}
