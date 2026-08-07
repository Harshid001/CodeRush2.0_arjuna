import { connectDB } from "../src/config/db";
import { app } from "../src/app";

export default async function handler(req: any, res: any) {
  await connectDB();
  return app(req, res);
}
