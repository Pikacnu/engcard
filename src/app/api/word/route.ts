import DB from '@/lib/db';
import { CardProps } from '@/type';
import {
	isChinese,
	isEnglish,
	isJapanese,
	OpenAIClient,
	OpenAIHistoryTranscriber,
} from '@/utils';
import {
	wordGeminiHistory,
	wordSystemInstruction,
	WordModel,
	wordSchema,
} from '@/utils';
import {
	getWordFromDictionaryAPI,
	getWordFromEnWordNetAPU,
} from '@/utils/dict/functions';
import { NextResponse } from 'next/server';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';

export async function GET(request: Request): Promise<Response> {
	const { searchParams } = new URL(request.url);
	let word = searchParams.get('word');
	if (!word) {
		return NextResponse.json({ error: 'Word is required' }, { status: 400 });
	}

	if (!(isChinese(word.trim()) || isEnglish(word.trim()))) {
		return NextResponse.json({ error: 'Word is not valid' }, { status: 400 });
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
	let data;
	if (isJapanese(word)) {
		data = await getAIResponse(word);
	} else {
		data = await newWord(word);
	}
	if (!data) {
		await db.insertOne({ word, available: false });
		return NextResponse.json({ error: 'Word not found' }, { status: 404 });
	}

	await db.insertOne(data);
	return NextResponse.json(data, { status: 200 });
}

async function newWord(word: string): Promise<CardProps | null> {
	const sourceDataPromiseList = [
		getWordFromDictionaryAPI(word),
		getWordFromEnWordNetAPU(word),
	];
	const sourceDataList = (await Promise.all(sourceDataPromiseList)).filter(
		(data) => data !== null,
	) as CardProps[];
	if (sourceDataList.length < 1) {
		return await getAIResponse(word);
	}
	return await getAIResponse(sourceDataList);
}

function CheckData(apidata: CardProps, aidata: CardProps) {
	let result = aidata;
	if (
		aidata.phonetic === '' ||
		aidata.phonetic === undefined ||
		aidata.phonetic === 'string'
	) {
		result = Object.assign(result, {
			phonetic: apidata.phonetic,
		});
	}
	if (
		aidata.audio === '' ||
		aidata.audio === undefined ||
		aidata.audio === 'string'
	) {
		result = Object.assign(result, {
			audio: apidata.audio,
		});
	}
	return result;
}

async function getAIResponse(
	processedData: CardProps | CardProps[] | string,
): Promise<CardProps> {
	let AIResponse;
	let prompt;
	const isProvidedData =
		typeof processedData === 'object' || Array.isArray(processedData);

	if (isProvidedData) {
		if (Array.isArray(processedData)) {
			prompt = `data : ${JSON.stringify(processedData).replaceAll('"', '')}
				it have ${processedData.length} data sources
				and total ${processedData.reduce(
					(acc, data) => acc + data.blocks.length,
					0,
				)} blocks(part of speech)
				Please response with all the blocks
				And combine all the data into one data (from all the data sources)`;
		} else {
			processedData = processedData as CardProps;
			prompt = `data : ${JSON.stringify(processedData)}
				it have ${processedData.blocks.length} blocks(part of speech)
				Please response with all the blocks`;
		}
	} else {
		prompt = `word : ${processedData} Please response with all the blocks`;
	}

	try {
		AIResponse = await OpenAIClient.beta.chat.completions.parse({
			model: 'gpt-4.1-nano',
			messages: [
				{
					role: 'system',
					content: wordSystemInstruction,
				},
				...OpenAIHistoryTranscriber(wordGeminiHistory),
				{
					role: 'user',
					content: prompt,
				},
			],
			response_format: zodResponseFormat(wordSchema, 'data'),
		});
		console.log(AIResponse.usage);
		const result: CardProps = AIResponse.choices[0].message
			?.parsed as CardProps;
		console.log('OpenAI SDK Success');
		if (isProvidedData) {
			if (Array.isArray(processedData)) {
				return CheckData(processedData[0], result);
			}
			processedData = processedData as CardProps;
			return CheckData(processedData, result);
		}
		return result;
	} catch (error) {
		console.error('OpenAI SDK Error :', error);
		console.log('trying by google AI SDK');
		try {
			const chat = WordModel.startChat({
				history: wordGeminiHistory,
			});
			AIResponse = await chat.sendMessage(prompt);
			const result: CardProps = JSON.parse(AIResponse.response.text());
			console.log('Google AI SDK Success');
			if (isProvidedData) {
				if (Array.isArray(processedData)) {
					return CheckData(processedData[0], result);
				}
				processedData = processedData as CardProps;
				return CheckData(processedData, result);
			}
			return result;
		} catch (error) {
			console.error('Error parsing AI response:', error);
		}
	}
	if (typeof processedData === 'string') {
		console.log('Error: No data found');
	}
	return processedData as CardProps;
}
