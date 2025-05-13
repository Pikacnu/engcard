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
	Word,
} from '@/type';
import db from '@/lib/db';
import { ObjectId } from 'mongodb';

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
	//const fileext = ExtenstionTable.get(imageType);
	//const filename = `ocr${Date.now()}.${fileext}`;
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
	//console.log(imageType);
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
		const binaryData = new Uint8Array(await imageData.arrayBuffer());
		const fileData = await uploadFile(
			binaryData,
			ExtenstionToMimeType.get(imageType) as string,
		);
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
		const result = JSON.parse(response.response.text()) as textRecognizeSchema;

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
