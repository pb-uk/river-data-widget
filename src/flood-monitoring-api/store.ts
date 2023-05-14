const prefix = 'riverDataWidget';

const addPrefix = (key: string): string => `${prefix}|${key}`;

let instance: Store;

class Store {
  clear(destroy = false) {
    for (const key of this.keys()) {
      localStorage.remove(addPrefix(key));
    }
    if (destroy) {
      localStorage.remove(prefix);
      return;
    }
    localStorage.setItem(prefix, JSON.stringify([]));
  }

  get(key: string) {
    const value = localStorage.getItem(addPrefix(key));
    return value === null ? null : JSON.parse(value);
  }

  has(key: string): boolean {
    return this.keys().includes(key);
  }

  /**
   * Detect active localStorage.
   *
   * @returns true iff localStorage for the widget is active.
   */
  isActive() {
    return localStorage.getItem(prefix) !== null;
  }

  keys(): string[] {
    const storedKeys = localStorage.getItem(prefix);
    return storedKeys === null ? [] : JSON.parse(storedKeys);
  }

  set(key: string, value: unknown) {
    const json = JSON.stringify(value);
    const storedKeys = localStorage.getItem(prefix);
    const keys: string[] = storedKeys === null ? [] : JSON.parse(storedKeys);
    if (!keys.includes(key)) {
      keys.push(key);
      localStorage.setItem(prefix, JSON.stringify(keys));
    }
    localStorage.setItem(addPrefix(key), json);
  }

  unset(key: string): boolean {
    // Remove it before we do anything else.
    localStorage.remove(addPrefix(key));

    // Then remove it from the list of keys.
    const storedKeys = localStorage.getItem(prefix);
    const keys: string[] = storedKeys === null ? [] : JSON.parse(storedKeys);
    const index = keys.indexOf(key);

    // If it doesn't exist we don't have to remove it.
    if (index === -1) return false;

    keys.splice(index, 1);
    localStorage.setItem(prefix, JSON.stringify(keys));
    return true;
  }
}

export const useStore = (): Store => {
  if (!instance) {
    instance = new Store();
  }
  return instance;
};
