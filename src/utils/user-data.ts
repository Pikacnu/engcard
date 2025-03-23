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
