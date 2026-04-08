import "./globals.css";
import { AdminEntryButton } from "@/components/AdminEntryButton";

export const metadata = {
  title: "Dr. Sheng's Website",
  description: "Now we start cooking",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
        <AdminEntryButton />
      </body>
    </html>
  );
}
