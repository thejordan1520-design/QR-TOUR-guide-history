interface CacheItem<T> {
  data: T;
  timestamp: number;
  ttl: number; // Time to live in milliseconds
}

interface CacheConfig {
  defaultTTL: number;
  maxSize: number;
  enablePersistence: boolean;
}

class SupabaseCache {
  private cache = new Map<string, CacheItem<any>>();
  private config: CacheConfig;
  private persistenceKey = 'supabase_cache';

  constructor(config: Partial<CacheConfig> = {}) {
    this.config = {
      defaultTTL: 5 * 60 * 1000, // 5 minutes
      maxSize: 100,
      enablePersistence: true,
      ...config
    };

    this.loadFromPersistence();
    this.startCleanupInterval();
  }

  private loadFromPersistence(): void {
    if (!this.config.enablePersistence) return;

    try {
      const stored = localStorage.getItem(this.persistenceKey);
      if (stored) {
        const data = JSON.parse(stored);
        const now = Date.now();
        
        // Only load non-expired items
        Object.entries(data).forEach(([key, item]: [string, any]) => {
          if (item.timestamp + item.ttl > now) {
            this.cache.set(key, item);
          }
        });
      }
    } catch (error) {
      console.warn('Failed to load cache from persistence:', error);
    }
  }

  private saveToPersistence(): void {
    if (!this.config.enablePersistence) return;

    try {
      const data: Record<string, CacheItem<any>> = {};
      this.cache.forEach((value, key) => {
        data[key] = value;
      });
      localStorage.setItem(this.persistenceKey, JSON.stringify(data));
    } catch (error) {
      console.warn('Failed to save cache to persistence:', error);
    }
  }

  private startCleanupInterval(): void {
    // Clean up expired items every minute
    setInterval(() => {
      this.cleanup();
    }, 60 * 1000);
  }

  private cleanup(): void {
    const now = Date.now();
    const expiredKeys: string[] = [];

    this.cache.forEach((item, key) => {
      if (item.timestamp + item.ttl <= now) {
        expiredKeys.push(key);
      }
    });

    expiredKeys.forEach(key => {
      this.cache.delete(key);
    });

    // Remove oldest items if cache is too large
    if (this.cache.size > this.config.maxSize) {
      const entries = Array.from(this.cache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      
      const toRemove = entries.slice(0, this.cache.size - this.config.maxSize);
      toRemove.forEach(([key]) => {
        this.cache.delete(key);
      });
    }

    if (expiredKeys.length > 0 || this.cache.size > this.config.maxSize) {
      this.saveToPersistence();
    }
  }

  public get<T>(key: string): T | null {
    const item = this.cache.get(key);
    if (!item) return null;

    const now = Date.now();
    if (item.timestamp + item.ttl <= now) {
      this.cache.delete(key);
      this.saveToPersistence();
      return null;
    }

    return item.data;
  }

  public set<T>(key: string, data: T, ttl?: number): void {
    const now = Date.now();
    const item: CacheItem<T> = {
      data,
      timestamp: now,
      ttl: ttl || this.config.defaultTTL
    };

    this.cache.set(key, item);
    this.saveToPersistence();
  }

  public has(key: string): boolean {
    const item = this.cache.get(key);
    if (!item) return false;

    const now = Date.now();
    if (item.timestamp + item.ttl <= now) {
      this.cache.delete(key);
      this.saveToPersistence();
      return false;
    }

    return true;
  }

  public delete(key: string): void {
    this.cache.delete(key);
    this.saveToPersistence();
  }

  public clear(): void {
    this.cache.clear();
    this.saveToPersistence();
  }

  public getStats(): {
    size: number;
    maxSize: number;
    hitRate: number;
    keys: string[];
  } {
    return {
      size: this.cache.size,
      maxSize: this.config.maxSize,
      hitRate: 0, // Would need to track hits/misses for this
      keys: Array.from(this.cache.keys())
    };
  }

  // Generate cache key for Supabase queries
  public generateKey(table: string, operation: string, params?: any): string {
    const paramString = params ? JSON.stringify(params) : '';
    return `${table}_${operation}_${paramString}`;
  }
}

// Create singleton instance
export const supabaseCache = new SupabaseCache();

// Enhanced Supabase service with caching
export class CachedSupabaseService {
  private cache: SupabaseCache;

  constructor(cache: SupabaseCache) {
    this.cache = cache;
  }

  async getDestinations(limit?: number): Promise<any> {
    const cacheKey = this.cache.generateKey('destinations', 'getAll', { limit });
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return { data: cached, error: null, fromCache: true };
    }

    try {
      const { supabase } = await import('../lib/supabase');
      const startTime = performance.now();
      
      let query = supabase.from('destinations').select('*');
      if (limit) {
        query = query.limit(limit);
      }
      
      const { data, error } = await query;
      const duration = performance.now() - startTime;

      // Track performance
      const { trackSupabaseOperation } = await import('./performance');
      trackSupabaseOperation('getDestinations', duration, !error);

      if (!error && data) {
        // Cache successful results
        this.cache.set(cacheKey, data, 5 * 60 * 1000); // 5 minutes
      }

      return { data, error, fromCache: false };
    } catch (error) {
      return { data: null, error, fromCache: false };
    }
  }

  async getDestinationById(id: string): Promise<any> {
    const cacheKey = this.cache.generateKey('destinations', 'getById', { id });
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return { data: cached, error: null, fromCache: true };
    }

    try {
      const { supabase } = await import('../lib/supabase');
      const startTime = performance.now();
      
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .eq('id', id)
        .single();
      
      const duration = performance.now() - startTime;

      // Track performance
      const { trackSupabaseOperation } = await import('./performance');
      trackSupabaseOperation('getDestinationById', duration, !error);

      if (!error && data) {
        // Cache successful results
        this.cache.set(cacheKey, data, 10 * 60 * 1000); // 10 minutes
      }

      return { data, error, fromCache: false };
    } catch (error) {
      return { data: null, error, fromCache: false };
    }
  }

  async getPopularDestinations(limit: number = 10): Promise<any> {
    const cacheKey = this.cache.generateKey('destinations', 'getPopular', { limit });
    
    // Check cache first
    const cached = this.cache.get(cacheKey);
    if (cached) {
      return { data: cached, error: null, fromCache: true };
    }

    try {
      const { supabase } = await import('../lib/supabase');
      const startTime = performance.now();
      
      const { data, error } = await supabase
        .from('destinations')
        .select('*')
        .order('rating', { ascending: false })
        .limit(limit);
      
      const duration = performance.now() - startTime;

      // Track performance
      const { trackSupabaseOperation } = await import('./performance');
      trackSupabaseOperation('getPopularDestinations', duration, !error);

      if (!error && data) {
        // Cache popular destinations for longer
        this.cache.set(cacheKey, data, 15 * 60 * 1000); // 15 minutes
      }

      return { data, error, fromCache: false };
    } catch (error) {
      return { data: null, error, fromCache: false };
    }
  }

  // Invalidate cache for specific table
  public invalidateTable(table: string): void {
    const keys = Array.from(this.cache.getStats().keys);
    keys.forEach(key => {
      if (key.startsWith(`${table}_`)) {
        this.cache.delete(key);
      }
    });
  }

  // Invalidate all cache
  public invalidateAll(): void {
    this.cache.clear();
  }
}

// Create singleton instance
export const cachedSupabaseService = new CachedSupabaseService(supabaseCache);

export default supabaseCache;
