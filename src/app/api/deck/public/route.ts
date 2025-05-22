import db from '@/lib/db';
import { DeckCollection, PublicDeckToUser } from '@/type';
import { auth } from '@/utils';
import { ObjectId } from 'mongodb';

export async function POST(req: Request) {
	const { id: deckId } = await req.json();
	if (!deckId) {
		return Response.json({ error: 'Deck ID is required' }, { status: 400 });
	}
	const session = await auth();
	if (!session) {
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}
	const userId = session.user?.id;
	console.log(deckId);
	const deck = await db
		.collection<DeckCollection>('deck')
		.findOne({ _id: new ObjectId(deckId) });
	if (!deck) {
		return Response.json({ error: 'Deck not found' }, { status: 404 });
	}
	if (!deck.isPublic) {
		return Response.json({ error: 'Deck is not public' }, { status: 403 });
	}
	if (deck.userId === userId) {
		return Response.json(
			{ error: 'You cannot add your own deck' },
			{ status: 403 },
		);
	}
	await db.collection<PublicDeckToUser>('publicDeckToUser').updateOne(
		{
			userId: userId,
		},
		{
			$push: {
				deckId: deck._id.toString(),
			},
		},
		{ upsert: true },
	);
	return Response.json(
		{
			message: 'Deck added to your collection',
		},
		{ status: 200 },
	);
}

export async function GET(req: Request) {
	const url = new URL(req.url);
	const type = url.searchParams.get('type') || 'default';
	const session = await auth();
	if (!session) {
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}
	const userId = session.user?.id;
	const publicDecks = await db
		.collection<DeckCollection>('deck')
		.find({ isPublic: true })
		.toArray();
	const userDecks = await db
		.collection<PublicDeckToUser>('publicDeckToUser')
		.findOne({ userId: userId });
	if (!userDecks) {
		return Response.json({ decks: [] }, { status: 200 });
	}
	if (userDecks.deckId.length === 0) {
		return Response.json({ decks: [] }, { status: 200 });
	}
	const decks = publicDecks.filter((deck) => {
		return (
			userDecks.deckId.includes(deck._id.toString()) && deck.userId !== userId
		);
	});

	if (type === 'full') {
		const processedDecks = decks.map((deck) => {
			return {
				_id: deck._id.toString(),
				name: deck.name,
				isPublic: deck.isPublic,
				cards: deck.cards,
			};
		});
		return Response.json(
			{ decks: processedDecks, fulldata: processedDecks },
			{ status: 200 },
		);
	}

	const processedDecks = decks.map((deck) => {
		return {
			_id: deck._id.toString(),
			name: deck.name,
			card_length: deck.cards.length,
			isPublic: deck.isPublic,
		};
	});
	return Response.json(
		{ decks: processedDecks, fulldata: processedDecks },
		{ status: 200 },
	);
}

export async function DELETE(req: Request) {
	const { deckId } = await req.json();
	if (!deckId) {
		return Response.json({ error: 'Deck ID is required' }, { status: 400 });
	}
	const session = await auth();
	if (!session) {
		return Response.json({ error: 'Unauthorized' }, { status: 401 });
	}
	const userId = session.user?.id;
	await db.collection<PublicDeckToUser>('publicDeckToUser').updateOne(
		{
			userId: userId,
		},
		{
			$pop: {
				deckId: deckId,
			},
		},
	);
	return Response.json(
		{
			message: 'Deck removed from your collection',
		},
		{ status: 200 },
	);
}
