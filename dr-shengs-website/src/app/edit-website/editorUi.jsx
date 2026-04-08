export function Panel({ title, subtitle, children, actions }) {
  return (
    <section className="rounded-2xl border border-zinc-800/90 bg-zinc-900/50 p-6 shadow-xl shadow-black/20 backdrop-blur-sm">
      <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold tracking-tight text-white">{title}</h2>
          {subtitle && (
            <p className="mt-1 text-sm text-zinc-400">{subtitle}</p>
          )}
        </div>
        {actions}
      </div>
      {children}
    </section>
  );
}

export function FieldLabel({ children }) {
  return (
    <span className="mb-1 block text-xs font-medium uppercase tracking-wider text-zinc-500">
      {children}
    </span>
  );
}

export function TextInput({ className = "", ...props }) {
  return (
    <input
      {...props}
      className={
        "w-full rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-3 py-2 text-sm text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-[#CC0000]/50 focus:shadow-[0_0_0_3px_rgba(204,0,0,0.12)] " +
        className
      }
    />
  );
}

export function TextArea({ className = "", ...props }) {
  return (
    <textarea
      {...props}
      className={
        "w-full min-h-[8rem] resize-y rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-3 py-2 text-sm leading-relaxed text-zinc-100 outline-none placeholder:text-zinc-600 focus:border-[#CC0000]/50 focus:shadow-[0_0_0_3px_rgba(204,0,0,0.12)] " +
        className
      }
    />
  );
}

export function Btn({
  children,
  variant = "primary",
  className = "",
  type = "button",
  ...rest
}) {
  const variants = {
    primary:
      "rounded-xl bg-[#CC0000] px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-[#CC0000]/20 hover:bg-[#a30000] disabled:opacity-50",
    secondary:
      "rounded-xl border border-zinc-600 bg-zinc-800/50 px-4 py-2 text-sm font-medium text-zinc-200 hover:bg-zinc-800 disabled:opacity-50",
    danger:
      "rounded-xl border border-red-500/40 bg-red-950/40 px-3 py-1.5 text-sm text-red-200 hover:bg-red-950/70 disabled:opacity-50",
    ghost:
      "rounded-lg px-2 py-1 text-xs font-medium text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200",
  };
  return (
    <button
      type={type}
      className={`transition ${variants[variant]} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export function StatusLine({ message, error }) {
  if (!message) return null;
  return (
    <p
      role="status"
      className={
        error
          ? "mt-3 text-sm text-red-300"
          : "mt-3 text-sm text-emerald-300"
      }
    >
      {message}
    </p>
  );
}
