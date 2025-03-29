'use server';
import db from '@/lib/db';
import { ObjectId } from 'mongodb';
import { auth } from '@/utils/auth';
import {
	CardProps,
	Deck,
	DeckCollection,
	Definition,
	PartOfSpeech,
	ShareLink,
	Word,
} from '@/type';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function getDeck(id: string): Promise<any> {
	const deckId = new ObjectId(id);
	const deck = await db
		.collection<DeckCollection>('deck')
		.findOne({ _id: deckId });
	if (!deck) {
		return null;
	}
	if (!deck.isPublic) {
		const session = await auth();
		if (!session) {
			return null;
		}
		if (deck.userId !== session.user?.id) {
			return null;
		}
	}
	return {
		...deck,
		cards: deck.cards.map((card) => {
			//@ts-expect-error Bug by Add Card Without Removed _id (Fixed)
			if (card._id) {
				return {
					word: card.word,
					blocks: card.blocks,
					phonetic: card.phonetic,
				};
			}
			return card;
		}),
		_id: deck._id.toString(),
	};
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

export async function addCardFromDB(deckId: string, word: string) {
	const session = await auth();
	if (!session) {
		return;
	}
	const card = await db.collection<Word>('words').findOne({ word });

	if (!card) {
		return;
	}
	const cardprops: CardProps = {
		word: card.word,
		phonetic: card.phonetic,
		blocks: card.blocks,
	};
	await db.collection<DeckCollection>('deck').findOneAndUpdate(
		{ _id: new ObjectId(deckId), userId: session.user?.id },
		{
			$push: {
				cards: cardprops,
			},
		},
	);
	return;
}

export async function getShareDeck(deckId: string) {
	const session = await auth();
	if (!session) {
		return;
	}

	const share = await db.collection<ShareLink>('share').findOne({
		deckId,
	});
	if (share) {
		return new URLSearchParams({ deck: deckId }).toString();
	}

	const deck = await db
		.collection<DeckCollection>('deck')
		.findOne({ _id: new ObjectId(deckId) });

	if (!deck) {
		return;
	}
	if (deck.userId !== session.user?.id) {
		return;
	}
	if (!deck.isPublic) {
		await db
			.collection<Deck>('deck')
			.findOneAndUpdate(
				{ _id: new ObjectId(deckId) },
				{ $set: { isPublic: true } },
			);
	}

	await db.collection<ShareLink>('share').insertOne({
		deckId,
		isPublic: true,
	});
	return new URLSearchParams({ deck: deckId }).toString();
}
