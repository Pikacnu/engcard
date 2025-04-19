import db from '@/lib/db';
import { MarkAsNeedReview } from '@/type';
import { auth } from '@/utils';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
	const { word } = await req.json();
	if (!word) {
		return NextResponse.json(
			{ error: 'DeckId and word are required' },
			{ status: 400 },
		);
	}
	const session = await auth();
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}
	const data = await db
		.collection<MarkAsNeedReview>('markAsNeedReview')
		.findOneAndUpdate(
			{
				userId: session.user?.id,
				word: word,
			},
			{
				$set: {
					userId: session.user?.id,
					word: word,
				},
				$inc: {
					count: 1,
				},
			},
			{
				upsert: true,
				returnDocument: 'after',
			},
		);
	if (!data) {
		return NextResponse.json({ error: 'Data not found' }, { status: 404 });
	}
	return NextResponse.json(
		Object.assign(data, {
			id: data._id.toString(),
		}),
		{ status: 200 },
	);
}

export async function GET() {
	return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}
