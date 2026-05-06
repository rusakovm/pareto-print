"use client";

import { useState } from "react";
import { register } from "@/lib/api";

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    try {
      const data = await register(email, password);
      localStorage.setItem("token", data.accessToken);
      alert("Успешная регистрация!");
    } catch (err) {
      alert("Ошибка регистрации");
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <form
        onSubmit={handleSubmit}
        className="p-6 border rounded-lg w-80 space-y-4"
      >
        <h1 className="text-xl font-bold">Регистрация</h1>

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

        <button className="w-full bg-black text-white p-2">
          Зарегистрироваться
        </button>
      </form>
    </div>
  );
}