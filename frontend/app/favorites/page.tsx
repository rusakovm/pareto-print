"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Product = {
  id: number;
  title: string;
  author: string | null;
  price: number;
  image: string;
  category: string;
};

type FavoriteItem = {
  id: number;
  product: Product;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function FavoritesPage() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);

  async function loadFavorites() {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Сначала войдите");
      setLoading(false);
      return;
    }

    const res = await fetch(`${API}/favorites`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    const data = await res.json();

    if (res.ok) {
      setItems(data);
    }

    setLoading(false);
  }

  async function removeFavorite(productId: number) {
    const token = localStorage.getItem("token");
    if (!token) return;

    await fetch(`${API}/favorites/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await loadFavorites();
  }

  async function addToCart(productId: number) {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Сначала войдите");
      return;
    }

    await fetch(`${API}/cart/${productId}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    alert("Добавлено в корзину");
  }

  useEffect(() => {
    loadFavorites();
  }, []);

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black/80">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
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
            <Link href="/profile" className="px-4 py-2 rounded-2xl bg-white text-black">
              Профиль
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-semibold">Избранное</h1>

        {loading ? (
          <div className="mt-6 text-white/60">Загрузка...</div>
        ) : items.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-8 text-white/60">
            В избранном пока ничего нет.
          </div>
        ) : (
          <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {items.map((item) => (
              <div
                key={item.id}
                className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden"
              >
                <img
                  src={item.product.image}
                  alt=""
                  className="h-52 w-full object-cover"
                />

                <div className="p-4">
                  <div className="text-sm text-white/60">
                    {item.product.author || "Автор не указан"}
                  </div>

                  <div className="mt-1 font-semibold">
                    {item.product.title}
                  </div>

                  <div className="mt-2 text-sm text-white/50">
                    {item.product.category}
                  </div>

                  <div className="mt-3 font-semibold">
                    {formatRUB(item.product.price)}
                  </div>

                  <div className="mt-4 flex gap-2">
                    <button
                      onClick={() => addToCart(item.product.id)}
                      className="flex-1 px-4 py-2 rounded-2xl bg-white text-black"
                    >
                      В корзину
                    </button>

                    <button
                      onClick={() => removeFavorite(item.product.id)}
                      className="px-4 py-2 rounded-2xl bg-red-500/80"
                    >
                      Убрать
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}

function formatRUB(v: number) {
  return `${v.toLocaleString("ru-RU")} ₽`;
}