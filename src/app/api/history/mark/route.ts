import db from '@/lib/db';
import { DeckCollection, MarkAsNeedReview, MarkWordData } from '@/type';
import { auth } from '@/utils';
import { ObjectId } from 'mongodb';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
	const {
		word,
		deckId,
	}: {
		word: string;
		deckId: string;
	} = await req.json();
	if (!word || !deckId) {
		return NextResponse.json(
			{ error: 'DeckId and word are required' },
			{ status: 400 },
		);
	}
	const session = await auth();
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}
	const markedWord: MarkWordData = {
		word: word,
		deckId: deckId,
	};
	const data = await db
		.collection<MarkAsNeedReview>('markAsNeedReview')
		.updateOne(
			{
				userId: session.user?.id,
				word: { $not: { $elemMatch: markedWord } },
			},
			{
				$set: {
					userId: session.user?.id,
				},
				$push: {
					word: markedWord,
				},
				$inc: { count: 1 },
			},
			{
				upsert: true,
			},
		);

	if (!data) {
		return NextResponse.json({ error: 'Data not found' }, { status: 404 });
	}
	return NextResponse.json(
		{ message: 'Word marked successfully' },
		{ status: 200 },
	);
}

export async function DELETE(req: Request) {
	const {
		word,
		deckId,
	}: {
		word: string;
		deckId: string;
	} = await req.json();
	if (!word || !deckId) {
		return NextResponse.json(
			{ error: 'DeckId and word are required' },
			{ status: 400 },
		);
	}
	const session = await auth();
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}
	const markedWord: MarkWordData = {
		word: word,
		deckId: deckId,
	};
	const data = await db
		.collection<MarkAsNeedReview>('markAsNeedReview')
		.findOneAndUpdate(
			{
				userId: session.user?.id,
			},
			{
				$pull: {
					word: markedWord,
				},
				$inc: { count: -1 },
			},
			{
				returnDocument: 'after',
			},
		);
	if (!data) {
		return NextResponse.json({ error: 'Data not found' }, { status: 404 });
	}
	return NextResponse.json(
		{ message: 'Word unmarked successfully' },
		{ status: 200 },
	);
}

export async function GET(req: Request) {
	const url = new URL(req.url);

	const session = await auth();
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const deckId = url.searchParams.get('deckId');
	if (!deckId) {
		const markedWordData = await db
			.collection<MarkAsNeedReview>('markAsNeedReview')
			.findOne({ userId: session.user?.id });
		if (!markedWordData) {
			return NextResponse.json({ error: 'Data not found' }, { status: 404 });
		}
		const deckIds = [...new Set(markedWordData.word.map((w) => w.deckId))];
		const words = await db
			.collection<DeckCollection>('deck')
			.aggregate([
				{
					$addFields: {
						deckId: { $toString: '$_id' },
					},
				},
				{
					$match: {
						deckId: { $in: deckIds },
					},
				},
				{
					$addFields: {
						// 先取得當前 deck 的標記單字
						markedWordsForThisDeck: {
							$map: {
								input: {
									$filter: {
										input: markedWordData.word,
										as: 'w',
										cond: {
											$eq: ['$$w.deckId', '$deckId'],
										},
									},
								},
								as: 'markedWord',
								in: '$$markedWord.word',
							},
						},
					},
				},
				{
					$addFields: {
						cards: {
							$filter: {
								input: '$cards',
								as: 'card',
								cond: {
									$in: ['$$card.word', '$markedWordsForThisDeck'],
								},
							},
						},
					},
				},
				{
					$project: {
						markedWordsForThisDeck: 0, // 移除臨時欄位
					},
				},
			])
			.toArray();
		const allWords = words.flatMap((deck) => deck.cards);
		return NextResponse.json({ words: allWords }, { status: 200 });
	}
	const userId = session.user?.id;
	const markedWords = await db
		.collection<MarkAsNeedReview>('markAsNeedReview')
		.findOne({ userId: userId });
	if (!markedWords) {
		return NextResponse.json({ error: 'Data not found' }, { status: 404 });
	}
	const cardDatas = await db.collection<DeckCollection>('deck').findOne(
		{
			_id: new ObjectId(deckId),
			userId: userId,
		},
		{
			projection: {
				cards: {
					$filter: {
						input: '$cards',
						as: 'card',
						cond: {
							$in: [
								'$$card.word',
								markedWords.word
									.filter((w) => w.deckId === deckId)
									.map((w) => w.word),
							],
						},
					},
				},
			},
		},
	);
	if (!cardDatas) {
		return NextResponse.json({ error: 'No cards found' }, { status: 404 });
	}
	const words = cardDatas.cards.map((card) => card);
	return NextResponse.json({ words: words }, { status: 200 });
}
