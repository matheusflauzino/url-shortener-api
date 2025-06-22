import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

interface CachedItem {
  value: string;
  expires: number;
}

@Injectable()
export class CacheService implements OnModuleDestroy {
  private client?: Redis;
  private readonly store = new Map<string, CachedItem>();
  private readonly ttl: number;

  constructor() {
    this.ttl = parseInt(process.env.CACHE_TTL ?? '3600', 10);
    const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
    try {
      this.client = new Redis(url, {
        lazyConnect: true,
        maxRetriesPerRequest: 1,
        retryStrategy: () => null,
        connectTimeout: 500,
      });
      this.client.on('error', (err) => {
        Logger.error(`Redis error: ${err.message}`);
      });
      this.client.connect().catch(() => {
        this.client = undefined;
      });
    } catch {
      this.client = undefined;
    }
  }

  async get(key: string): Promise<string | null> {
    if (this.client) {
      try {
        const value = await this.client.get(key);
        if (value !== null) {
          return value;
        }
      } catch {
        this.client = undefined;
      }
    }
    const item = this.store.get(key);
    if (item && item.expires > Date.now()) {
      return item.value;
    }
    if (item) {
      this.store.delete(key);
    }
    return null;
  }

  async set(key: string, value: string, ttl = this.ttl): Promise<void> {
    if (this.client) {
      try {
        await this.client.set(key, value, 'EX', ttl);
        return;
      } catch {
        this.client = undefined;
      }
    }
    const expires = Date.now() + ttl * 1000;
    this.store.set(key, { value, expires });
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client) {
      try {
        await this.client.quit();
      } catch {}
    }
  }
}
