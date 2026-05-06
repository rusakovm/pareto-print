"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type SectionId = "hero" | "products" | "services" | "team" | "contacts";

const SECTIONS: { id: SectionId; title: string; subtitle?: string; bg?: string }[] = [
  { id: "hero", title: "Прето Принт", subtitle: "Печать • Полиграфия • Производство", bg: "/bg/hero.jpg" },
  { id: "products", title: "Продукция", subtitle: "Каталог и примеры работ", bg: "/bg/products.jpg" },
  { id: "services", title: "Услуги", subtitle: "Печать, дизайн, постобработка", bg: "/bg/services.jpg" },
  { id: "team", title: "Команда", subtitle: "Карусель как в примере", bg: "/bg/team.jpg" },
  { id: "contacts", title: "Контакты", subtitle: "Где мы находимся и как связаться", bg: "/bg/contacts.jpg" },
];

type Product = {
  id: string;
  regionTitle: string;
  name: string;
  labelLeft: string;
  labelValue: string;
  desc: string;
  bigImage: string;
  thumbs: { id: string; title: string; img: string; big?: string }[];
  leftMenu: { id: string; title: string; disabled?: boolean }[];
};

const PRODUCTS_GENSHIN: Product[] = [
  {
    id: "hardcover",
    regionTitle: "Каталог",
    name: "Книги",
    labelLeft: "Тип:",
    labelValue: "Твёрдый переплёт",
    desc:
      "Премиальная полиграфия для подарочных изданий, корпоративных каталогов и книг, которые должны служить годами.\n" +
      "Подберём бумагу, ламинацию, тиснение, выборочный лак и другие эффекты.\n" +
      "Сделаем тестовый экземпляр перед тиражом.",
    bigImage: "/products/hardcover/main.jpg",
    leftMenu: [
      { id: "hardcover", title: "Твёрдый переплёт" },
      { id: "softcover", title: "Мягкий переплёт" },
      { id: "brochures", title: "Брошюры" },
      { id: "exclusive", title: "Эксклюзив", disabled: true },
    ],
    thumbs: [
      { id: "t1", title: "Твёрдый", img: "/products/hardcover/1.jpg" },
      { id: "t2", title: "Обложка", img: "/products/hardcover/2.jpg" },
      { id: "t3", title: "Детали", img: "/products/hardcover/3.jpg" },
      { id: "t4", title: "Тираж", img: "/products/hardcover/4.jpg" },
    ],
  },
  {
    id: "softcover",
    regionTitle: "Каталог",
    name: "Книги",
    labelLeft: "Тип:",
    labelValue: "Мягкий переплёт",
    desc:
      "Идеально для методичек, инструкций и небольших тиражей.\n" +
      "КБС/скрепка/пружина — под задачу. Подготовим макет под печать и проконтролируем качество.",
    bigImage: "/products/softcover/main.jpg",
    leftMenu: [
      { id: "hardcover", title: "Твёрдый переплёт" },
      { id: "softcover", title: "Мягкий переплёт" },
      { id: "brochures", title: "Брошюры" },
      { id: "exclusive", title: "Эксклюзив", disabled: true },
    ],
    thumbs: [
      { id: "t1", title: "КБС", img: "/products/softcover/1.jpg" },
      { id: "t2", title: "Скрепка", img: "/products/softcover/2.jpg" },
      { id: "t3", title: "Пружина", img: "/products/softcover/3.jpg" },
      { id: "t4", title: "Блок", img: "/products/softcover/4.jpg" },
    ],
  },
  {
    id: "brochures",
    regionTitle: "Каталог",
    name: "Брошюры",
    labelLeft: "Формат:",
    labelValue: "Буклеты и каталоги",
    desc:
      "Быстрый способ красиво рассказать о продукте или услуге.\n" +
      "Печать с точной цветопередачей, разные форматы и фальцовка, матовая/глянцевая ламинация.",
    bigImage: "/products/brochures/main.jpg",
    leftMenu: [
      { id: "hardcover", title: "Твёрдый переплёт" },
      { id: "softcover", title: "Мягкий переплёт" },
      { id: "brochures", title: "Брошюры" },
      { id: "exclusive", title: "Эксклюзив", disabled: true },
    ],
    thumbs: [
      { id: "t1", title: "Буклет", img: "/products/brochures/1.jpg" },
      { id: "t2", title: "Каталог", img: "/products/brochures/2.jpg" },
      { id: "t3", title: "Фальц", img: "/products/brochures/3.jpg" },
      { id: "t4", title: "Ламинац.", img: "/products/brochures/4.jpg" },
    ],
  },
];

