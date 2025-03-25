import DB from '@/lib/db';
import { CardProps, PartOfSpeech, DictionaryAPIData, Lang } from '@/type';
import { isChinese } from '@/utils';
import {
	aiClient,
	GeminiHistory,
	OpenAIHistory,
	systemInstruction,
	WordModel,
	wordSchema,
} from '@/utils/gemini';
import { NextResponse } from 'next/server';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';

export async function GET(request: Request): Promise<Response> {
	const { searchParams } = new URL(request.url);
	let word = searchParams.get('word');
	if (!word) {
		return NextResponse.json({ error: 'Word is required' }, { status: 400 });
	}
	const db = DB.collection('words');
	if (isChinese(word)) {
		const result = await db.find({ zh: { $in: [word] } }).toArray();
		if (result.length < 0) {
			return NextResponse.json({ error: 'Word not found' }, { status: 404 });
		}
		const words = result.filter(
			(word) => word.avliable !== false || !word.avliable,
		);
		if (words.length < 1) {
			return NextResponse.json({ error: 'Word not found' }, { status: 404 });
		}
		if (result.length === 1) {
			return NextResponse.json(result[0], { status: 200 });
		}
		return NextResponse.json(words, { status: 200 });
	}
	/*
	if (isHavingSpace(word)) {
		fetch(`https://api.us.app.phrase.com/v2`, {
			headers: {
				'User-Agent':
					'FlashCard App by Pikacnu - cardlisher (pika@mail.pikacnu.com)',
			},
		});
	}*/

	word = word.trimEnd().trimStart().toLowerCase();
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
	let AIResponse;
	try {
		AIResponse = await aiClient.beta.chat.completions.parse({
			model: 'gemini-2.0-flash',
			messages: [
				{
					role: 'system',
					content: systemInstruction,
				},
				...OpenAIHistory,
				{
					role: 'user',
					content: `data : ${JSON.stringify(processedData)}
				it have ${processedData.blocks.length} blocks(part of speech)
				Please response with all the blocks`,
				},
			],
			response_format: zodResponseFormat(wordSchema, 'data'),
		});
		const result: CardProps = AIResponse.choices[0].message
			?.parsed as CardProps;
		return result;
	} catch (error) {
		console.error('OpenAI SDK Error :', error);
		console.log('trying by google AI SDK');
		try {
			const chat = WordModel.startChat({
				history: GeminiHistory,
			});
			AIResponse = await chat.sendMessage(`
				data : ${JSON.stringify(processedData)}
				it have ${processedData.blocks.length} blocks(part of speech)
				Please response with all the blocks
				`);
			const result: CardProps = JSON.parse(AIResponse.response.text());
			return result;
		} catch (error) {
			console.error('Error parsing AI response:', error);
		}
	}
	return processedData;
}
