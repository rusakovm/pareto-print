"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Me = {
  id: number;
  email: string;
  roles: string[];
  telegramLinked: boolean;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function ProfilePage() {
  const [me, setMe] = useState<Me | null>(null);
  const [loading, setLoading] = useState(true);

  const [code, setCode] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [botUsername, setBotUsername] = useState<string | null>(null);

  async function loadMe() {
    const token = localStorage.getItem("token");

    if (!token) {
      setLoading(false);
      return;
    }

    const res = await fetch(`${API}/auth/me`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => null);

    if (res.ok) {
      setMe(data);
    } else {
      localStorage.removeItem("token");
      setMe(null);
    }

    setLoading(false);
  }

  async function generateTelegramLinkCode() {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Сначала войдите");
      return;
    }

    const res = await fetch(`${API}/telegram/link-code`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      alert(data?.message || "Ошибка генерации кода");
      return;
    }

    setCode(data.code);
    setExpiresAt(data.expiresAt);
    setBotUsername(data.botUsername || null);
  }

  async function unlinkTelegram() {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Сначала войдите");
      return;
    }

    const res = await fetch(`${API}/telegram/unlink`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json().catch(() => null);

    if (!res.ok) {
      alert(data?.message || "Ошибка отвязки Telegram");
      return;
    }

    alert("Telegram отвязан");

    setCode(null);
    setExpiresAt(null);
    setBotUsername(null);

    await loadMe();
  }

  function logout() {
    localStorage.removeItem("token");
    window.location.href = "/login";
  }

  useEffect(() => {
    loadMe();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-black text-white p-8">Загрузка...</div>;
  }

  if (!me) {
    return (
      <div className="min-h-screen bg-black text-white p-8">
        <h1 className="text-3xl font-bold">Профиль</h1>
        <p className="mt-4 text-white/60">Вы не вошли в аккаунт.</p>

        <Link href="/login" className="inline-block mt-6 px-5 py-3 rounded-2xl bg-white text-black">
          Войти
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black/80">
        <div className="mx-auto max-w-5xl px-4 py-5 flex items-center justify-between">
          <Link href="/" className="font-semibold">
            ООО “Прето Принт”
          </Link>

          <div className="flex gap-2">
            <Link href="/shop" className="px-4 py-2 rounded-2xl bg-white/10 border border-white/15">
              Магазин
            </Link>

            <Link href="/cart" className="px-4 py-2 rounded-2xl bg-white/10 border border-white/15">
              Корзина
            </Link>

            <Link href="/favorites" className="px-4 py-2 rounded-2xl bg-white/10 border border-white/15">
              Избранное
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-8">
        <h1 className="text-3xl font-bold">Профиль</h1>

        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6">
          <div className="grid md:grid-cols-2 gap-6">
            <InfoBlock label="ID пользователя" value={`#${me.id}`} />
            <InfoBlock label="Email" value={me.email} />

            <div>
              <div className="text-sm text-white/50">Роли</div>
              <div className="flex gap-2 mt-2">
                {me.roles?.length ? (
                  me.roles.map((role) => (
                    <span key={role} className="px-3 py-1 rounded-full bg-white text-black text-sm">
                      {role}
                    </span>
                  ))
                ) : (
                  <span className="text-white/60">Нет ролей</span>
                )}
              </div>
            </div>

            <div>
              <div className="text-sm text-white/50">Telegram</div>
              <span
                className={`mt-2 inline-block px-3 py-1 rounded-full text-sm ${
                  me.telegramLinked ? "bg-green-500 text-black" : "bg-white/10 text-white/70"
                }`}
              >
                {me.telegramLinked ? "Привязан" : "Не привязан"}
              </span>
            </div>
          </div>

          <div className="mt-8 flex flex-wrap items-center gap-3">
            {!me.telegramLinked ? (
              <button
                onClick={generateTelegramLinkCode}
                className="px-5 py-3 rounded-2xl bg-white text-black hover:opacity-90 transition"
              >
                Привязать Telegram
              </button>
            ) : (
              <button
                onClick={unlinkTelegram}
                className="px-5 py-3 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition"
              >
                Отвязать Telegram
              </button>
            )}

            <Link
              href="/forgot"
              className="px-5 py-3 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition"
            >
              Сбросить пароль
            </Link>

            <button
              onClick={logout}
              className="px-5 py-3 rounded-2xl bg-red-500/80 hover:bg-red-500 transition"
            >
              Выйти
            </button>
          </div>
        </div>

        {code && !me.telegramLinked ? (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 space-y-3">
            <div>
              <b>Код:</b> {code}
            </div>

            <div>
              <b>Истекает:</b> {new Date(expiresAt!).toLocaleString()}
            </div>

            <ol className="list-decimal ml-6 text-white/80">
              <li>Открой Telegram</li>
              <li>Найди бота: @{botUsername || "YOUR_BOT"}</li>
              <li>
                Отправь сообщение: <code>/start {code}</code>
              </li>
            </ol>
          </div>
        ) : null}
      </main>
    </div>
  );
}

function InfoBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="text-sm text-white/50">{label}</div>
      <div className="mt-1 text-xl font-semibold">{value}</div>
    </div>
  );
}