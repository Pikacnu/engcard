import DB from '@/lib/db';
import { CardProps, PartOfSpeech, DictionaryAPIData, Lang } from '@/type';
import { NextResponse } from 'next/server';

export async function GET(request: Request): Promise<Response> {
	const { searchParams } = new URL(request.url);
	let word = searchParams.get('word');
	if (!word) {
		return NextResponse.json({ error: 'Word is required' }, { status: 400 });
	}
	word = word.trim().toLowerCase();
	const db = DB.collection('words');
	const result = await db.findOne({ word });
	if (result) {
		if (result.avliable === false) {
			return NextResponse.json({ error: 'Word not found' }, { status: 404 });
		}
		return NextResponse.json(result, { status: 200 });
	}

	const data = await newWord(word);
	if (!data) {
		await db.insertOne({ word, avliable: false });
		return NextResponse.json({ error: 'Word not found' }, { status: 404 });
	}

	await db.insertOne(data);
	return NextResponse.json(data, { status: 200 });
}

async function newWord(word: string): Promise<CardProps | null> {
	const response = await fetch(
		`https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
	);
	if (!response.ok) {
		return null;
	}
	const dataList = (await response.json()) as DictionaryAPIData[];
	const data = dataList[0];
	const processedData: CardProps = {
		word: data.word,
		phonetic: data.phonetic,
		blocks: data.meanings.map((meaning) => ({
			partOfSpeech: meaning.partOfSpeech as PartOfSpeech,
			definitions: meaning.definitions.map((definition) => {
				const data = {
					definition: [
						{
							lang: 'en' as Lang,
							content: definition.definition,
						},
					],
					synonyms: definition.synonyms || [],
					antonyms: definition.antonyms || [],
				};
				if (definition.example) {
					return Object.assign(data, {
						example: [
							[
								{
									lang: 'en',
									content: definition.example,
								},
							],
						],
					});
				}
				return data;
			}),
		})),
	};
	return processedData;
}
