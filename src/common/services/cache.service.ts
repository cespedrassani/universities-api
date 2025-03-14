import { Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';

@Injectable()
export class CacheService {
  private readonly cacheTTL = 3600;
  private readonly logger = new Logger(CacheService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }

  async get<T>(key: string): Promise<T | null> {
    const data = await this.cacheManager.get<T>(key);

    if (data) {
      this.logger.debug(`Cache hit: ${key}`);
      return data;
    }

    this.logger.debug(`Cache miss: ${key}`);
    return null;
  }

  async set<T>(key: string, data: T, ttl: number = this.cacheTTL): Promise<void> {
    await this.cacheManager.set(key, data, ttl);
    this.logger.debug(`Dados armazenados no cache: ${key}`);
  }

  getAllKey(offset: number, limit: number): string {
    return `all__offset${offset}_limit${limit}`;
  }

  getByNameKey(name: string, offset: number, limit: number): string {
    return `name_${name}_offset${offset}_limit${limit}`;
  }

  getByCountryKey(country: string, offset: number, limit: number): string {
    return `country_${country}_offset${offset}_limit${limit}`;
  }

  getByDomainKey(domain: string, offset: number, limit: number): string {
    return `domain_${domain}_offset${offset}_limit${limit}`;
  }

  getSearchKey(searchParams: Record<string, any>, offset: number, limit: number): string {
    const queryParams = Object.entries(searchParams)
      .filter(([, value]) => value !== undefined)
      .map(([key, value]) => `${key}_${value}`)
      .join('_');

    return `search_${queryParams || 'all'}_offset${offset}_limit${limit}`;
  }
}
