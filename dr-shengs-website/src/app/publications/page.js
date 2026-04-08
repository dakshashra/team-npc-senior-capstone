import Image from "next/image";

export const metadata = {
  title: "Publications · Machine Learning & Data Science Lab",
  description: "Publications from the lab",
};

export default function PublicationsPage() {
  return (
    <main className="min-h-screen bg-white">
      {/* Hero Links Section */}
      <section className="flex min-h-[calc(100svh-4rem)] w-full flex-col items-center justify-center bg-zinc-50 px-4 py-12 sm:px-6 lg:px-8">

        <div className="mx-auto flex w-full max-w-7xl flex-col items-center justify-center bg-zinc-50">

          <div className="w-full mb-10 md:mb-14">
            <h1 className="text-4xl font-bold font-sans tracking-tight text-black text-center md:text-left">
              Publications
            </h1>
          </div>

          {/* Top 2 side-by-side */}
          <div className="flex w-full flex-col md:flex-row gap-6 md:gap-8 justify-center">
            <a
              href="https://scholar.google.com/citations?user=0epc43IAAAAJ&hl=en"
              target="_blank"
              rel="noopener noreferrer"
              className="group block w-full md:w-1/2 overflow-hidden rounded-2xl border border-zinc-200 shadow-sm transition-all hover:shadow-xl"
            >
              <Image
                src="/google_scholar.jpg"
                alt="Google Scholar"
                width={1200}
                height={800}
                className="h-auto w-full transform object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                priority
              />
            </a>

            <a
              href="https://www.researchgate.net/profile/Victor-Sheng"
              target="_blank"
              rel="noopener noreferrer"
              className="group block w-full md:w-1/2 overflow-hidden rounded-2xl border border-zinc-200 shadow-sm transition-all hover:shadow-xl"
            >
              <Image
                src="/researchgate3.png"
                alt="ResearchGate"
                width={1200}
                height={800}
                className="h-auto w-full transform object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                priority
              />
            </a>
          </div>

          {/* Bottom 1 centered */}
          <div className="mt-6 flex w-full justify-center md:mt-8">
            <a
              href="https://www.webofscience.com/wos/author/record/E-6264-2017"
              target="_blank"
              rel="noopener noreferrer"
              className="group block w-full md:w-1/2 overflow-hidden rounded-2xl border border-zinc-200 shadow-sm transition-all hover:shadow-xl"
            >
              <Image
                src="/researcherid2.png"
                alt="ResearchID Web of Science"
                width={1200}
                height={800}
                className="h-auto w-full transform object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                priority
              />
            </a>
          </div>

        </div>
      </section>
    </main>
  );
}
