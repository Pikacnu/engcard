import { db } from '@/db';
import { FSRSCard, FSRSReviewLog, cards } from '@/db/schema';
import { auth } from '@/utils';
import { and, eq, lte } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import { toFSRSCard, repeatCard } from '@/lib/fsrs';
import { Rating } from 'ts-fsrs';

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;

  const { cardId, rating }: { cardId: string; rating: Rating } =
    await req.json();

  if (!cardId || rating === undefined) {
    return NextResponse.json(
      { error: 'CardId and rating are required' },
      { status: 400 },
    );
  }

  try {
    const fsrsCardRecord = await db.query.FSRSCard.findFirst({
      where: and(eq(FSRSCard.userId, userId), eq(FSRSCard.cardId, cardId)),
    });

    if (!fsrsCardRecord) {
      return NextResponse.json(
        { error: 'FSRS card not found' },
        { status: 404 },
      );
    }

    const currentCard = toFSRSCard(fsrsCardRecord);
    const { card: nextCard, log } = repeatCard(currentCard, rating);

    await db.transaction(async (tx) => {
      await tx
        .update(FSRSCard)
        .set({
          due: nextCard.due,
          stability: nextCard.stability,
          difficulty: nextCard.difficulty,
          elapsedDays: nextCard.elapsed_days,
          scheduledDays: nextCard.scheduled_days,
          reps: nextCard.reps,
          lapses: nextCard.lapses,
          state: nextCard.state,
          lastReview: nextCard.last_review,
          learningSteps: nextCard.learning_steps,
          updatedAt: new Date(),
        })
        .where(eq(FSRSCard.id, fsrsCardRecord.id));

      await tx.insert(FSRSReviewLog).values({
        userId,
        fsrsCardId: fsrsCardRecord.id,
        rating: rating,
        state: log.state,
        due: log.due,
        stability: log.stability,
        difficulty: log.difficulty,
        elapsedDays: log.elapsed_days,
        lastElapsedDays: log.last_elapsed_days,
        scheduledDays: log.scheduled_days,
        review: log.review,
      });
    });

    return NextResponse.json({
      success: true,
      nextReview: nextCard.due,
    });
  } catch (error) {
    console.error('FSRS Review Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const url = new URL(req.url);
  const deckId = url.searchParams.get('deckId');

  try {
    const filters = [
      eq(FSRSCard.userId, userId),
      lte(FSRSCard.due, new Date()),
    ];

    if (deckId) {
      filters.push(eq(cards.deckId, deckId));
    }

    const results = await db
      .select({
        fsrs: FSRSCard,
        card: cards,
      })
      .from(FSRSCard)
      .innerJoin(cards, eq(FSRSCard.cardId, cards.id))
      .where(and(...filters));

    return NextResponse.json(results);
  } catch (error) {
    console.error('Error fetching due cards:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
