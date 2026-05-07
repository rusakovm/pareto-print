import "dotenv/config";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://pareto-print-qctp-snowy.vercel.app",
    "https://pareto-print-llc7af36f-rusakovms-projects.vercel.app",
    process.env.FRONTEND_URL,
  ].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  });

  const port = process.env.PORT || 3000;

  await app.listen(port, "0.0.0.0");

  console.log(`API running on port ${port}`);
}

bootstrap();