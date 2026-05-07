"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type AdminTab = "products" | "services" | "employees" | "users" | "announcements";

type Product = {
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

type ServiceItem = {
  id: number;
  title: string;
  shortText: string;
  fullText: string;
  image: string;
  order: number;
};

type EmployeePage = {
  id: number;
  title: string;
  text: string;
  order: number;
};

type Employee = {
  id: number;
  name: string;
  role: string;
  exp: string;
  skill: string;
  photo: string | null;
  bio: string | null;
  order: number;
  pages: EmployeePage[];
};

type ProductForm = {
  title: string;
  author: string;
  description: string;
  price: string;
  image: string;
  category: string;
  cover: string;
  stock: string;
  isHero: boolean;
  isMerch: boolean;
};

type ServiceForm = {
  title: string;
  shortText: string;
  fullText: string;
  image: string;
  order: string;
};

type EmployeeForm = {
  name: string;
  role: string;
  exp: string;
  skill: string;
  photo: string;
  bio: string;
  order: string;
  about: string;
  quote: string;
  focus: string;
};

const EMPTY_PRODUCT_FORM: ProductForm = {
  title: "",
  author: "",
  description: "",
  price: "",
  image: "/shop/books/1.jpg",
  category: "Новинки",
  cover: "hard",
  stock: "in",
  isHero: false,
  isMerch: false,
};

const EMPTY_SERVICE_FORM: ServiceForm = {
  title: "",
  shortText: "",
  fullText: "",
  image: "/bg/services.jpg",
  order: "0",
};

const EMPTY_EMPLOYEE_FORM: EmployeeForm = {
  name: "",
  role: "",
  exp: "",
  skill: "",
  photo: "",
  bio: "",
  order: "0",
  about: "",
  quote: "",
  focus: "",
};

export default function AdminPage() {
  const [tab, setTab] = useState<AdminTab>("products");

  return (
    <div className="min-h-screen bg-black text-white">
      <header className="border-b border-white/10 bg-black/80 backdrop-blur sticky top-0 z-40">
        <div className="mx-auto max-w-6xl px-4 py-4 flex items-center justify-between">
          <div>
            <div className="text-xl font-semibold">Админ-панель</div>
            <div className="text-sm text-white/50">ООО “Прето Принт”</div>
          </div>

          <div className="flex gap-2">
            <Link href="/" className="px-4 py-2 rounded-2xl bg-white/10 border border-white/15">
              Главная
            </Link>
            <Link href="/shop" className="px-4 py-2 rounded-2xl bg-white text-black">
              В магазин
            </Link>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid lg:grid-cols-[240px_1fr] gap-6">
          <aside className="rounded-3xl border border-white/10 bg-white/5 p-3 h-fit">
            <AdminButton active={tab === "products"} onClick={() => setTab("products")}>
              Товары
            </AdminButton>
            <AdminButton active={tab === "services"} onClick={() => setTab("services")}>
              Услуги
            </AdminButton>
            <AdminButton active={tab === "employees"} onClick={() => setTab("employees")}>
              Сотрудники
            </AdminButton>
            <AdminButton active={tab === "users"} onClick={() => setTab("users")}>
              Пользователи
            </AdminButton>
            <AdminButton active={tab === "announcements"} onClick={() => setTab("announcements")}>
              Объявления
            </AdminButton>
          </aside>

          <section>
            {tab === "products" ? <ProductsAdmin /> : null}
            {tab === "services" ? <ServicesAdmin /> : null}
            {tab === "employees" ? <EmployeesAdmin /> : null}
            {tab === "users" ? <Stub title="Пользователи" /> : null}
            {tab === "announcements" ? <Stub title="Объявления" /> : null}
          </section>
        </div>
      </main>

      <style jsx global>{`
        .adminInput {
          width: 100%;
          border-radius: 16px;
          border: 1px solid rgba(255, 255, 255, 0.12);
          background: rgba(0, 0, 0, 0.35);
          padding: 12px 14px;
          color: white;
          outline: none;
        }

        .adminInput:focus {
          border-color: rgba(255, 255, 255, 0.45);
        }

        .adminInput option {
          color: black;
        }
      `}</style>
    </div>
  );
}

function AdminButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-3 rounded-2xl transition ${
        active ? "bg-white text-black" : "hover:bg-white/10 text-white/80"
      }`}
    >
      {children}
    </button>
  );
}

function Stub({ title }: { title: string }) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-2xl font-semibold">{title}</h2>
      <p className="mt-2 text-white/60">Этот раздел пока заглушка.</p>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <div className="mb-2 text-sm text-white/70">{label}</div>
      {children}
    </label>
  );
}

/* ---------------- PRODUCTS ---------------- */

function ProductsAdmin() {
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

  const [products, setProducts] = useState<Product[]>([]);
  const [form, setForm] = useState<ProductForm>(EMPTY_PRODUCT_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadProducts() {
    const res = await fetch(`${API}/products`);
    const data = await res.json();
    setProducts(data);
  }

  useEffect(() => {
    loadProducts().catch(console.error);
  }, []);

  function startEdit(product: Product) {
    setEditingId(product.id);
    setForm({
      title: product.title,
      author: product.author || "",
      description: product.description || "",
      price: String(product.price),
      image: product.image,
      category: product.category,
      cover: product.cover,
      stock: product.stock,
      isHero: product.isHero,
      isMerch: product.isMerch,
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_PRODUCT_FORM);
  }

  async function saveProduct(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId ? `${API}/products/${editingId}` : `${API}/products`;
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Ошибка сохранения товара");
      }

      alert(editingId ? "Товар обновлён" : "Товар добавлен");
      setEditingId(null);
      setForm(EMPTY_PRODUCT_FORM);
      await loadProducts();
    } catch (err) {
      console.error(err);
      alert("Ошибка сохранения товара");
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct(id: number) {
    if (!confirm("Удалить товар?")) return;

    const res = await fetch(`${API}/products/${id}`, { method: "DELETE" });

    if (!res.ok) {
      alert("Ошибка удаления товара");
      return;
    }

    if (editingId === id) cancelEdit();
    await loadProducts();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">
          {editingId ? `Редактирование товара #${editingId}` : "Добавление товара"}
        </h2>

        <form onSubmit={saveProduct} className="mt-6 grid md:grid-cols-2 gap-4">
          <Field label="Название">
            <input
              className="adminInput"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </Field>

          <Field label="Автор">
            <input
              className="adminInput"
              value={form.author}
              onChange={(e) => setForm({ ...form, author: e.target.value })}
            />
          </Field>

          <Field label="Цена">
            <input
              className="adminInput"
              type="number"
              value={form.price}
              onChange={(e) => setForm({ ...form, price: e.target.value })}
              required
            />
          </Field>

          <Field label="Картинка">
            <input
              className="adminInput"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              required
            />
          </Field>

          <Field label="Категория">
            <select
              className="adminInput"
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
            >
              <option value="Новинки">Новинки</option>
              <option value="Художественная">Художественная</option>
              <option value="Нон-фикшн">Нон-фикшн</option>
              <option value="Детская">Детская</option>
              <option value="Поэзия">Поэзия</option>
              <option value="Бизнес">Бизнес</option>
              <option value="Скидки">Скидки</option>
              <option value="Мерч">Мерч</option>
            </select>
          </Field>

          <Field label="Переплёт">
            <select
              className="adminInput"
              value={form.cover}
              onChange={(e) => setForm({ ...form, cover: e.target.value })}
            >
              <option value="hard">Твёрдый</option>
              <option value="soft">Мягкий</option>
              <option value="none">Без переплёта</option>
            </select>
          </Field>

          <Field label="Наличие">
            <select
              className="adminInput"
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value })}
            >
              <option value="in">В наличии</option>
              <option value="preorder">Предзаказ</option>
              <option value="out">Нет в наличии</option>
            </select>
          </Field>

          <Field label="Описание">
            <textarea
              className="adminInput min-h-28"
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
            />
          </Field>

          <div className="md:col-span-2 flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm text-white/80">
              <input
                type="checkbox"
                checked={form.isHero}
                onChange={(e) => setForm({ ...form, isHero: e.target.checked })}
              />
              Показывать в верхнем слайдере
            </label>

            <label className="flex items-center gap-2 text-sm text-white/80">
              <input
                type="checkbox"
                checked={form.isMerch}
                onChange={(e) => setForm({ ...form, isMerch: e.target.checked })}
              />
              Это мерч
            </label>
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button disabled={loading} className="px-5 py-3 rounded-2xl bg-white text-black disabled:opacity-50">
              {loading ? "Сохранение..." : editingId ? "Сохранить изменения" : "Добавить товар"}
            </button>

            {editingId ? (
              <button
                type="button"
                onClick={cancelEdit}
                className="px-5 py-3 rounded-2xl border border-white/15 bg-white/10"
              >
                Отмена
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <CardsList
        title="Товары в базе"
        empty="Товаров пока нет"
        items={products}
        render={(p) => (
          <div key={p.id} className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
            <img src={p.image} alt="" className="h-40 w-full object-cover" />

            <div className="p-4">
              <div className="text-sm text-white/50">#{p.id}</div>
              <div className="font-semibold">{p.title}</div>
              <div className="text-sm text-white/60">{p.author || "Автор не указан"}</div>
              <div className="mt-2 text-sm">{p.price.toLocaleString("ru-RU")} ₽</div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/60">
                <span className="px-2 py-1 rounded-full bg-white/10">{p.category}</span>
                <span className="px-2 py-1 rounded-full bg-white/10">{p.cover}</span>
                <span className="px-2 py-1 rounded-full bg-white/10">{p.stock}</span>
                {p.isHero ? <span className="px-2 py-1 rounded-full bg-white/10">hero</span> : null}
                {p.isMerch ? <span className="px-2 py-1 rounded-full bg-white/10">merch</span> : null}
              </div>

              <div className="mt-4 flex gap-2">
                <button onClick={() => startEdit(p)} className="flex-1 px-3 py-2 rounded-xl bg-white text-black text-sm">
                  Редактировать
                </button>
                <button onClick={() => deleteProduct(p.id)} className="flex-1 px-3 py-2 rounded-xl bg-red-500/80 text-sm">
                  Удалить
                </button>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}

/* ---------------- SERVICES ---------------- */

function ServicesAdmin() {
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

  const [items, setItems] = useState<ServiceItem[]>([]);
  const [form, setForm] = useState<ServiceForm>(EMPTY_SERVICE_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadItems() {
    const res = await fetch(`${API}/services`);
    const data = await res.json();
    setItems(data);
  }

  useEffect(() => {
    loadItems().catch(console.error);
  }, []);

  function startEdit(item: ServiceItem) {
    setEditingId(item.id);
    setForm({
      title: item.title,
      shortText: item.shortText,
      fullText: item.fullText,
      image: item.image,
      order: String(item.order),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_SERVICE_FORM);
  }

  async function saveItem(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId ? `${API}/services/${editingId}` : `${API}/services`;
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Ошибка сохранения услуги");
      }

      alert(editingId ? "Услуга обновлена" : "Услуга добавлена");
      setEditingId(null);
      setForm(EMPTY_SERVICE_FORM);
      await loadItems();
    } catch (err) {
      console.error(err);
      alert("Ошибка сохранения услуги");
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(id: number) {
    if (!confirm("Удалить услугу?")) return;

    const res = await fetch(`${API}/services/${id}`, { method: "DELETE" });

    if (!res.ok) {
      alert("Ошибка удаления услуги");
      return;
    }

    if (editingId === id) cancelEdit();
    await loadItems();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">
          {editingId ? `Редактирование услуги #${editingId}` : "Добавление услуги"}
        </h2>

        <form onSubmit={saveItem} className="mt-6 grid md:grid-cols-2 gap-4">
          <Field label="Название услуги">
            <input
              className="adminInput"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
              required
            />
          </Field>

          <Field label="Порядок отображения">
            <input
              className="adminInput"
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
            />
          </Field>

          <Field label="Картинка">
            <input
              className="adminInput"
              value={form.image}
              onChange={(e) => setForm({ ...form, image: e.target.value })}
              required
            />
          </Field>

          <Field label="Краткое описание">
            <textarea
              className="adminInput min-h-24"
              value={form.shortText}
              onChange={(e) => setForm({ ...form, shortText: e.target.value })}
              required
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Полное описание для окна Подробнее">
              <textarea
                className="adminInput min-h-40"
                value={form.fullText}
                onChange={(e) => setForm({ ...form, fullText: e.target.value })}
                required
              />
            </Field>
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button disabled={loading} className="px-5 py-3 rounded-2xl bg-white text-black disabled:opacity-50">
              {loading ? "Сохранение..." : editingId ? "Сохранить изменения" : "Добавить услугу"}
            </button>

            {editingId ? (
              <button type="button" onClick={cancelEdit} className="px-5 py-3 rounded-2xl border border-white/15 bg-white/10">
                Отмена
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <CardsList
        title="Услуги в базе"
        empty="Услуг пока нет"
        items={items}
        render={(s) => (
          <div key={s.id} className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
            <img src={s.image} alt="" className="h-40 w-full object-cover" />

            <div className="p-4">
              <div className="text-sm text-white/50">#{s.id} • порядок {s.order}</div>
              <div className="font-semibold">{s.title}</div>
              <div className="mt-2 text-sm text-white/60 line-clamp-3">{s.shortText}</div>

              <div className="mt-4 flex gap-2">
                <button onClick={() => startEdit(s)} className="flex-1 px-3 py-2 rounded-xl bg-white text-black text-sm">
                  Редактировать
                </button>
                <button onClick={() => deleteItem(s.id)} className="flex-1 px-3 py-2 rounded-xl bg-red-500/80 text-sm">
                  Удалить
                </button>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}

/* ---------------- EMPLOYEES ---------------- */

function EmployeesAdmin() {
  const API = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

  const [items, setItems] = useState<Employee[]>([]);
  const [form, setForm] = useState<EmployeeForm>(EMPTY_EMPLOYEE_FORM);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadItems() {
    const res = await fetch(`${API}/employees`);
    const data = await res.json();
    setItems(data);
  }

  useEffect(() => {
    loadItems().catch(console.error);
  }, []);

  function getPageText(employee: Employee, title: string) {
    return employee.pages.find((p) => p.title === title)?.text || "";
  }

  function startEdit(item: Employee) {
    setEditingId(item.id);
    setForm({
      name: item.name,
      role: item.role,
      exp: item.exp,
      skill: item.skill,
      photo: item.photo || "",
      bio: item.bio || "",
      order: String(item.order),
      about: getPageText(item, "О работе"),
      quote: getPageText(item, "Цитата"),
      focus: getPageText(item, "Фокус"),
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function cancelEdit() {
    setEditingId(null);
    setForm(EMPTY_EMPLOYEE_FORM);
  }

  async function saveItem(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);

    try {
      const url = editingId ? `${API}/employees/${editingId}` : `${API}/employees`;
      const method = editingId ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data?.message || "Ошибка сохранения сотрудника");
      }

      alert(editingId ? "Сотрудник обновлён" : "Сотрудник добавлен");
      setEditingId(null);
      setForm(EMPTY_EMPLOYEE_FORM);
      await loadItems();
    } catch (err) {
      console.error(err);
      alert("Ошибка сохранения сотрудника");
    } finally {
      setLoading(false);
    }
  }

  async function deleteItem(id: number) {
    if (!confirm("Удалить сотрудника?")) return;

    const res = await fetch(`${API}/employees/${id}`, { method: "DELETE" });

    if (!res.ok) {
      alert("Ошибка удаления сотрудника");
      return;
    }

    if (editingId === id) cancelEdit();
    await loadItems();
  }

  return (
    <div className="space-y-6">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
        <h2 className="text-2xl font-semibold">
          {editingId ? `Редактирование сотрудника #${editingId}` : "Добавление сотрудника"}
        </h2>

        <form onSubmit={saveItem} className="mt-6 grid md:grid-cols-2 gap-4">
          <Field label="Имя / должность на карточке">
            <input
              className="adminInput"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              required
            />
          </Field>

          <Field label="Роль / подзаголовок">
            <input
              className="adminInput"
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              required
            />
          </Field>

          <Field label="Стаж">
            <input
              className="adminInput"
              value={form.exp}
              onChange={(e) => setForm({ ...form, exp: e.target.value })}
              placeholder="3+ года"
              required
            />
          </Field>

          <Field label="Навык">
            <input
              className="adminInput"
              value={form.skill}
              onChange={(e) => setForm({ ...form, skill: e.target.value })}
              placeholder="коммуникация"
              required
            />
          </Field>

          <Field label="Фото">
            <input
              className="adminInput"
              value={form.photo}
              onChange={(e) => setForm({ ...form, photo: e.target.value })}
              placeholder="/employees/1.jpg"
            />
          </Field>

          <Field label="Порядок отображения">
            <input
              className="adminInput"
              type="number"
              value={form.order}
              onChange={(e) => setForm({ ...form, order: e.target.value })}
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Биография для окна «О сотруднике»">
              <textarea
                className="adminInput min-h-28"
                value={form.bio}
                onChange={(e) => setForm({ ...form, bio: e.target.value })}
              />
            </Field>
          </div>

          <Field label="О работе">
            <textarea
              className="adminInput min-h-28"
              value={form.about}
              onChange={(e) => setForm({ ...form, about: e.target.value })}
            />
          </Field>

          <Field label="Цитата">
            <textarea
              className="adminInput min-h-28"
              value={form.quote}
              onChange={(e) => setForm({ ...form, quote: e.target.value })}
            />
          </Field>

          <div className="md:col-span-2">
            <Field label="Фокус">
              <textarea
                className="adminInput min-h-28"
                value={form.focus}
                onChange={(e) => setForm({ ...form, focus: e.target.value })}
              />
            </Field>
          </div>

          <div className="md:col-span-2 flex gap-3">
            <button disabled={loading} className="px-5 py-3 rounded-2xl bg-white text-black disabled:opacity-50">
              {loading ? "Сохранение..." : editingId ? "Сохранить изменения" : "Добавить сотрудника"}
            </button>

            {editingId ? (
              <button type="button" onClick={cancelEdit} className="px-5 py-3 rounded-2xl border border-white/15 bg-white/10">
                Отмена
              </button>
            ) : null}
          </div>
        </form>
      </div>

      <CardsList
        title="Сотрудники в базе"
        empty="Сотрудников пока нет"
        items={items}
        render={(e) => (
          <div key={e.id} className="rounded-2xl border border-white/10 bg-black/30 overflow-hidden">
            {e.photo ? (
              <img src={e.photo} alt="" className="h-40 w-full object-cover" />
            ) : (
              <div className="h-40 w-full bg-white/5 flex items-center justify-center text-white/40">
                Фото
              </div>
            )}

            <div className="p-4">
              <div className="text-sm text-white/50">#{e.id} • порядок {e.order}</div>
              <div className="font-semibold">{e.name}</div>
              <div className="text-sm text-white/60">{e.role}</div>

              <div className="mt-3 flex flex-wrap gap-2 text-xs text-white/60">
                <span className="px-2 py-1 rounded-full bg-white/10">{e.exp}</span>
                <span className="px-2 py-1 rounded-full bg-white/10">{e.skill}</span>
                <span className="px-2 py-1 rounded-full bg-white/10">{e.pages.length} вкладки</span>
              </div>

              <div className="mt-4 flex gap-2">
                <button onClick={() => startEdit(e)} className="flex-1 px-3 py-2 rounded-xl bg-white text-black text-sm">
                  Редактировать
                </button>
                <button onClick={() => deleteItem(e.id)} className="flex-1 px-3 py-2 rounded-xl bg-red-500/80 text-sm">
                  Удалить
                </button>
              </div>
            </div>
          </div>
        )}
      />
    </div>
  );
}

/* ---------------- SMALL REUSABLE LIST ---------------- */

function CardsList<T>({
  title,
  empty,
  items,
  render,
}: {
  title: string;
  empty: string;
  items: T[];
  render: (item: T) => React.ReactNode;
}) {
  return (
    <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
      <h2 className="text-2xl font-semibold">{title}</h2>

      {items.length === 0 ? (
        <div className="mt-4 text-white/50">{empty}</div>
      ) : (
        <div className="mt-5 grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {items.map(render)}
        </div>
      )}
    </div>
  );
}