import { db } from '@/db';
import { markedWords, decks, cards, FSRSCard } from '@/db/schema';
import { auth } from '@/utils';
import { and, eq, inArray } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { createInitialFSRSCard } from '@/lib/fsrs';

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
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    await db
      .insert(markedWords)
      .values({
        userId,
        word,
        deckId,
      })
      .onConflictDoNothing();

    const card = await db.query.cards.findFirst({
      where: and(eq(cards.word, word), eq(cards.deckId, deckId)),
    });

    if (card) {
      await db
        .insert(FSRSCard)
        .values(createInitialFSRSCard(userId, card.id))
        .onConflictDoNothing();
    }
  } catch (e) {
    console.error('Error marking word:', e);
    return NextResponse.json(
      { error: 'Failed to mark word. Deck might not exist.' },
      { status: 400 },
    );
  }

  return NextResponse.json(
    { message: 'Word marked and added to FSRS' },
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
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  try {
    const card = await db.query.cards.findFirst({
      where: and(eq(cards.word, word), eq(cards.deckId, deckId)),
    });

    if (card) {
      await db
        .delete(FSRSCard)
        .where(and(eq(FSRSCard.userId, userId), eq(FSRSCard.cardId, card.id)));
    }

    await db
      .delete(markedWords)
      .where(
        and(
          eq(markedWords.userId, userId),
          eq(markedWords.word, word),
          eq(markedWords.deckId, deckId),
        ),
      );
  } catch (e) {
    console.error('Error unmarking word:', e);
  }

  return NextResponse.json(
    { message: 'Word unmarked and removed from FSRS' },
    { status: 200 },
  );
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const deckId = url.searchParams.get('deckId');

  if (deckId) {
    const marked = await db.query.markedWords.findMany({
      where: and(
        eq(markedWords.userId, userId),
        eq(markedWords.deckId, deckId),
      ),
    });

    if (marked.length === 0) {
      return NextResponse.json({ error: 'No cards found' }, { status: 404 });
    }

    const deck = await db.query.decks.findFirst({
      where: eq(decks.id, deckId),
      with: { cards: true },
    });

    if (!deck) {
      return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
    }

    const markedWordSet = new Set(marked.map((m) => m.word));
    const cards = (
      deck as unknown as { cards: { word: string }[] }
    ).cards.filter((c) => markedWordSet.has(c.word));

    return NextResponse.json({ words: cards || [] }, { status: 200 });
  } else {
    // All marked words
    const marked = await db.query.markedWords.findMany({
      where: eq(markedWords.userId, userId),
    });

    if (marked.length === 0) {
      return NextResponse.json({ words: [] }, { status: 200 });
    }

    const deckIds = [...new Set(marked.map((m) => m.deckId))];
    const deckList = await db.query.decks.findMany({
      where: inArray(decks.id, deckIds),
      with: { cards: true },
    });

    // Map deckId -> Set<Word>
    const deckWordMap = new Map<string, Set<string>>();
    for (const m of marked) {
      if (!deckWordMap.has(m.deckId)) deckWordMap.set(m.deckId, new Set());
      deckWordMap.get(m.deckId)!.add(m.word);
    }

    const allWords = deckList.flatMap((deck) => {
      const markedSet = deckWordMap.get(deck.id);
      if (!markedSet) return [];
      // Filter cards in this deck
      return (deck as unknown as { cards: { word: string }[] }).cards
        .filter((c) => markedSet.has(c.word))
        .map((c) => ({ ...c, deckId: deck.id }));
    });

    return NextResponse.json({ words: allWords }, { status: 200 });
  }
}
