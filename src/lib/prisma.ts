import { PrismaClient } from '@prisma/client';

declare global { var __fitplanPrisma: PrismaClient | undefined; }
export const prisma = global.__fitplanPrisma ?? new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.__fitplanPrisma = prisma;