export default function HomePage() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [active, setActive] = useState<SectionId>("hero");
  const [loading, setLoading] = useState(true);

  const [musicOn, setMusicOn] = useState(false);
  const [lang, setLang] = useState<"RU" | "EN">("RU");

  const bgUrl = useMemo(() => SECTIONS.find((s) => s.id === active)?.bg, [active]);

  useEffect(() => {
    const t = setTimeout(() => setLoading(false), 800);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const root = containerRef.current;
    if (!root) return;

    const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-section]"));
    const io = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => (b.intersectionRatio ?? 0) - (a.intersectionRatio ?? 0))[0];
        if (!visible) return;
        const id = visible.target.getAttribute("data-section") as SectionId;
        if (id) setActive(id);
      },
      { root: null, threshold: [0.35, 0.55, 0.75] }
    );

    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    let locked = false;

    const onWheel = (e: WheelEvent) => {
      const target = e.target as HTMLElement | null;
      if (target && target.closest("[data-no-snap]")) return;

      e.preventDefault();
      if (locked) return;
      locked = true;

      const dir = Math.sign(e.deltaY);
      const idx = SECTIONS.findIndex((s) => s.id === active);
      const nextIdx = Math.min(SECTIONS.length - 1, Math.max(0, idx + dir));
      const nextId = SECTIONS[nextIdx]?.id;

      if (nextId && nextId !== active) scrollToSection(nextId);
      setTimeout(() => (locked = false), 800);
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    return () => window.removeEventListener("wheel", onWheel as any);
  }, [active]);

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

  function scrollToSection(id: SectionId) {
    const el = document.querySelector<HTMLElement>(`[data-section="${id}"]`);
    el?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  const showToTop = active !== "hero";

  return (
    <div className="relative min-h-screen bg-black text-white overflow-x-hidden">
      {/* background */}
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0 transition-opacity duration-700"
          style={{
            backgroundImage: bgUrl ? `url(${bgUrl})` : undefined,
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: bgUrl ? 0.9 : 0,
          }}
        />
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/30 to-black/65" />
      </div>

      {/* loader */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center bg-black transition-opacity duration-700 ${
          loading ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
      >
        <div className="text-center">
          <div className="text-2xl font-semibold tracking-wide">PARETO PRINT</div>
          <div className="mt-2 text-sm opacity-70">Загрузка интерфейса…</div>
          <div className="mt-6 h-1 w-56 bg-white/10 rounded">
            <div className="h-1 w-2/3 bg-white/70 rounded animate-pulse" />
          </div>
        </div>
      </div>

      {/* top nav */}
      <header className="fixed top-0 left-0 right-0 z-40">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center font-bold">
              PP
            </div>
            <div className="leading-tight">
              <div className="font-semibold">ООО “Прето Принт”</div>
              <div className="text-xs opacity-70">презентационный интерфейс</div>
            </div>
          </Link>

          <nav className="hidden md:flex items-center gap-2 bg-white/10 border border-white/15 rounded-2xl px-2 py-1">
            {SECTIONS.map((s) => (
              <button
                key={s.id}
                onClick={() => scrollToSection(s.id)}
                className={`text-sm px-3 py-2 rounded-xl transition ${
                  active === s.id ? "bg-white/20" : "hover:bg-white/10"
                }`}
              >
                {lang === "RU" ? s.title : toEn(s.id)}
              </button>
            ))}
            <Link
              href="/profile"
              className="text-sm px-3 py-2 rounded-xl bg-white text-black hover:opacity-90 transition"
            >
              Профиль
            </Link>
          </nav>
        </div>
      </header>

      {/* side nav + music/lang */}
      <aside className="fixed right-4 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col gap-3">
        <div className="bg-white/10 border border-white/15 rounded-2xl p-2 backdrop-blur">
          {SECTIONS.map((s) => (
            <button
              key={s.id}
              onClick={() => scrollToSection(s.id)}
              className={`w-44 text-left px-3 py-2 rounded-xl text-sm transition flex items-center justify-between ${
                active === s.id ? "bg-white/20" : "hover:bg-white/10"
              }`}
            >
              <span>{lang === "RU" ? s.title : toEn(s.id)}</span>
              <span className={`h-2 w-2 rounded-full ${active === s.id ? "bg-white" : "bg-white/30"}`} />
            </button>
          ))}
        </div>

        <div className="bg-white/10 border border-white/15 rounded-2xl p-2 backdrop-blur flex items-center justify-between gap-2">
          <button
            onClick={() => setMusicOn((v) => !v)}
            className={`px-3 py-2 rounded-xl text-sm transition ${
              musicOn ? "bg-white text-black" : "hover:bg-white/10"
            }`}
            title="Музыка"
          >
            {musicOn ? "♪ ON" : "♪ OFF"}
          </button>

          <button
            onClick={() => setLang((v) => (v === "RU" ? "EN" : "RU"))}
            className="px-3 py-2 rounded-xl text-sm hover:bg-white/10 transition"
            title="Язык"
          >
            {lang}
          </button>
        </div>
      </aside>

      <audio ref={audioRef} src="/audio/theme.mp3" />

      {/* sections */}
      <div
        ref={containerRef}
        className="relative z-10 h-screen overflow-y-auto scroll-smooth"
        style={{ scrollSnapType: "y mandatory" }}
      >
        <VideoHeroSection
          title={lang === "RU" ? "ПРЕТО ПРИНТ" : "PARETO PRINT"}
          subtitle={lang === "RU" ? "Печать • Полиграфия • Производство" : "Printing • Production • Design"}
          ctaPrimaryText={lang === "RU" ? "Оставить заявку (скоро)" : "Request (soon)"}
          ctaSecondaryText={lang === "RU" ? "Смотреть продукцию" : "View products"}
          onSecondary={() => scrollToSection("products")}
        />

        {/* ✅ FULL-WIDTH PRODUCTS (как в геншине) */}
        <Section
          id="products"
          title={lang === "RU" ? "Продукция" : "Products"}
          subtitle={lang === "RU" ? "Каталог: слева типы • центр описание • справа фото • снизу лента" : "Left types • center info • right preview • bottom strip"}
          fullBleed
        >
          <GenshinProductsFullWidth />
        </Section>

        <Section id="services" title={lang === "RU" ? "Услуги" : "Services"} subtitle={lang === "RU" ? "Что мы делаем" : "What we do"}>
          <div className="grid md:grid-cols-3 gap-4">
            <Card title={lang === "RU" ? "Печать" : "Print"} text={lang === "RU" ? "Цифра/офсет/широкоформат — под задачу." : "Digital/offset/large format."} />
            <Card title={lang === "RU" ? "Дизайн" : "Design"} text={lang === "RU" ? "Макеты, адаптации, подготовка к печати." : "Layouts, adaptation, prepress."} />
            <Card title={lang === "RU" ? "Постобработка" : "Finishing"} text={lang === "RU" ? "Ламинация, вырубка, резка, сборка." : "Lamination, cutting, assembly."} />
          </div>
        </Section>

        <Section id="team" title={lang === "RU" ? "Команда" : "Team"} subtitle={lang === "RU" ? "Карусель (центр больше)" : "Carousel (center bigger)"}>
          <div className="w-full flex flex-col items-center">
            <div className="w-full flex justify-center">
              <TeamCarousel />
            </div>
            <div className="mt-6 text-center text-sm text-white/60">
              Нажми на левую/правую карточку, чтобы листать • Внутри карточки — вкладки текста
            </div>
          </div>
        </Section>

        <Section id="contacts" title={lang === "RU" ? "Контакты" : "Contacts"} subtitle={lang === "RU" ? "Карта / связь" : "Map / reach us"}>
          <div className="grid md:grid-cols-2 gap-4 w-full max-w-5xl">
            <div className="bg-white/10 border border-white/15 rounded-3xl p-5 backdrop-blur">
              <div className="font-semibold">{lang === "RU" ? "Карта" : "Map"}</div>
              <div className="mt-3 h-56 rounded-2xl border border-white/15 bg-black/30 flex items-center justify-center text-sm text-white/60">
                Map placeholder
              </div>
              <div className="mt-4 text-sm text-white/80 space-y-1">
                <div><b>{lang === "RU" ? "Адрес:" : "Address:"}</b> (впиши)</div>
                <div><b>{lang === "RU" ? "График:" : "Hours:"}</b> Пн–Пт 09:00–18:00</div>
              </div>
            </div>

            <div className="bg-white/10 border border-white/15 rounded-3xl p-5 backdrop-blur">
              <div className="font-semibold">{lang === "RU" ? "Связаться" : "Contact"}</div>
              <div className="mt-3 text-sm text-white/80 space-y-2">
                <div><b>Тел:</b> +7 (___) ___-__-__</div>
                <div><b>Email:</b> info@pareto-print.ru</div>
                <div><b>Telegram:</b> @pareto_print</div>
              </div>

              <div className="mt-5 flex gap-3 flex-wrap">
                <button className="px-5 py-3 rounded-2xl bg-white text-black opacity-70 cursor-not-allowed" disabled>
                  {lang === "RU" ? "Написать (скоро)" : "Message (soon)"}
                </button>
                <Link href="/reviews" className="px-5 py-3 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition">
                  {lang === "RU" ? "Отзывы" : "Reviews"}
                </Link>
              </div>
            </div>
          </div>

          <SiteFooter />
        </Section>
      </div>

      {/* to top */}
      <button
        onClick={() => scrollToSection("hero")}
        className={`fixed left-4 bottom-4 z-40 rounded-2xl px-4 py-3 bg-white/10 border border-white/15 backdrop-blur transition ${
          showToTop ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
        }`}
        title="Наверх"
      >
        ↑ {lang === "RU" ? "Наверх" : "Top"}
      </button>
    </div>
  );
}

function Section({
  id,
  title,
  subtitle,
  children,
  fullBleed,
}: {
  id: SectionId;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  fullBleed?: boolean;
}) {
  return (
    <section
      data-section={id}
      className={`min-h-screen pt-28 pb-16 flex items-center ${
        fullBleed ? "px-0" : "px-4"
      }`}
      style={{ scrollSnapAlign: "start" }}
    >
      {/* ✅ если fullBleed — НЕ ограничиваем ширину контейнером */}
      <div className={`${fullBleed ? "w-full" : "mx-auto max-w-6xl w-full"}`}>
        {/* Заголовок оставим в небольшом контейнере, но сам блок дальше будет full */}
        <div className={`${fullBleed ? "px-4 md:px-8" : ""} mb-6`}>
          <div className="text-3xl md:text-4xl font-semibold">{title}</div>
          {subtitle ? (
            <div className="mt-1 text-sm md:text-base text-white/70">{subtitle}</div>
          ) : null}
        </div>

        {children}
      </div>
    </section>
  );
}

function Card({ title, text }: { title: string; text: string }) {
  return (
    <div className="bg-white/10 border border-white/15 rounded-3xl p-5 backdrop-blur hover:bg-white/12 transition">
      <div className="font-semibold">{title}</div>
      <div className="mt-2 text-sm text-white/80 leading-relaxed">{text}</div>
      <button className="mt-4 px-4 py-2 rounded-2xl bg-white text-black opacity-70 cursor-not-allowed text-sm" disabled>
        Подробнее (скоро)
      </button>
    </div>
  );
}

/** ✅ FULL width products block (без маржинов/контейнера, как Genshin) */
function GenshinProductsFullWidth() {
  const [productId, setProductId] = useState(PRODUCTS_GENSHIN[0]?.id ?? "hardcover");

  const product = useMemo(
    () => PRODUCTS_GENSHIN.find((p) => p.id === productId) ?? PRODUCTS_GENSHIN[0],
    [productId]
  );

  const [activeThumbId, setActiveThumbId] = useState(product.thumbs[0]?.id ?? "t1");

  useEffect(() => {
    setActiveThumbId(product.thumbs[0]?.id ?? "t1");
  }, [productId, product.thumbs]);

  const activeThumb = useMemo(
    () => product.thumbs.find((t) => t.id === activeThumbId) ?? product.thumbs[0],
    [product, activeThumbId]
  );

  const bigImage = activeThumb?.big ?? activeThumb?.img ?? product.bigImage;

  return (
    <div className="w-full">
      <div className="relative w-full min-h-[640px] lg:min-h-[720px] overflow-hidden">
        {/* диагональные оверлеи */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 bg-black/25" />
          <div className="absolute -left-40 top-0 h-full w-[55%] bg-white/6 rotate-[12deg]" />
          <div className="absolute inset-0 bg-gradient-to-r from-black/55 via-black/25 to-black/35" />
        </div>

        <div className="relative w-full h-full">
          {/* ✅ Сдвигаем правую картинку ближе к тексту:
              - уменьшаем правую колонку
              - добавляем внутренний right padding всему grid (чтобы не липла к краю)
          */}
          <div className="grid lg:grid-cols-[280px_1fr_560px] gap-6 lg:gap-8 px-4 md:px-8 lg:pr-100 pt-4">
            {/* LEFT */}
            <div className="relative">
              <div className="bg-black/30 border border-white/10 rounded-3xl backdrop-blur p-3">
                <div className="text-xs text-white/60 px-2 pb-2">Тип продукции</div>

                <div className="flex lg:flex-col gap-2 overflow-x-auto lg:overflow-visible">
                  {product.leftMenu.map((it) => {
                    const active = it.id === productId;
                    const disabled = !!it.disabled;

                    return (
                      <button
                        key={it.id}
                        onClick={() => !disabled && setProductId(it.id)}
                        className={`min-w-[200px] lg:min-w-0 text-left px-3 py-2 rounded-2xl border transition ${
                          active
                            ? "bg-white text-black border-white"
                            : disabled
                            ? "bg-white/5 border-white/10 text-white/40 cursor-not-allowed"
                            : "bg-white/5 border-white/10 hover:bg-white/10"
                        }`}
                        disabled={disabled}
                      >
                        <div className="text-sm font-semibold">{it.title}</div>
                        <div className={`text-xs ${active ? "text-black/70" : "text-white/55"}`}>
                          {disabled ? "Скоро…" : "Открыть"}
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="hidden lg:block absolute -left-4 top-10 h-[72%] w-[2px] bg-white/20" />
            </div>

            {/* CENTER */}
            <div className="relative">
              <div className="absolute -top-2 left-0 h-[2px] w-24 bg-white/60" />

              <div className="text-white/55 text-sm tracking-wide uppercase">{product.regionTitle}</div>
              <div className="mt-2 text-4xl md:text-5xl font-semibold italic tracking-wide">{product.name}</div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3 rounded-2xl bg-black/30 border border-white/10 backdrop-blur px-4 py-3">
                  <span className="text-white/60 text-sm">{product.labelLeft}</span>
                  <span className="text-white font-semibold">{product.labelValue}</span>
                </div>

                <div className="rounded-2xl bg-black/30 border border-white/10 backdrop-blur px-4 py-3 text-sm text-white/70">
                  RU • Печать / производство
                </div>
              </div>

              <div className="mt-5 rounded-2xl bg-black/40 border border-white/10 backdrop-blur p-5 max-w-[720px]">
                <div className="text-white/90 text-sm md:text-base leading-relaxed whitespace-pre-line">
                  {product.desc}
                </div>
              </div>

              <div className="mt-6 inline-flex items-center gap-3">
                <div className="h-[2px] w-14 bg-white/35" />
                <div className="text-white/85 italic text-lg md:text-xl">“Сделаем красиво и стабильно в тираже.”</div>
              </div>

              <div className="mt-6 flex flex-wrap gap-3">
                <button className="px-5 py-3 rounded-2xl bg-white text-black opacity-70 cursor-not-allowed" disabled>
                  Рассчитать стоимость (скоро)
                </button>
                <button className="px-5 py-3 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition">
                  Отправить ТЗ (скоро)
                </button>
              </div>
            </div>

            {/* RIGHT big image */}
            <div className="relative">
              {/* ✅ чтобы картинка не липла к правому краю:
                  - ограничили колонку до 560px
                  - добавили lg:pr-16 на grid
                  - плюс можно чуть сдвинуть рамку внутрь: lg:mr-6
              */}
              <div className="lg:mr-6 rounded-[28px] overflow-hidden border border-white/10 bg-black/20 shadow-[0_30px_90px_rgba(0,0,0,0.45)]">
                <div className="relative aspect-[16/10]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={bigImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-transparent to-transparent" />
                </div>
              </div>
            </div>
          </div>

          {/* ✅ НИЖНЯЯ ЛЕНТА: по центру + горизонтальный скролл */}
          <div className="px-4 md:px-8 pb-10 pt-6">
            {/* контейнер по центру, чтобы лента не была “в углу” */}
            <div className="mx-auto w-full max-w-5xl">
              <div className="flex items-center justify-between text-xs text-white/60">
                <div>Примеры / фото</div>
                <div className="hidden md:block">Кликни на карточку снизу</div>
              </div>

              <div className="mt-3">
                {/* ✅ центрируем полосу: justify-center + overflow-x-auto */}
                <div className="flex justify-center">
                  <div className="flex gap-3 overflow-x-auto pb-2 px-2 max-w-full">
                    {product.thumbs.map((t) => {
                      const on = t.id === activeThumbId;
                      return (
                        <button
                          key={t.id}
                          onClick={() => setActiveThumbId(t.id)}
                          className={`shrink-0 w-[140px] rounded-2xl border transition ${
                            on ? "border-white bg-white/15" : "border-white/10 bg-white/5 hover:bg-white/10"
                          }`}
                          title={t.title}
                        >
                          <div className="p-2">
                            <div className="rounded-xl overflow-hidden border border-white/10 bg-black/20">
                              {/* eslint-disable-next-line @next/next/no-img-element */}
                              <img src={t.img} alt="" className="h-16 w-full object-cover" />
                            </div>
                            <div className={`mt-2 text-xs ${on ? "text-white" : "text-white/70"} truncate`}>
                              {t.title}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-white/45">
                  Фото бери из{" "}
                  <code className="px-1 py-0.5 rounded bg-white/10 border border-white/10">public/products/...</code>
                </div>
              </div>
            </div>
          </div>
          {/* конец */}
        </div>
      </div>
    </div>
  );
}

function VideoHeroSection({
  title,
  subtitle,
  ctaPrimaryText,
  ctaSecondaryText,
  onSecondary,
}: {
  title: string;
  subtitle: string;
  ctaPrimaryText: string;
  ctaSecondaryText: string;
  onSecondary: () => void;
}) {
  return (
    <section data-section="hero" className="relative min-h-screen w-full" style={{ scrollSnapAlign: "start" }}>
      <div className="absolute inset-0">
        <video className="h-full w-full object-cover" src="/hero.mp4" autoPlay muted loop playsInline preload="auto" />
        <div className="absolute inset-0 bg-black/55" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/30 to-black/70" />
      </div>

      <div className="relative z-10 mx-auto max-w-6xl px-4 pt-28 pb-16 min-h-screen flex items-center">
        <div className="max-w-3xl">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-white/80 backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-white/70" />
            {subtitle}
          </div>

          <h1 className="mt-6 text-4xl md:text-6xl font-semibold tracking-wide leading-tight">{title}</h1>

          <p className="mt-5 text-white/80 text-base md:text-lg leading-relaxed">
            Создаём печатные материалы для бизнеса: визитки, наклейки, упаковка, листовки, брендированные изделия.
            Быстро, аккуратно, с контролем качества.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <button className="px-5 py-3 rounded-2xl bg-white text-black hover:opacity-90 transition">
              {ctaPrimaryText}
            </button>

            <button
              onClick={onSecondary}
              className="px-5 py-3 rounded-2xl bg-white/10 border border-white/15 hover:bg-white/15 transition"
            >
              {ctaSecondaryText}
            </button>
          </div>

          <div className="mt-10 flex items-center gap-3 text-sm text-white/60">
            <span className="inline-flex h-9 w-9 items-center justify-center rounded-2xl border border-white/15 bg-white/10 backdrop-blur">
              ↓
            </span>
            Прокрути вниз, чтобы продолжить
          </div>
        </div>
      </div>
    </section>
  );
}

function SiteFooter() {
  return (
    <footer className="mt-12 border-t border-white/10 pt-8">
      <div className="mx-auto max-w-6xl w-full grid md:grid-cols-4 gap-6">
        <div className="md:col-span-2">
          <div className="font-semibold text-lg">ООО “Прето Принт”</div>
          <div className="mt-2 text-sm text-white/70 max-w-md leading-relaxed">
            Полиграфия и производство печатной продукции: книги, брошюры, упаковка, наклейки, корпоративные материалы.
            Делаем аккуратно и в срок.
          </div>
          <div className="mt-4 text-xs text-white/50">© {new Date().getFullYear()} ООО “Прето Принт”. Все права защищены.</div>
        </div>

        <div>
          <div className="font-semibold">Навигация</div>
          <div className="mt-3 space-y-2 text-sm text-white/70">
            <div>Продукция</div>
            <div>Услуги</div>
            <div>Команда</div>
            <div>Контакты</div>
          </div>
        </div>

        <div>
          <div className="font-semibold">Контакты</div>
          <div className="mt-3 space-y-2 text-sm text-white/70">
            <div>Тел: +7 (___) ___-__-__</div>
            <div>Email: info@pareto-print.ru</div>
            <div>Telegram: @pareto_print</div>
          </div>
          <div className="mt-4 flex gap-2">
            <span className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white/70">VK (скоро)</span>
            <span className="px-3 py-2 rounded-xl bg-white/10 border border-white/15 text-xs text-white/70">TG (скоро)</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

/* ---- TEAM carousel (оставил твой рабочий вариант) ---- */

function TeamCarousel() {
  const [index, setIndex] = useState(0);
  const [pageIndex, setPageIndex] = useState<Record<number, number>>({});

  const items = EMPLOYEES;
  const n = items.length;
  const wrap = (i: number) => ((i % n) + n) % n;

  const prev = () => setIndex((i) => wrap(i - 1));
  const next = () => setIndex((i) => wrap(i + 1));

  const leftIdx = wrap(index - 1);
  const rightIdx = wrap(index + 1);

  const left = items[leftIdx];
  const center = items[index];
  const right = items[rightIdx];

  const getPage = (idx: number) => pageIndex[idx] ?? 0;
  const setPage = (idx: number, v: number) => setPageIndex((p) => ({ ...p, [idx]: v }));

  const boxRef = useRef<HTMLDivElement | null>(null);
  const centerRef = useRef<HTMLDivElement | null>(null);

  const { width: boxW } = useElementSize(boxRef);
  const { width: centerWMeasured } = useElementSize(centerRef);

  const isMd = boxW >= 768;
  const sideApprox = isMd ? 440 : 280;
  const centerApprox = centerWMeasured || (isMd ? 560 : 340);
  const gap = isMd ? 28 : 16;
  const shift = Math.round(centerApprox / 2 + sideApprox / 2 + gap);

  const centerWClass = "w-[340px] md:w-[560px]";
  const sideWClass = "w-[280px] md:w-[440px]";

  return (
    <div ref={boxRef} className="w-full max-w-6xl mx-auto flex flex-col items-center">
      <div className="relative w-full overflow-hidden rounded-[32px]">
        <div className="relative h-[380px] md:h-[480px] w-full flex items-center justify-center">
          <div className="absolute left-1/2 top-1/2" style={{ transform: `translate(-50%, -50%) translateX(${-shift}px)` }}>
            <div className={`${sideWClass} scale-[0.88] origin-center opacity-80 transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)]`}>
              <EmployeeCard employee={left} variant="side" onClick={prev} page={getPage(leftIdx)} setPage={(v) => setPage(leftIdx, v)} />
            </div>
          </div>

          <div className="absolute left-1/2 top-1/2" style={{ transform: `translate(-50%, -50%)` }}>
            <div ref={centerRef} className={`${centerWClass} transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)]`}>
              <EmployeeCard
                employee={center}
                variant="center"
                onClick={() => {}}
                page={getPage(index)}
                setPage={(v) => setPage(index, v)}
                onPrev={prev}
                onNext={next}
              />
            </div>
          </div>

          <div className="absolute left-1/2 top-1/2" style={{ transform: `translate(-50%, -50%) translateX(${shift}px)` }}>
            <div className={`${sideWClass} scale-[0.88] origin-center opacity-80 transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)]`}>
              <EmployeeCard employee={right} variant="side" onClick={next} page={getPage(rightIdx)} setPage={(v) => setPage(rightIdx, v)} />
            </div>
          </div>

          <button onClick={prev} className="absolute left-0 top-0 h-full w-[18%] z-30 opacity-0" aria-label="Prev" />
          <button onClick={next} className="absolute right-0 top-0 h-full w-[18%] z-30 opacity-0" aria-label="Next" />

          <div className="pointer-events-none absolute inset-0">
            <div className="absolute left-0 top-0 h-full w-24 bg-gradient-to-r from-black/60 to-transparent" />
            <div className="absolute right-0 top-0 h-full w-24 bg-gradient-to-l from-black/60 to-transparent" />
          </div>
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        {items.map((_, i) => {
          const activeDot = i === index;
          return (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-2.5 rounded-full transition-all ${activeDot ? "w-10 bg-white" : "w-2.5 bg-white/35 hover:bg-white/60"}`}
              aria-label={`Go ${i + 1}`}
            />
          );
        })}
      </div>
    </div>
  );
}

function useElementSize<T extends HTMLElement>(ref: React.RefObject<T | null>) {
  const [size, setSize] = useState({ width: 0, height: 0 });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const ro = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (!entry) return;
      const cr = entry.contentRect;
      setSize({ width: cr.width, height: cr.height });
    });

    ro.observe(el);

    const rect = el.getBoundingClientRect();
    setSize({ width: rect.width, height: rect.height });

    return () => ro.disconnect();
  }, [ref]);

  return size;
}

function EmployeeCard({
  employee,
  variant,
  onClick,
  page,
  setPage,
  onPrev,
  onNext,
}: {
  employee: Employee;
  variant: "center" | "side";
  onClick: () => void;
  page: number;
  setPage: (v: number) => void;
  onPrev?: () => void;
  onNext?: () => void;
}) {
  const max = employee.pages.length;

  const canPrevPage = page > 0;
  const canNextPage = page < max - 1;

  const frame =
    variant === "center"
      ? "bg-white/10 border-white/20 shadow-[0_24px_80px_rgba(0,0,0,0.45)]"
      : "bg-white/8 border-white/12 opacity-90";

  const blur = variant === "side" ? "blur-[1px]" : "";
  const cursor = variant === "side" ? "cursor-pointer" : "cursor-default";

  return (
    <div onClick={onClick} className={`rounded-[28px] border ${frame} backdrop-blur p-6 ${cursor} transition-colors hover:bg-white/12`} data-no-snap>
      <div className={`transition-all duration-700 ease-[cubic-bezier(.2,.8,.2,1)] ${blur}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-xl md:text-2xl font-semibold">{employee.name}</div>
            <div className="text-sm md:text-base text-white/70">{employee.role}</div>
          </div>

          <div className="h-12 w-12 rounded-2xl bg-white/10 border border-white/15 flex items-center justify-center text-xs">
            фото
          </div>
        </div>

        <div className="mt-5 flex flex-wrap gap-2">
          {employee.pages.map((p, i) => (
            <button
              key={p.title}
              onClick={(e) => {
                e.stopPropagation();
                setPage(i);
              }}
              className={`px-3 py-1.5 rounded-full text-xs border transition ${
                i === page ? "bg-white text-black border-white" : "bg-white/10 border-white/15 hover:bg-white/15"
              }`}
            >
              {p.title}
            </button>
          ))}
        </div>

        <div className="mt-4 min-h-[88px]">
          <div className="text-sm md:text-base text-white/85 leading-relaxed">{employee.pages[page]?.text}</div>
        </div>

        <div className="mt-5 flex gap-2 flex-wrap text-xs text-white/70">
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15">Стаж: {employee.exp}</span>
          <span className="px-3 py-1 rounded-full bg-white/10 border border-white/15">{employee.skill}</span>
        </div>

        <div className="mt-6 flex items-center justify-between gap-3">
          <button disabled className="px-4 py-2 rounded-2xl bg-white text-black opacity-70 cursor-not-allowed text-sm" onClick={(e) => e.stopPropagation()}>
            Профиль (скоро)
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (canPrevPage) setPage(page - 1);
              }}
              className={`px-3 py-2 rounded-2xl border border-white/15 bg-white/10 transition ${
                canPrevPage ? "hover:bg-white/15" : "opacity-40 cursor-not-allowed"
              }`}
              disabled={!canPrevPage}
              title="Предыдущая вкладка"
            >
              ‹
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                if (canNextPage) setPage(page + 1);
              }}
              className={`px-3 py-2 rounded-2xl border border-white/15 bg-white/10 transition ${
                canNextPage ? "hover:bg-white/15" : "opacity-40 cursor-not-allowed"
              }`}
              disabled={!canNextPage}
              title="Следующая вкладка"
            >
              ›
            </button>
          </div>

          {variant === "center" && onPrev && onNext ? (
            <div className="hidden md:flex items-center gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onPrev();
                }}
                className="px-3 py-2 rounded-2xl border border-white/15 bg-white/10 hover:bg-white/15 transition"
                title="Предыдущий сотрудник"
              >
                ←
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onNext();
                }}
                className="px-3 py-2 rounded-2xl border border-white/15 bg-white/10 hover:bg-white/15 transition"
                title="Следующий сотрудник"
              >
                →
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}

type Employee = {
  name: string;
  role: string;
  exp: string;
  skill: string;
  pages: { title: string; text: string }[];
};

const EMPLOYEES: Employee[] = [
  {
    name: "Менеджер по работе с клиентами",
    role: "Заказы • консультации",
    exp: "3+ года",
    skill: "коммуникация",
    pages: [
      { title: "О работе", text: "Помогаю подобрать материал и формат, согласовать сроки и стоимость. Делаю так, чтобы всё было понятно и без сюрпризов." },
      { title: "Цитата", text: "“Делаем быстро, но без потери качества.”" },
      { title: "Фокус", text: "Сильная сторона — общение с клиентом и контроль этапов: от заявки до выдачи." },
    ],
  },
  {
    name: "Дизайнер",
    role: "Макеты • подготовка",
    exp: "5+ лет",
    skill: "prepress",
    pages: [
      { title: "О работе", text: "Подготовка макетов под разные технологии печати. Проверка вылетов, профилей, мелких деталей и читабельности." },
      { title: "Цитата", text: "“Главное — чтобы печать выглядела дороже, чем стоит.”" },
      { title: "Фокус", text: "Люблю чистую типографику и аккуратные сетки. Делаю так, чтобы в печати было идеально." },
    ],
  },
  {
    name: "Оператор производства",
    role: "Печать • контроль",
    exp: "4+ года",
    skill: "качество",
    pages: [
      { title: "О работе", text: "Запускаю печать, контролирую цвет и резку. Слежу за стабильностью и повторяемостью в тираже." },
      { title: "Цитата", text: "“Тираж — это дисциплина и точность.”" },
      { title: "Фокус", text: "Чёткий контроль качества на каждом шаге: чтобы каждый экземпляр был одинаковым." },
    ],
  },
  {
    name: "Технолог",
    role: "Материалы • процессы",
    exp: "6+ лет",
    skill: "технологии",
    pages: [
      { title: "О работе", text: "Подбираю материалы, технологию, параметры. Знаю что будет красиво на бумаге, пленке, картоне и нестандартных носителях." },
      { title: "Цитата", text: "“Правильный материал решает половину результата.”" },
      { title: "Фокус", text: "Оптимизация: качество/срок/стоимость — чтобы клиент получал максимум." },
    ],
  },
];

function toEn(id: SectionId) {
  switch (id) {
    case "hero":
      return "Home";
    case "products":
      return "Products";
    case "services":
      return "Services";
    case "team":
      return "Team";
    case "contacts":
      return "Contacts";
  }
}