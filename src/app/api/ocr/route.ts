import {
	auth,
	TextRecognizeModel,
	TextRecognizeSchema,
	uploadToGemini,
} from '@/utils';
import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { unlink } from 'fs/promises';
import { GET } from '../word/route';

const ExtenstionTable = new Map([
	['image/jpeg', 'jpg'],
	['image/png', 'png'],
]);

export async function POST(req: Request) {
	return NextResponse.json({ error: 'Not implemented' }, { status: 501 });
	const session = await auth();
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}
	try {
		const imageData = await req.blob();
		if (!ExtenstionTable.has(imageData.type)) {
			return NextResponse.json(
				{ error: 'Invalid image type' },
				{ status: 400 },
			);
		}
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

		const fileext = ExtenstionTable.get(imageData.type);
		const filename = `ocr${Date.now()}.${fileext}`;
		await writeFile(
			`./public/gemini-data/${filename}`,
			Buffer.from(await imageData.arrayBuffer()),
		);
		const uploadedFile = await uploadToGemini(
			`./public/gemini-data/${filename}`,
			imageData.type,
		);
		const response = await TextRecognizeModel.generateContent({
			contents: [
				{
					role: 'user',
					parts: [
						{
							fileData: {
								mimeType: uploadedFile.mimeType,
								fileUri: uploadedFile.uri,
							},
						},
					],
				},
			],
		});
		const result = JSON.parse(response.response.text()) as TextRecognizeSchema;
		result.words.forEach((word, index) => {
			setTimeout(() => {
				GET(new Request(`http://localhost:3000/api/word?word=${word.word}`));
			}, index * 2.5 * 1_000);
		});
		await unlink(`./public/gemini-data/${filename}`);
		return NextResponse.json(result, { status: res.status });
	} catch (e) {
		console.log(e);
		return NextResponse.json(
			{ error: 'Failed to upload image' },
			{ status: 500 },
		);
	}
}
