import DB from '@/lib/db';
import {
  CardProps,
  Example,
  Lang,
  LangEnum,
  PartOfSpeech,
  UserSettingsCollection,
  WordCollection,
  WordCollectionWith,
} from '@/type';
import {
  auth,
  GwordSchemaCreator,
  LangVailderCreator,
  OpenAIClient,
  OpenAIHistoryTranscriber,
  wordSchemaCreator,
} from '@/utils';
import {
  wordGeminiHistory,
  wordSystemInstructionCreator,
  Models,
  wordSchema,
} from '@/utils';
import {
  getWordFromDictionaryAPI,
  getWordFromEnWordNetAPI,
} from '@/utils/dict/functions';
import { WithId } from 'mongodb';
import { NextResponse } from 'next/server';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';

export async function GET(request: Request): Promise<Response> {
  const { searchParams } = new URL(request.url);
  let word = searchParams.get('word');
  if (!word || word.trim() === '') {
    return NextResponse.json({ error: 'Word is required' }, { status: 400 });
  }

  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const settings = await DB.collection<UserSettingsCollection>(
    'settings',
  ).findOne({
    userId: session.user?.id || '',
  });

  const sourceLang = settings?.usingLang || [LangEnum.EN];
  const targetLang = settings?.targetLang || LangEnum.TW;

  const db = DB.collection<WordCollection>('words');
  const vailders = sourceLang.map((l) => LangVailderCreator(l));
  if (vailders.some((fn) => fn(word!))) {
    const result = await db
      .find(
        {
          availableSearchTarget: { $in: [word] },
          targetLang: targetLang,
        },
        {},
      )
      .toArray();
    if (result.length < 0) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }

    const simpleFilter =
      (targetLang: Lang | Lang[]) =>
      <T>(array: Array<T & { lang: Lang }>) =>
        array.filter((data) =>
          Array.isArray(targetLang)
            ? targetLang.includes(data.lang)
            : data.lang === targetLang,
        );
    const filter = simpleFilter([...sourceLang, targetLang]);
    const words: WordCollectionWith<CardProps>[] = result
      .filter((word) => word.available !== false || !word.available)
      .filter(
        (word): word is WithId<WordCollectionWith<CardProps>> =>
          'blocks' in word,
      )
      .map((word) => ({
        ...word,
        blocks: word.blocks.map((block) => ({
          ...block,
          definitions: block.definitions.map((definition) => ({
            ...definition,
            definition: filter(definition.definition),
            synonyms: definition.synonyms,
            antonyms: definition.antonyms,
            example: definition.example?.map((ex) =>
              ex.map((item) => ({
                lang: item.lang,
                content: item.content,
              })),
            ),
          })),
        })),
      }));

    if (words.length < 1) {
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }
    if (result.length === 1) {
      return NextResponse.json(result[0], { status: 200 });
    }
    return NextResponse.json(words, { status: 200 });
  }
  // for english phrase currently disabled
  /*
	if (isHavingSpace(word)) {
		fetch(`https://api.us.app.phrase.com/v2`, {
			headers: {
				'User-Agent':
					'FlashCard App by Pikacnu - cardlisher (pika@mail.pikacnu.com)',
			},
		});
	}*/

  word = word.trimEnd().trimStart().toLowerCase();
  const result = await db.findOne({ word, targetLang });
  if (result) {
    // has data in db and not available
    if (result.available === false)
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });

    // has data in db and available with all sourceLang
    if (
      sourceLang.every((neededLang) => result.sourceLang.includes(neededLang))
    )
      return NextResponse.json(result, { status: 200 });

    // has data in db and available but not all sourceLang
    const missingLangs = sourceLang.filter(
      (neededLang) => !result.sourceLang.includes(neededLang),
    );
    const testfn = (
      data: WithId<WordCollection>,
    ): data is WithId<WordCollectionWith<CardProps>> =>
      data.blocks !== undefined;
    if (testfn(result)) {
      const newResult = await getModifiedResult(
        result,
        missingLangs,
        targetLang,
      );
      if (!newResult) {
        return NextResponse.json({ error: 'Word not found' }, { status: 404 });
      }
      await db.updateOne(
        { _id: result._id },
        {
          $set: {
            available: true,
            sourceLang: [...result.sourceLang, ...missingLangs],
          },
        },
      );
      return NextResponse.json(newResult, { status: 200 });
    }

    // If the result is not a valid WordCollectionWith<CardProps> Generate new data
    // *Fallthrough to generate new data
  }
  let data: CardProps;
  if (![LangEnum.EN].includes(targetLang)) {
    data = await getAIResponse(word, sourceLang, targetLang);
  } else {
    const newWordData = await newWord(word, sourceLang, targetLang);
    if (!newWordData) {
      await db.insertOne({
        word,
        available: false,
        sourceLang,
        targetLang,
      });
      return NextResponse.json({ error: 'Word not found' }, { status: 404 });
    }
    data = newWordData;
  }

  if (!data) {
    await db.insertOne({
      word,
      available: false,
      sourceLang,
      targetLang,
    });
    return NextResponse.json({ error: 'Word not found' }, { status: 404 });
  }

  const wordData: WordCollection = {
    available: true,
    ...data,
    sourceLang,
    targetLang,
    availableSearchTarget: data.blocks
      .map((block) =>
        block.definitions
          .map((def) => def.definition)
          .flat()
          .filter((def) => def.lang === settings?.targetLang)
          .map((def) => def.content),
      )
      .flat(),
  };

  await db.insertOne(wordData);
  return NextResponse.json(data, { status: 200 });
}

