import { db } from '@/db';
import { dictionaryItems } from '@/db/schema';
import { LangEnum, CardProps, Example, PartOfSpeech, Lang } from '@/type';
import {
  DictionaryItemMetadata,
  generateEmbedding,
  OpenAIClient,
  wordSystemInstructionCreator,
  OpenAIHistoryTranscriber,
  wordGeminiHistory,
  wordSchemaCreator,
  wordSchema,
  GwordSchemaCreator,
  Models,
} from '@/utils';
import {
  getWordFromDictionaryAPI,
  getWordFromEnWordNetAPI,
} from '@/utils/dict/functions';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';

export async function newWord(
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

export async function saveToDictionaryItems(
  data: CardProps,
  langCode: LangEnum,
) {
  try {
    const term = data.word;
    const inserts = [];

    for (const block of data.blocks) {
      for (const defItem of block.definitions) {
        // Collect definition texts for embedding
        const defTexts = defItem.definition.map((d) => d.content).join(' ');
        const embeddingText = `${term} ${defTexts}`;

        // Prepare definitions map for metadata
        const definitionsMap: Record<string, string> = {};
        defItem.definition.forEach((d) => {
          definitionsMap[d.lang] = d.content;
        });

        // Prepare examples for metadata
        const examples =
          defItem.example?.map((exGroup) => {
            const exObj: Record<string, string> = {};
            exGroup.forEach((ex) => {
              exObj[ex.lang] = ex.content;
            });
            // Approximate matching to schema keys (ja, zh, en)
            return {
              ja: exObj[LangEnum.JA],
              zh: exObj[LangEnum.TW],
              en: exObj[LangEnum.EN],
              // nuance: ... not provided in CardProps
            };
          }) || [];

        const metadata: DictionaryItemMetadata = {
          source_term: term,
          detected_lang: langCode,
          phonetic: data.phonetic || '',
          pos: block.partOfSpeech || 'unknown',
          definitions: definitionsMap,
          synonyms: defItem.synonyms || [],
          context_tags: [], // Not in CardProps
          examples: examples,
        };

        inserts.push(async () => {
          try {
            const embedding = await generateEmbedding(embeddingText);
            await db.insert(dictionaryItems).values({
              term: term,
              languageCode: langCode,
              embedding: embedding,
              metadata: metadata,
            });
          } catch (e) {
            console.error(
              'Error generating embedding or inserting dictionary item',
              e,
            );
          }
        });
      }
    }
    await Promise.all(inserts.map((fn) => fn()));
  } catch (error) {
    console.error('Error saving to dictionary items:', error);
  }
}

export async function CheckData(
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

export async function getModifiedResult(
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

export async function getAIResponse(
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
    const checked = await CheckData(processedData, result);
    await saveToDictionaryItems(checked, sourceLang[0] || LangEnum.EN);
    return checked;
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
      const checked = await CheckData(processedData, result);
      await saveToDictionaryItems(checked, sourceLang[0] || LangEnum.EN);
      return checked;
    } catch (error) {
      console.error('Error parsing AI response:', error);
    }
  }
  if (typeof processedData === 'string') {
    console.log('Error: No data found');
  }
  return processedData as CardProps;
}
