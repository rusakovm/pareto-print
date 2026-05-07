"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const router = useRouter();

async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  try {
    const res = await fetch("http://localhost:3000/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      alert(data?.message || "Ошибка входа");
      return;
    }

    if (!data.accessToken) {
      alert("Backend не вернул accessToken");
      console.log("LOGIN RESPONSE:", data);
      return;
    }

    localStorage.setItem("token", data.accessToken);

    console.log("SAVED TOKEN:", data.accessToken);

    alert("Успешный вход!");
    router.push("/shop");
  } catch (err) {
    console.error(err);
    alert("Ошибка входа");
  }
}

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="p-6 border rounded-lg w-80 space-y-4"
      >
        <h1 className="text-xl font-bold">Вход</h1>

        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />

        <input
          type="password"
          placeholder="Пароль"
          className="w-full border p-2"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-black text-white p-2"
        >
          Войти
        </button>
        <button
          type="button"
          className="w-full border p-2"
          onClick={() => router.push("/forgot")}
        >
          Забыли пароль?
        </button>
      </form>
    </div>
  );
}