import "server-only";
import { cache } from "react";
import { prisma } from "./prisma";
import type { Setting } from "@prisma/client";

/**
 * Fetch the singleton settings row, creating it with defaults if missing.
 * Wrapped in React `cache` so the layout and the page share one query per
 * request instead of each hitting the database.
 */
export const getSettings = cache(async (): Promise<Setting> => {
  const existing = await prisma.setting.findUnique({ where: { id: 1 } });
  if (existing) return existing;
  return prisma.setting.create({ data: { id: 1 } });
});
