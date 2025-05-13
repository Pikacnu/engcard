import { useCallback, useMemo } from 'react';

export function useDebounce(delay = 1000): (fn: () => void) => void {
	const debounce = useCallback(() => {
		let timeoutId: NodeJS.Timeout | null = null;

		return (fn: () => void) => {
			if (timeoutId) {
				clearTimeout(timeoutId);
			}
			timeoutId = setTimeout(() => {
				fn();
			}, delay);
		};
	}, [delay]);

	const debounceFunction = useMemo(() => debounce(), [debounce]);
	return debounceFunction;
}
