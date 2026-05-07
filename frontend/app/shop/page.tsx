"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Lang = "RU" | "EN";

type DbProduct = {
  id: number;
  title: string;
  author: string | null;
  description: string | null;
  price: number;
  image: string;
  category: string;
  cover: string;
  stock: string;
  isHero: boolean;
  isMerch: boolean;
};

const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

export default function ShopPage() {
  const [lang, setLang] = useState<Lang>("RU");
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;

    if (musicOn) {
      audioRef.current.volume = 0.25;
      audioRef.current.loop = true;
      audioRef.current.play().catch(() => setMusicOn(false));
    } else {
      audioRef.current.pause();
    }
  }, [musicOn]);

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/80" />
      </div>

      <header className="fixed top-0 left-0 right-0 z-50">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-bold">
              PP
            </div>
            <div className="leading-tight">
              <div className="font-semibold">ООО “Прето Принт”</div>
              <div className="text-xs opacity-70">{lang === "RU" ? "Магазин" : "Shop"}</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2 bg-white/10 border border-white/15 rounded-2xl px-2 py-1 backdrop-blur">
            <Link href="/" className="text-sm px-3 py-2 rounded-xl hover:bg-white/10 transition">
              {lang === "RU" ? "Главная" : "Home"}
            </Link>
            <button className="text-sm px-3 py-2 rounded-xl bg-white/20">
              {lang === "RU" ? "Товары" : "Shop"}
            </button>
            <Link href="/profile" className="text-sm px-3 py-2 rounded-xl bg-white text-black hover:opacity-90 transition">
              {lang === "RU" ? "Профиль" : "Profile"}
            </Link>
            <Link href="/cart" className="text-sm px-3 py-2 rounded-xl hover:bg-white/10 transition">
              {lang === "RU" ? "Корзина" : "Cart"}
            </Link>
            <Link href="/favorites" className="text-sm px-3 py-2 rounded-xl hover:bg-white/10 transition">
              {lang === "RU" ? "Избранное" : "Favorites"}
            </Link>
          </nav>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setMusicOn((v) => !v)}
              className={`px-3 py-2 rounded-xl text-sm border border-white/15 bg-white/10 hover:bg-white/15 transition ${
                musicOn ? "text-black bg-white" : ""
              }`}
              title="Музыка"
            >
              {musicOn ? "♪ ON" : "♪ OFF"}
            </button>
            <button
              onClick={() => setLang((v) => (v === "RU" ? "EN" : "RU"))}
              className="px-3 py-2 rounded-xl text-sm border border-white/15 bg-white/10 hover:bg-white/15 transition"
              title="Язык"
            >
              {lang}
            </button>
          </div>
        </div>
      </header>

      <audio ref={audioRef} src="/audio/theme.mp3" />

      <main className="relative z-10 pt-24">
        <HeroShopSlider lang={lang} />
        <MerchSection lang={lang} />
        <ShopGridSection lang={lang} />
        <SiteFooter lang={lang} />
      </main>
    </div>
  );
}

/* ----------------------------- HERO SLIDER ----------------------------- */

