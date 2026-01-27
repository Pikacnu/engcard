import { db } from '@/db';
import { wordCache, settings, dictionaryItems } from '@/db/schema';
import { eq, and, cosineDistance, lt } from 'drizzle-orm';
import { CardProps, Lang, LangEnum, PartOfSpeech } from '@/type';
import {
  auth,
  LangVailderCreator,
  generateEmbedding,
  MultipleLangValidator,
} from '@/utils';
import { NextResponse } from 'next/server';
import { getModifiedResult, getAIResponse, newWord } from './functions';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  let word = searchParams.get('word');
  if (!word || word.trim() === '') {
    return NextResponse.json({ error: 'Word is required' }, { status: 400 });
  }

  const session = await auth();
  if (!session || !session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const userSettings = await db.query.settings.findFirst({
    where: eq(settings.userId, session.user.id),
  });

  const sourceLang = (userSettings?.usingLang as LangEnum[]) || [LangEnum.EN];
  const targetLang = (userSettings?.targetLang as LangEnum) || LangEnum.TW;

  const sourceLangValidator = MultipleLangValidator(sourceLang);
  const targetLangVailder = LangVailderCreator(targetLang);

  switch (true) {
    // Search From sourceLang (by definition content)
    case sourceLangValidator(word): {
      // embedding search content
      const embeddedVector = await generateEmbedding(word);
      // get nearest definitions
      const nearestDefinitions = await db
        .select()
        .from(dictionaryItems)
        .where(
          and(
            eq(dictionaryItems.languageCode, targetLang),
            lt(cosineDistance(dictionaryItems.embedding, embeddedVector), 0.2),
          ),
        )
        .limit(10);

      if (nearestDefinitions.length === 0) {
        return NextResponse.json({ error: 'Word not found' }, { status: 404 });
      }

      const simpleFilter =
        (targetLang: Lang | Lang[]) =>
        <T>(obj: Array<T | Lang | (T & { lang: Lang })>) => {
          return obj.filter((item) => {
            if (Array.isArray(targetLang)) {
              return targetLang.includes((item as T & { lang: Lang }).lang);
            } else {
              return (item as T & { lang: Lang }).lang === targetLang;
            }
          }) as Array<T>;
        };
      const pickupLanguageFilter = simpleFilter([...sourceLang, targetLang]);

      // build CardProps from nearestDefinitions
      const nearestDefinitionsWarpedWithWord = nearestDefinitions.map((def) => {
        const blocks: CardProps['blocks'] = [
          {
            partOfSpeech: def.metadata.pos as PartOfSpeech,
            definitions: [
              {
                definition: pickupLanguageFilter(
                  Object.entries(def.metadata.definitions),
                ).map(([lang, content]) => ({
                  lang: lang as Lang,
                  content: content,
                })),
                synonyms: def.metadata.synonyms || [],
                antonyms: [],
                example: pickupLanguageFilter(def.metadata.examples).map((ex) =>
                  Object.entries(ex).map(([lang, content]) => ({
                    lang: lang as Lang,
                    content: content,
                  })),
                ),
              },
            ],
          },
        ];

        return {
          phonetic: def.metadata.phonetic,
          word: def.metadata.source_term,
          blocks: blocks,
        };
      }) as CardProps[];

      // const parsedResults: WordCollectionWith<CardProps>[] = result
      //   .filter(
      //     (w) => w.data && typeof w.data === 'object' && 'blocks' in w.data,
      //   )
      //   .map((w) => ({
      //     ...(w.data as CardProps),
      //     available: w.available || false,
      //     sourceLang: w.sourceLang as LangEnum[],
      //     targetLang: w.targetLang as LangEnum,
      //     // availableSearchTarget: w.availableSearchTarget as string[],
      //   }));

      // const words = parsedResults
      //   .filter((word) => word.available !== false) // !word.available logic? available defaults to true in schema.
      //   .map((word) => ({
      //     ...word,
      //     blocks: word.blocks.map((block) => ({
      //       ...block,
      //       definitions: block.definitions.map((definition) => ({
      //         ...definition,
      //         definition: filter(definition.definition),
      //         synonyms: definition.synonyms,
      //         antonyms: definition.antonyms,
      //         example: definition.example?.map((ex) =>
      //           ex.map((item) => ({
      //             lang: item.lang,
      //             content: item.content,
      //           })),
      //         ),
      //       })),
      //     })),
      //   }));

      if (nearestDefinitionsWarpedWithWord.length > 0) {
        if (nearestDefinitionsWarpedWithWord.length === 1) {
          return NextResponse.json(nearestDefinitionsWarpedWithWord[0], {
            status: 200,
          });
        }
        return NextResponse.json(nearestDefinitionsWarpedWithWord, {
          status: 200,
        });
      }
      break;
    }
    // Search From targetLang (by word)
    case targetLangVailder(word): {
      break;
    }
    default: {
      return NextResponse.json(
        { error: 'Word language does not match user settings' },
        { status: 400 },
      );
    }
  }

  word = word.trimEnd().trimStart().toLowerCase();

  // Check is word already in cache
  const cacheResult = await db.query.wordCache.findFirst({
    where: and(eq(wordCache.word, word), eq(wordCache.targetLang, targetLang)),
  });

  if (cacheResult) {
    const resultData = {
      ...(cacheResult.data as CardProps),
      available: cacheResult.available,
      sourceLang: cacheResult.sourceLang as LangEnum[],
      targetLang: cacheResult.targetLang as LangEnum,
    };

    // has data in db and not available
    // * available means that the word is exist or not
    if (resultData.available === false)
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });

    // has data in db and available with all sourceLang
    // -> this fits all the needed sourceLang
    if (
      sourceLang.every((neededLang) =>
        resultData.sourceLang.includes(neededLang),
      )
    )
      return NextResponse.json(resultData, { status: 200 });

    // has data in db and available but not all sourceLang
    const missingLangs = sourceLang.filter(
      (neededLang) => !resultData.sourceLang.includes(neededLang),
    );

    if (resultData) {
      // due to the missing langs, we need to get modified result from AI
      // so we call AI again with existing data plus missing langs
      const newResult = await getModifiedResult(
        resultData,
        missingLangs,
        targetLang,
      );
      if (!newResult) {
        return NextResponse.json({ error: 'Word not found' }, { status: 404 });
      }

      const updatedSourceLang = [...resultData.sourceLang, ...missingLangs];

      await db
        .update(wordCache)
        .set({
          available: true,
          sourceLang: updatedSourceLang,
          data: newResult, // jsonb
        })
        .where(
          and(eq(wordCache.word, word), eq(wordCache.targetLang, targetLang)),
        );

      return NextResponse.json(newResult, { status: 200 });
    }
  }

  // Generate New Data
  let data: CardProps;
  switch (true) {
    case ![LangEnum.EN].includes(targetLang): {
      data = await getAIResponse(word, sourceLang, targetLang);
      break;
    }
    case [LangEnum.EN].includes(targetLang): {
      const newWordData = await newWord(word, sourceLang, targetLang);
      if (!newWordData) {
        await db
          .insert(wordCache)
          .values({
            word,
            available: false,
            sourceLang,
            targetLang,
            data: {},
          })
          .onConflictDoNothing();
        return NextResponse.json({ error: 'Word not found' }, { status: 404 });
      }
      data = newWordData;
      break;
    }
    default: {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }
  }

  if (!data) {
    await db
      .insert(wordCache)
      .values({
        word,
        available: false,
        sourceLang,
        targetLang,
        data: {},
      })
      .onConflictDoNothing();
    return NextResponse.json({ error: 'Word not found' }, { status: 404 });
  }

  await db
    .insert(wordCache)
    .values({
      word,
      available: true,
      data: data,
      sourceLang,
      targetLang,
      //availableSearchTarget,
    })
    .onConflictDoUpdate({
      target: [wordCache.word, wordCache.targetLang],
      set: {
        data: data,
        available: true,
        sourceLang,
        //availableSearchTarget,
        updatedAt: new Date(),
      },
    });

  return NextResponse.json(data, { status: 200 });
}
