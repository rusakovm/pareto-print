"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

function extractErrorMessage(data: any) {
  if (!data) return "Ошибка";
  if (typeof data.message === "string") return data.message;
  if (Array.isArray(data.message)) return data.message.join("\n");
  return "Ошибка";
}

export default function ResetPage() {
  const sp = useSearchParams();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const e = sp.get("email");
    if (e) setEmail(e);
  }, [sp]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, code, newPassword }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(extractErrorMessage(data));
        return;
      }

      alert("Пароль изменён. Теперь войдите.");
      router.push("/login");
    } catch {
      alert("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm border rounded-lg p-6 space-y-4">
        <h1 className="text-xl font-bold">Сброс пароля</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Код из Telegram"
          className="w-full border p-2 rounded"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Новый пароль"
          className="w-full border p-2 rounded"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
          minLength={6}
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white p-2 rounded disabled:opacity-60"
        >
          {loading ? "Сбрасываю..." : "Сбросить пароль"}
        </button>

        <button
          type="button"
          className="w-full border p-2 rounded"
          onClick={() => router.push("/forgot")}
        >
          Получить новый код
        </button>
      </form>
    </div>
  );
}