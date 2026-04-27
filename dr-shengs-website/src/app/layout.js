import "./globals.css";

import { SiteHeaderShell } from "@/components/SiteHeaderShell";
import { SiteFooterShell } from "@/components/SiteFooterShell";

export const metadata = {
  title: "Dr. Sheng's Website",
  description: "Now we start cooking",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        <SiteHeaderShell />
        {children}
        <SiteFooterShell />

      </body>
    </html>
  );
}
