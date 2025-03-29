import {
	auth,
	TextRecognizeModel,
	TextRecognizeSchema,
	uploadFile,
} from '@/utils';
import { NextResponse } from 'next/server';
import { GET } from '@/app/api/word/route';
import { Deck, Word } from '@/type';
import db from '@/lib/db';
import { ObjectId } from 'mongodb';
import { ExtenstionTable } from '@/type';

export async function POST(req: Request) {
	const session = await auth();
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}
	const url = new URL(req.url);
	const searchParams = url.searchParams;
	const deckId = searchParams.get('deckId')?.trim();

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

	const imageData = await req.blob();
	const imageType = imageData.type || req.headers.get('content-type') || '';
	//const fileext = ExtenstionTable.get(imageType);
	//const filename = `ocr${Date.now()}.${fileext}`;
	if (!ExtenstionTable.has(imageType)) {
		return NextResponse.json({ error: 'Invalid image type' }, { status: 400 });
	}

	//if file is larger than 7MB
	if (imageData.size > 7_000_000) {
		return NextResponse.json(
			{ error: 'File is too large, max size is 7MB' },
			{ status: 400 },
		);
	}
	console.log(imageType);
	/*
	await writeFile(
		`./public/gemini-data/${filename}`,
		Buffer.from(await imageData.arrayBuffer()),
	);*/

	try {
		/*
		const res = await fetch('http://192.168.0.226:8787/api/ocr', {
			method: 'POST',
			headers: {
				'Content-Type': imageData.type,
			},
			body: new Blob([imageData], { type: imageData.type }),
		});
		if (!res.ok) {
			throw new Error('Failed to upload image');
		}
		*/
		const fileData = await uploadFile(imageData, imageType);
		const response = await TextRecognizeModel.generateContent({
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
		const result = JSON.parse(response.response.text()) as TextRecognizeSchema;

		result.words.map((word, index) => {
			setTimeout(async () => {
				await GET(
					new Request(`http://localhost:3000/api/word?word=${word.word}`),
				);
				const wordData = await db
					.collection<Word>('words')
					.findOne({ word: word.word });
				if (wordData) {
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
			}, index * 2.5 * 1_000);
		});
		/*
		await unlink(`./public/gemini-data/${filename}`);
		*/
		return NextResponse.json(
			{
				message: 'Image uploaded successfully',
			},
			{ status: 200 },
		);
	} catch (e) {
		console.log(e);
		/*await unlink(`./public/gemini-data/${filename}`);*/
		return NextResponse.json(
			{ error: 'Failed to upload image' },
			{ status: 500 },
		);
	}
}
