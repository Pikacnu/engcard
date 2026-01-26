'use server';
import { db } from '@/db';
import { settings as settingsTable } from '@/db/schema';
import { DeckType, UserSettings, OCRProcessType, LangEnum } from '@/type';
import { auth } from '@/utils/auth/';
import { eq } from 'drizzle-orm';

export async function getSettings(): Promise<UserSettings & { _id: string }> {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error('Unauthorized');
  }
  let settingsData = (
    await db
      .select()
      .from(settingsTable)
      .where(eq(settingsTable.userId, session.user.id))
      .limit(1)
  )[0];

  if (!settingsData) {
    [settingsData] = await db
      .insert(settingsTable)
      .values({
        userId: session.user.id,
        deckActionType: DeckType.ChangeByButton,
      })
      .returning();
  }

  return {
    ...settingsData,
    _id: settingsData.id,
    deckActionType: (settingsData.deckActionType ??
      DeckType.ChangeByButton) as DeckType,
    ocrProcessType: (settingsData.ocrProcessType ??
      OCRProcessType.OnlyFromImage) as OCRProcessType,
    targetLang: (settingsData.targetLang ?? LangEnum.TW) as LangEnum,
    usingLang: (settingsData.usingLang ?? [LangEnum.TW]) as LangEnum[],
  };
}

export async function updateSettings(
  name: keyof UserSettings,
  value: UserSettings[keyof UserSettings],
) {
  const session = await auth();
  if (!session || !session.user?.id) {
    throw new Error('Unauthorized');
  }

  await db
    .update(settingsTable)
    .set({
      [name]: value,
    })
    .where(eq(settingsTable.userId, session.user.id));
}
