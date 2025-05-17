import { useState } from 'react';

export function useCopyToClipboard() {
	const [isCopied, setIsCopied] = useState(false);
	const [isCopying, setIsCopying] = useState(false);

	const copyToClipboard = async (text: string) => {
		setIsCopying(true);
		try {
			await navigator.clipboard.writeText(text);
			setIsCopied(true);
		} catch (error) {
			console.error('Failed to copy text: ', error);
		} finally {
			setIsCopying(false);
			setTimeout(() => setIsCopied(false), 2000);
		}
	};

	return { isCopied, isCopying, copyToClipboard };
}