function HeroShopSlider({ lang }: { lang: Lang }) {
  const [slides, setSlides] = useState<DbProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<DbProduct | null>(null);
  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);
  const [loading, setLoading] = useState(true);

  const bigRef = useRef<HTMLDivElement | null>(null);
  const miniRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch(`${API}/products/hero`)
      .then((res) => res.json())
      .then((data: DbProduct[]) => {
        setSlides(data);
        setActive(0);
      })
      .catch((err) => console.error("Ошибка загрузки hero:", err))
      .finally(() => setLoading(false));
  }, []);

  const bgUrl = slides[active]?.image || "/shop/main.jpg";

  const clampIndex = (i: number) => {
    if (!slides.length) return 0;
    return (i + slides.length) % slides.length;
  };

  const scrollToIndex = (idx: number, behavior: ScrollBehavior = "smooth") => {
    const big = bigRef.current;
    const mini = miniRef.current;
    if (!big || !mini) return;

    const bigChild = big.querySelector<HTMLElement>(`[data-hero-big="${idx}"]`);
    const miniChild = mini.querySelector<HTMLElement>(`[data-hero-mini="${idx}"]`);

    bigChild?.scrollIntoView({ behavior, inline: "center", block: "nearest" });
    miniChild?.scrollIntoView({ behavior, inline: "center", block: "nearest" });
  };

  const go = (dir: -1 | 1) => {
    if (!slides.length) return;

    const next = clampIndex(active + dir);
    setActive(next);
    scrollToIndex(next);
  };

  useEffect(() => {
    if (hovered || slides.length <= 1) return;

    const t = setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % slides.length;
        requestAnimationFrame(() => scrollToIndex(next));
        return next;
      });
    }, 5000);

    return () => clearInterval(t);
  }, [hovered, slides.length]);

  if (loading) {
    return (
      <section className="w-full">
        <div className="mx-auto max-w-6xl px-4 py-20 text-white/60">Загрузка верхнего слайдера...</div>
      </section>
    );
  }

  if (!slides.length) {
    return (
      <section className="w-full">
        <div className="mx-auto max-w-6xl px-4 py-20">
          <div className="text-3xl md:text-4xl font-semibold">{lang === "RU" ? "Товары / Магазин" : "Shop"}</div>
          <div className="mt-3 rounded-3xl border border-white/10 bg-white/5 p-6 text-white/60">
            {lang === "RU"
              ? "Верхний слайдер пуст. В админке отметь товар галочкой «Показывать в верхнем слайдере»."
              : "Hero slider is empty. Mark products as Hero in admin panel."}
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="w-full">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-3xl md:text-4xl font-semibold">{lang === "RU" ? "Товары / Магазин" : "Shop"}</div>
            <div className="mt-1 text-sm md:text-base text-white/70">
              {lang === "RU" ? "Готовые книги в наличии • подборки • новинки" : "Books in stock • collections • new arrivals"}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button onClick={() => go(-1)} className="h-11 w-11 rounded-2xl border border-white/15 bg-white/10 hover:bg-white/15 transition">
              ←
            </button>
            <button onClick={() => go(1)} className="h-11 w-11 rounded-2xl border border-white/15 bg-white/10 hover:bg-white/15 transition">
              →
            </button>
          </div>
        </div>
      </div>

      <div className="mt-6" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <div className="relative">
          <div className="pointer-events-none absolute inset-0">
            <div
              className="absolute inset-0 transition-opacity duration-700"
              style={{
                backgroundImage: `url(${bgUrl})`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: 0.35,
              }}
            />
            <div className="absolute inset-0 bg-black/55" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-black/70" />
          </div>

          <div className="relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 hidden md:block">
              <button onClick={() => go(-1)} className="h-12 w-12 rounded-full bg-white text-black shadow hover:opacity-90 transition">
                ‹
              </button>
            </div>

            <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 hidden md:block">
              <button onClick={() => go(1)} className="h-12 w-12 rounded-full bg-white text-black shadow hover:opacity-90 transition">
                ›
              </button>
            </div>

            <div ref={bigRef} className="noScrollBar w-full overflow-x-auto flex gap-6 px-4 md:px-10 scroll-smooth" style={{ scrollSnapType: "x mandatory" }}>
              {slides.map((s, idx) => (
                <div key={s.id} data-hero-big={idx} className="shrink-0 w-[92vw] md:w-[540px] lg:w-[600px]" style={{ scrollSnapAlign: "center" }}>
                  <div className="rounded-[28px] overflow-hidden">
                    <div className="relative">
                      <img src={s.image} alt="" className="h-[320px] md:h-[360px] w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                      <div className="absolute left-5 top-5 text-xs px-3 py-1.5 rounded-full bg-white text-black">HERO</div>
                    </div>

                    <div className="p-5 md:p-6 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-lg md:text-xl font-semibold truncate">{s.title}</div>
                        <div className="mt-1 text-sm text-white/70 truncate">{s.description || s.author || s.category}</div>
                      </div>

                      <button
                        onClick={() => setSelectedProduct(s)}
                        className="shrink-0 px-4 py-2 rounded-2xl bg-white text-black hover:opacity-90 transition"
                      >
                        {lang === "RU" ? "Смотреть" : "Open"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-4 flex items-center justify-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActive(i);
                    scrollToIndex(i);
                  }}
                  className={`h-2.5 rounded-full transition-all ${i === active ? "w-10 bg-white" : "w-2.5 bg-white/35 hover:bg-white/60"}`}
                />
              ))}
            </div>

            <div className="mt-4 pb-6">
              <div ref={miniRef} className="noScrollBar w-full overflow-x-auto flex gap-6 px-4 md:px-10 scroll-smooth" style={{ scrollSnapType: "x mandatory" }}>
                {slides.map((s, idx) => {
                  const on = idx === active;

                  return (
                    <button
                      key={s.id}
                      data-hero-mini={idx}
                      onClick={() => {
                        setActive(idx);
                        scrollToIndex(idx);
                      }}
                      className={`shrink-0 rounded-2xl border transition ${on ? "border-white bg-white/12" : "border-white/10 bg-white/5 hover:bg-white/10"}`}
                      style={{ scrollSnapAlign: "center" }}
                    >
                      <div className="w-[160px] md:w-[190px] p-2">
                        <div className="rounded-xl overflow-hidden border border-white/10 bg-black/20">
                          <img src={s.image} alt="" className="h-16 w-full object-cover" />
                        </div>
                        <div className={`mt-2 text-xs truncate ${on ? "text-white" : "text-white/70"}`}>{s.title}</div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 text-center text-xs text-white/45">
                {lang === "RU" ? "Данные слайдера загружаются из БД по признаку isHero" : "Slider data is loaded from DB by isHero flag"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedProduct ? <ProductModal product={selectedProduct} lang={lang} onClose={() => setSelectedProduct(null)} /> : null}

      <style jsx global>{`
        .noScrollBar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }

        .noScrollBar::-webkit-scrollbar {
          display: none;
        }
      `}</style>
    </section>
  );
}

/* ------------------------------ MERCH SECTION ------------------------------ */

function MerchSection({ lang }: { lang: Lang }) {
  const [items, setItems] = useState<DbProduct[]>([]);
  const [selectedProduct, setSelectedProduct] = useState<DbProduct | null>(null);
  const [active, setActive] = useState(0);
  const [loading, setLoading] = useState(true);

  const trackRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetch(`${API}/products/merch`)
      .then((res) => res.json())
      .then((data: DbProduct[]) => {
        setItems(data);
        setActive(0);
      })
      .catch((err) => console.error("Ошибка загрузки мерча:", err))
      .finally(() => setLoading(false));
  }, []);

  const clampIndex = (i: number) => {
    if (!items.length) return 0;
    return (i + items.length) % items.length;
  };

  const go = (dir: -1 | 1) => {
    if (!items.length) return;

    const next = clampIndex(active + dir);
    setActive(next);

    const el = trackRef.current?.querySelector<HTMLElement>(`[data-merch="${next}"]`);
    el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  };

  return (
    <section className="mt-10">
      <div className="relative overflow-hidden">
        <RibbonBackground />

        <div className="relative z-10 mx-auto max-w-6xl px-4">
          <div className="flex items-end justify-between gap-4">
            <div>
              <div className="text-2xl md:text-3xl font-semibold">{lang === "RU" ? "Мерч / фирменные штуки" : "Merch"}</div>
              <div className="mt-1 text-sm md:text-base text-white/70">
                {lang === "RU" ? "Товары из базы данных с признаком isMerch" : "Products loaded from database by isMerch flag"}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button onClick={() => go(-1)} className="h-11 w-11 rounded-2xl border border-white/15 bg-white/10 hover:bg-white/15 transition">
                ←
              </button>
              <button onClick={() => go(1)} className="h-11 w-11 rounded-2xl border border-white/15 bg-white/10 hover:bg-white/15 transition">
                →
              </button>
            </div>
          </div>

          {loading ? <div className="mt-6 text-white/60">Загрузка мерча...</div> : null}

          {!loading && items.length === 0 ? (
            <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-6 text-white/60">
              {lang === "RU" ? "Мерч пуст. В админке отметь товар галочкой «Это мерч»." : "Merch is empty. Mark products as merch in admin panel."}
            </div>
          ) : null}

          {items.length > 0 ? (
            <div className="mt-6 relative">
              <div ref={trackRef} className="noScrollBar overflow-x-auto flex gap-4 px-2 md:px-8 py-2 scroll-smooth" style={{ scrollSnapType: "x mandatory" }}>
                {items.map((m, idx) => {
                  const on = idx === active;

                  return (
                    <div
                      key={m.id}
                      data-merch={idx}
                      className={`shrink-0 rounded-[24px] border transition text-left ${
                        on ? "border-white bg-white/12" : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                      style={{ scrollSnapAlign: "center" }}
                    >
                      <div className="w-[280px] md:w-[340px] p-3">
                        <button
                          onClick={() => {
                            setActive(idx);
                            setSelectedProduct(m);
                          }}
                          className="block w-full text-left"
                        >
                          <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/20">
                            <img src={m.image} alt="" className="h-[170px] md:h-[190px] w-full object-cover" />
                          </div>

                          <div className="mt-3 flex items-start justify-between gap-3">
                            <div>
                              <div className="text-sm font-semibold">{m.title}</div>
                              <div className="mt-1 text-xs text-white/70">{formatRUB(m.price)}</div>
                            </div>
                            <div className="text-[11px] px-2 py-1 rounded-full bg-white text-black">MERCH</div>
                          </div>
                        </button>

                        <div className="mt-4 flex gap-2">
                          <button
                            onClick={() => addToCart(m.id)}
                            className="flex-1 px-3 py-2 rounded-2xl bg-white text-black text-sm hover:opacity-90 transition"
                          >
                            {lang === "RU" ? "В корзину" : "Add"}
                          </button>
                          <button
                            onClick={() => addToFavorites(m.id)}
                            className="px-3 py-2 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition"
                          >
                            ♡
                          </button>
                          <button
                            onClick={() => setSelectedProduct(m)}
                            className="px-3 py-2 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition text-sm"
                          >
                            Подробнее
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 flex items-center justify-center gap-2">
                {items.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => {
                      setActive(i);
                      const el = trackRef.current?.querySelector<HTMLElement>(`[data-merch="${i}"]`);
                      el?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                    }}
                    className={`h-2.5 rounded-full transition-all ${i === active ? "w-10 bg-white" : "w-2.5 bg-white/35 hover:bg-white/60"}`}
                  />
                ))}
              </div>
            </div>
          ) : null}
        </div>

        <div className="h-10" />
      </div>

      {selectedProduct ? <ProductModal product={selectedProduct} lang={lang} onClose={() => setSelectedProduct(null)} /> : null}
    </section>
  );
}

function RibbonBackground() {
  const line = "СПЕЦИАЛЬНОЕ СОДЕРЖИМОЕ • PARETO PRINT • ";

  return (
    <div className="pointer-events-none absolute inset-0">
      <div className="absolute inset-0 bg-gradient-to-r from-[#7c3aed]/30 via-[#a855f7]/20 to-[#7c3aed]/30" />
      <div className="absolute inset-0 bg-black/40" />

      <div className="absolute left-0 right-0 top-10 h-12 overflow-hidden opacity-70">
        <div className="ribbon ribbon-a">
          <div className="ribbonText">{line.repeat(20)}</div>
        </div>
      </div>

      <div className="absolute left-0 right-0 top-28 h-12 overflow-hidden opacity-55">
        <div className="ribbon ribbon-b">
          <div className="ribbonText">{line.repeat(20)}</div>
        </div>
      </div>

      <div className="absolute left-0 right-0 top-46 h-12 overflow-hidden opacity-45">
        <div className="ribbon ribbon-c">
          <div className="ribbonText">{line.repeat(20)}</div>
        </div>
      </div>

      <style jsx>{`
        .ribbon {
          height: 48px;
          display: flex;
          align-items: center;
          transform: skewY(-2deg);
          border-top: 1px solid rgba(255, 255, 255, 0.15);
          border-bottom: 1px solid rgba(255, 255, 255, 0.15);
          background: rgba(255, 255, 255, 0.05);
          backdrop-filter: blur(8px);
        }

        .ribbonText {
          white-space: nowrap;
          font-weight: 700;
          letter-spacing: 0.08em;
          font-size: 34px;
          opacity: 0.22;
          animation: move 18s linear infinite;
        }

        .ribbon-a .ribbonText {
          animation-duration: 18s;
        }

        .ribbon-b .ribbonText {
          animation-duration: 22s;
        }

        .ribbon-c .ribbonText {
          animation-duration: 26s;
        }

        .ribbon-b {
          transform: skewY(1.5deg);
        }

        .ribbon-c {
          transform: skewY(-1deg);
        }

        @keyframes move {
          0% {
            transform: translateX(0);
          }

          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </div>
  );
}

/* ------------------------------ SHOP GRID ------------------------------ */

function ShopGridSection({ lang }: { lang: Lang }) {
  const [all, setAll] = useState<DbProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState<DbProduct | null>(null);

  const [q, setQ] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [stock, setStock] = useState<"all" | "in" | "preorder">("all");
  const [cover, setCover] = useState<"all" | "hard" | "soft">("all");
  const [sort, setSort] = useState<"popular" | "price_asc" | "price_desc" | "new">("popular");

  useEffect(() => {
    fetch(`${API}/products`)
      .then((res) => {
        if (!res.ok) throw new Error("Ошибка загрузки товаров");
        return res.json();
      })
      .then((data: DbProduct[]) => setAll(data.filter((item) => !item.isMerch)))
      .catch((err) => console.error("Ошибка загрузки товаров:", err))
      .finally(() => setLoading(false));
  }, []);

  const categories = useMemo(() => {
    const set = new Set(all.map((b) => b.category));
    return Array.from(set);
  }, [all]);

  const filtered = useMemo(() => {
    let items = [...all];

    if (q.trim()) {
      const s = q.trim().toLowerCase();
      items = items.filter((b) => `${b.title} ${b.author ?? ""}`.toLowerCase().includes(s));
    }

    if (selectedCats.length) items = items.filter((b) => selectedCats.includes(b.category));
    if (stock !== "all") items = items.filter((b) => b.stock === stock);
    if (cover !== "all") items = items.filter((b) => b.cover === cover);

    switch (sort) {
      case "price_asc":
        items.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        items.sort((a, b) => b.price - a.price);
        break;
      case "new":
        items.sort((a, b) => (b.category === "Новинки" ? 1 : 0) - (a.category === "Новинки" ? 1 : 0));
        break;
      default:
        break;
    }

    return items;
  }, [all, q, selectedCats, stock, cover, sort]);

  return (
    <section className="mt-14">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-2xl md:text-3xl font-semibold">{lang === "RU" ? "Каталог товаров" : "Catalog"}</div>
            <div className="mt-1 text-sm md:text-base text-white/70">
              {lang === "RU" ? "Товары загружаются из базы данных PostgreSQL" : "Products are loaded from PostgreSQL database"}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="text-sm text-white/60">{lang === "RU" ? "Сортировка:" : "Sort:"}</div>
            <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 outline-none">
              <option value="popular">{lang === "RU" ? "Популярное" : "Popular"}</option>
              <option value="new">{lang === "RU" ? "Сначала новинки" : "New first"}</option>
              <option value="price_asc">{lang === "RU" ? "Цена ↑" : "Price ↑"}</option>
              <option value="price_desc">{lang === "RU" ? "Цена ↓" : "Price ↓"}</option>
            </select>
          </div>
        </div>

        <div className="mt-6 grid lg:grid-cols-[280px_1fr] gap-6">
          <aside className="bg-white/5 border border-white/10 rounded-3xl p-4 backdrop-blur">
            <div className="font-semibold">{lang === "RU" ? "Поиск" : "Search"}</div>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder={lang === "RU" ? "Название или автор" : "Title or author"}
              className="mt-3 w-full px-3 py-2 rounded-2xl bg-black/40 border border-white/10 outline-none"
            />

            <div className="mt-5 font-semibold">{lang === "RU" ? "Категории" : "Categories"}</div>
            <div className="mt-2 space-y-2">
              {categories.length ? (
                categories.map((c) => {
                  const on = selectedCats.includes(c);

                  return (
                    <label key={c} className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={on}
                        onChange={() => setSelectedCats((prev) => (on ? prev.filter((x) => x !== c) : [...prev, c]))}
                        className="h-4 w-4"
                      />
                      <span>{c}</span>
                    </label>
                  );
                })
              ) : (
                <div className="text-sm text-white/45">Категории появятся после загрузки</div>
              )}
            </div>

            <div className="mt-5 font-semibold">{lang === "RU" ? "Наличие" : "Stock"}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { id: "all", label: lang === "RU" ? "Любое" : "All" },
                { id: "in", label: lang === "RU" ? "В наличии" : "In stock" },
                { id: "preorder", label: lang === "RU" ? "Предзаказ" : "Preorder" },
              ].map((x) => (
                <button
                  key={x.id}
                  onClick={() => setStock(x.id as typeof stock)}
                  className={`px-3 py-2 rounded-2xl text-sm border transition ${stock === x.id ? "bg-white text-black border-white" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
                >
                  {x.label}
                </button>
              ))}
            </div>

            <div className="mt-5 font-semibold">{lang === "RU" ? "Переплёт" : "Cover"}</div>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { id: "all", label: lang === "RU" ? "Любой" : "All" },
                { id: "hard", label: lang === "RU" ? "Твёрдый" : "Hard" },
                { id: "soft", label: lang === "RU" ? "Мягкий" : "Soft" },
              ].map((x) => (
                <button
                  key={x.id}
                  onClick={() => setCover(x.id as typeof cover)}
                  className={`px-3 py-2 rounded-2xl text-sm border transition ${cover === x.id ? "bg-white text-black border-white" : "bg-white/5 border-white/10 hover:bg-white/10"}`}
                >
                  {x.label}
                </button>
              ))}
            </div>

            <div className="mt-6 flex gap-2">
              <button
                onClick={() => {
                  setQ("");
                  setSelectedCats([]);
                  setStock("all");
                  setCover("all");
                  setSort("popular");
                }}
                className="w-full px-4 py-3 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition"
              >
                {lang === "RU" ? "Сбросить" : "Reset"}
              </button>
            </div>

            <div className="mt-4 text-xs text-white/50">{lang === "RU" ? "Данные поступают через NestJS API: /products" : "Data comes from NestJS API: /products"}</div>
          </aside>

          <div>
            <div className="md:hidden mb-4">
              <select value={sort} onChange={(e) => setSort(e.target.value as typeof sort)} className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 outline-none">
                <option value="popular">{lang === "RU" ? "Популярное" : "Popular"}</option>
                <option value="new">{lang === "RU" ? "Сначала новинки" : "New first"}</option>
                <option value="price_asc">{lang === "RU" ? "Цена ↑" : "Price ↑"}</option>
                <option value="price_desc">{lang === "RU" ? "Цена ↓" : "Price ↓"}</option>
              </select>
            </div>

            <div className="text-sm text-white/60 mb-3">
              {loading ? (
                <span>{lang === "RU" ? "Загрузка товаров..." : "Loading products..."}</span>
              ) : (
                <>
                  {lang === "RU" ? "Найдено:" : "Found:"} <b className="text-white">{filtered.length}</b>
                </>
              )}
            </div>

            {!loading && filtered.length === 0 ? (
              <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-white/60">
                {lang === "RU" ? "Товары не найдены. Проверь базу данных или фильтры." : "No products found. Check database or filters."}
              </div>
            ) : null}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((b) => (
                <BookCard key={b.id} book={b} lang={lang} onOpen={() => setSelectedProduct(b)} />
              ))}
            </div>
          </div>
        </div>
      </div>

      {selectedProduct ? <ProductModal product={selectedProduct} lang={lang} onClose={() => setSelectedProduct(null)} /> : null}
    </section>
  );
}

function BookCard({ book, lang, onOpen }: { book: DbProduct; lang: Lang; onOpen: () => void }) {
  const badge =
    book.stock === "in"
      ? lang === "RU"
        ? "В наличии"
        : "In stock"
      : book.stock === "preorder"
        ? lang === "RU"
          ? "Предзаказ"
          : "Preorder"
        : lang === "RU"
          ? "Нет"
          : "Out";

  const badgeClass =
    book.stock === "in"
      ? "bg-white text-black"
      : book.stock === "preorder"
        ? "bg-white/15 text-white border border-white/20"
        : "bg-white/10 text-white/60 border border-white/10";

  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 backdrop-blur hover:bg-white/8 transition overflow-hidden">
      <button onClick={onOpen} className="relative block w-full text-left">
        <img src={book.image} alt="" className="h-52 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div className={`absolute left-3 top-3 text-[11px] px-2 py-1 rounded-full ${badgeClass}`}>{badge}</div>
      </button>

      <div className="p-4">
        <button onClick={onOpen} className="block text-left w-full">
          <div className="text-sm text-white/70">{book.author || "Автор не указан"}</div>
          <div className="mt-1 font-semibold leading-snug">{book.title}</div>

          {book.description ? <div className="mt-2 text-xs text-white/55 line-clamp-2">{book.description}</div> : null}
        </button>

        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-white/70">
          <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10">
            {book.cover === "hard" ? (lang === "RU" ? "Твёрдый" : "Hard") : book.cover === "soft" ? (lang === "RU" ? "Мягкий" : "Soft") : book.cover}
          </span>
          <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10">{book.category}</span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-base font-semibold">{formatRUB(book.price)}</div>
          <div className="flex gap-2">
            <button onClick={() => addToCart(book.id)} className="px-4 py-2 rounded-2xl bg-white text-black hover:opacity-90 transition">
              {lang === "RU" ? "В корзину" : "Add"}
            </button>

            <button onClick={() => addToFavorites(book.id)} className="px-3 py-2 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition">
              ♡
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ MODAL / API HELPERS ------------------------------ */

function ProductModal({ product, lang, onClose }: { product: DbProduct; lang: Lang; onClose: () => void }) {
  const badge = product.isMerch ? "MERCH" : product.stock === "in" ? "В наличии" : product.stock === "preorder" ? "Предзаказ" : "Нет в наличии";

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

      <div className="relative z-10 w-full max-w-5xl max-h-[90vh] overflow-y-auto rounded-[36px] border border-white/15 bg-black/95 shadow-[0_30px_120px_rgba(0,0,0,0.75)]">
        <button onClick={onClose} className="absolute right-5 top-5 z-20 h-11 w-11 rounded-full bg-white text-black text-2xl">
          ×
        </button>

        <div className="grid md:grid-cols-[1fr_1fr] gap-0">
          <div className="relative min-h-[320px]">
            <img src={product.image} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20" />
            <div className="absolute left-5 top-5 rounded-full bg-white text-black px-3 py-1.5 text-xs font-semibold">{badge}</div>
          </div>

          <div className="p-7 md:p-9">
            <div className="text-sm text-white/50">{product.category}</div>
            <h2 className="mt-2 text-3xl md:text-4xl font-semibold leading-tight">{product.title}</h2>

            {product.author ? <div className="mt-2 text-white/65">{product.author}</div> : null}

            <div className="mt-5 flex flex-wrap gap-2 text-xs text-white/70">
              <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10">{product.cover}</span>
              <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10">{product.stock}</span>
              {product.isHero ? <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10">hero</span> : null}
              {product.isMerch ? <span className="px-3 py-1.5 rounded-full bg-white/10 border border-white/10">merch</span> : null}
            </div>

            {product.description ? <div className="mt-6 text-white/80 leading-relaxed whitespace-pre-line">{product.description}</div> : null}

            <div className="mt-7 text-2xl font-semibold">{formatRUB(product.price)}</div>

            <div className="mt-7 flex flex-wrap gap-3">
              <button onClick={() => addToCart(product.id)} className="px-5 py-3 rounded-2xl bg-white text-black hover:opacity-90 transition">
                {lang === "RU" ? "В корзину" : "Add to cart"}
              </button>

              <button onClick={() => addToFavorites(product.id)} className="px-5 py-3 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition">
                {lang === "RU" ? "В избранное" : "Favorite"}
              </button>

              <button onClick={onClose} className="px-5 py-3 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition">
                {lang === "RU" ? "Закрыть" : "Close"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

async function addToCart(productId: number) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Сначала войдите");
    return;
  }

  const res = await fetch(`${API}/cart/${productId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    console.error("ADD CART ERROR:", data);
    alert(data?.message || "Ошибка добавления в корзину");
    return;
  }

  alert("Добавлено в корзину");
}

async function addToFavorites(productId: number) {
  const token = localStorage.getItem("token");

  if (!token) {
    alert("Сначала войдите");
    return;
  }

  const res = await fetch(`${API}/favorites/${productId}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json().catch(() => null);

  if (!res.ok) {
    console.error("ADD FAVORITE ERROR:", data);
    alert(data?.message || "Ошибка добавления в избранное");
    return;
  }

  alert("Добавлено в избранное");
}

/* ------------------------------ FOOTER ------------------------------ */

function SiteFooter({ lang }: { lang: Lang }) {
  return (
    <footer className="mt-16 border-t border-white/10 bg-black/40">
      <div className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-4 gap-8">
        <div>
          <div className="font-semibold">ООО “Прето Принт”</div>
          <div className="mt-2 text-sm text-white/70 leading-relaxed">
            {lang === "RU" ? "Печать и полиграфия • производство • магазин готовых книг." : "Printing • production • shop for ready-to-buy books."}
          </div>
        </div>

        <div>
          <div className="font-semibold">{lang === "RU" ? "Разделы" : "Sections"}</div>
          <div className="mt-3 space-y-2 text-sm text-white/70">
            <Link className="block hover:text-white transition" href="/">
              {lang === "RU" ? "Главная" : "Home"}
            </Link>
            <Link className="block hover:text-white transition" href="/shop">
              {lang === "RU" ? "Товары" : "Shop"}
            </Link>
            <Link className="block hover:text-white transition" href="/profile">
              {lang === "RU" ? "Профиль" : "Profile"}
            </Link>
          </div>
        </div>

        <div>
          <div className="font-semibold">{lang === "RU" ? "Контакты" : "Contacts"}</div>
          <div className="mt-3 space-y-2 text-sm text-white/70">
            <div>Тел: +7 (___) ___-__-__</div>
            <div>Email: info@pareto-print.ru</div>
            <div>Telegram: @pareto_print</div>
          </div>
        </div>

        <div>
          <div className="font-semibold">{lang === "RU" ? "Информация" : "Info"}</div>
          <div className="mt-3 space-y-2 text-sm text-white/70">
            <div className="cursor-default">{lang === "RU" ? "Доставка (скоро)" : "Shipping (soon)"}</div>
            <div className="cursor-default">{lang === "RU" ? "Оплата (скоро)" : "Payment (soon)"}</div>
            <div className="cursor-default">{lang === "RU" ? "Возврат (скоро)" : "Returns (soon)"}</div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-6xl px-4 pb-8 flex flex-col md:flex-row gap-2 md:items-center md:justify-between text-xs text-white/50">
        <div>© {new Date().getFullYear()} ООО “Прето Принт”.</div>
        <div>{lang === "RU" ? "Демо интерфейс магазина" : "Shop demo UI"}</div>
      </div>
    </footer>
  );
}

function formatRUB(v: number) {
  return `${v.toLocaleString("ru-RU")} ₽`;
}
