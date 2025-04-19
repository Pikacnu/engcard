import db from '@/lib/db';
import { DeckCollection } from '@/type';
import { auth } from '@/utils/auth';
import { ObjectId } from 'mongodb';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	const url = new URL(request.url);
	const params = url.searchParams;
	const id = params.get('id');

	const user = await auth();
	const userId = user?.user?.id || '';
	if (!id) {
		if (!user) {
			// If user is not logged in, return public decks
			// This is a public API, so we don't need to check for userId
			const publicDecks = await db
				.collection<DeckCollection>('deck')
				.find({ isPublic: true })
				.toArray();
			const deckData = publicDecks.map((deck) =>
				Object.assign(deck, { _id: deck._id.toString() }),
			);
			return NextResponse.json(deckData);
		}
		// If user is logged in, return their decks
		const decks = await db.collection('deck').find({ userId }).toArray();
		const deckData = decks.map((deck) => ({
			_id: deck._id.toString(),
			name: deck.name,
			isPublic: deck.isPublic,
			cards_length: deck.cards.length,
		}));
		return NextResponse.json(deckData);
	}
	if (id.trim().length === 0) {
		return NextResponse.json({ error: 'Deck ID is required' }, { status: 400 });
	}

	const deck = await db.collection('deck').findOne({ _id: new ObjectId(id) });
	if (!deck) {
		return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
	}
	if (deck.isPublic) {
		// If deck is public, return it
		return NextResponse.json(deck);
	}
	if (deck.userId !== userId) {
		// If deck is not public and user is not the owner, return 403
		return NextResponse.json(
			{ error: 'You are not authorized to access this deck' },
			{ status: 403 },
		);
	}
	// If deck is not public and user is the owner, return it
	return NextResponse.json(deck);
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
