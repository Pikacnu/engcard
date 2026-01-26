import { db } from '@/db';
import { settings as settingsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { DeckType, LangEnum, OCRProcessType, UserSettings } from '@/type';
import { auth } from '@/utils';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const params = url.searchParams;

  const name = params.get('name') as keyof UserSettings;

  const session = await auth();

  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let result = await db.query.settings.findFirst({
    where: eq(settingsTable.userId, session.user.id),
  });

  if (!result) {
    const newSettings = {
      userId: session.user.id,
      deckActionType: DeckType.AutoChangeToNext,
      ocrProcessType: OCRProcessType.FromSource,
      targetLang: LangEnum.EN,
      usingLang: [LangEnum.TW],
    };

    // Attempt to insert
    const inserted = await db
      .insert(settingsTable)
      .values(newSettings)
      .returning();

    if (!inserted || inserted.length === 0) {
      return NextResponse.json(
        { error: 'Failed to create settings' },
        { status: 500 },
      );
    }
    result = inserted[0];
  }

  // Cast values to Enums for response
  const responseData = {
    ...result,
    _id: result.id,
    deckActionType: (result.deckActionType ??
      DeckType.ChangeByButton) as DeckType,
    ocrProcessType: (result.ocrProcessType ??
      OCRProcessType.OnlyFromImage) as OCRProcessType,
    targetLang: (result.targetLang ?? LangEnum.TW) as LangEnum,
    usingLang: (result.usingLang ?? [LangEnum.TW]) as LangEnum[],
  };

  if (!name) {
    return NextResponse.json(responseData);
  }

  if (name in responseData) {
    return NextResponse.json({
      [name]: responseData[name as keyof typeof responseData],
    });
  }

  return NextResponse.json({ [name]: undefined });
}

export async function POST(req: Request) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const { name, value } = await req.json();
  if (!name || value === undefined) {
    return NextResponse.json({ error: 'Need two arguments' }, { status: 400 });
  }

  // Prepare update object. Cast to any to handle dynamic key with Drizzle types
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const updateData: any = {};
  updateData[name] = value;

  const result = await db
    .update(settingsTable)
    .set(updateData)
    .where(eq(settingsTable.userId, session.user.id))
    .returning();

  if (!result || result.length === 0) {
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 },
    );
  }
  return NextResponse.json({ [name]: value });
}
