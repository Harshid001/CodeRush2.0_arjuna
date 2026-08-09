import { connectDB } from "./config/db";
import { env } from "./config/env";
import { app } from "./app";
import { seedDatabase } from "./services/seed.service";

async function start() {
  await connectDB();
  if (env.NODE_ENV === "development" || process.env.ENABLE_AUTO_SEED === "true") {
    await seedDatabase();
  }

  app.listen(env.PORT, () => {
    console.log(`[server] x402 Backend running on http://localhost:${env.PORT}`);
    console.log(`[server] Environment: ${env.NODE_ENV}`);
  });
}

start().catch((err) => {
  console.error("[server] Failed to start:", err);
  process.exit(1);
});