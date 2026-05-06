"use client";

import Link from "next/link";
import { useEffect, useMemo, useRef, useState } from "react";

type Lang = "RU" | "EN";

type ProductType = "book" | "brochure" | "catalog";
type PrintFormat = "SRA3" | "A3" | "A4";
type EditionFormat = "A4" | "A5" | "A6" | "B5";
type ColorMode = "bw" | "color";
type PaperType = "offset80" | "coated130" | "coated170";
type BindingType = "staple" | "soft" | "hard";
type PackagingType = "none" | "box" | "individual";
type UrgencyType = "normal" | "fast" | "rush";

type CalculatorForm = {
  productType: ProductType;
  printFormat: PrintFormat;
  editionFormat: EditionFormat;
  pages: number;
  quantity: number;
  colorMode: ColorMode;
  paper: PaperType;
  binding: BindingType;
  packaging: PackagingType;
  urgency: UrgencyType;
  manualProduction: boolean;
  extras: {
    inserts: boolean;
    gluedInserts: boolean;
    bookmark: boolean;
    dustJacket: boolean;
    varnish: boolean;
    lamination: boolean;
  };
};

type CalcResponse = {
  input: CalculatorForm;
  result: {
    pagesPerSheet: number;
    sheetsPerCopy: number;
    prepressCost: number;
    printCost: number;
    paperCost: number;
    bindingCost: number;
    extrasCost: number;
    packagingCost: number;
    manualProductionCost: number;
    urgencyCost: number;
    quantityDiscount: number;
    total: number;
    pricePerCopy: number;
  };
};

type CalcResult = CalcResponse["result"];

type SectionId =
  | "product"
  | "format"
  | "materials"
  | "production"
  | "extras"
  | "delivery";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

const pageContainer = "w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8";
const glass =
  "border border-white/10 bg-white/[0.06] backdrop-blur-xl shadow-[0_10px_50px_rgba(0,0,0,0.35)]";
const amberGlass =
  "border border-white/10 bg-[linear-gradient(180deg,rgba(120,78,33,0.24),rgba(255,255,255,0.04))] backdrop-blur-xl shadow-[0_10px_50px_rgba(0,0,0,0.35)]";

