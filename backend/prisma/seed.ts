import "dotenv/config";
import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
});

const prisma = new PrismaClient({
  adapter,
} as any);

async function main() {
  await (prisma as any).product.createMany({
    data: [
      {
        title: "Лабиринт печатника",
        author: "И. Авторов",
        description: "Книга о мире печати, дизайна и полиграфии.",
        price: 790,
        image: "/shop/books/1.jpg",
        category: "Новинки",
        cover: "hard",
        stock: "in",
        isHero: true,
        isMerch: false,
      },
      {
        title: "Ночь на типографской улице",
        author: "К. Писатель",
        description: "Художественная книга в мягком переплёте.",
        price: 650,
        image: "/shop/books/2.jpg",
        category: "Художественная",
        cover: "soft",
        stock: "preorder",
        isHero: true,
        isMerch: false,
      },
      {
        title: "Набор наклеек Pareto Print",
        author: null,
        description: "Фирменный набор наклеек компании.",
        price: 290,
        image: "/shop/merch/1.jpg",
        category: "Мерч",
        cover: "none",
        stock: "in",
        isHero: false,
        isMerch: true,
      },
    ],
  });

  console.log("Seed completed");
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });