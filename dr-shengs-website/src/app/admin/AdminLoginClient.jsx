"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/app/firebase";

export function AdminLoginClient() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setMessage(null);
    const u = username.trim();
    const p = password;
    if (!u || !p) {
      setMessage({ type: "error", text: "Enter both username and password." });
      return;
    }

    setLoading(true);
    try {
      const snap = await getDocs(collection(db, "admin"));
      let matchedUsername = false;

      for (const docSnap of snap.docs) {
        const data = docSnap.data();
        const docUser = data.username;
        if (docUser !== u) continue;

        matchedUsername = true;
        if (data.password === p) {
          router.push("/edit-website");
          return;
        }
        setMessage({
          type: "error",
          text: "Incorrect password for this account.",
        });
        return;
      }

      if (!matchedUsername) {
        setMessage({
          type: "error",
          text: "No admin account matches that username.",
        });
      }
    } catch (err) {
      console.error(err);
      setMessage({
        type: "error",
        text: "Could not verify credentials. Check your connection and Firestore rules.",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-zinc-950 text-zinc-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_50%_at_50%_-20%,rgba(120,80,200,0.25),transparent)]" />
      <div className="pointer-events-none absolute bottom-0 left-1/2 h-px w-[min(100%,48rem)] -translate-x-1/2 bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />

      <div className="relative mx-auto flex min-h-screen max-w-md flex-col justify-center px-6 py-16">
        <div className="mb-10 text-center">
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-violet-400/90">
            Restricted
          </p>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight text-white">
            Admin access
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Sign in with credentials stored in the admin collection.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-zinc-800/80 bg-zinc-900/60 p-8 shadow-2xl shadow-black/40 backdrop-blur-xl"
        >
          <div className="space-y-5">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Username
              </span>
              <input
                type="text"
                name="username"
                autoComplete="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 py-3 text-sm text-zinc-100 outline-none ring-0 transition-[border,box-shadow] placeholder:text-zinc-600 focus:border-violet-500/60 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)]"
                placeholder="Admin username"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-zinc-500">
                Password
              </span>
              <input
                type="password"
                name="password"
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-xl border border-zinc-700/80 bg-zinc-950/80 px-4 py-3 text-sm text-zinc-100 outline-none transition-[border,box-shadow] placeholder:text-zinc-600 focus:border-violet-500/60 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.15)]"
                placeholder="••••••••"
              />
            </label>
          </div>

          {message && (
            <p
              role="alert"
              className={
                message.type === "error"
                  ? "mt-5 rounded-lg border border-red-500/30 bg-red-950/40 px-3 py-2 text-sm text-red-200"
                  : "mt-5 rounded-lg border border-emerald-500/30 bg-emerald-950/40 px-3 py-2 text-sm text-emerald-200"
              }
            >
              {message.text}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="mt-8 flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-fuchsia-600 px-4 py-3.5 text-sm font-semibold text-white shadow-lg shadow-violet-900/30 transition hover:from-violet-500 hover:to-fuchsia-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <>
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                Checking…
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-zinc-500">
          <Link
            href="/"
            className="text-violet-400/90 underline-offset-4 transition hover:text-violet-300 hover:underline"
          >
            Back to site
          </Link>
        </p>
      </div>
    </div>
  );
}