async function newWord(
  word: string,
  sourceLang: LangEnum[],
  targetLang: LangEnum,
): Promise<CardProps | null> {
  const sourceDataPromiseList = [
    getWordFromDictionaryAPI(word),
    getWordFromEnWordNetAPI(word),
  ];
  const sourceDataList = (await Promise.all(sourceDataPromiseList)).filter(
    (data) => data !== null && data !== undefined,
  ) as CardProps[];
  if (sourceDataList.length < 1) {
    return null;
  }

  // 過濾例句，只保留包含原始單字的例句
  const normalizedWord = word.toLowerCase().trim();
  const filteredData = sourceDataList.map((data) => ({
    ...data,
    blocks: data.blocks.map((block) => ({
      ...block,
      definitions: block.definitions.map((def) => ({
        ...def,
        example: def.example?.filter((exampleGroup) => {
          // 檢查每個 example group 是否包含原始單字
          return exampleGroup.some((item) => {
            const content = item.content.toLowerCase();
            // 使用單字邊界檢查，確保是完整單字而不是單詞的一部分
            const wordRegex = new RegExp(`\\b${normalizedWord}\\b`, 'i');
            return wordRegex.test(content);
          });
        }),
      })),
    })),
  }));

  return await getAIResponse(filteredData, sourceLang, targetLang);
}

