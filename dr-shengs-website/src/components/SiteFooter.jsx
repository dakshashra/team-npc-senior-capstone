import Image from "next/image";

export function SiteFooter() {
  return (
    <footer style={{ backgroundColor: "#757575" }} className="w-full text-black">
      <div className="flex items-center justify-center gap-8 px-8 py-10">

        {/* TTU logo — left */}
        <div className="shrink-0">
          <Image
            src="/ttu2.png"
            alt="Texas Tech University"
            width={180}
            height={80}
            className="h-auto w-44 object-contain"
          />
        </div>

        {/* Divider */}
        <div className="h-28 w-px bg-black/20 shrink-0" />

        {/* Contact + address — right */}
        <div className="text-sm leading-relaxed">
          <p>
            <span className="font-semibold">Email:</span>{" "}
            <a
              href="mailto:victor.sheng@ttu.edu"
              className="underline underline-offset-2 hover:text-zinc-600 transition-colors"
            >
              victor.sheng@ttu.edu
            </a>
          </p>
          <p><span className="font-semibold">Phone:</span> 806.834.8971</p>
          <p><span className="font-semibold">Fax:</span> 806.742.3519</p>
          <p><span className="font-semibold">Office:</span> EC 314</p>

          <div className="mt-3">
            <p>Texas Tech University</p>
            <p>Department of Computer Science</p>
            <p>Box 43104</p>
            <p>Lubbock, TX 79409−3104</p>
          </div>
        </div>

      </div>
    </footer>
  );
}
