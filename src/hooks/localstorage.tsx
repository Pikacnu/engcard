import { useCallback, useRef, useSyncExternalStore } from 'react';

const subscribe = (onStoreChange: () => void) => {
  window.addEventListener('storage', onStoreChange);
  window.addEventListener('local-storage', onStoreChange);
  return () => {
    window.removeEventListener('storage', onStoreChange);
    window.removeEventListener('local-storage', onStoreChange);
  };
};

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  forceType?: string,
) {
  const cacheValue = useRef<{
    key: string;
    raw: string | null;
    parsed: T;
  } | null>(null);

  const getSnapshot = useCallback(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const raw = window.localStorage.getItem(key);

      if (
        cacheValue.current &&
        cacheValue.current.key === key &&
        cacheValue.current.raw === raw
      ) {
        return cacheValue.current.parsed;
      }

      let parsed: T;
      const type = forceType || typeof initialValue;

      if (raw === null) {
        switch (type) {
          case 'object':
            parsed = initialValue;
            break;
          case 'string':
            parsed = '' as unknown as T;
            break;
          case 'number':
            parsed = 0 as unknown as T;
            break;
          case 'boolean':
            parsed = false as unknown as T;
            break;
          default:
            parsed = initialValue;
        }
      } else {
        switch (type) {
          case 'object':
            parsed = JSON.parse(raw);
            break;
          case 'string':
            parsed = (raw.replaceAll(/["\\]/g, '') || '') as unknown as T;
            break;
          case 'number':
            parsed = Number(raw) as unknown as T;
            break;
          case 'boolean':
            parsed = JSON.parse(raw);
            break;
          default:
            parsed = raw as unknown as T;
        }
      }

      cacheValue.current = { key, raw, parsed };
      return parsed;
    } catch (error) {
      console.error(`Error reading localStorage key “${key}”:`, error);
      return initialValue;
    }
  }, [key, initialValue, forceType]);

  const getServerSnapshot = useCallback(() => initialValue, [initialValue]);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setValue = useCallback(
    (newValue: T | ((val: T) => T)) => {
      try {
        const current = getSnapshot();
        const valueToStore =
          newValue instanceof Function ? newValue(current) : newValue;

        if (typeof window !== 'undefined') {
          console.log(`Setting localStorage key “${key}” to`, valueToStore);
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          window.dispatchEvent(new Event('local-storage'));
        }
      } catch (error) {
        console.error(`Error setting localStorage key “${key}”:`, error);
      }
    },
    [key, getSnapshot],
  );

  return [value, setValue] as const;
}
