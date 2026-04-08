"use client";

import { usePathname } from "next/navigation";
import { SiteFooter } from "./SiteFooter";

export function SiteFooterShell() {
  const pathname = usePathname();
  if (!pathname) return null;
  if (pathname.startsWith("/admin") || pathname.startsWith("/edit-website")) {
    return null;
  }
  return <SiteFooter />;
}
