// src/services/CacheService.ts

export interface CachedUser {
  uid: string;
  fullName?: string;
  photoURL?: string;
  about?: string;
  username?: string;
  lastSeen?: any;
  isOnline?: boolean;
  timestamp: number;
}

const USER_CACHE_KEY = 'gx_user_cache';
const CACHE_EXPIRY = 1000 * 60 * 60; // 1 hour

export const CacheService = {
  getUsers: (): Record<string, CachedUser> => {
    try {
      const data = localStorage.getItem(USER_CACHE_KEY);
      return data ? JSON.parse(data) : {};
    } catch (e) {
      return {};
    }
  },

  getUser: (uid: string): CachedUser | null => {
    const cache = CacheService.getUsers();
    const user = cache[uid];
    if (user && Date.now() - user.timestamp < CACHE_EXPIRY) {
      return user;
    }
    return null;
  },

  saveUser: (uid: string, userData: any) => {
    const cache = CacheService.getUsers();
    cache[uid] = {
      ...userData,
      uid,
      timestamp: Date.now()
    };
    localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cache));
  },

  clearOldCache: () => {
    const cache = CacheService.getUsers();
    const now = Date.now();
    let changed = false;
    Object.keys(cache).forEach(uid => {
      if (now - cache[uid].timestamp > CACHE_EXPIRY * 24) { // Keep for 24 hours even if "expired" for refresh
        delete cache[uid];
        changed = true;
      }
    });
    if (changed) {
      localStorage.setItem(USER_CACHE_KEY, JSON.stringify(cache));
    }
  }
};
