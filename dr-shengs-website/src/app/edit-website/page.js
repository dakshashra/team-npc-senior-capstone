export const metadata = {
  title: "Edit Website · Dr. Sheng's Website",
  description: "Website editor",
};

export default function EditWebsitePage() {
  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_45%_at_50%_0%,rgba(204,0,0,0.18),transparent)]" />
      <main className="relative flex min-h-screen flex-col items-center justify-center px-6 py-20">
        <p className="text-xs font-medium uppercase tracking-[0.25em] text-[#CC0000]/90">
          Dashboard
        </p>
        <h1 className="mt-3 text-4xl font-semibold tracking-tight text-white sm:text-5xl">
          Edit Website
        </h1>
        <p className="mt-4 max-w-md text-center text-sm text-zinc-400">
          This space is ready for your content and layout tools.
        </p>
      </main>
    </div>
  );
}
