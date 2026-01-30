import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils';
import { db } from '@/db';
import { decks, cards } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { CardProps } from '@/type';
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

  const deck = await db.query.decks.findFirst({
    where: eq(decks.id, id),
  });

  if (!deck) {
    return NextResponse.json({ error: 'Deck Not Found' }, { status: 404 });
  }

  let authorized = false;
  if (deck.isPublic) {
    authorized = true;
  } else {
    const session = await auth();
    if (session?.user?.id === deck.userId) {
      authorized = true;
    }
  }

  if (!authorized) {
    return NextResponse.json(
      {
        error: 'Not Public or Not Creator',
      },
      {
        status: 403,
      },
    );
  }

  // Prepare result with _id for compatibility
  const resultDeck = { ...deck, _id: deck.id };
  const deckCards = (await db
    .select()
    .from(cards)
    .where(eq(cards.deckId, deck.id))) as CardProps[];

  const optionalData = {
    count: Number(params.get('count')) || null,
    startWith: params.get('startWith') || null,
  };

  if (Object.values(optionalData).some((w) => w !== null)) {
    let cards: CardProps[] = [];
    let originalCards = [...deckCards];

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
      Object.assign(resultDeck, {
        cards,
      }),
      { status: 200 },
    );
  }

  return NextResponse.json(
    Object.assign(resultDeck, {
      cards: shuffle(deckCards),
    }),
    {
      status: 200,
    },
  );
}

export async function DELETE(request: NextRequest) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
  }
  const userId = session.user.id;

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

  // Fetch existing deck to modify cards array
  const deck = await db.query.decks.findFirst({
    where: and(eq(decks.id, id), eq(decks.userId, userId)),
  });

  if (!deck) {
    return NextResponse.json(
      { error: 'Deck not found or you are not the owner' },
      { status: 404 },
    );
  }

  await db.delete(cards).where(and(eq(cards.deckId, id), eq(cards.word, word)));

  return NextResponse.json(
    {
      message: 'Card deleted successfully',
    },
    { status: 200 },
  );
}
