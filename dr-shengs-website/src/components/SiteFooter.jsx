import Image from "next/image";
import Link from "next/link";

export function SiteFooter() {
  return (
    <footer style={{ backgroundColor: "#757575" }} className="w-full text-black">
      <div className="mx-auto max-w-6xl flex flex-col md:flex-row items-start md:items-center justify-between gap-8 px-8 py-10">

        {/* Left: lab info */}
        <div className="flex flex-col gap-4">
          <h2 className="text-lg font-bold leading-tight">
            Machine Learning &amp; Data Science Lab
          </h2>

          {/* Email */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Email</span>
            <p className="mt-0.5 text-sm">
              <a
                href="mailto:victor.sheng@ttu.edu"
                className="underline underline-offset-2 hover:opacity-75 transition-opacity"
              >
                victor.sheng@ttu.edu
              </a>
            </p>
          </div>

          {/* Phone */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Phone</span>
            <p className="mt-0.5 text-sm">
              <a href="tel:8068348971" className="hover:opacity-75 transition-opacity">
                806.834.8971
              </a>
            </p>
          </div>

          {/* Address */}
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider opacity-70">Address</span>
            <p className="mt-0.5 text-sm leading-relaxed">
              EC 314, Texas Tech University<br />
              Department of Computer Science<br />
              Box 43104, Lubbock, TX 79409‑3104
            </p>
          </div>

          {/* Admin login */}
          <div>
            <Link
              href="/admin"
              className="text-xs underline underline-offset-2 opacity-60 hover:opacity-90 transition-opacity"
            >
              admin login
            </Link>
          </div>
        </div>

        {/* Divider */}
        <div className="hidden md:block h-48 w-px bg-black/20 shrink-0" />

        {/* Right: CS department logo */}
        <div className="shrink-0">
          <Image
            src="/ttu2.png"
            alt="TTU Department of Computer Science"
            width={200}
            height={90}
            className="h-auto w-48 object-contain"
          />
        </div>

      </div>
    </footer>
  );
}
