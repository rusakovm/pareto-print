"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState(searchParams.get("email") || "");
  const [code, setCode] = useState(searchParams.get("code") || "");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:3000/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          code,
          newPassword: password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (!res.ok) {
        alert(data?.message || "Ошибка сброса пароля");
        return;
      }

      alert("Пароль успешно изменён!");
      router.push("/login");
    } catch (err) {
      console.error(err);
      alert("Ошибка сброса пароля");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-black text-white">
      <form
        onSubmit={handleSubmit}
        className="p-6 border border-white/10 rounded-3xl w-80 space-y-4 bg-white/5"
      >
        <h1 className="text-xl font-bold">Сброс пароля</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border border-white/10 bg-black/40 rounded-xl p-3 outline-none"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="text"
          placeholder="Код из Telegram"
          className="w-full border border-white/10 bg-black/40 rounded-xl p-3 outline-none"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Новый пароль"
          className="w-full border border-white/10 bg-black/40 rounded-xl p-3 outline-none"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="w-full bg-white text-black p-3 rounded-xl"
        >
          Изменить пароль
        </button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="p-8">Загрузка...</div>}>
      <ResetPasswordContent />
    </Suspense>
  );
}