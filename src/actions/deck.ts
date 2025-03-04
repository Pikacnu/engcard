'use server';
import db from '@/lib/db';
import { ObjectId } from 'mongodb';
import { auth } from '@/utils/auth';
import { CardProps, DeckCollection, Definition, PartOfSpeech } from '@/type';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getDeck(id: string): Promise<any> {
	const deckId = new ObjectId(id);
	const deck = await db.collection('deck').findOne({ _id: deckId });
	if (!deck) {
		return null;
	}
	if (deck.isPublic) {
		return { ...deck, _id: deck._id.toString() };
	}
	const session = await auth();
	if (!session) {
		return null;
	}
	if (deck.userId !== session.user?.id) {
		return null;
	}
	return { ...deck, _id: deck._id.toString() };
}

export async function getDecks() {
	const session = await auth();
	if (!session) {
		return [];
	}
	const data = (
		await db
			.collection<DeckCollection>('deck')
			.find({ userId: session.user?.id })
			.toArray()
	).map((deck) => {
		return {
			name: deck.name,
			_id: deck._id.toString(),
			public: deck.isPublic,
		};
	});
	return data;
}

export async function addDeck(name: string, isPublic = false) {
	const session = await auth();
	if (!session) {
		return;
	}
	if (!(session.user && session.user.id)) {
		return;
	}
	await db
		.collection<DeckCollection>('deck')
		.insertOne({ name, isPublic, userId: session.user?.id, cards: [] });
}

export async function deleteDeck(id: string) {
	const session = await auth();
	if (!session) {
		return;
	}
	await db
		.collection<DeckCollection>('deck')
		.deleteOne({ _id: new ObjectId(id), userId: session.user?.id });
}

export async function addCard(
	deckId: string,
	word: string,
	definition: Definition[],
	partOfSpeech: PartOfSpeech,
) {
	const session = await auth();
	if (!session) {
		return;
	}
	const card: CardProps = {
		word,
		blocks: [{ partOfSpeech, definitions: definition }],
		phonetic: '',
	};
	await db.collection<DeckCollection>('deck').findOneAndUpdate(
		{ _id: new ObjectId(deckId), userId: session.user?.id },
		{
			$push: {
				cards: card,
			},
		},
	);
}
