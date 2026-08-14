// app/api/db-test/route.ts

import { prisma } from "@/lib/prisma";

export async function GET() {
  const start = Date.now();

  await prisma.$queryRaw`SELECT 1`;

  return Response.json({
    success: true,
    time: `${Date.now() - start}ms`,
  });
}