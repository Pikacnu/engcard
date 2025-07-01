import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/auth';
import db from '@/lib/db';
import { ObjectId, WithId } from 'mongodb';
import { CardProps, Deck, DeckCollection } from '@/type';
import { shuffle } from '@/utils';

export async function GET(request: NextRequest) {
	const url = new URL(request.url);
	const params = url.searchParams;
	const id = params.get('id');
	if (!id)
		return NextResponse.json(
			{
				error: 'Please Provide Deck ID',
			},
			{
				status: 400,
			},
		);

	const deck = (await db.collection<DeckCollection>('deck').findOne({
		_id: new ObjectId(id),
	})) as WithId<Deck>;

	if (!deck) {
		return NextResponse.json({ error: 'Deck Not Found' }, { status: 404 });
	}

	if (deck.isPublic) {
		return NextResponse.json(
			Object.assign(deck, {
				_id: deck._id.toString(),
			}),
			{ status: 200 },
		);
	}

	const user = await auth();
	if (!user) {
		return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
	}

	if (user.user?.id !== deck.userId) {
		return NextResponse.json(
			{
				error: 'Not Public or Not Creator',
			},
			{
				status: 403,
			},
		);
	}
	const optionalData = {
		count: Number(params.get('count')) || null,
		startWith: params.get('startWith') || null,
	};
	if (Object.values(optionalData).some((w) => w !== null)) {
		let cards: CardProps[] = [];
		let originalCards = deck.cards;
		if (optionalData.startWith && optionalData.startWith.trim().length !== 0) {
			originalCards = originalCards.filter((w) =>
				w.word.startsWith(optionalData.startWith || ''),
			);
		}
		originalCards = shuffle(originalCards);
		if (optionalData.count && optionalData.count) {
			cards = originalCards.slice(0, optionalData.count);
		}
		return NextResponse.json(
			Object.assign(deck, {
				cards,
				_id: deck._id.toString(),
			}),
			{ status: 200 },
		);
	}

	return NextResponse.json(
		Object.assign(deck, {
			_id: deck._id.toString(),
			cards: shuffle(deck.cards),
		}),
		{
			status: 200,
		},
	);
}

export async function DELETE(request: NextRequest) {
	const user = await auth();
	if (!user) {
		return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
	}
	const {
		id, // deck id
		word, // word to delete
	} = await request.json();

	if (!id || !word) {
		return NextResponse.json(
			{ error: 'Please provide deck id and word to delete' },
			{ status: 400 },
		);
	}
	const deck = await db.collection<DeckCollection>('deck').findOneAndUpdate(
		{
			_id: new ObjectId(id),
			userId: user.user?.id,
		},
		{
			$pull: { cards: { word } },
		},
		{
			returnDocument: 'after',
		},
	);
	if (deck) {
		return NextResponse.json(
			{
				message: 'Card deleted successfully',
			},
			{ status: 200 },
		);
	}
	return NextResponse.json(
		{ error: 'Deck not found or you are not the owner' },
		{ status: 404 },
	);
}
