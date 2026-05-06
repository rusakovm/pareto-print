// src/app/shop/page.tsx
"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Lang = "RU" | "EN";

type HeroSlide = {
  id: string;
  title: string;
  subtitle: string;
  img: string; // /shop/hero/...
  badge?: string;
};

type Book = {
  id: string;
  title: string;
  author: string;
  price: number;
  currency: "RUB";
  cover: "hard" | "soft";
  stock: "in" | "preorder" | "out";
  category:
    | "Новинки"
    | "Художественная"
    | "Нон-фикшн"
    | "Детская"
    | "Поэзия"
    | "Бизнес"
    | "Скидки";
  tags: string[];
  img: string; // /shop/books/...
};

type MerchItem = {
  id: string;
  title: string;
  price: number;
  img: string; // /shop/merch/...
  badge?: string;
};

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
      {/* фон */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/80" />
      </div>

      {/* header */}
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
  const slides = HERO_SLIDES;

  const bgUrl = "/shop/main.jpg";

  

  const [active, setActive] = useState(0);
  const [hovered, setHovered] = useState(false);

  const bigRef = useRef<HTMLDivElement | null>(null);
  const miniRef = useRef<HTMLDivElement | null>(null);

  const clampIndex = (i: number) => (i + slides.length) % slides.length;

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
    const next = clampIndex(active + dir);
    setActive(next);
    scrollToIndex(next);
  };

  // автопрокрутка
  useEffect(() => {
    if (hovered) return;
    const t = setInterval(() => {
      setActive((prev) => {
        const next = (prev + 1) % slides.length;
        requestAnimationFrame(() => scrollToIndex(next));
        return next;
      });
    }, 5000);
    return () => clearInterval(t);
  }, [hovered, slides.length]);

  // синхронизация при ручном скролле большого блока
  useEffect(() => {
    const el = bigRef.current;
    if (!el) return;

    let raf = 0;
    const onScroll = () => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const children = Array.from(el.querySelectorAll<HTMLElement>("[data-hero-big]"));
        if (!children.length) return;

        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;

        let bestIdx = 0;
        let bestDist = Infinity;

        children.forEach((ch) => {
          const r = ch.getBoundingClientRect();
          const chCenter = r.left + r.width / 2;
          const dist = Math.abs(chCenter - centerX);
          const idx = Number(ch.dataset.heroBig ?? 0);
          if (dist < bestDist) {
            bestDist = dist;
            bestIdx = idx;
          }
        });

        if (bestIdx !== active) {
          setActive(bestIdx);
          const mini = miniRef.current;
          const miniChild = mini?.querySelector<HTMLElement>(`[data-hero-mini="${bestIdx}"]`);
          miniChild?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
      });
    };

    el.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      el.removeEventListener("scroll", onScroll as any);
      cancelAnimationFrame(raf);
    };
  }, [active]);

  return (
    <section className="w-full">
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex items-end justify-between gap-4">
          <div>
            <div className="text-3xl md:text-4xl font-semibold">
              {lang === "RU" ? "Товары / Магазин" : "Shop"}
            </div>
            <div className="mt-1 text-sm md:text-base text-white/70">
              {lang === "RU"
                ? "Готовые книги в наличии • подборки • новинки"
                : "Books in stock • collections • new arrivals"}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <button
              onClick={() => go(-1)}
              className="h-11 w-11 rounded-2xl border border-white/15 bg-white/10 hover:bg-white/15 transition"
              aria-label="Prev"
            >
              ←
            </button>
            <button
              onClick={() => go(1)}
              className="h-11 w-11 rounded-2xl border border-white/15 bg-white/10 hover:bg-white/15 transition"
              aria-label="Next"
            >
              →
            </button>
          </div>
        </div>
      </div>

      {/* шапка */}
      <div className="mt-6" onMouseEnter={() => setHovered(true)} onMouseLeave={() => setHovered(false)}>
        <div className="relative">
         {/* BACKGROUND (меняется по активному слайду) */}
            <div className="pointer-events-none absolute inset-0">
            <div
                className="absolute inset-0 transition-opacity duration-700"
              style={{
                backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
                backgroundSize: "cover",
                backgroundPosition: "center",
                opacity: bgUrl ? 0.35 : 0, // можешь 0.25–0.5
                filter: "none",
                transform: "none",
                }}
            />
            {/* затемнение + градиенты */}
            <div className="absolute inset-0 bg-black/55" />
            <div className="absolute inset-0 bg-gradient-to-b from-black/30 via-black/15 to-black/70" />
            </div>

          <div className="relative">
            {/* большие стрелки */}
            <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 hidden md:block">
              <button
                onClick={() => go(-1)}
                className="h-12 w-12 rounded-full bg-white text-black shadow hover:opacity-90 transition"
                aria-label="Prev"
              >
                ‹
              </button>
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 hidden md:block">
              <button
                onClick={() => go(1)}
                className="h-12 w-12 rounded-full bg-white text-black shadow hover:opacity-90 transition"
                aria-label="Next"
              >
                ›
              </button>
            </div>

            {/* BIG */}
            <div
              ref={bigRef}
              className="noScrollBar w-full overflow-x-auto flex gap-6 px-4 md:px-10 scroll-smooth"
              style={{ scrollSnapType: "x mandatory", scrollbarGutter: "stable" as any }}
            >
              {slides.map((s, idx) => (
                <div
                  key={s.id}
                  data-hero-big={idx}
                  className="shrink-0 w-[92vw] md:w-[540px] lg:w-[600px]"
                  style={{ scrollSnapAlign: "center" }}
                >
                  <div className="rounded-[28px] overflow-hidden">
                    <div className="relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={s.img} alt="" className="h-[320px] md:h-[360px] w-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-black/10 to-transparent" />
                      {s.badge ? (
                        <div className="absolute left-5 top-5 text-xs px-3 py-1.5 rounded-full bg-white text-black">
                          {s.badge}
                        </div>
                      ) : null}
                    </div>

                    <div className="p-5 md:p-6 flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-lg md:text-xl font-semibold truncate">{s.title}</div>
                        <div className="mt-1 text-sm text-white/70 truncate">{s.subtitle}</div>
                      </div>

                      <button className="shrink-0 px-4 py-2 rounded-2xl bg-white text-black hover:opacity-90 transition">
                        {lang === "RU" ? "Смотреть" : "Open"}
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* dots */}
            <div className="mt-4 flex items-center justify-center gap-2">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => {
                    setActive(i);
                    scrollToIndex(i);
                  }}
                  className={`h-2.5 rounded-full transition-all ${
                    i === active ? "w-10 bg-white" : "w-2.5 bg-white/35 hover:bg-white/60"
                  }`}
                  aria-label={`Go ${i + 1}`}
                />
              ))}
            </div>

            {/* MINI */}
            <div className="mt-4 pb-6">
              <div
                ref={miniRef}
                className="noScrollBar w-full overflow-x-auto flex gap-6 px-4 md:px-10 scroll-smooth"
                style={{ scrollSnapType: "x mandatory", scrollbarGutter: "stable" as any }}
              >
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
                      className={`shrink-0 rounded-2xl border transition ${
                        on ? "border-white bg-white/12" : "border-white/10 bg-white/5 hover:bg-white/10"
                      }`}
                      style={{ scrollSnapAlign: "center" }}
                    >
                      <div className="w-[160px] md:w-[190px] p-2">
                        <div className="rounded-xl overflow-hidden border border-white/10 bg-black/20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={s.img} alt="" className="h-16 w-full object-cover" />
                        </div>
                        <div className={`mt-2 text-xs truncate ${on ? "text-white" : "text-white/70"}`}>
                          {s.title}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="mt-2 text-center text-xs text-white/45">
                {lang === "RU"
                  ? "Большой и маленький скроллы связаны • автопереключение каждые 5 секунд"
                  : "Big and small sliders are synced • autoplay every 5 seconds"}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ скрытие скроллбаров (Chrome/Safari/Edge/Firefox) */}
      <style jsx global>{`
        .noScrollBar {
          -ms-overflow-style: none; /* IE/Edge legacy */
          scrollbar-width: none; /* Firefox */
        }
        .noScrollBar::-webkit-scrollbar {
          display: none; /* Chrome/Safari */
        }
      `}</style>
    </section>
  );
}