async function CheckData(
  apidata: CardProps | CardProps[] | string,
  aidata: CardProps,
) {
  let result = aidata;
  let audio;
  if (typeof apidata === 'string') {
    const res = await fetch((process.env.AUDIO_API_URL as string) || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': process.env.AUDIO_API_UA || '',
        Authorization: `Bearer ${process.env.AUDIO_API_KEY || ''}`,
      },
      body: JSON.stringify({
        word: apidata,
      }),
    });
    console.log(`Audio API Response: ${res.status} ${res.statusText}`);
    if (res.ok) {
      result = Object.assign(result, {
        audio: `${process.env.AUDIO_API_URL}?word=${apidata}`,
      });
    }
    return result;
  }
  const isDataArray = Array.isArray(apidata);
  const phonetic = isDataArray ? apidata[0].phonetic : apidata.phonetic;
  audio = isDataArray ? apidata[0].audio : apidata.audio;
  // Audio API
  if (audio === undefined || audio === '') {
    const res = await fetch((process.env.AUDIO_API_URL as string) || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': process.env.AUDIO_API_UA || '',
        Authorization: `Bearer ${process.env.AUDIO_API_KEY || ''}`,
      },
      body: JSON.stringify({
        word: isDataArray ? apidata[0].word : apidata.word,
      }),
    });
    console.log(`Audio API Response: ${res.status} ${res.statusText}`);
    if (res.ok) {
      audio = `${process.env.AUDIO_API_URL}?word=${
        isDataArray ? apidata[0].word : apidata.word
      }`;
    }
  }
  const isObjKeyEmpty = <T>(obj: T, key: keyof T) => {
    return (
      obj[key] === '' ||
      obj[key] === undefined ||
      obj[key] === 'string' ||
      (obj[key] as string).trim() === ''
    );
  };

  if (isObjKeyEmpty(aidata, 'phonetic'))
    result = Object.assign(result, {
      phonetic: phonetic,
    });

  if (isObjKeyEmpty(aidata, 'audio'))
    result = Object.assign(result, {
      audio: audio,
    });

  return result;
}

async function getModifiedResult(
  originalData: CardProps,
  missingLang: LangEnum[],
  targetLang: LangEnum,
): Promise<CardProps | null> {
  const updatedResult = await getAIResponse(
    originalData,
    missingLang,
    targetLang,
  );
  if (!updatedResult || Object.keys(updatedResult).length === 0) {
    return null;
  }
  const newResult: CardProps = {
    ...originalData,
    blocks: originalData.blocks.map((block) => {
      const updatedBlock = updatedResult.blocks.find(
        (b) => b.partOfSpeech === block.partOfSpeech,
      );
      if (!updatedBlock) return block;
      return {
        ...block,
        definitions: block.definitions.map((definition) => {
          const updatedDefinition = updatedBlock.definitions.find((d) =>
            d.definition.some((def) => def.lang === targetLang),
          );
          if (!updatedDefinition) return definition;

          return {
            ...definition,
            definition: updatedDefinition.definition
              .filter((def) => missingLang.includes(def.lang as LangEnum))
              .concat(definition.definition),
            synonyms: updatedDefinition.synonyms?.concat(
              definition.synonyms || [],
            ),
            antonyms: updatedDefinition.antonyms?.concat(
              definition.antonyms || [],
            ),

            example: (() => {
              if (!definition.example || !updatedDefinition.example) {
                return definition.example || [];
              }

              const newExampleIndex = new Map<string, Example[]>();
              updatedDefinition.example.forEach((newExample) => {
                const targetContent = newExample.find(
                  (item) => item.lang === targetLang,
                )?.content;
                if (targetContent) {
                  newExampleIndex.set(targetContent, newExample);
                }
              });

              // O(E × L × M) - 處理原有例句
              return definition.example.map((originalExample) => {
                const originalTargetContent = originalExample.find(
                  (item) => item.lang === targetLang,
                )?.content;

                if (
                  originalTargetContent &&
                  newExampleIndex.has(originalTargetContent)
                ) {
                  const matchingNewExample = newExampleIndex.get(
                    originalTargetContent,
                  )!;
                  const existingLangSet = new Set(
                    originalExample.map((item) => item.lang),
                  );
                  const newLangItems = matchingNewExample.filter(
                    (item) =>
                      missingLang.includes(item.lang as LangEnum) &&
                      !existingLangSet.has(item.lang),
                  );
                  return [...originalExample, ...newLangItems];
                }

                return originalExample;
              });
            })(),
          };
        }),
      };
    }),
  };
  return await CheckData(originalData, newResult);
}

