import { promises as fs } from "fs";
import os from "os";
import path from "path";

type CacheEntry<T> = {
  cachedAt: number;
  expiresAt: number;
  value: T;
  version: number;
};

export type CacheResult<T> = {
  cachedAt: number;
  stale: boolean;
  value: T;
};

const CACHE_VERSION = 1;
const cacheDirectory = path.join(os.homedir(), ".cache", "homescreen-dashboard");
const memoryCache = new Map<string, CacheEntry<unknown>>();
const diskLookups = new Set<string>();

/**
 * Cache external API responses in memory and on disk.
 *
 * Fresh data is returned while the TTL is valid. If the external service fails,
 * the latest cached value is returned as stale, even after a Raspberry Pi
 * reboot. This keeps the dashboard useful without ever inventing fallback data.
 */
export async function withCache<T>(
  key: string,
  ttlMs: number,
  loader: () => Promise<T>,
): Promise<CacheResult<T>> {
  const cached = await getCachedEntry<T>(key);
  const now = Date.now();

  if (cached && cached.expiresAt > now) {
    return {
      cachedAt: cached.cachedAt,
      stale: false,
      value: cached.value,
    };
  }

  try {
    const freshValue = await loader();
    const cachedAt = Date.now();
    const freshEntry: CacheEntry<T> = {
      cachedAt,
      expiresAt: cachedAt + Math.max(0, ttlMs),
      value: freshValue,
      version: CACHE_VERSION,
    };

    memoryCache.set(key, freshEntry);

    // Disk persistence is best effort. A filesystem problem must not turn a
    // successful API request into a failed dashboard request.
    try {
      await persistEntry(key, freshEntry);
    } catch (error) {
      console.warn(`Could not persist cache entry "${key}":`, error);
    }

    return {
      cachedAt,
      stale: false,
      value: freshValue,
    };
  } catch (error) {
    if (cached) {
      console.warn(`Using stale cache entry "${key}" after refresh failed:`, error);
      return {
        cachedAt: cached.cachedAt,
        stale: true,
        value: cached.value,
      };
    }

    throw error;
  }
}

async function getCachedEntry<T>(key: string): Promise<CacheEntry<T> | undefined> {
  const inMemory = memoryCache.get(key) as CacheEntry<T> | undefined;
  if (inMemory) {
    return inMemory;
  }

  // A missing/invalid file only needs to be checked once during a process run.
  if (diskLookups.has(key)) {
    return undefined;
  }
  diskLookups.add(key);

  try {
    const raw = await fs.readFile(getCachePath(key), "utf8");
    const parsed = JSON.parse(raw) as unknown;

    if (!isCacheEntry<T>(parsed)) {
      console.warn(`Ignoring incompatible cache entry "${key}".`);
      return undefined;
    }

    memoryCache.set(key, parsed);
    return parsed;
  } catch (error) {
    if (isNodeError(error) && error.code === "ENOENT") {
      return undefined;
    }

    console.warn(`Could not read cache entry "${key}":`, error);
    return undefined;
  }
}

async function persistEntry<T>(key: string, entry: CacheEntry<T>): Promise<void> {
  await fs.mkdir(cacheDirectory, { recursive: true });

  const targetPath = getCachePath(key);
  const temporaryPath = `${targetPath}.${process.pid}.tmp`;

  await fs.writeFile(temporaryPath, JSON.stringify(entry), "utf8");
  await fs.rename(temporaryPath, targetPath);
}

function getCachePath(key: string): string {
  const safeKey = key.replace(/[^a-z0-9_-]/gi, "_");
  return path.join(cacheDirectory, `${safeKey}.json`);
}

function isCacheEntry<T>(value: unknown): value is CacheEntry<T> {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<CacheEntry<T>>;
  return (
    candidate.version === CACHE_VERSION &&
    typeof candidate.cachedAt === "number" &&
    Number.isFinite(candidate.cachedAt) &&
    typeof candidate.expiresAt === "number" &&
    Number.isFinite(candidate.expiresAt) &&
    "value" in candidate
  );
}

function isNodeError(error: unknown): error is NodeJS.ErrnoException {
  return error instanceof Error && "code" in error;
}