export default function CalculatorPage() {
  const [lang, setLang] = useState<Lang>("RU");
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [openSections, setOpenSections] = useState<SectionId[]>([
    "product",
    "format",
  ]);

  const [form, setForm] = useState<CalculatorForm>({
    productType: "book",
    printFormat: "SRA3",
    editionFormat: "A5",
    pages: 128,
    quantity: 300,
    colorMode: "bw",
    paper: "offset80",
    binding: "soft",
    packaging: "box",
    urgency: "normal",
    manualProduction: false,
    extras: {
      inserts: false,
      gluedInserts: false,
      bookmark: true,
      dustJacket: false,
      varnish: false,
      lamination: false,
    },
  });

  const [loading, setLoading] = useState(false);
  const [serverResult, setServerResult] = useState<CalcResponse | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (!audioRef.current) return;
    if (musicOn) {
      audioRef.current.volume = 0.22;
      audioRef.current.loop = true;
      audioRef.current.play().catch(() => setMusicOn(false));
    } else {
      audioRef.current.pause();
    }
  }, [musicOn]);

  const localPreview = useMemo(() => calculateLocal(form), [form]);

  useEffect(() => {
    const t = setTimeout(() => {
      void calculateOnServer();
    }, 250);
    return () => clearTimeout(t);
  }, [form]);

  async function calculateOnServer() {
    try {
      setLoading(true);
      setServerError(null);

      const res = await fetch(`${API_URL}/calculator/calculate`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        throw new Error("Ошибка расчёта на сервере");
      }

      const data: CalcResponse = await res.json();
      setServerResult(data);
    } catch {
      setServerResult(null);
      setServerError(
        lang === "RU"
          ? "Сервер недоступен. Сейчас показывается локальный предпросчёт."
          : "Server unavailable. Showing local estimate.",
      );
    } finally {
      setLoading(false);
    }
  }

  const result = serverResult?.result ?? localPreview;

  function toggleSection(id: SectionId) {
    setOpenSections((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    );
  }

  function isOpen(id: SectionId) {
    return openSections.includes(id);
  }

  return (
    <div className="min-h-screen bg-black text-white overflow-x-hidden">
      <div className="pointer-events-none fixed inset-0">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "url('/shop/main.jpg')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.22,
            filter: "blur(0px)",
          }}
        />
        <div className="absolute inset-0 bg-black/70" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(176,123,56,0.16),transparent_28%)]" />
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/45 to-black/85" />
      </div>

      <audio ref={audioRef} src="/audio/theme.mp3" />

      <header className="fixed inset-x-0 top-0 z-50">
        <div className={`${pageContainer} relative pt-5`}>
          <div className="absolute left-4 top-5 hidden lg:flex items-start gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/15 bg-white/10 text-lg font-bold backdrop-blur-xl">
              PP
            </div>
            <div className="leading-tight">
              <div className="text-[15px] font-semibold">ООО “Прето Принт”</div>
              <div className="text-sm text-white/65">
                {lang === "RU" ? "презентационный интерфейс" : "presentation interface"}
              </div>
            </div>
          </div>

          <div className="mx-auto flex w-fit items-center gap-2 rounded-[22px] border border-white/15 bg-white/10 px-2 py-1.5 backdrop-blur-xl shadow-[0_10px_40px_rgba(0,0,0,0.35)]">
            <NavItem href="/" label={lang === "RU" ? "Прето Принт" : "Preto Print"} />
            <NavItem href="/shop" label={lang === "RU" ? "Продукция" : "Products"} />
            <NavItem href="/services" label={lang === "RU" ? "Услуги" : "Services"} />
            <NavItem href="/team" label={lang === "RU" ? "Команда" : "Team"} />
            <NavItem href="/contacts" label={lang === "RU" ? "Контакты" : "Contacts"} />
            <Link
              href="/profile"
              className="rounded-2xl bg-white px-4 py-2.5 text-sm font-medium text-black transition hover:opacity-90"
            >
              {lang === "RU" ? "Профиль" : "Profile"}
            </Link>
          </div>

          <div className="absolute right-4 top-5 flex items-center gap-2 lg:hidden">
            <button
              onClick={() => setMusicOn((v) => !v)}
              className={`rounded-2xl border border-white/15 px-3 py-2 text-sm backdrop-blur-xl transition ${
                musicOn ? "bg-white text-black" : "bg-white/10 hover:bg-white/15"
              }`}
            >
              {musicOn ? "♪ ON" : "♪ OFF"}
            </button>
            <button
              onClick={() => setLang((v) => (v === "RU" ? "EN" : "RU"))}
              className="rounded-2xl border border-white/15 bg-white/10 px-3 py-2 text-sm backdrop-blur-xl transition hover:bg-white/15"
            >
              {lang}
            </button>
          </div>
        </div>
      </header>

      <main className="relative z-10">
        <section className="min-h-screen pt-28">
          <div className={`${pageContainer} relative`}>
            <div className="grid min-h-[calc(100vh-7rem)] grid-cols-1 gap-10 xl:grid-cols-[1fr_240px] xl:gap-12">
              <div className="flex items-center">
                <div className="max-w-4xl pt-10 md:pt-16">
                  <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs ${glass}`}>
                    <span className="h-2 w-2 rounded-full bg-white/70" />
                    <span className="uppercase tracking-[0.08em] text-white/85">
                      {lang === "RU"
                        ? "Печать • Полиграфия • Производство"
                        : "Printing • Production • Publishing"}
                    </span>
                  </div>

                  <h1 className="mt-8 text-5xl font-semibold leading-[0.92] md:text-7xl xl:text-[88px]">
                    {lang === "RU" ? "КАЛЬКУЛЯТОР\nПЕЧАТИ" : "PRINT\nCALCULATOR"}
                  </h1>

                  <p className="mt-8 max-w-3xl text-lg leading-relaxed text-white/72 md:text-[28px] md:leading-[1.45]">
                    {lang === "RU"
                      ? "Создаём расчёт печатных материалов для бизнеса: книги, каталоги, брошюры, упаковка и брендированные издания. Быстро, аккуратно, с визуальной подачей как в презентационном интерфейсе."
                      : "Create estimates for printed materials: books, catalogs, brochures, packaging and branded editions with a premium presentation feel."}
                  </p>

                  <div className="mt-10 flex flex-wrap gap-4">
                    <button className="rounded-[22px] bg-white px-7 py-4 text-base font-medium text-black transition hover:opacity-90">
                      {lang === "RU" ? "Отправить заявку" : "Send Request"}
                    </button>
                    <a
                      href="#calculator"
                      className={`rounded-[22px] px-7 py-4 text-base font-medium transition hover:bg-white/15 ${amberGlass}`}
                    >
                      {lang === "RU" ? "Смотреть калькулятор" : "Open Calculator"}
                    </a>
                  </div>

                  <div className="mt-12 flex items-center gap-4 text-white/65">
                    <div className={`flex h-11 w-11 items-center justify-center rounded-full ${glass}`}>
                      ↓
                    </div>
                    <div className="text-sm md:text-base">
                      {lang === "RU"
                        ? "Прокрути вниз, чтобы продолжить"
                        : "Scroll down to continue"}
                    </div>
                  </div>

                  <div className="mt-16 max-w-[520px] overflow-hidden rounded-[28px] border border-white/10 bg-white/5 shadow-[0_30px_80px_rgba(0,0,0,0.45)]">
                    <img
                      src="/shop/preview.jpg"
                      alt="Preview"
                      className="h-[280px] w-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                    <div className="bg-black/35 px-6 py-5 backdrop-blur">
                      <div className="text-lg font-semibold">
                        {lang === "RU" ? "Презентационный расчёт" : "Presentation Quote"}
                      </div>
                      <div className="mt-1 text-sm text-white/65">
                        {lang === "RU"
                          ? "Визуальный стиль и расчёт в одном интерфейсе."
                          : "Visual style and pricing in one interface."}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <aside className="hidden xl:flex xl:items-center xl:justify-end">
                <div className="w-full max-w-[230px] space-y-4">
                  <div className={`rounded-[24px] p-4 ${amberGlass}`}>
                    <div className="space-y-3">
                      <SideMenuItem label={lang === "RU" ? "Прето Принт" : "Preto Print"} active />
                      <SideMenuItem label={lang === "RU" ? "Продукция" : "Products"} />
                      <SideMenuItem label={lang === "RU" ? "Услуги" : "Services"} />
                      <SideMenuItem label={lang === "RU" ? "Команда" : "Team"} />
                      <SideMenuItem label={lang === "RU" ? "Контакты" : "Contacts"} />
                    </div>
                  </div>

                  <div className={`rounded-[24px] p-4 ${amberGlass}`}>
                    <div className="flex items-center justify-between gap-3">
                      <button
                        onClick={() => setMusicOn((v) => !v)}
                        className={`rounded-2xl px-4 py-3 text-sm transition ${
                          musicOn ? "bg-white text-black" : "bg-white/5 text-white hover:bg-white/10"
                        }`}
                      >
                        {musicOn ? "♪ ON" : "♪ OFF"}
                      </button>

                      <button
                        onClick={() => setLang((v) => (v === "RU" ? "EN" : "RU"))}
                        className="rounded-2xl bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
                      >
                        {lang}
                      </button>
                    </div>
                  </div>
                </div>
              </aside>
            </div>
          </div>
        </section>

        <section id="calculator" className="relative pb-20">
          <div className={`${pageContainer}`}>
            <div className="mb-8 max-w-3xl">
              <div className={`inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs ${glass}`}>
                <span className="h-2 w-2 rounded-full bg-white/70" />
                <span className="uppercase tracking-[0.16em] text-white/82">
                  PRETO PRINT • {lang === "RU" ? "расчёт тиража" : "print quote"}
                </span>
              </div>

              <h2 className="mt-6 text-3xl font-semibold md:text-5xl">
                {lang === "RU" ? "Настройки расчёта" : "Calculation Settings"}
              </h2>

              <p className="mt-4 text-sm leading-relaxed text-white/65 md:text-lg">
                {lang === "RU"
                  ? "Ниже расположен сам калькулятор. Он сохранил всю логику, но теперь визуально встроен в презентационный стиль страницы."
                  : "Below is the calculator itself, now integrated into the presentation-style layout."}
              </p>
            </div>

            <div className="grid items-start gap-8 xl:grid-cols-[1.02fr_0.75fr] xl:gap-10">
              <section className="space-y-5">
                <AccordionSection
                  title={lang === "RU" ? "1. Тип изделия" : "1. Product Type"}
                  summary={getProductSummary(form, lang)}
                  open={isOpen("product")}
                  onToggle={() => toggleSection("product")}
                >
                  <div className="grid gap-3 sm:grid-cols-3">
                    <ChipButton
                      active={form.productType === "book"}
                      onClick={() => setForm((prev) => ({ ...prev, productType: "book" }))}
                      title={lang === "RU" ? "Книга" : "Book"}
                      subtitle={lang === "RU" ? "Тиражные издания" : "Edition print"}
                    />
                    <ChipButton
                      active={form.productType === "brochure"}
                      onClick={() => setForm((prev) => ({ ...prev, productType: "brochure" }))}
                      title={lang === "RU" ? "Брошюра" : "Brochure"}
                      subtitle={lang === "RU" ? "Лёгкий формат" : "Light format"}
                    />
                    <ChipButton
                      active={form.productType === "catalog"}
                      onClick={() => setForm((prev) => ({ ...prev, productType: "catalog" }))}
                      title={lang === "RU" ? "Каталог" : "Catalog"}
                      subtitle={
                        lang === "RU" ? "Презентационные материалы" : "Presentation materials"
                      }
                    />
                  </div>
                </AccordionSection>

                <AccordionSection
                  title={lang === "RU" ? "2. Формат и тираж" : "2. Format & Quantity"}
                  summary={getFormatSummary(form, lang)}
                  open={isOpen("format")}
                  onToggle={() => toggleSection("format")}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <SelectCard
                      label={lang === "RU" ? "Формат печати" : "Print Format"}
                      value={form.printFormat}
                      onChange={(value) =>
                        setForm((prev) => ({ ...prev, printFormat: value as PrintFormat }))
                      }
                      options={[
                        { value: "SRA3", label: "SRA3" },
                        { value: "A3", label: "A3" },
                        { value: "A4", label: "A4" },
                      ]}
                    />

                    <SelectCard
                      label={lang === "RU" ? "Формат издания" : "Edition Format"}
                      value={form.editionFormat}
                      onChange={(value) =>
                        setForm((prev) => ({ ...prev, editionFormat: value as EditionFormat }))
                      }
                      options={[
                        { value: "A4", label: "A4" },
                        { value: "A5", label: "A5" },
                        { value: "A6", label: "A6" },
                        { value: "B5", label: "B5" },
                      ]}
                    />

                    <NumberCard
                      label={lang === "RU" ? "Количество страниц" : "Pages"}
                      value={form.pages}
                      min={4}
                      step={4}
                      onChange={(value) => setForm((prev) => ({ ...prev, pages: value }))}
                    />

                    <NumberCard
                      label={lang === "RU" ? "Тираж" : "Quantity"}
                      value={form.quantity}
                      min={1}
                      step={1}
                      onChange={(value) => setForm((prev) => ({ ...prev, quantity: value }))}
                    />
                  </div>
                </AccordionSection>

                <AccordionSection
                  title={lang === "RU" ? "3. Материалы" : "3. Materials"}
                  summary={getMaterialsSummary(form, lang)}
                  open={isOpen("materials")}
                  onToggle={() => toggleSection("materials")}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <SelectCard
                      label={lang === "RU" ? "Цветность" : "Color Mode"}
                      value={form.colorMode}
                      onChange={(value) =>
                        setForm((prev) => ({ ...prev, colorMode: value as ColorMode }))
                      }
                      options={[
                        { value: "bw", label: lang === "RU" ? "Ч/б" : "B/W" },
                        { value: "color", label: lang === "RU" ? "Полноцвет" : "Color" },
                      ]}
                    />

                    <SelectCard
                      label={lang === "RU" ? "Бумага" : "Paper"}
                      value={form.paper}
                      onChange={(value) =>
                        setForm((prev) => ({ ...prev, paper: value as PaperType }))
                      }
                      options={[
                        {
                          value: "offset80",
                          label: lang === "RU" ? "Офсет 80 г/м²" : "Offset 80 gsm",
                        },
                        {
                          value: "coated130",
                          label: lang === "RU" ? "Мелованная 130 г/м²" : "Coated 130 gsm",
                        },
                        {
                          value: "coated170",
                          label: lang === "RU" ? "Мелованная 170 г/м²" : "Coated 170 gsm",
                        },
                      ]}
                    />
                  </div>
                </AccordionSection>

                <AccordionSection
                  title={lang === "RU" ? "4. Переплёт и производство" : "4. Binding & Production"}
                  summary={getProductionSummary(form, lang)}
                  open={isOpen("production")}
                  onToggle={() => toggleSection("production")}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <SelectCard
                      label={lang === "RU" ? "Переплёт" : "Binding"}
                      value={form.binding}
                      onChange={(value) =>
                        setForm((prev) => ({ ...prev, binding: value as BindingType }))
                      }
                      options={[
                        { value: "staple", label: lang === "RU" ? "Скоба" : "Staple" },
                        { value: "soft", label: lang === "RU" ? "Мягкий" : "Soft" },
                        { value: "hard", label: lang === "RU" ? "Твёрдый" : "Hard" },
                      ]}
                    />

                    <ToggleCard
                      label={lang === "RU" ? "Ручные операции / вставка" : "Manual production / insert"}
                      checked={form.manualProduction}
                      onChange={(checked) =>
                        setForm((prev) => ({ ...prev, manualProduction: checked }))
                      }
                    />
                  </div>
                </AccordionSection>

                <AccordionSection
                  title={lang === "RU" ? "5. Дополнительные элементы" : "5. Extras"}
                  summary={getExtrasSummary(form, lang)}
                  open={isOpen("extras")}
                  onToggle={() => toggleSection("extras")}
                >
                  <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                    <ToggleCard
                      label={lang === "RU" ? "Вкладки" : "Inserts"}
                      checked={form.extras.inserts}
                      onChange={(checked) =>
                        setForm((prev) => ({
                          ...prev,
                          extras: { ...prev.extras, inserts: checked },
                        }))
                      }
                    />

                    <ToggleCard
                      label={lang === "RU" ? "Вклейки" : "Glued Inserts"}
                      checked={form.extras.gluedInserts}
                      onChange={(checked) =>
                        setForm((prev) => ({
                          ...prev,
                          extras: { ...prev.extras, gluedInserts: checked },
                        }))
                      }
                    />

                    <ToggleCard
                      label={lang === "RU" ? "Закладка" : "Bookmark"}
                      checked={form.extras.bookmark}
                      onChange={(checked) =>
                        setForm((prev) => ({
                          ...prev,
                          extras: { ...prev.extras, bookmark: checked },
                        }))
                      }
                    />

                    <ToggleCard
                      label={lang === "RU" ? "Суперобложка" : "Dust Jacket"}
                      checked={form.extras.dustJacket}
                      onChange={(checked) =>
                        setForm((prev) => ({
                          ...prev,
                          extras: { ...prev.extras, dustJacket: checked },
                        }))
                      }
                    />

                    <ToggleCard
                      label={lang === "RU" ? "Выборочный лак" : "Varnish"}
                      checked={form.extras.varnish}
                      onChange={(checked) =>
                        setForm((prev) => ({
                          ...prev,
                          extras: { ...prev.extras, varnish: checked },
                        }))
                      }
                    />

                    <ToggleCard
                      label={lang === "RU" ? "Ламинация" : "Lamination"}
                      checked={form.extras.lamination}
                      onChange={(checked) =>
                        setForm((prev) => ({
                          ...prev,
                          extras: { ...prev.extras, lamination: checked },
                        }))
                      }
                    />
                  </div>
                </AccordionSection>

                <AccordionSection
                  title={lang === "RU" ? "6. Упаковка и сроки" : "6. Packaging & Deadlines"}
                  summary={getDeliverySummary(form, lang)}
                  open={isOpen("delivery")}
                  onToggle={() => toggleSection("delivery")}
                >
                  <div className="grid gap-4 md:grid-cols-2">
                    <SelectCard
                      label={lang === "RU" ? "Упаковка" : "Packaging"}
                      value={form.packaging}
                      onChange={(value) =>
                        setForm((prev) => ({ ...prev, packaging: value as PackagingType }))
                      }
                      options={[
                        { value: "none", label: lang === "RU" ? "Без упаковки" : "None" },
                        { value: "box", label: lang === "RU" ? "В короба" : "Boxes" },
                        {
                          value: "individual",
                          label: lang === "RU" ? "Поэкземплярно" : "Individual",
                        },
                      ]}
                    />

                    <SelectCard
                      label={lang === "RU" ? "Срочность" : "Urgency"}
                      value={form.urgency}
                      onChange={(value) =>
                        setForm((prev) => ({ ...prev, urgency: value as UrgencyType }))
                      }
                      options={[
                        { value: "normal", label: lang === "RU" ? "Обычная" : "Normal" },
                        { value: "fast", label: lang === "RU" ? "Быстро" : "Fast" },
                        { value: "rush", label: lang === "RU" ? "Срочно" : "Rush" },
                      ]}
                    />
                  </div>
                </AccordionSection>

                <div className="flex flex-wrap gap-3 pt-2">
                  <button
                    onClick={() => void calculateOnServer()}
                    className="rounded-[22px] bg-white px-5 py-3 text-black transition hover:opacity-90"
                  >
                    {lang === "RU" ? "Пересчитать" : "Recalculate"}
                  </button>

                  <button
                    onClick={() =>
                      setForm({
                        productType: "book",
                        printFormat: "SRA3",
                        editionFormat: "A5",
                        pages: 128,
                        quantity: 300,
                        colorMode: "bw",
                        paper: "offset80",
                        binding: "soft",
                        packaging: "box",
                        urgency: "normal",
                        manualProduction: false,
                        extras: {
                          inserts: false,
                          gluedInserts: false,
                          bookmark: true,
                          dustJacket: false,
                          varnish: false,
                          lamination: false,
                        },
                      })
                    }
                    className={`rounded-[22px] px-5 py-3 transition hover:bg-white/15 ${glass}`}
                  >
                    {lang === "RU" ? "Сбросить" : "Reset"}
                  </button>
                </div>
              </section>

              <aside className={`rounded-[32px] p-6 md:p-7 xl:sticky xl:top-28 ${amberGlass}`}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <div className="text-sm text-white/60">
                      {lang === "RU" ? "Предварительная стоимость" : "Estimated Total"}
                    </div>
                    <div className="mt-2 text-4xl font-semibold md:text-5xl">
                      {formatRUB(result.total)}
                    </div>
                    <div className="mt-2 text-sm text-white/65">
                      {lang === "RU" ? "за весь тираж" : "for the full batch"}
                    </div>
                  </div>

                  <div className="rounded-[22px] border border-white/10 bg-white/10 px-4 py-3 text-right backdrop-blur">
                    <div className="text-xs text-white/60">
                      {lang === "RU" ? "за экземпляр" : "per copy"}
                    </div>
                    <div className="mt-1 text-xl font-semibold">{formatRUB(result.pricePerCopy)}</div>
                  </div>
                </div>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  <MetricCard
                    title={lang === "RU" ? "Полос на листе" : "Pages per Sheet"}
                    value={String(result.pagesPerSheet)}
                  />
                  <MetricCard
                    title={lang === "RU" ? "Листов на экземпляр" : "Sheets per Copy"}
                    value={String(result.sheetsPerCopy)}
                  />
                </div>

                <div className="mt-6 space-y-3">
                  <BreakdownRow
                    label={lang === "RU" ? "Предпечатная подготовка" : "Prepress"}
                    value={result.prepressCost}
                  />
                  <BreakdownRow
                    label={lang === "RU" ? "Печать" : "Printing"}
                    value={result.printCost}
                  />
                  <BreakdownRow
                    label={lang === "RU" ? "Бумага" : "Paper"}
                    value={result.paperCost}
                  />
                  <BreakdownRow
                    label={lang === "RU" ? "Переплёт" : "Binding"}
                    value={result.bindingCost}
                  />
                  <BreakdownRow
                    label={lang === "RU" ? "Доп. элементы" : "Extras"}
                    value={result.extrasCost}
                  />
                  <BreakdownRow
                    label={lang === "RU" ? "Упаковка" : "Packaging"}
                    value={result.packagingCost}
                  />
                  <BreakdownRow
                    label={lang === "RU" ? "Ручные операции" : "Manual Work"}
                    value={result.manualProductionCost}
                  />
                  <BreakdownRow
                    label={lang === "RU" ? "Срочность" : "Urgency"}
                    value={result.urgencyCost}
                  />
                  <BreakdownRow
                    label={lang === "RU" ? "Скидка за тираж" : "Quantity Discount"}
                    value={-result.quantityDiscount}
                    isDiscount
                  />
                </div>

                <div className="mt-5 h-px bg-white/10" />

                <div className="mt-5 flex items-center justify-between gap-4">
                  <div className="text-lg font-semibold">{lang === "RU" ? "Итого" : "Total"}</div>
                  <div className="text-2xl font-semibold">{formatRUB(result.total)}</div>
                </div>

                <div className="mt-5 text-xs leading-relaxed text-white/55">
                  {loading
                    ? lang === "RU"
                      ? "Считаем..."
                      : "Calculating..."
                    : serverError
                      ? serverError
                      : lang === "RU"
                        ? "Расчёт синхронизирован с Nest backend."
                        : "Calculation synced with Nest backend."}
                </div>

                <div className="mt-6 flex flex-wrap gap-3">
                  <button className="rounded-[22px] bg-white px-4 py-3 text-black transition hover:opacity-90">
                    {lang === "RU" ? "Отправить ТЗ" : "Send Request"}
                  </button>
                  <button className={`rounded-[22px] px-4 py-3 transition hover:bg-white/15 ${glass}`}>
                    {lang === "RU" ? "Сохранить расчёт" : "Save Quote"}
                  </button>
                </div>
              </aside>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}

function NavItem({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className="rounded-2xl px-4 py-2.5 text-sm text-white/88 transition hover:bg-white/10"
    >
      {label}
    </Link>
  );
}

function SideMenuItem({
  label,
  active = false,
}: {
  label: string;
  active?: boolean;
}) {
  return (
    <div
      className={`flex items-center justify-between rounded-2xl px-4 py-3 text-sm transition ${
        active ? "bg-white/10 text-white" : "text-white/82 hover:bg-white/5"
      }`}
    >
      <span>{label}</span>
      <span className="text-white/55">•</span>
    </div>
  );
}

function AccordionSection({
  title,
  summary,
  open,
  onToggle,
  children,
}: {
  title: string;
  summary: string;
  open: boolean;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.05] backdrop-blur-xl shadow-[0_10px_50px_rgba(0,0,0,0.28)]">
      <button
        type="button"
        onClick={onToggle}
        className="flex w-full items-center justify-between gap-4 px-6 py-5 text-left transition hover:bg-white/[0.04] md:px-7 md:py-6"
      >
        <div className="min-w-0">
          <div className="text-base font-semibold md:text-lg">{title}</div>
          <div className="mt-1 truncate text-sm text-white/55">{summary}</div>
        </div>

        <div className="shrink-0">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-lg">
            {open ? "−" : "+"}
          </div>
        </div>
      </button>

      {open ? <div className="border-t border-white/8 px-6 pb-7 pt-3 md:px-7">{children}</div> : null}
    </section>
  );
}

function ChipButton({
  active,
  onClick,
  title,
  subtitle,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  subtitle: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-[24px] border p-4 text-left transition ${
        active
          ? "border-white/25 bg-white/15 shadow-[0_10px_30px_rgba(0,0,0,0.18)]"
          : "border-white/10 bg-white/5 hover:bg-white/10"
      }`}
    >
      <div className="font-semibold">{title}</div>
      <div className="mt-1 text-sm text-white/60">{subtitle}</div>
    </button>
  );
}

