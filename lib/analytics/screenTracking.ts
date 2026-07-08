import { usePathname } from "expo-router";
import { useEffect, useRef } from "react";
import { screen } from "./analytics";

const RESOURCE_SEGMENTS = new Set(["subscriptions"]);

const isDynamicSegment = (segment: string, previousSegment?: string) => {
  if (previousSegment && RESOURCE_SEGMENTS.has(previousSegment)) return true;

  return (
    /^\d+$/.test(segment) ||
    /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(segment) ||
    /^[0-9a-z_-]{16,}$/i.test(segment)
  );
};

const normalizePathname = (pathname: string) => {
  if (pathname === "/") return "/";

  const segments = pathname.split("/").filter(Boolean);
  const normalizedSegments = segments.map((segment, index) =>
    isDynamicSegment(segment, segments[index - 1]) ? "[id]" : segment,
  );

  return `/${normalizedSegments.join("/")}`;
};

const normalizeScreenName = (pathname: string) => {
  const normalizedPathname = normalizePathname(pathname);

  if (normalizedPathname === "/") return "Home";

  return normalizedPathname
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
    const normalizedPathname = normalizePathname(pathname);
    screen({
      screen_name: normalizeScreenName(normalizedPathname),
      pathname: normalizedPathname,
      previous_screen: previousPathname
        ? normalizeScreenName(previousPathname)
        : undefined,
    });
    previousPathnameRef.current = pathname;
  }, [pathname]);
}
