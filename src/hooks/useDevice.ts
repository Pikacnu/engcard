import { useEffect, useState } from 'react';

export function useDevice() {
	const isMobile = useMediaQuery('(max-width: 768px)');
	const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)');
	const isDesktop = useMediaQuery('(min-width: 1025px)');

	return {
		isMobile,
		isTablet,
		isDesktop,
	};
}

function useMediaQuery(query: string) {
	const [matches, setMatches] = useState(false);

	useEffect(() => {
		const media = window.matchMedia(query);
		if (media.matches !== matches) {
			setMatches(media.matches);
		}

		const listener = () => setMatches(media.matches);
		media.addEventListener('change', listener);

		return () => media.removeEventListener('change', listener);
	}, [matches, query]);

	return matches;
}
