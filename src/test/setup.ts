import '@testing-library/jest-dom/vitest'

// Node 26 defines an experimental global `localStorage` accessor that resolves
// to `undefined` unless `--localstorage-file` is passed. Vitest's jsdom
// population skips keys that already exist on the global, so jsdom's own
// localStorage is never copied over — leaving `localStorage` undefined in
// tests. Session storage happens to work only because Node's experimental
// `sessionStorage` returns an object. Provide a real in-memory localStorage so
// storage-backed code can be exercised.
class MemoryStorage {
  private store = new Map<string, string>()

  get length(): number {
    return this.store.size
  }

  key(index: number): string | null {
    return [...this.store.keys()][index] ?? null
  }

  getItem(key: string): string | null {
    return this.store.get(key) ?? null
  }

  setItem(key: string, value: string): void {
    this.store.set(key, String(value))
  }

  removeItem(key: string): void {
    this.store.delete(key)
  }

  clear(): void {
    this.store.clear()
  }
}

Object.defineProperty(globalThis, 'localStorage', {
  configurable: true,
  value: new MemoryStorage(),
})