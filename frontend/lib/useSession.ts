import { useSyncExternalStore } from "react";
import { SESSION_KEY, TOKEN_KEY } from "@/lib/api";

function subscribe(callback: () => void): () => void {
  window.addEventListener("storage", callback);
  window.addEventListener("rp-session", callback);
  return () => {
    window.removeEventListener("storage", callback);
    window.removeEventListener("rp-session", callback);
  };
}

const noop = () => () => {};

export function useSession(): { pin: string | null; mounted: boolean } {
  const pin = useSyncExternalStore(
    subscribe,
    () =>
      sessionStorage.getItem(TOKEN_KEY) ?? sessionStorage.getItem(SESSION_KEY),
    () => null,
  );
  const mounted = useSyncExternalStore(
    noop,
    () => true,
    () => false,
  );
  return { pin, mounted };
}
