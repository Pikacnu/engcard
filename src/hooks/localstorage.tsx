import { useState } from 'react';

export function useLocalStorage<T>(
	key: string,
	initialValue: T,
	forceType?: string,
) {
	const [storedValue, setStoredValue] = useState<T>(() => {
		if (typeof window === 'undefined') {
			return initialValue;
		}
		try {
			const item = window.localStorage.getItem(key);
			const type = forceType || typeof initialValue;
			switch (type) {
				case 'object':
					if (item === null) {
						return initialValue;
					}
					return item ? JSON.parse(item) : initialValue;

				case 'string':
					if (item === null) {
						return '';
					}
					return item.replaceAll(/["\\]/g, '') || '';
				case 'number':
					if (item === null) {
						return 0;
					}
					return item ? Number(item) : 0;
				case 'boolean':
					if (item === null) {
						return false;
					}
					return item ? JSON.parse(item) : false;
			}
		} catch (error) {
			console.error(`Error reading localStorage key “${key}”:`, error);
			return initialValue;
		}
	});

	const setValue = (value: T | ((val: T) => T)) => {
		try {
			console.log(`Setting localStorage key “${key}” to`, value);
			const valueToStore =
				value instanceof Function ? value(storedValue) : value;
			setStoredValue(valueToStore);
			if (typeof window !== 'undefined') {
				window.localStorage.setItem(key, JSON.stringify(valueToStore));
			}
		} catch (error) {
			console.error(`Error setting localStorage key “${key}”:`, error);
		}
	};

	return [storedValue, setValue] as const;
}