function SelectCard({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
}) {
  return (
    <label className="block rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="mb-3 text-sm text-white/65">{label}</div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 outline-none transition focus:border-white/20"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="text-black">
            {opt.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function NumberCard({
  label,
  value,
  min,
  step,
  onChange,
}: {
  label: string;
  value: number;
  min?: number;
  step?: number;
  onChange: (value: number) => void;
}) {
  return (
    <label className="block rounded-[24px] border border-white/10 bg-white/5 p-4 backdrop-blur">
      <div className="mb-3 text-sm text-white/65">{label}</div>
      <input
        type="number"
        value={value}
        min={min}
        step={step}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full rounded-2xl border border-white/10 bg-black/35 px-4 py-3 outline-none transition focus:border-white/20"
      />
    </label>
  );
}

function ToggleCard({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`w-full rounded-[24px] border p-4 text-left transition ${
        checked
          ? "border-white/25 bg-white/15"
          : "border-white/10 bg-white/5 hover:bg-white/10"
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="text-sm">{label}</div>
        <div
          className={`h-6 w-11 rounded-full p-1 transition ${
            checked ? "bg-white" : "bg-white/15"
          }`}
        >
          <div
            className={`h-4 w-4 rounded-full transition ${
              checked ? "translate-x-5 bg-black" : "translate-x-0 bg-white"
            }`}
          />
        </div>
      </div>
    </button>
  );
}

function MetricCard({ title, value }: { title: string; value: string }) {
  return (
    <div className="rounded-[24px] border border-white/10 bg-white/8 p-4 backdrop-blur">
      <div className="text-xs text-white/55">{title}</div>
      <div className="mt-2 text-2xl font-semibold">{value}</div>
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  isDiscount = false,
}: {
  label: string;
  value: number;
  isDiscount?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4 border-b border-white/8 pb-3 text-sm">
      <span className="text-white/75">{label}</span>
      <span className={isDiscount ? "text-green-300" : "text-white"}>
        {value < 0 ? `− ${formatRUB(Math.abs(value))}` : formatRUB(value)}
      </span>
    </div>
  );
}

function formatRUB(v: number) {
  return `${Math.round(v).toLocaleString("ru-RU")} ₽`;
}

function calculateLocal(form: CalculatorForm): CalcResult {
  const quantity = Math.max(1, Number(form.quantity) || 1);
  const pages = Math.max(4, Number(form.pages) || 4);

  const printFormatMap: Record<PrintFormat, { basePagesPerSheet: number; printCost: number }> = {
    SRA3: { basePagesPerSheet: 4, printCost: 7.5 },
    A3: { basePagesPerSheet: 4, printCost: 8.5 },
    A4: { basePagesPerSheet: 2, printCost: 6.5 },
  };

  const editionFormatFactor: Record<EditionFormat, number> = {
    A4: 1,
    A5: 0.8,
    A6: 0.65,
    B5: 0.9,
  };

  const paperMap: Record<PaperType, number> = {
    offset80: 2.4,
    coated130: 4.8,
    coated170: 6.2,
  };

  const bindingMap: Record<BindingType, number> = {
    staple: 18,
    soft: 75,
    hard: 180,
  };

  const packagingMap: Record<PackagingType, number> = {
    none: 0,
    box: 14,
    individual: 32,
  };

  const urgencyMap: Record<UrgencyType, number> = {
    normal: 0,
    fast: 0.12,
    rush: 0.25,
  };

  const productBasePrepress: Record<ProductType, number> = {
    book: 2500,
    brochure: 1800,
    catalog: 2200,
  };

  const selectedPrintFormat = printFormatMap[form.printFormat];
  const editionFactor = editionFormatFactor[form.editionFormat];

  const pagesPerSheet = Math.max(
    1,
    Math.round(selectedPrintFormat.basePagesPerSheet / editionFactor),
  );

  const sheetsPerCopy = Math.ceil(pages / pagesPerSheet);
  const colorMultiplier = form.colorMode === "color" ? 1.85 : 1;
  const prepressCost = productBasePrepress[form.productType];
  const printCost = sheetsPerCopy * selectedPrintFormat.printCost * colorMultiplier * quantity;
  const paperCost = sheetsPerCopy * paperMap[form.paper] * quantity;

  let bindingCost = bindingMap[form.binding] * quantity;

  if (
    (form.binding === "hard" || form.binding === "soft") &&
    (form.editionFormat === "A4" || form.editionFormat === "B5")
  ) {
    bindingCost *= 1.1;
  }

  let extrasCost = 0;
  if (form.extras.inserts) extrasCost += 6 * quantity;
  if (form.extras.gluedInserts) extrasCost += 12 * quantity;
  if (form.extras.bookmark) extrasCost += 10 * quantity;
  if (form.extras.dustJacket) extrasCost += 35 * quantity;
  if (form.extras.varnish) extrasCost += 16 * quantity;
  if (form.extras.lamination) extrasCost += 18 * quantity;

  const packagingCost = packagingMap[form.packaging] * quantity;
  const manualProductionCost = form.manualProduction ? 35 * quantity : 0;

  const subtotal =
    prepressCost +
    printCost +
    paperCost +
    bindingCost +
    extrasCost +
    packagingCost +
    manualProductionCost;

  const urgencyCost = subtotal * urgencyMap[form.urgency];

  let quantityDiscount = 0;
  if (quantity >= 300) quantityDiscount = subtotal * 0.07;
  if (quantity >= 1000) quantityDiscount = subtotal * 0.12;

  const total = Math.max(0, Math.round(subtotal + urgencyCost - quantityDiscount));
  const pricePerCopy = Math.round(total / quantity);

  return {
    pagesPerSheet,
    sheetsPerCopy,
    prepressCost: Math.round(prepressCost),
    printCost: Math.round(printCost),
    paperCost: Math.round(paperCost),
    bindingCost: Math.round(bindingCost),
    extrasCost: Math.round(extrasCost),
    packagingCost: Math.round(packagingCost),
    manualProductionCost: Math.round(manualProductionCost),
    urgencyCost: Math.round(urgencyCost),
    quantityDiscount: Math.round(quantityDiscount),
    total,
    pricePerCopy,
  };
}

function getProductSummary(form: CalculatorForm, lang: Lang) {
  const map: Record<ProductType, string> = {
    book: lang === "RU" ? "Книга" : "Book",
    brochure: lang === "RU" ? "Брошюра" : "Brochure",
    catalog: lang === "RU" ? "Каталог" : "Catalog",
  };
  return map[form.productType];
}

function getFormatSummary(form: CalculatorForm, lang: Lang) {
  return lang === "RU"
    ? `${form.printFormat} • ${form.editionFormat} • ${form.pages} стр. • ${form.quantity} экз.`
    : `${form.printFormat} • ${form.editionFormat} • ${form.pages} pages • ${form.quantity} qty`;
}

function getMaterialsSummary(form: CalculatorForm, lang: Lang) {
  const color =
    form.colorMode === "bw"
      ? lang === "RU"
        ? "Ч/б"
        : "B/W"
      : lang === "RU"
        ? "Полноцвет"
        : "Color";

  const paperMap: Record<PaperType, string> = {
    offset80: lang === "RU" ? "Офсет 80" : "Offset 80",
    coated130: lang === "RU" ? "Мелованная 130" : "Coated 130",
    coated170: lang === "RU" ? "Мелованная 170" : "Coated 170",
  };

  return `${color} • ${paperMap[form.paper]}`;
}

function getProductionSummary(form: CalculatorForm, lang: Lang) {
  const bindingMap: Record<BindingType, string> = {
    staple: lang === "RU" ? "Скоба" : "Staple",
    soft: lang === "RU" ? "Мягкий" : "Soft",
    hard: lang === "RU" ? "Твёрдый" : "Hard",
  };

  return form.manualProduction
    ? `${bindingMap[form.binding]} • ${lang === "RU" ? "есть ручные операции" : "manual work enabled"}`
    : bindingMap[form.binding];
}

function getExtrasSummary(form: CalculatorForm, lang: Lang) {
  const list: string[] = [];
  if (form.extras.inserts) list.push(lang === "RU" ? "вкладки" : "inserts");
  if (form.extras.gluedInserts) list.push(lang === "RU" ? "вклейки" : "glued inserts");
  if (form.extras.bookmark) list.push(lang === "RU" ? "закладка" : "bookmark");
  if (form.extras.dustJacket) list.push(lang === "RU" ? "суперобложка" : "dust jacket");
  if (form.extras.varnish) list.push(lang === "RU" ? "лак" : "varnish");
  if (form.extras.lamination) list.push(lang === "RU" ? "ламинация" : "lamination");

  if (!list.length) {
    return lang === "RU" ? "Без дополнительных элементов" : "No extra elements";
  }

  return list.join(" • ");
}

function getDeliverySummary(form: CalculatorForm, lang: Lang) {
  const packagingMap: Record<PackagingType, string> = {
    none: lang === "RU" ? "без упаковки" : "no packaging",
    box: lang === "RU" ? "в короба" : "boxes",
    individual: lang === "RU" ? "поэкземплярно" : "individual",
  };

  const urgencyMap: Record<UrgencyType, string> = {
    normal: lang === "RU" ? "обычно" : "normal",
    fast: lang === "RU" ? "быстро" : "fast",
    rush: lang === "RU" ? "срочно" : "rush",
  };

  return `${packagingMap[form.packaging]} • ${urgencyMap[form.urgency]}`;
}