import {
	auth,
	Base64ToFile,
	TextRecognizeModel,
	textRecognizeSchema,
	uploadFile,
} from '@/utils';
import { NextResponse } from 'next/server';
import { GET } from '@/app/api/word/route';
import {
	allowedImageExtension,
	Deck,
	ExtenstionTable,
	ExtenstionToMimeType,
	OCRProcessType,
	UserSettingsCollection,
	WithAvliable,
	Word,
} from '@/type';
import db from '@/lib/db';
import { ObjectId } from 'mongodb';
import {
	getDefiniationFromRecognizedResultAndCardProps,
	transfromToCardPropsFromRecognizedResult,
} from '@/utils/dict/functions';
import { FinishReason } from '@google/generative-ai';

export async function POST(req: Request) {
	const session = await auth();
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const url = new URL(req.url);
	const params = url.searchParams;

	const deckId = params.get('deckId') as string;

	if (!deckId) {
		return NextResponse.json({ error: 'DeckId is required' }, { status: 400 });
	}

	const deck = await db
		.collection<Deck>('deck')
		.findOne({ _id: new ObjectId(deckId), userId: session.user?.id });

	if (!deck) {
		return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
	}

	if (deck.userId !== session.user?.id) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	let imageData;

	if (req.headers.get('content-type')?.includes('base64')) {
		const { base64, filename, mimeType } = await req.json();
		if (!base64 || !filename || !mimeType) {
			return NextResponse.json(
				{ error: 'Need three arguments' },
				{ status: 400 },
			);
		}
		const imageData = Base64ToFile(base64, filename, mimeType);
		if (!imageData) {
			return NextResponse.json({ error: 'Image is required' }, { status: 400 });
		}
	} else {
		imageData = (await req.blob()) as Blob;
		console.log(imageData);
		if (!imageData) {
			return NextResponse.json({ error: 'Image is required' }, { status: 400 });
		}
	}

	if (!imageData) {
		return NextResponse.json({ error: 'Image is required' }, { status: 400 });
	}

	const imageType =
		(ExtenstionTable.get(imageData.type) as string) ||
		(req.headers.get('content-type') as string);

	console.log(imageType);
	if (!allowedImageExtension.includes(imageType)) {
		return NextResponse.json({ error: 'Invalid image type' }, { status: 400 });
	}

	//if file is larger than 7MB
	if (imageData.size > 7_000_000) {
		return NextResponse.json(
			{ error: 'File is too large, max size is 7MB' },
			{ status: 400 },
		);
	}

	const settings = await db
		.collection<UserSettingsCollection>('settings')
		.findOne({
			userId: session.user?.id,
		});
	let processType = settings?.ocrProcessType;
	if (processType === undefined || processType === null) {
		processType = OCRProcessType.FromSource;
	}

	try {
		const binaryData = new Uint8Array(await imageData.arrayBuffer());
		const fileData = await uploadFile(
			binaryData,
			ExtenstionToMimeType.get(imageType) as string,
		);
		let response = await TextRecognizeModel.generateContent({
			contents: [
				{
					role: 'user',
					parts: [
						{
							fileData: {
								mimeType: fileData.file.mimeType,
								fileUri: fileData.file.uri,
							},
						},
					],
				},
			],
		});
		let part = '';
		while (true) {
			if (!response.response.candidates) {
				return NextResponse.json(
					{ error: 'Failed to recognize text' },
					{ status: 500 },
				);
			}
			if (response.response.candidates[0].finishReason !== FinishReason.STOP) {
				part += response.response.text();
				response = await TextRecognizeModel.generateContent({
					contents: [
						{
							role: 'user',
							parts: [
								{
									fileData: {
										mimeType: fileData.file.mimeType,
										fileUri: fileData.file.uri,
									},
								},
							],
						},
						{
							role: 'assistant',
							parts: [
								{
									text: part,
								},
							],
						},
						{
							role: 'user',
							parts: [
								{
									text: 'Continue from where you left off. Do not repeat any previous content.',
								},
							],
						},
					],
				});
				continue;
			}
			part += response.response.text();
			break;
		}

		const result: textRecognizeSchema = textRecognizeSchema.parse(
			JSON.parse(part),
		);

		if (processType === OCRProcessType.OnlyFromImage) {
			const words = transfromToCardPropsFromRecognizedResult(result);
			await db.collection<Deck>('deck').findOneAndUpdate(
				{ _id: new ObjectId(deckId), userId: session.user?.id },
				{
					$push: {
						cards: {
							$each: words.map((word) => ({
								word: word.word,
								phonetic: word.phonetic,
								blocks: word.blocks,
							})),
						},
					},
				},
				{ upsert: true },
			);
			return NextResponse.json(
				{
					message: 'Image uploaded successfully',
				},
				{ status: 200 },
			);
		}
		result.words.forEach((word, index) => {
			setTimeout(async () => {
				await GET(
					new Request(`http://localhost:3000/api/word?word=${word.word}`),
				);
				const wordData = await db
					.collection<WithAvliable<Word>>('words')
					.findOne({ word: word.word });
				if (
					(wordData?.available !== undefined && wordData.available !== true) ||
					!wordData
				)
					return;
				if (settings?.ocrProcessType === OCRProcessType.FromSource) {
					await db.collection<Deck>('deck').findOneAndUpdate(
						{ _id: new ObjectId(deckId), userId: session.user?.id },
						{
							$push: {
								cards: {
									word: wordData.word,
									phonetic: wordData.phonetic,
									blocks: wordData.blocks,
								},
							},
						},
					);
				}
				if (
					settings?.ocrProcessType ===
					OCRProcessType.FromSourceButOnlyDefinitionFromImage
				) {
					const porcessedWordData =
						getDefiniationFromRecognizedResultAndCardProps(
							{
								word: wordData.word,
								phonetic: wordData.phonetic,
								blocks: wordData.blocks,
								audio: '',
							},
							result,
						);
					if (!porcessedWordData) return;
					if (
						!Array.isArray(porcessedWordData.blocks) ||
						porcessedWordData.blocks.length <= 0
					)
						return;
					await db.collection<Deck>('deck').findOneAndUpdate(
						{ _id: new ObjectId(deckId), userId: session.user?.id },
						{
							$push: {
								cards: {
									word: porcessedWordData.word,
									phonetic: porcessedWordData.phonetic,
									blocks: porcessedWordData.blocks,
								},
							},
						},
					);
				}
			}, index * 1.5 * 1_000);
			return NextResponse.json(
				{
					message: 'Image uploaded successfully',
					time: result.words.length * 2,
				},
				{ status: 200 },
			);
		});
		return NextResponse.json({
			error: 'No words found in the image',
		});
	} catch (e) {
		console.log(e);
		return NextResponse.json(
			{ error: 'Failed to upload image' },
			{ status: 500 },
		);
	}
}
