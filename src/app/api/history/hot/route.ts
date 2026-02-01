import { db } from '@/db';
import { histories } from '@/db/schema';
import { auth } from '@/utils';
import { desc, eq, count } from 'drizzle-orm';
import { NextResponse } from 'next/server';

export async function GET() {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const data = await db
      .select({
        entries: histories.words,
        count: count(),
      })
      .from(histories)
      .where(eq(histories.userId, session.user.id))
      .groupBy(histories.words)
      .orderBy(desc(count()))
      .limit(10);

    const filteredData = data.filter(
      (entry): entry is { entries: string[]; count: number } =>
        entry.entries !== null && entry.entries.length >= 1,
    );

    // Flatten and format for simple OfflineHotWord schema
    const results: { word: string; count: number }[] = [];
    filteredData.forEach((item) => {
      item.entries.forEach((word) => {
        const existing = results.find((r) => r.word === word);
        if (existing) {
          existing.count += item.count;
        } else {
          results.push({ word, count: item.count });
        }
      });
    });

    return NextResponse.json(
      results.sort((a, b) => b.count - a.count).slice(0, 20),
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 },
    );
  }
}
