import { usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import { screen } from "./analytics";

const normalizeScreenName = (pathname: string) => {
  if (pathname === "/") return "Home";

  return pathname
    .split("/")
    .filter(Boolean)
    .map((segment) => segment.replace(/[-_]/g, " "))
    .join(" / ");
};

export function useExpoRouterScreenTracking() {
  const pathname = usePathname();
  const previousPathnameRef = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || previousPathnameRef.current === pathname) return;

    const previousPathname = previousPathnameRef.current;
    screen({
      screen_name: normalizeScreenName(pathname),
      pathname,
      previous_screen: previousPathname
        ? normalizeScreenName(previousPathname)
        : undefined,
    });
    previousPathnameRef.current = pathname;
  }, [pathname]);
}
