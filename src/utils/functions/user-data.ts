import { CardProps } from '@/type';

export const saveHistory = async (
	words: string[],
	deckId: string,
	userId?: string,
) => {
	await fetch('/api/history', {
		method: 'POST',
		body: JSON.stringify({ words, deckId, userId }),
		headers: {
			'Content-Type': 'application/json',
		},
	});
};

export const getMarkWords = async (
	deckId: string,
): Promise<{
	words: CardProps[];
}> => {
	const response = await fetch('/api/history/mark?deckId=' + deckId);
	if (!response.ok) {
		return { words: [] };
	}
	return await response.json();
};

export const removeMarkWord = async (word: string, deckId: string) => {
	await fetch('/api/history/mark', {
		method: 'DELETE',
		body: JSON.stringify({ word, deckId }),
		headers: {
			'Content-Type': 'application/json',
		},
	});
};

export const removeMarkWordsByWord = async (deckId: string) => {
	await fetch('/api/history/mark', {
		method: 'DELETE',
		body: JSON.stringify({ deckId }),
		headers: {
			'Content-Type': 'application/json',
		},
	});
};

export const addMarkWord = async (word: string, deckId: string) => {
	await fetch('/api/history/mark', {
		method: 'POST',
		body: JSON.stringify({ word, deckId }),
		headers: {
			'Content-Type': 'application/json',
		},
	});
};
