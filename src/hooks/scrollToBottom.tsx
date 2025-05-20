import { useState, useEffect } from 'react';

export function useScrollToBottom(
	ref: React.RefObject<HTMLDivElement | null>,
	dependencies: unknown[] = [],
) {
	const [isAtBottom, setIsAtBottom] = useState(true);

	useEffect(() => {
		if (ref.current) {
			const handleScroll = () => {
				const { scrollTop, scrollHeight, clientHeight } =
					ref.current as HTMLDivElement;
				setIsAtBottom(scrollTop + clientHeight >= scrollHeight);
			};

			const currentRef = ref.current;
			currentRef.addEventListener('scroll', handleScroll);

			return () => {
				currentRef.removeEventListener('scroll', handleScroll);
			};
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [ref, ...dependencies]);

	return isAtBottom;
}
