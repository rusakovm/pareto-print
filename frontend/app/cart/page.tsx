"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Product = {
  id: number;
  title: string;
  author: string | null;
  price: number;
  image: string;
  category: string;
};

type CartItem = {
  id: number;
  quantity: number;
  product: Product;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function CartPage() {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);

  const total = useMemo(() => {
    return items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
  }, [items]);

  async function loadCart() {
    const token = localStorage.getItem("token");

    if (!token) {
      alert("Сначала войдите");
      setLoading(false);
      return;
    }

    const res = await fetch(`${API}/cart`, {
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

  async function updateQuantity(productId: number, quantity: number) {
    const token = localStorage.getItem("token");
    if (!token) return;

    await fetch(`${API}/cart/${productId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ quantity }),
    });

    await loadCart();
  }

  async function removeItem(productId: number) {
    const token = localStorage.getItem("token");
    if (!token) return;

    await fetch(`${API}/cart/${productId}`, {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    await loadCart();
  }

  useEffect(() => {
    loadCart();
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
            <Link href="/favorites" className="px-4 py-2 rounded-2xl bg-white/10 border border-white/15">
              Избранное
            </Link>
            <Link href="/profile" className="px-4 py-2 rounded-2xl bg-white text-black">
              Профиль
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <h1 className="text-3xl font-semibold">Корзина</h1>

        {loading ? (
          <div className="mt-6 text-white/60">Загрузка...</div>
        ) : items.length === 0 ? (
          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-8 text-white/60">
            Корзина пустая.
          </div>
        ) : (
          <div className="mt-6 grid lg:grid-cols-[1fr_320px] gap-6">
            <div className="space-y-4">
              {items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-3xl border border-white/10 bg-white/5 p-4 flex gap-4"
                >
                  <img
                    src={item.product.image}
                    alt=""
                    className="h-28 w-24 rounded-2xl object-cover"
                  />

                  <div className="flex-1">
                    <div className="text-sm text-white/50">{item.product.author || "Автор не указан"}</div>
                    <div className="font-semibold">{item.product.title}</div>
                    <div className="mt-1 text-sm text-white/60">{item.product.category}</div>
                    <div className="mt-3 font-semibold">{formatRUB(item.product.price)}</div>
                  </div>

                  <div className="flex flex-col items-end justify-between">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                        className="h-9 w-9 rounded-xl bg-white/10 border border-white/15"
                      >
                        -
                      </button>

                      <div className="w-8 text-center">{item.quantity}</div>

                      <button
                        onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                        className="h-9 w-9 rounded-xl bg-white/10 border border-white/15"
                      >
                        +
                      </button>
                    </div>

                    <button
                      onClick={() => removeItem(item.product.id)}
                      className="text-sm text-red-300 hover:text-red-200"
                    >
                      Удалить
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <aside className="rounded-3xl border border-white/10 bg-white/5 p-6 h-fit">
              <div className="text-xl font-semibold">Итого</div>

              <div className="mt-4 flex justify-between text-white/70">
                <span>Товаров</span>
                <span>{items.reduce((sum, item) => sum + item.quantity, 0)}</span>
              </div>

              <div className="mt-3 flex justify-between text-lg font-semibold">
                <span>Сумма</span>
                <span>{formatRUB(total)}</span>
              </div>

              <button className="mt-6 w-full px-5 py-3 rounded-2xl bg-white text-black">
                Оформить заказ
              </button>
            </aside>
          </div>
        )}
      </main>
    </div>
  );
}

function formatRUB(v: number) {
  return `${v.toLocaleString("ru-RU")} ₽`;
}