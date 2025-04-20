export function shuffle<T>(array: T[]): T[] {
	const result = [...array];
	for (let i = result.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[result[i], result[j]] = [result[j], result[i]];
	}
	return result;
}

export function isChinese(str: string): boolean {
	return /[\u4E00-\u9FA5\uF900-\uFA2D]/.test(str);
}

export function isHavingSpace(str: string): boolean {
	return /\s/.test(str);
}

export function isJapanese(str: string): boolean {
	return /[ぁ-ゔゞァ-・ヽヾ゛゜ー]/.test(str);
}

export function isEnglish(str: string): boolean {
	return /^[a-zA-Z]+$/.test(str);
}