/* ------------------------------ MERCH SECTION ------------------------------ */

function MerchSection({ lang }: { lang: Lang }) {
  const items = MERCH_ITEMS;

  const [active, setActive] = useState(0);
  const trackRef = useRef<HTMLDivElement | null>(null);

  const clampIndex = (i: number) => (i + items.length) % items.length;

  const go = (dir: -1 | 1) => {
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
              <div className="text-2xl md:text-3xl font-semibold">
                {lang === "RU" ? "Мерч / фирменные штуки" : "Merch"}
              </div>
              <div className="mt-1 text-sm md:text-base text-white/70">
                {lang === "RU"
                  ? "Стикеры, закладки, открытки, наборы — для бренда и настроения"
                  : "Stickers, bookmarks, postcards, bundles — for branding and vibes"}
              </div>
            </div>

            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={() => go(-1)}
                className="h-11 w-11 rounded-2xl border border-white/15 bg-white/10 hover:bg-white/15 transition"
                aria-label="Prev merch"
              >
                ←
              </button>
              <button
                onClick={() => go(1)}
                className="h-11 w-11 rounded-2xl border border-white/15 bg-white/10 hover:bg-white/15 transition"
                aria-label="Next merch"
              >
                →
              </button>
            </div>
          </div>

          <div className="mt-6 relative">
            <div className="absolute left-2 top-1/2 -translate-y-1/2 z-20 md:hidden">
              <button
                onClick={() => go(-1)}
                className="h-10 w-10 rounded-full bg-white text-black hover:opacity-90 transition"
                aria-label="Prev merch"
              >
                ‹
              </button>
            </div>
            <div className="absolute right-2 top-1/2 -translate-y-1/2 z-20 md:hidden">
              <button
                onClick={() => go(1)}
                className="h-10 w-10 rounded-full bg-white text-black hover:opacity-90 transition"
                aria-label="Next merch"
              >
                ›
              </button>
            </div>

            <div
              ref={trackRef}
              className="noScrollBar overflow-x-auto flex gap-4 px-2 md:px-8 py-2 scroll-smooth"
              style={{ scrollSnapType: "x mandatory" }}
            >
              {items.map((m, idx) => {
                const on = idx === active;
                return (
                  <button
                    key={m.id}
                    data-merch={idx}
                    onClick={() => setActive(idx)}
                    className={`shrink-0 rounded-[24px] border transition text-left ${
                      on ? "border-white bg-white/12" : "border-white/10 bg-white/5 hover:bg-white/10"
                    }`}
                    style={{ scrollSnapAlign: "center" }}
                  >
                    <div className="w-[280px] md:w-[340px]">
                      <div className="p-3">
                        <div className="rounded-2xl overflow-hidden border border-white/10 bg-black/20">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={m.img} alt="" className="h-[170px] md:h-[190px] w-full object-cover" />
                        </div>

                        <div className="mt-3 flex items-start justify-between gap-3">
                          <div>
                            <div className="text-sm font-semibold">{m.title}</div>
                            <div className="mt-1 text-xs text-white/70">{formatRUB(m.price)}</div>
                          </div>

                          {m.badge ? (
                            <div className="text-[11px] px-2 py-1 rounded-full bg-white text-black">
                              {m.badge}
                            </div>
                          ) : null}
                        </div>
                      </div>
                    </div>
                  </button>
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
                  className={`h-2.5 rounded-full transition-all ${
                    i === active ? "w-10 bg-white" : "w-2.5 bg-white/35 hover:bg-white/60"
                  }`}
                  aria-label={`Merch ${i + 1}`}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="h-10" />
      </div>
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
  const all = BOOKS;

  const categories = useMemo(() => {
    const set = new Set(all.map((b) => b.category));
    return Array.from(set);
  }, [all]);

  const [q, setQ] = useState("");
  const [selectedCats, setSelectedCats] = useState<string[]>([]);
  const [stock, setStock] = useState<"all" | "in" | "preorder">("all");
  const [cover, setCover] = useState<"all" | "hard" | "soft">("all");
  const [sort, setSort] = useState<"popular" | "price_asc" | "price_desc" | "new">("popular");

  const filtered = useMemo(() => {
    let items = [...all];

    if (q.trim()) {
      const s = q.trim().toLowerCase();
      items = items.filter((b) => (b.title + " " + b.author).toLowerCase().includes(s));
    }

    if (selectedCats.length) {
      items = items.filter((b) => selectedCats.includes(b.category));
    }

    if (stock !== "all") {
      items = items.filter((b) => b.stock === stock);
    }

    if (cover !== "all") {
      items = items.filter((b) => b.cover === cover);
    }

    switch (sort) {
      case "price_asc":
        items.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        items.sort((a, b) => b.price - a.price);
        break;
      case "new":
        items.sort(
          (a, b) => (b.category === "Новинки" ? 1 : 0) - (a.category === "Новинки" ? 1 : 0)
        );
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
              {lang === "RU" ? "Фильтры слева • карточки справа" : "Filters left • grid right"}
            </div>
          </div>

          <div className="hidden md:flex items-center gap-2">
            <div className="text-sm text-white/60">{lang === "RU" ? "Сортировка:" : "Sort:"}</div>
            <select
              value={sort}
              onChange={(e) => setSort(e.target.value as any)}
              className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 outline-none"
            >
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
              {categories.map((c) => {
                const on = selectedCats.includes(c);
                return (
                  <label key={c} className="flex items-center gap-2 text-sm text-white/80 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={on}
                      onChange={() =>
                        setSelectedCats((prev) => (on ? prev.filter((x) => x !== c) : [...prev, c]))
                      }
                      className="h-4 w-4"
                    />
                    <span>{c}</span>
                  </label>
                );
              })}
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
                  onClick={() => setStock(x.id as any)}
                  className={`px-3 py-2 rounded-2xl text-sm border transition ${
                    stock === x.id
                      ? "bg-white text-black border-white"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
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
                  onClick={() => setCover(x.id as any)}
                  className={`px-3 py-2 rounded-2xl text-sm border transition ${
                    cover === x.id
                      ? "bg-white text-black border-white"
                      : "bg-white/5 border-white/10 hover:bg-white/10"
                  }`}
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

            <div className="mt-4 text-xs text-white/50">
              {lang === "RU"
                ? "Это демо UI. Потом подключим реальные товары из БД."
                : "Demo UI. Later we’ll connect real products from DB."}
            </div>
          </aside>

          <div>
            <div className="md:hidden mb-4">
              <select
                value={sort}
                onChange={(e) => setSort(e.target.value as any)}
                className="w-full px-3 py-2 rounded-xl bg-white/10 border border-white/15 outline-none"
              >
                <option value="popular">{lang === "RU" ? "Популярное" : "Popular"}</option>
                <option value="new">{lang === "RU" ? "Сначала новинки" : "New first"}</option>
                <option value="price_asc">{lang === "RU" ? "Цена ↑" : "Price ↑"}</option>
                <option value="price_desc">{lang === "RU" ? "Цена ↓" : "Price ↓"}</option>
              </select>
            </div>

            <div className="text-sm text-white/60 mb-3">
              {lang === "RU" ? "Найдено:" : "Found:"} <b className="text-white">{filtered.length}</b>
            </div>

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {filtered.map((b) => (
                <BookCard key={b.id} book={b} lang={lang} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BookCard({ book, lang }: { book: Book; lang: Lang }) {
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
      <div className="relative">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={book.img} alt="" className="h-52 w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/55 via-transparent to-transparent" />
        <div className={`absolute left-3 top-3 text-[11px] px-2 py-1 rounded-full ${badgeClass}`}>{badge}</div>
      </div>

      <div className="p-4">
        <div className="text-sm text-white/70">{book.author}</div>
        <div className="mt-1 font-semibold leading-snug">{book.title}</div>

        <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-white/70">
          <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10">
            {book.cover === "hard" ? (lang === "RU" ? "Твёрдый" : "Hard") : lang === "RU" ? "Мягкий" : "Soft"}
          </span>
          <span className="px-2 py-1 rounded-full bg-white/10 border border-white/10">{book.category}</span>
        </div>

        <div className="mt-4 flex items-center justify-between gap-3">
          <div className="text-base font-semibold">{formatRUB(book.price)}</div>
          <button className="px-4 py-2 rounded-2xl bg-white text-black hover:opacity-90 transition">
            {lang === "RU" ? "В корзину" : "Add"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ FOOTER ------------------------------ */

function SiteFooter({ lang }: { lang: Lang }) {
  return (
    <footer className="mt-16 border-t border-white/10 bg-black/40">
      <div className="mx-auto max-w-6xl px-4 py-10 grid md:grid-cols-4 gap-8">
        <div>
          <div className="font-semibold">ООО “Прето Принт”</div>
          <div className="mt-2 text-sm text-white/70 leading-relaxed">
            {lang === "RU"
              ? "Печать и полиграфия • производство • магазин готовых книг."
              : "Printing • production • shop for ready-to-buy books."}
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

/* ------------------------------ DATA ------------------------------ */

const HERO_SLIDES: HeroSlide[] = Array.from({ length: 16 }).map((_, i) => {
  const n = i + 1;
  return {
    id: `hs${n}`,
    title:
      [
        "Подборка недели: новые авторы",
        "Переиздание: коллекционная обложка",
        "Наборы для подарка",
        "Премиум переплёт: серия",
        "Лимитка: золотое тиснение",
        "Детская подборка",
        "Нон-фикшн недели",
        "Поэзия и альбомы",
        "Бизнес и маркетинг",
        "Скидки на комплекты",
        "Короткие рассказы",
        "Сборники эссе",
        "Книги с иллюстрациями",
        "Малые тиражи",
        "Классика в новом виде",
        "Лучшее за месяц",
      ][i] ?? `Слайд ${n}`,
    subtitle:
      [
        "Серия малых тиражей • твёрдый переплёт",
        "Ограниченный выпуск • в наличии",
        "Книга + открытка + закладка",
        "Максимум “дорого выглядит”",
        "Обложка и корешок — вау",
        "Добрые истории • яркие иллюстрации",
        "Истории, факты, исследования",
        "Стихи, артбуки, сборники",
        "Практика, кейсы, инструменты",
        "Экономия на популярных позициях",
        "Лёгкое чтение • в дорогу",
        "Идеи, мысли, вдохновение",
        "Плотная бумага • цвет",
        "Готовые издания небольших авторов",
        "Дизайн/переплёт/бумага — апгрейд",
        "Подборка самых покупаемых",
      ][i] ?? "",
    img: `/shop/hero/${n}.jpg`,
    badge: i === 0 ? "NEW" : i === 1 ? "RECOMMEND" : i === 2 ? "BUNDLE" : i === 4 ? "LIMITED" : undefined,
  };
});

const MERCH_ITEMS: MerchItem[] = [
  { id: "m1", title: "Набор наклеек (бренд)", price: 290, img: "/shop/merch/1.jpg", badge: "NEW" },
  { id: "m2", title: "Закладка (премиум)", price: 190, img: "/shop/merch/2.jpg" },
  { id: "m3", title: "Открытка + конверт", price: 160, img: "/shop/merch/3.jpg" },
  { id: "m4", title: "Подарочный набор", price: 690, img: "/shop/merch/4.jpg", badge: "HOT" },
];

const BOOKS: Book[] = [
  {
    id: "b1",
    title: "Лабиринт печатника",
    author: "И. Авторов",
    price: 790,
    currency: "RUB",
    cover: "hard",
    stock: "in",
    category: "Новинки",
    tags: ["серия", "бестселлер"],
    img: "/shop/books/1.jpg",
  },
  {
    id: "b2",
    title: "Ночь на типографской улице",
    author: "К. Писатель",
    price: 650,
    currency: "RUB",
    cover: "soft",
    stock: "preorder",
    category: "Художественная",
    tags: ["роман"],
    img: "/shop/books/2.jpg",
  },
  {
    id: "b3",
    title: "Как издать книгу и не сойти с ума",
    author: "А. Редактор",
    price: 990,
    currency: "RUB",
    cover: "hard",
    stock: "in",
    category: "Бизнес",
    tags: ["практика"],
    img: "/shop/books/3.jpg",
  },
  {
    id: "b4",
    title: "Стихи на полях",
    author: "М. Поэт",
    price: 420,
    currency: "RUB",
    cover: "soft",
    stock: "in",
    category: "Поэзия",
    tags: ["лирика"],
    img: "/shop/books/4.jpg",
  },
  {
    id: "b5",
    title: "История бумаги",
    author: "Н. Исследователь",
    price: 860,
    currency: "RUB",
    cover: "hard",
    stock: "in",
    category: "Нон-фикшн",
    tags: ["история"],
    img: "/shop/books/5.jpg",
  },
  {
    id: "b6",
    title: "Сказки переплёта",
    author: "Д. Рассказчик",
    price: 540,
    currency: "RUB",
    cover: "soft",
    stock: "out",
    category: "Детская",
    tags: ["детям"],
    img: "/shop/books/6.jpg",
  },
  {
    id: "b7",
    title: "Скидочный комплект (2 книги)",
    author: "Разные авторы",
    price: 990,
    currency: "RUB",
    cover: "soft",
    stock: "in",
    category: "Скидки",
    tags: ["набор"],
    img: "/shop/books/7.jpg",
  },
  {
    id: "b8",
    title: "Каталог идей для обложек",
    author: "Студия",
    price: 730,
    currency: "RUB",
    cover: "hard",
    stock: "preorder",
    category: "Нон-фикшн",
    tags: ["дизайн"],
    img: "/shop/books/8.jpg",
  },
];

/* ------------------------------ HELPERS ------------------------------ */

function formatRUB(v: number) {
  return `${v.toLocaleString("ru-RU")} ₽`;
}