import { db } from '@/db';
import { wordCache, settings, dictionaryItems } from '@/db/schema';
import { eq, and, cosineDistance, lt } from 'drizzle-orm';
import { CardProps, Lang, LangEnum, PartOfSpeech, Blocks } from '@/type';
import {
  auth,
  generateEmbedding,
  isHavingSpace,
  MultipleLangValidator,
  LangVailderCreator,
  getLangByStr,
} from '@/utils';
import { sql } from 'drizzle-orm';
import { NextResponse } from 'next/server';
import {
  getModifiedResult,
  getAIResponse,
  newWord,
  getNewWordDataWithAPIResources,
  CheckData,
} from './functions';
import { getWordFromJishoOrg } from '@/utils/dict/jisho';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  const word = searchParams.get('word');
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
  const targetLangValidator = LangVailderCreator(targetLang);

  const isPhrase = isHavingSpace(word);
  const normalizedWord = word.trim().toLowerCase();

  // 優化：語言守衛 (Language Guard)
  // 如果輸入既不是來源語言也不是目標語言，且不是明顯的短語，則直接跳過語義計算
  const isSource = sourceLangValidator(word);
  const isTarget = targetLangValidator(word);

  if (!isSource && !isTarget) {
    const detected = getLangByStr(word);
    if (!detected) {
      return NextResponse.json(
        { error: 'Unsupported language' },
        { status: 400 },
      );
    }
  }

  // 層級一：精確字面匹配 (Exact Literal Match)
  const cacheResult = await db.query.wordCache.findFirst({
    where: and(
      eq(wordCache.word, normalizedWord),
      eq(wordCache.targetLang, targetLang),
    ),
  });

  if (cacheResult) {
    const resultData = {
      ...(cacheResult.data as CardProps),
      available: cacheResult.available,
      sourceLang: (cacheResult.sourceLang as LangEnum[]) || [],
      targetLang: cacheResult.targetLang as LangEnum,
    };

    if (resultData.available !== false) {
      const isLangComplete = sourceLang.every((needed) =>
        resultData.sourceLang.includes(needed),
      );

      if (isLangComplete) {
        return NextResponse.json(resultData, { status: 200 });
      }

      const missingLangs = sourceLang.filter(
        (needed) => !resultData.sourceLang.includes(needed),
      );

      const newResult = await getModifiedResult(
        resultData,
        missingLangs,
        targetLang,
      );
      if (newResult) {
        const updatedSourceLang = Array.from(
          new Set([...resultData.sourceLang, ...missingLangs]),
        );

        await db
          .update(wordCache)
          .set({
            available: true,
            sourceLang: updatedSourceLang,
            data: newResult,
            updatedAt: new Date(),
          })
          .where(
            and(
              eq(wordCache.word, normalizedWord),
              eq(wordCache.targetLang, targetLang),
            ),
          );

        return NextResponse.json(newResult, { status: 200 });
      }
    }
    // 如果 available 是 false，不直接報錯，而是「掉出」快取層進入語義搜尋
  }

  // 優化：字面反向查詢 (Literal Reverse Lookup)
  // 若輸入的是目標語言（如中文），先嘗試快速比對定義文字，避免 Embedding 計算
  if (isTarget && !isPhrase) {
    const literalMatch = await db
      .select()
      .from(dictionaryItems)
      .where(
        sql`${dictionaryItems.metadata}->'definitions'->>${targetLang} = ${normalizedWord}`,
      )
      .limit(1);

    if (literalMatch.length > 0) {
      const concept = literalMatch[0];
      const conceptData = convertToCardProps(concept, [
        ...sourceLang,
        targetLang,
      ]);
      const checkedData = await CheckData(
        concept.metadata.source_term,
        conceptData,
      );
      return NextResponse.json(checkedData, { status: 200 });
    }
  }

  // 層級二：語義搜尋與概念匹配 (Semantic Search & Concept Matching)
  const embeddedVector = await generateEmbedding(normalizedWord);
  const nearestConcept = await db
    .select()
    .from(dictionaryItems)
    .where(
      and(lt(cosineDistance(dictionaryItems.embedding, embeddedVector), 0.1)),
    )
    .limit(1);

  if (nearestConcept.length > 0) {
    const concept = nearestConcept[0];
    const conceptData = convertToCardProps(concept, [
      ...sourceLang,
      targetLang,
    ]);

    // 概念命中後，同樣檢查語言補全邏輯
    const currentLangs = concept.languageCode as LangEnum[];
    const missingFromConcept = sourceLang.filter(
      (l) => !currentLangs.includes(l),
    );

    if (missingFromConcept.length > 0) {
      const expandedResult = await getModifiedResult(
        conceptData,
        missingFromConcept,
        targetLang,
      );
      if (expandedResult) {
        return NextResponse.json(expandedResult, { status: 200 });
      }
    }
    const checkedData = await CheckData(
      concept.metadata.source_term,
      conceptData,
    );
    return NextResponse.json(checkedData, { status: 200 });
  }

  // 層級三：模糊/相關搜尋 (Fuzzy / Related Results)
  const relatedResults = await db
    .select()
    .from(dictionaryItems)
    .where(
      and(lt(cosineDistance(dictionaryItems.embedding, embeddedVector), 0.25)),
    )
    .limit(5);

  if (relatedResults.length > 0 && !isTarget) {
    const langSet = new Set([...sourceLang, targetLang]);
    const groupedResults = relatedResults.reduce(
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
        const definitionItem = {
          definition: Object.entries(def.metadata.definitions)
            .filter(([lang]) => langSet.has(lang as LangEnum))
            .map(([lang, content]) => ({ lang: lang as Lang, content })),
          synonyms: def.metadata.synonyms || [],
          antonyms: [],
          example: (def.metadata.examples as Record<string, string>[]).map(
            (ex) =>
              Object.entries(ex)
                .filter(([lang]) => langSet.has(lang as LangEnum))
                .map(([lang, content]) => ({ lang: lang as Lang, content })),
          ),
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

    return NextResponse.json(Object.values(groupedResults), { status: 200 });
  }

  // 最終：生成新詞邏輯 (Generation Logic)
  let data: CardProps | null = null;
  switch (true) {
    case targetLang === LangEnum.JA: {
      const newWordData = await getNewWordDataWithAPIResources(
        normalizedWord,
        sourceLang,
        targetLang,
        [getWordFromJishoOrg(normalizedWord)],
      );
      if (!newWordData) {
        await db
          .insert(wordCache)
          .values({
            word: normalizedWord,
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
      data = await getAIResponse(normalizedWord, sourceLang, targetLang);
      break;
    }
    case [LangEnum.EN].includes(targetLang): {
      const newWordData = await newWord(normalizedWord, sourceLang, targetLang);
      if (!newWordData) {
        await db
          .insert(wordCache)
          .values({
            word: normalizedWord,
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
  }

  if (!data) {
    await db
      .insert(wordCache)
      .values({
        word: normalizedWord,
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
      word: normalizedWord,
      available: true,
      data: data,
      sourceLang,
      targetLang,
    })
    .onConflictDoUpdate({
      target: [wordCache.word, wordCache.targetLang],
      set: {
        data: data,
        available: true,
        sourceLang,
        updatedAt: new Date(),
      },
    });

  return NextResponse.json(data, { status: 200 });
}

// 輔助函數：將 DictionaryItem 轉換為 CardProps
function convertToCardProps(
  concept: typeof dictionaryItems.$inferSelect,
  langs: LangEnum[],
): CardProps {
  const langSet = new Set(langs);
  return {
    word: concept.metadata.source_term,
    phonetic: concept.metadata.phonetic || '',
    blocks: [
      {
        partOfSpeech: concept.metadata.pos as PartOfSpeech,
        definitions: [
          {
            definition: Object.entries(concept.metadata.definitions)
              .filter(([lang]) => langSet.has(lang as LangEnum))
              .map(([lang, content]) => ({ lang: lang as Lang, content })),
            synonyms: concept.metadata.synonyms || [],
            antonyms: [],
            example: (
              concept.metadata.examples as Record<string, string>[]
            ).map((ex) =>
              Object.entries(ex)
                .filter(([lang]) => langSet.has(lang as LangEnum))
                .map(([lang, content]) => ({ lang: lang as Lang, content })),
            ),
          },
        ],
      },
    ],
  };
}
