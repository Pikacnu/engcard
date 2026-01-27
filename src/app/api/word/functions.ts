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
} from '@/utils/dict';
import { and, arrayContained, eq } from 'drizzle-orm';
import { zodResponseFormat } from 'openai/helpers/zod.mjs';

export async function getNewWordDataWithAPIResources(
  word: string,
  sourceLang: LangEnum[],
  targetLang: LangEnum,
  apiData: Promise<CardProps | CardProps[] | null>[],
): Promise<CardProps | null> {
  const sourceDataList = (await Promise.allSettled(apiData))
    .filter((data) => data.status === 'fulfilled')
    .map((data) => (data as PromiseFulfilledResult<CardProps>).value)
    .filter((data): data is CardProps => data !== null)
    .flat();
  if (sourceDataList.length < 1) {
    return null;
  }
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

export async function newWord(
  word: string,
  sourceLang: LangEnum[],
  targetLang: LangEnum,
): Promise<CardProps | null> {
  // Fetch data from multiple sources
  const sourceDataPromiseList = [
    getWordFromDictionaryAPI(word),
    getWordFromEnWordNetAPI(word),
  ];
  return getNewWordDataWithAPIResources(
    word,
    sourceLang,
    targetLang,
    sourceDataPromiseList,
  );

  const sourceDataList = (await Promise.allSettled(sourceDataPromiseList))
    .filter((data) => data.status === 'fulfilled')
    .map((data) => (data as PromiseFulfilledResult<CardProps>).value);
  if (sourceDataList.length < 1) {
    return null;
  }

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
    const LangSet = new Set<LangEnum>();
    LangSet.add(langCode);

    for (const block of data.blocks) {
      for (const defItem of block.definitions) {
        // Collect definition texts for embedding
        const defTexts = defItem.definition.map((d) => d.content).join(' ');
        const defLangs = defItem.definition.map((d) => d.lang);
        defLangs.forEach((lang) => LangSet.add(lang as LangEnum));
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
            return exObj;
          }) || [];

        const metadata: DictionaryItemMetadata = {
          source_term: term,
          detected_lang: Array.from(LangSet),
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
              languageCode: Array.from(LangSet),
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
    // Word string search
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

  // Object data merging - Ensure data completeness
  const isDataArray = Array.isArray(apidata);
  const sourceList = isDataArray ? apidata : [apidata];

  const phonetic = sourceList[0]?.phonetic;
  audio = sourceList[0]?.audio;

  // Audio API Fallback
  if (!audio) {
    const res = await fetch((process.env.AUDIO_API_URL as string) || '', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': process.env.AUDIO_API_UA || '',
        Authorization: `Bearer ${process.env.AUDIO_API_KEY || ''}`,
      },
      body: JSON.stringify({
        word: sourceList[0]?.word || aidata.word,
      }),
    });
    if (res.ok) {
      audio = `${process.env.AUDIO_API_URL}?word=${sourceList[0]?.word || aidata.word}`;
    }
  }

  const isObjKeyEmpty = (obj: Record<string, unknown>, key: string) => {
    const val = obj[key];
    return !val || (typeof val === 'string' && val.trim() === '');
  };

  if (isObjKeyEmpty(aidata as unknown as Record<string, unknown>, 'phonetic'))
    result.phonetic = phonetic || '';
  if (isObjKeyEmpty(aidata as unknown as Record<string, unknown>, 'audio'))
    result.audio = audio || '';

  // Deep comparison: Ensure all parts of speech from source are present in AI result
  sourceList.forEach((source) => {
    source.blocks.forEach((sBlock) => {
      const aBlock = result.blocks.find(
        (b) => b.partOfSpeech === sBlock.partOfSpeech,
      );
      if (!aBlock) {
        // AI missed a whole category, we should append it
        console.warn(
          `AI missed part of speech: ${sBlock.partOfSpeech}, appending original data.`,
        );
        result.blocks.push(sBlock);
      } else {
        // AI found the block, but check if it missed definitions?
        // For now, assume AI's definitions are preferred, but we could merge if needed.
      }
    });
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

  const alreadyEmbeddedLangs = new Set<Lang>();

  // Make sure to collect all already embedded languages
  originalData.blocks.forEach((block) => {
    block.definitions.forEach((def) => {
      def.definition.forEach((d) => {
        alreadyEmbeddedLangs.add(d.lang);
      });
    });
  });

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
            synonyms: Array.from(
              new Set([
                ...(updatedDefinition.synonyms || []),
                ...(definition.synonyms || []),
              ]),
            ),
            antonyms: Array.from(
              new Set([
                ...(updatedDefinition.antonyms || []),
                ...(definition.antonyms || []),
              ]),
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

  // regenerate embedding and save to database
  Promise.allSettled(
    newResult.blocks.map(async (block) => {
      return (
        await Promise.allSettled(
          block.definitions.map(async (defItem) => {
            const defTexts = defItem.definition.map((d) => d.content).join(' ');
            const embeddingText = `${newResult.word} ${defTexts}`;
            const embeddedVector = await generateEmbedding(embeddingText);
            return {
              embedding: embeddedVector,
              metadata: {
                source_term: newResult.word,
                detected_lang: [targetLang] as LangEnum[],
                phonetic: newResult.phonetic || '',
                pos: block.partOfSpeech || 'unknown',
                definitions: block.definitions.reduce(
                  (acc, def) => {
                    def.definition.forEach((d) => {
                      acc[d.lang] = d.content;
                    });
                    return acc;
                  },
                  {} as Record<string, string>,
                ),
                synonyms: defItem.synonyms || [],
                context_tags: [] as string[],
                examples:
                  defItem.example?.map((exGroup) => {
                    const exObj: Record<string, string> = {};
                    exGroup.forEach((ex) => {
                      exObj[ex.lang] = ex.content;
                    });
                    return exObj;
                  }) || [],
              },
            };
          }),
        )
      )
        .filter((res) => res.status === 'fulfilled')
        .map((res) => res.value)
        .flat();
    }),
  ).then((allEmbeddings) => {
    const embeddings = allEmbeddings
      .filter((res) => res.status === 'fulfilled')
      .map((res) => res.value)
      .flat();
    db.transaction(async (tx) => {
      try {
        const existingLangCodes = await tx
          .delete(dictionaryItems)
          .where(
            and(
              eq(dictionaryItems.term, newResult.word),
              arrayContained(dictionaryItems.languageCode, [targetLang]),
            ),
          )
          .returning({
            langCode: dictionaryItems.languageCode,
          });
        const existingLangSet = new Set<LangEnum>();
        existingLangSet.add(targetLang);
        existingLangCodes.forEach((item) => {
          item.langCode.forEach((lang) =>
            existingLangSet.add(lang as LangEnum),
          );
        });
        await tx.insert(dictionaryItems).values(
          embeddings.map((item) => ({
            term: newResult.word,
            languageCode: Array.from(existingLangSet),
            embedding: item.embedding,
            metadata: item.metadata,
          })),
        );
      } catch (e) {
        console.error('Error saving updated embeddings to database:', e);
        tx.rollback();
      }
    });
  });

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
      prompt = `data : ${JSON.stringify(processedData).replaceAll('"', '')}
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
      model: 'gpt-4o-mini',
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

    const tempResult = AIResponse.choices[0].message?.parsed as wordSchema;
    const result: CardProps = {
      word: tempResult.word,
      phonetic: tempResult.phonetic,
      availableSearchTarget: tempResult.availableSearchTarget,
      blocks: tempResult.blocks.map((block) => ({
        partOfSpeech: block.partOfSpeech as PartOfSpeech,
        definitions: block.definitions.map((definition) => ({
          definition: Object.values(definition.definition).map((d) => ({
            lang: (d as { lang: Lang }).lang,
            content: (d as { content: string }).content,
          })),
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

    const checked = await CheckData(processedData, result);
    await saveToDictionaryItems(checked, sourceLang[0] || LangEnum.EN);
    return checked;
  } catch (error) {
    console.error('AI Error processing, falling back to Google...', error);
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

      if (!response.text) throw new Error('No response text');

      const tempResult: wordSchema = JSON.parse(response.text);
      const result: CardProps = {
        word: tempResult.word,
        phonetic: tempResult.phonetic,
        availableSearchTarget: tempResult.availableSearchTarget,
        blocks: tempResult.blocks.map((block) => ({
          partOfSpeech: block.partOfSpeech as PartOfSpeech,
          definitions: block.definitions.map((definition) => ({
            definition: Object.values(definition.definition).map((d) => ({
              lang: (d as { lang: Lang }).lang,
              content: (d as { content: string }).content,
            })),
            synonyms: definition.synonyms,
            antonyms: definition.antonyms,
            example: definition.example?.map((ex) =>
              ex.map((item) => ({
                lang: item.lang as Lang,
                content: item.content,
              })),
            ),
          })),
        })),
      };

      const checked = await CheckData(processedData, result);
      await saveToDictionaryItems(checked, sourceLang[0] || LangEnum.EN);
      return checked;
    } catch (e) {
      console.error('Critical AI Error:', e);
    }
  }
  return (
    Array.isArray(processedData) ? processedData[0] : processedData
  ) as CardProps;
}
