import { db } from '@/db';
import { wordCache, settings, dictionaryItems } from '@/db/schema';
import { eq, and, cosineDistance, lt, sql, inArray } from 'drizzle-orm';
import {
  CardProps,
  Lang,
  LangEnum,
  PartOfSpeech,
  Definition,
  Blocks,
} from '@/type';
import {
  auth,
  LangVailderCreator,
  generateEmbedding,
  MultipleLangValidator,
  isHavingSpace,
  getLangByStr,
} from '@/utils';
import { NextResponse } from 'next/server';
import {
  getModifiedResult,
  getAIResponse,
  newWord,
  getNewWordDataWithAPIResources,
} from './functions';
import { getWordFromJishoOrg } from '@/utils/dict/jisho';

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

  const isPhrase = isHavingSpace(word);

  switch (true) {
    // Semantic Search for phrases and words
    // 1. Search in target language
    // 2. Search in source language
    // If not found, fallback to normal word search for single words
    case isPhrase && targetLangVailder(word):
    case sourceLangValidator(word): {
      const isTarget = targetLangVailder(word);
      const queryLang = isTarget
        ? targetLang
        : getLangByStr(word) || LangEnum.EN;

      let nearestDefinitions: (typeof dictionaryItems.$inferSelect)[] = [];

      // Try exact match for target language single words first (Reverse Lookup Fallback)
      if (isTarget && !isPhrase) {
        nearestDefinitions = await db
          .select()
          .from(dictionaryItems)
          .where(
            and(
              inArray(dictionaryItems.languageCode, sourceLang),
              sql`${dictionaryItems.metadata}->'definitions'->>${targetLang} = ${word}`,
            ),
          );
      }

      if (nearestDefinitions.length === 0) {
        // embedding search content
        const embeddedVector = await generateEmbedding(word);
        // get nearest definitions
        nearestDefinitions = await db
          .select()
          .from(dictionaryItems)
          .where(
            and(
              eq(dictionaryItems.languageCode, queryLang),
              lt(
                cosineDistance(dictionaryItems.embedding, embeddedVector),
                0.2,
              ),
            ),
          )
          .limit(10);
      }

      if (nearestDefinitions.length === 0) {
        if (isPhrase) {
          return NextResponse.json(
            { error: 'Concept not found' },
            { status: 404 },
          );
        }
        break; // Fallback to normal word search for single words
      }

      const langSet = new Set([...sourceLang, targetLang]);

      // Group definitions by source_term to build CardProps
      const groupedByTerm = nearestDefinitions.reduce(
        (acc, def) => {
          const term = def.metadata.source_term;
          if (!acc[term]) {
            acc[term] = {
              word: term,
              phonetic: def.metadata.phonetic || '',
              blocks: [],
            };
          }

          const block = acc[term].blocks.find(
            (b: Blocks) => b.partOfSpeech === def.metadata.pos,
          );

          const definitionItem: Definition = {
            definition: Object.entries(def.metadata.definitions)
              .filter(([lang]) => langSet.has(lang as LangEnum))
              .map(([lang, content]) => ({
                lang: lang as Lang,
                content: content as string,
              })),
            synonyms: def.metadata.synonyms || [],
            antonyms: [],
            example: (def.metadata.examples as Record<string, string>[])
              .map((ex) =>
                Object.entries(ex)
                  .filter(([lang]) => langSet.has(lang as LangEnum))
                  .map(([lang, content]) => ({
                    lang: lang as Lang,
                    content: content as string,
                  })),
              )
              .filter((exGroup) => exGroup.length > 0),
          };

          if (block) {
            block.definitions.push(definitionItem);
          } else {
            acc[term].blocks.push({
              partOfSpeech: def.metadata.pos as PartOfSpeech,
              definitions: [definitionItem],
            });
          }
          return acc;
        },
        {} as Record<string, CardProps>,
      );

      const results = Object.values(groupedByTerm);

      if (results.length > 0) {
        // If it's a single clear hit, try to get the full AI-enhanced data from wordCache
        if (results.length === 1) {
          const cached = await db.query.wordCache.findFirst({
            where: and(
              eq(wordCache.word, results[0].word.toLowerCase().trim()),
              eq(wordCache.targetLang, targetLang),
            ),
          });
          if (cached && cached.available && cached.data) {
            return NextResponse.json(cached.data, { status: 200 });
          }
        }
        return NextResponse.json(results, { status: 200 });
      }
      break;
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
    case targetLang === LangEnum.JA: {
      const newWordData = await getNewWordDataWithAPIResources(
        word,
        sourceLang,
        targetLang,
        [getWordFromJishoOrg(word)],
      );
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
