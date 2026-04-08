"use client";

import { usePathname } from "next/navigation";
import { SiteHeader } from "./SiteHeader";

export function SiteHeaderShell() {
  const pathname = usePathname();
  if (!pathname) return null;
  if (pathname.startsWith("/admin") || pathname.startsWith("/edit-website")) {
    return null;
  }
  return <SiteHeader />;
}
