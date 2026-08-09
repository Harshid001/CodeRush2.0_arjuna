import { connectDB } from "../config/db";
import mongoose from "mongoose";
import { logger } from "../utils/logger";

/**
 * Mongoose Schema Migration Runner (PRD-006)
 * Executes database schema evolution scripts safely.
 */
export async function runMigrations() {
  logger.info("[Migration] Starting database migration check...");
  await connectDB();

  const db = mongoose.connection.db;
  if (!db) {
    logger.error("[Migration] Database connection unavailable.");
    return;
  }

  const migrationsCollection = db.collection("schema_migrations");
  const completed = await migrationsCollection.find({}).toArray();
  const appliedMigrationIds = new Set(completed.map((m) => m.migrationId));

  const migrations = [
    {
      id: "20260810_001_initial_schema_indexes",
      description: "Ensure provider and receipt indexes exist",
      up: async () => {
        await db.collection("providers").createIndex({ active: 1, category: 1 });
        await db.collection("receipts").createIndex({ paymentId: 1, userId: 1 });
      },
    },
  ];

  for (const migration of migrations) {
    if (!appliedMigrationIds.has(migration.id)) {
      logger.info(`[Migration] Applying migration ${migration.id}: ${migration.description}`);
      await migration.up();
      await migrationsCollection.insertOne({
        migrationId: migration.id,
        appliedAt: new Date(),
      });
      logger.info(`[Migration] Successfully applied ${migration.id}`);
    } else {
      logger.info(`[Migration] Migration ${migration.id} already applied.`);
    }
  }

  logger.info("[Migration] All migrations up to date.");
}

if (require.main === module) {
  runMigrations()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error("[Migration Error]:", err);
      process.exit(1);
    });
}
