import db from '@/lib/db';
import { auth } from '@/utils/auth';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	const user = await auth();
	if (!user) {
		return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
	}
	const userId = user.user?.id;

	const url = new URL(request.url);
	const params = url.searchParams;
	const id = params.get('id');
	if (id && id.length > 0) {
		const decks = await db
			.collection('deck')
			.findOne({ userId, _id: new ObjectId(id) });
		if (!decks) {
			return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
		}
		return NextResponse.json(decks);
	}

	const decks = await db.collection('deck').find({ userId }).toArray();
	const deckData = decks.map((deck) => ({
		_id: deck._id.toString(),
		name: deck.name,
		isPublic: deck.isPublic,
		cards_length: deck.cards.length,
	}));
	return NextResponse.json(deckData);
}

export async function POST(req: NextRequest) {
	const user = await auth();
	if (!user) {
		return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
	}
	const userId = user.user?.id;
	const { name, isPublic } = await req.json();
	const deck = await db
		.collection('deck')
		.insertOne({ name, isPublic, userId });
	return NextResponse.json(deck);
}
