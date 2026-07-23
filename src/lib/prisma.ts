// import pkg from "@prisma/client";
// const { PrismaClient } = pkg as any;

// const globalForPrisma = global as unknown as {
//   prisma?: typeof PrismaClient;
// };

// export const prisma =
//   globalForPrisma.prisma ||
//   new PrismaClient({
//     log: process.env.NODE_ENV === "development" ? ["query"] : [],
//   });

// if (process.env.NODE_ENV !== "production") {
//   globalForPrisma.prisma = prisma;
// }
import { PrismaClient }
from "@/generated/prisma/client";

import { PrismaPg }
from "@prisma/adapter-pg";

const connectionString =
  process.env.DATABASE_URL!;

const adapter =
  new PrismaPg({
    connectionString,
  });

const globalForPrisma =
  globalThis as unknown as {
    prisma?: PrismaClient;
  };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}