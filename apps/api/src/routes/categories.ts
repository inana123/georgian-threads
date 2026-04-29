import type { FastifyInstance } from "fastify";
import { prisma } from "../db.js";

export async function categoryRoutes(app: FastifyInstance) {
  app.get("/", async () => {
    return prisma.category.findMany({ orderBy: { name: "asc" } });
  });
}
