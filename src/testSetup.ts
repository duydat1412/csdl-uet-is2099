import '@testing-library/jest-dom';

if (
  typeof window !== 'undefined' &&
  (!window.localStorage || typeof window.localStorage.getItem !== 'function')
) {
  const store = new Map<string, string>();
  const mockStorage: Storage = {
    get length() {
      return store.size;
    },
    clear() {
      store.clear();
    },
    getItem(key: string) {
      return store.has(key) ? store.get(key) ?? null : null;
    },
    key(index: number) {
      return Array.from(store.keys())[index] ?? null;
    },
    removeItem(key: string) {
      store.delete(key);
    },
    setItem(key: string, value: string) {
      store.set(key, String(value));
    },
  };

  Object.defineProperty(window, 'localStorage', {
    value: mockStorage,
    configurable: true,
    writable: true,
  });
}

// JSDOM omits ElementCSSInlineStyle (.style) on MathML (<math>, <mi>, ...) emitted by KaTeX,
// causing dom-accessibility-api's getComputedStyle() calls during getByRole() queries to throw.
if (typeof window !== 'undefined' && typeof window.getComputedStyle === 'function') {
  const originalGetComputedStyle = window.getComputedStyle.bind(window);
  const fallbackStyleTarget = document.createElement('span');
  window.getComputedStyle = (elt: Element, pseudoElt?: string | null) => {
    if (elt && (elt as Partial<HTMLElement>).style == null) {
      return originalGetComputedStyle(fallbackStyleTarget, pseudoElt);
    }
    return originalGetComputedStyle(elt, pseudoElt);
  };
}