async function getAIResponse(
  processedData: CardProps | CardProps[] | string,
  sourceLang: LangEnum[],
  targetLang: LangEnum,
): Promise<CardProps> {
  let AIResponse;
  let prompt;
  const isProvidedData =
    typeof processedData === 'object' || Array.isArray(processedData);

  if (isProvidedData) {
    if (Array.isArray(processedData)) {
      prompt = `data : ${JSON.stringify(processedData).replaceAll('"', '')}
				it have ${processedData.length} data sources
				and total ${processedData.reduce(
          (acc, data) => acc + data.blocks.length,
          0,
        )} blocks(part of speech)
				Please response with all the blocks
				And combine all the data into one data (from all the data sources)
				IMPORTANT: Provide at least 3 varied examples for each definition in both source and target languages`;
    } else {
      processedData = processedData as CardProps;
      prompt = `data : ${JSON.stringify(processedData)}
				it have ${processedData.blocks.length} blocks(part of speech)
				Please response with all the blocks
				IMPORTANT: Provide at least 3 varied examples for each definition in both source and target languages`;
    }
  } else {
    prompt = `word : ${processedData} Please response with all the blocks
			IMPORTANT: Provide at least 3 varied examples for each definition in both source and target languages`;
  }

  try {
    AIResponse = await OpenAIClient.beta.chat.completions.parse({
      model: 'gpt-4.1-mini',
      messages: [
        {
          role: 'system',
          content: wordSystemInstructionCreator(sourceLang, targetLang),
        },
        ...OpenAIHistoryTranscriber(wordGeminiHistory),
        {
          role: 'user',
          content: prompt,
        },
      ],
      response_format: zodResponseFormat(
        wordSchemaCreator([...sourceLang, targetLang]),
        'data',
      ),
    });
    console.log(AIResponse.usage);
    const tempResult = AIResponse.choices[0].message?.parsed as wordSchema;
    const result: CardProps = {
      word: tempResult.word,
      phonetic: tempResult.phonetic,
      blocks: tempResult.blocks.map((block) => ({
        partOfSpeech: block.partOfSpeech as PartOfSpeech,
        definitions: block.definitions.map((definition) => ({
          definition: Object.values(definition.definition) as {
            lang: Lang;
            content: string;
          }[],
          synonyms: definition.synonyms,
          antonyms: definition.antonyms,
          example: definition.example.map((ex) =>
            ex.map((item) => ({
              lang: item.lang as Lang,
              content: item.content,
            })),
          ),
        })),
      })),
    };
    console.log('OpenAI SDK Success');
    return await CheckData(processedData, result);
  } catch (error) {
    console.error('OpenAI SDK Error :', error);
    console.log('trying by google AI SDK');
    try {
      const response = await Models.generateContent({
        model: 'gemma-3-27b-it',
        config: {
          responseMimeType: 'application/json',
          responseSchema: GwordSchemaCreator([
            ...sourceLang,
            targetLang,
          ]).toSchema(),
          systemInstruction: wordSystemInstructionCreator(
            sourceLang,
            targetLang,
          ),
        },
        contents: [
          ...wordGeminiHistory,
          {
            role: 'user',
            parts: [{ text: prompt }],
          },
        ],
      });
      if (!response || !response.text) {
        throw new Error('No response from Google AI SDK');
      }
      const tempResult: CardProps = JSON.parse(response.text);
      const result: CardProps = {
        word: tempResult.word,
        phonetic: tempResult.phonetic,
        blocks: tempResult.blocks.map((block) => ({
          partOfSpeech: block.partOfSpeech as PartOfSpeech,
          definitions: block.definitions.map((definition) => ({
            definition: Object.values(definition.definition) as {
              lang: Lang;
              content: string;
            }[],
            synonyms: definition.synonyms,
            antonyms: definition.antonyms,
            example: definition.example?.map((ex) =>
              ex.map((item) => ({
                lang: item.lang,
                content: item.content,
              })),
            ),
          })),
        })),
      };
      console.log('Google AI SDK Success');
      return await CheckData(processedData, result);
    } catch (error) {
      console.error('Error parsing AI response:', error);
    }
  }
  if (typeof processedData === 'string') {
    console.log('Error: No data found');
  }
  return processedData as CardProps;
}
