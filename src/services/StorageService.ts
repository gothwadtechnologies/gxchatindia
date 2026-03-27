/**
 * StorageService provides a safe interface for localStorage and sessionStorage.
 * It checks for availability and handles security policy restrictions in iframes.
 */

class StorageService {
  private isAvailable: boolean;

  constructor() {
    this.isAvailable = this.checkAvailability();
  }

  private checkAvailability(): boolean {
    try {
      const testKey = '__storage_test__';
      window.localStorage.setItem(testKey, testKey);
      window.localStorage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  getItem(key: string): string | null {
    if (!this.isAvailable) return null;
    try {
      return window.localStorage.getItem(key);
    } catch (e) {
      return null;
    }
  }

  setItem(key: string, value: string): void {
    if (!this.isAvailable) return;
    try {
      window.localStorage.setItem(key, value);
    } catch (e) {
      // Silent fail
    }
  }

  removeItem(key: string): void {
    if (!this.isAvailable) return;
    try {
      window.localStorage.removeItem(key);
    } catch (e) {
      // Silent fail
    }
  }

  clear(): void {
    if (!this.isAvailable) return;
    try {
      window.localStorage.clear();
    } catch (e) {
      // Silent fail
    }
  }
}

export const storage = new StorageService();
