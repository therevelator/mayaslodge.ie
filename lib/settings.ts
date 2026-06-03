import "server-only";
import { prisma } from "./prisma";
import type { Setting } from "@prisma/client";

/** Fetch the singleton settings row, creating it with defaults if missing. */
export async function getSettings(): Promise<Setting> {
  const existing = await prisma.setting.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.setting.create({ data: { id: 1 } });
}
