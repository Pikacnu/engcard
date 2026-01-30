'use server';
import { db } from '@/db';
import { decks, cards, wordCache, shares } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { auth } from '@/utils/auth';
import { CardProps, DeckCollection, Definition, PartOfSpeech } from '@/type';
import { Blocks } from '@/type-shared';

export async function getDeck(id: string): Promise<any> {
  // 1. Fetch Deck
  const deck = (await db.select().from(decks).where(eq(decks.id, id)))[0];
  const cardDatas = await db.select().from(cards).where(eq(cards.deckId, id));

  if (!deck) {
    return null;
  }

  // 2. Auth check
  if (!deck.isPublic) {
    const session = await auth();
    if (!session) {
      return null;
    }
    if (deck.userId !== session.user?.id) {
      return null;
    }
  }

  // 3. Format response to match expected output
  return {
    ...deck,
    _id: deck.id,
    cards: cardDatas.map((card) => {
      // Reconstruct CardProps from DB
      // Note: blocks is jsonb, needing cast if Drizzle doesn't infer it perfectly as Blocks[]
      return {
        word: card.word,
        blocks: card.blocks as Blocks[],
        phonetic: card.phonetic || '',
        audio: card.audio || undefined,
        flipped: card.flipped || false,
      };
    }),
  } as DeckCollection;
}

export async function getDecks() {
  const session = await auth();
  if (!session || !session.user?.id) {
    return [];
  }

  const userDecks = await db.query.decks.findMany({
    where: eq(decks.userId, session.user.id),
    orderBy: (decks, { desc }) => [desc(decks.updatedAt)],
  });

  return userDecks.map((deck) => {
    return {
      name: deck.name,
      _id: deck.id,
      public: deck.isPublic,
    };
  });
}

export async function addDeck(name: string, isPublic = false) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return;
  }

  await db.insert(decks).values({
    name,
    isPublic,
    userId: session.user.id,
  });
}

export async function deleteDeck(id: string) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return;
  }

  // Cascade delete handles cards, but we need to ensure owner deletes it
  await db
    .delete(decks)
    .where(and(eq(decks.id, id), eq(decks.userId, session.user.id)));
}

export async function addCard(
  deckId: string,
  word: string,
  definition: Definition[],
  partOfSpeech: PartOfSpeech,
) {
  if (!word || word.trim().length === 0) {
    return;
  }
  if (!definition || definition.length === 0) {
    return;
  }
  // Check if any definition block has no definitions
  if (definition.some((d) => d.definition.length === 0)) {
    return;
  }
  // Check if any definition has empty content
  if (definition.some((d) => d.definition.some((def) => !def.content))) {
    return;
  }

  const session = await auth();
  if (!session) {
    return;
  }

  // Verify deck ownership
  const deck = await db.query.decks.findFirst({
    where: and(eq(decks.id, deckId), eq(decks.userId, session.user?.id || '')),
  });
  if (!deck) return;

  const blocks: Blocks[] = [
    { partOfSpeech, definitions: definition, phonetic: '' },
  ];

  await db.insert(cards).values({
    deckId,
    word,
    blocks,
    phonetic: '',
  });
}

export async function addCardFromDB(deckId: string, word: string) {
  const session = await auth();
  if (!session) {
    return;
  }

  // Verify deck ownership
  const deck = await db.query.decks.findFirst({
    where: and(eq(decks.id, deckId), eq(decks.userId, session.user?.id || '')),
  });

  if (!deck) return;

  // Use wordCache table
  const cachedWord = await db.query.wordCache.findFirst({
    where: eq(wordCache.word, word),
  });

  if (!cachedWord || !cachedWord.data) {
    return;
  }

  const cardData = cachedWord.data as unknown as CardProps;

  await db.insert(cards).values({
    deckId,
    word: cardData.word,
    phonetic: cardData.phonetic || '',
    blocks: cardData.blocks || [],
  });

  return;
}

export async function getShareDeck(deckId: string) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return;
  }

  const share = await db.query.shares.findFirst({
    where: eq(shares.deckId, deckId),
  });

  if (share) {
    return new URLSearchParams({ deck: deckId }).toString();
  }

  const deck = await db.query.decks.findFirst({
    where: eq(decks.id, deckId),
  });

  if (!deck) {
    return;
  }
  if (deck.userId !== session.user.id) {
    return;
  }

  if (!deck.isPublic) {
    await db.update(decks).set({ isPublic: true }).where(eq(decks.id, deckId));
  }

  await db.insert(shares).values({
    deckId,
    isPublic: true,
  });

  return new URLSearchParams({ deck: deckId }).toString();
}
