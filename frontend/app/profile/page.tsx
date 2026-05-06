"use client";

import { useState } from "react";

export default function ProfilePage() {
  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [botUsername, setBotUsername] = useState<string | null>(null);

  async function generateTelegramLinkCode() {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Сначала войдите");
      return;
    }

    const res = await fetch("http://localhost:3000/telegram/link-code", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();
    if (!res.ok) {
      alert("Ошибка генерации кода");
      console.error(data);
      return;
    }

    setCode(data.code);
    setExpiresAt(data.expiresAt);
    setBotUsername(data.botUsername || null);
  }

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Профиль</h1>

      <button
        onClick={generateTelegramLinkCode}
        className="border px-4 py-2 rounded"
      >
        Привязать Telegram
      </button>

      {code && (
        <div className="border p-4 rounded space-y-2">
          <div><b>Код:</b> {code}</div>
          <div><b>Истекает:</b> {new Date(expiresAt!).toLocaleString()}</div>
          <div>
            <b>Шаги:</b>
            <ol className="list-decimal ml-6">
              <li>Открой Telegram</li>
              <li>Найди бота: @{botUsername || "YOUR_BOT"}</li>
              <li>Отправь сообщение: <code>/start {code}</code></li>
            </ol>
          </div>
        </div>
      )}
    </div>
  );
}