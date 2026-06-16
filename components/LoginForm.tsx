"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { LockKeyhole } from "lucide-react";

export default function LoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    setLoading(false);
    if (!response.ok) {
      setError("Password non valida.");
      return;
    }

    router.push("/admin");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="glass mx-auto grid w-full max-w-md gap-5 rounded-lg p-6 shadow-soft">
      <div className="space-y-2">
        <div className="grid h-11 w-11 place-items-center rounded-lg bg-zinc-950 text-white dark:bg-white dark:text-zinc-950">
          <LockKeyhole className="h-5 w-5" aria-hidden="true" />
        </div>
        <h1 className="text-2xl font-semibold text-zinc-950 dark:text-white">Area amministratore</h1>
        <p className="text-sm leading-6 text-zinc-600 dark:text-zinc-300">Inserisci la password configurata per gestire il catalogo.</p>
      </div>
      <label className="grid gap-2 text-sm font-medium text-zinc-700 dark:text-zinc-200">
        Password
        <input
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          className="focus-ring h-11 rounded-lg border border-black/10 bg-white/85 px-3 text-zinc-950 dark:border-white/10 dark:bg-zinc-950/60 dark:text-white"
          autoComplete="current-password"
          required
        />
      </label>
      {error ? <p className="text-sm font-medium text-red-600 dark:text-red-400">{error}</p> : null}
      <button
        type="submit"
        disabled={loading}
        className="focus-ring h-11 rounded-lg bg-zinc-950 px-4 text-sm font-semibold text-white transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-200"
      >
        {loading ? "Accesso..." : "Accedi"}
      </button>
    </form>
  );
}
