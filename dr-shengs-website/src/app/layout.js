import "./globals.css";
import { AdminEntryButton } from "@/components/AdminEntryButton";
import { SiteHeaderShell } from "@/components/SiteHeaderShell";

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
        <AdminEntryButton />
      </body>
    </html>
  );
}
