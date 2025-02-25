'use server';

import { CardProps } from '@/type';
import { readFile } from 'fs/promises';
import { NextResponse } from 'next/server';
import { shuffle } from '@/utils';

export async function GET(req: Request) {
	const url = new URL(req.url);
	const { searchParams } = url;
	const deck_id = searchParams.get('deck_id');
	const counts = searchParams.get('count');
	const range = searchParams.get('range');
	if (!deck_id) {
		return new Response('deck_id is required', { status: 400 });
	}
	const count = Number(counts) ?? 15;
	const wordRange =
		range && range.split('-').length === 2 ? range.split('-') : null;
	if (wordRange && wordRange.length !== 2) {
		return new Response('range must be in the format of "a-z"', {
			status: 400,
		});
	}

	let words: string[][];
	try {
		const fileContent = await readFile('data_process/sch.json', 'utf-8');
		words = JSON.parse(fileContent);
		// eslint-disable-next-line @typescript-eslint/no-unused-vars
	} catch (e) {
		return new Response('Error reading or parsing file', { status: 500 });
	}
	const result = shuffle(
		words.filter((word) => {
			if (!wordRange) return true;
			if (wordRange[0] === wordRange[1])
				return word[0].split('')[0] === wordRange[0];
			return RegExp(`^([${wordRange[0]}-${wordRange[1]}]).*+`).test(word[0]);
		}),
	)
		.slice(0, count)
		.map((word) => simpleWordToCard(word[0], word[1]));

	return NextResponse.json(result);
}

const simpleWordToCard = (word: string, mean: string): CardProps => {
	return {
		word,
		phonetic: '',
		blocks: [
			{
				definitions: [
					{
						definition: [
							{
								lang: 'tw',
								content: mean,
							},
						],
					},
				],
			},
		],
		flipped: false,
	};
};
