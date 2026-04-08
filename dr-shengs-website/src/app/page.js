import Image from "next/image";

export default function Home() {
  return (
    <main className="w-full bg-white">
      <section className="mx-auto flex min-h-[calc(100svh-5rem)] w-full max-w-7xl flex-col justify-center px-4 py-10 sm:px-6 lg:px-8">
        <div className="grid items-center gap-8 md:grid-cols-[20rem_1fr] lg:grid-cols-[23rem_1fr]">
          <div className="mx-auto w-full max-w-[23rem]">
            <div className="overflow-hidden rounded-2xl border border-zinc-200">
              <Image
                src="/drsheng.jpg"
                alt="Portrait of Dr. Victor S. Sheng"
                width={720}
                height={960}
                className="h-auto w-full object-cover"
                priority
              />
            </div>
          </div>

          <div className="text-center md:text-left">
            <h1 className="text-4xl font-bold tracking-tight text-zinc-900 sm:text-5xl">
              Victor S. Sheng, PhD.
            </h1>
            <p className="mt-4 text-xl text-zinc-800">Associate Professor</p>
            <p className="mt-1 text-lg text-zinc-700">
              Department of Computer Science
            </p>
            <p className="mt-1 text-lg text-zinc-700">Texas Tech University</p>
          </div>
        </div>

        <div className="mt-10 max-w-4xl border-t border-zinc-200 pt-6 text-sm leading-6 text-zinc-700">
          <p className="font-semibold text-zinc-900">For Prospective Students</p>
          <p className="mt-2">TA/RA positions in PhD program</p>
          <p className="mt-2">
            I am looking for self-motivated, creative and hard-working Ph.D.
            students. Please feel free to email me (
            <a
              href="mailto:victor.sheng@ttu.edu"
              className="font-medium text-[#CC0000] underline underline-offset-2"
            >
              victor.sheng@ttu.edu
            </a>
            ) your CV if you are interested in my research. TTU is a Carnegie
            Research I (R1) university.
          </p>
        </div>
      </section>
    </main>
  );
}
