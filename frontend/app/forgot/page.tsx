"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

function extractErrorMessage(data: any) {
  if (!data) return "Ошибка";
  if (typeof data.message === "string") return data.message;
  if (Array.isArray(data.message)) return data.message.join("\n");
  return "Ошибка";
}

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(`${API}/auth/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(extractErrorMessage(data));
        return;
      }

      alert("Если аккаунт существует — код отправлен в Telegram (если привязан).");
      router.push(`/reset?email=${encodeURIComponent(email)}`);
    } catch {
      alert("Ошибка сети");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <form onSubmit={onSubmit} className="w-full max-w-sm border rounded-lg p-6 space-y-4">
        <h1 className="text-xl font-bold">Восстановление пароля</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-black text-white p-2 rounded disabled:opacity-60"
        >
          {loading ? "Отправляю..." : "Получить код"}
        </button>

        <p className="text-sm opacity-70">
          Код придёт в Telegram, если он привязан в профиле.
        </p>
      </form>
    </div>
  );
}