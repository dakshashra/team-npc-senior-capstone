export const metadata = {
  title: "Dr. Sheng's Website",
  description: "Now we start cooking",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="antialiased">{children}</body>
    </html>
  );
}
