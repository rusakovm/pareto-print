"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

function ResetPasswordContent() {
  const searchParams = useSearchParams();

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
          code,
          newPassword: password,
        }),
      });

      if (!res.ok) {
        throw new Error("Ошибка сброса пароля");
      }

      alert("Пароль успешно изменён!");
    } catch (err) {
      alert("Ошибка сброса пароля");
      console.error(err);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="p-6 border rounded-lg w-80 space-y-4"
      >
        <h1 className="text-xl font-bold">Сброс пароля</h1>

        <input
          type="text"
          placeholder="Код"
          className="w-full border p-2"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Новый пароль"
          className="w-full border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button type="submit" className="w-full bg-black text-white p-2">
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