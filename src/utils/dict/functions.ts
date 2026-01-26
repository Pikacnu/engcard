import {
  CardProps,
  DictionaryAPIData,
  PartOfSpeech,
  EnWordDefinition,
  RelationType,
  Definition,
  EnWordPartOfSpeech,
  EnWordPartOfSpeechToPartOfSpeech,
  Blocks,
  LangEnum,
} from '@/type';
import { textRecognizeSchema } from '../ai/schema';
import { isChinese, isEnglish } from '../functions/functions';

export async function getWordFromDictionaryAPI(
  word: string,
): Promise<CardProps | null> {
  const response = await fetch(
    `https://api.dictionaryapi.dev/api/v2/entries/en/${word}`,
  );
  if (!response.ok) {
    return null;
  }
  const dataList = (await response.json()) as DictionaryAPIData[];
  const data = dataList[0];
  if (!data) {
    return null;
  }
  return {
    word: data.word,
    phonetic: data.phonetic,
    audio:
      data.phonetics.find((phonetic) => phonetic.text === data.phonetic)
        ?.audio || '',
    blocks: data.meanings.map((meaning) => ({
      partOfSpeech: meaning.partOfSpeech as PartOfSpeech,
      definitions: meaning.definitions.map((definition) => {
        const data = {
          definition: [
            {
              lang: LangEnum.EN,
              content: definition.definition,
            },
          ],
          synonyms: definition.synonyms || [],
          antonyms: definition.antonyms || [],
        };
        if (definition.example) {
          return Object.assign(data, {
            example: [
              [
                {
                  lang: LangEnum.EN,
                  content: definition.example,
                },
              ],
            ],
          });
        }
        return data;
      }),
    })),
  };
}

type WithAdditionData<T> = T & {
  partOfSpeech: PartOfSpeech;
  phonetic?: string;
};

export async function getWordFromEnWordNetAPI(
  word: string,
): Promise<CardProps | null> {
  const response = await fetch(`https://en-word.net/json/lemma/${word}`);
  if (!response.ok) {
    return null;
  }
  const data = (await response.json()) as EnWordDefinition[];
  if (!data) {
    return null;
  }
  const definitions: WithAdditionData<Definition>[] = data.map((item) => {
    const definition = {
      definition: [
        {
          lang: LangEnum.EN,
          content: item.definition,
        },
      ],
      example:
        item.examples?.map((example) => [
          {
            lang: LangEnum.EN,
            content: example,
          },
        ]) || [],
      synonyms: item.relations
        .map((relation) => {
          if (
            [RelationType.Antonym, RelationType.Derivation].includes(
              relation.rel_type,
            )
          ) {
            return relation.trg_word;
          }
          return null;
        })
        .filter((item) => item !== null) as string[],
      antonyms: item.relations
        .map((relation) => {
          if ([RelationType.Antonym].includes(relation.rel_type)) {
            return relation.trg_word;
          }
        })
        .filter((item) => item !== null) as string[],
      partOfSpeech:
        EnWordPartOfSpeechToPartOfSpeech[
          item.subject.split('.')[0] as EnWordPartOfSpeech
        ],
    };
    const pronunciations = item.lemmas.find(
      (lemma) => lemma.lemma === word,
    )?.pronunciations;
    if (Array.isArray(pronunciations) && pronunciations.length > 0) {
      const phonetic = pronunciations[0].value;
      return Object.assign(definition, { phonetic });
    }

    return definition;
  });
  const blocks: Blocks[] = [];
  definitions.forEach((definition) => {
    const block = blocks.find(
      (block) => block.partOfSpeech === definition.partOfSpeech,
    );
    if (block) {
      block.definitions.push(definition);
      if (definition.phonetic && !block.phonetic) {
        block.phonetic = definition.phonetic;
      }
    } else {
      blocks.push({
        partOfSpeech: definition.partOfSpeech,
        definitions: [definition],
      });
    }
  });
  if (blocks.length === 0) {
    return null;
  }
  return {
    word,
    phonetic: blocks[0]?.phonetic || '',
    audio: '',
    blocks,
  };
}

export function transfromToCardPropsFromRecognizedResult(
  result: textRecognizeSchema,
  targetLang: LangEnum = LangEnum.TW,
): CardProps[] {
  const words: CardProps[] = result.words.map((word) => {
    const result: CardProps = {
      word: word.word,
      phonetic: word.phonetic || '',
      audio: '',
      blocks: [
        {
          partOfSpeech: (word.partOfSpeech || 'noun') as PartOfSpeech,
          definitions: [
            {
              definition: word.definitions.map((definition) => {
                if (isChinese(definition)) {
                  return {
                    lang: targetLang,
                    content: definition,
                  };
                }
                return {
                  lang: LangEnum.EN,
                  content: definition,
                };
              }),
              example: word.examples.map((example) => {
                if (isChinese(example)) {
                  return [
                    {
                      lang: targetLang,
                      content: example,
                    },
                  ];
                }
                return [
                  {
                    lang: LangEnum.EN,
                    content: example,
                  },
                ];
              }),
            },
          ],
        },
      ],
    };
    return result;
  });
  return words;
}

export function getDefiniationFromRecognizedResultAndCardProps(
  cardProps: CardProps,
  result: textRecognizeSchema,
  targetLang: LangEnum,
): CardProps | undefined {
  if (!result.words.length) return undefined;

  // 深度複製卡片以避免修改原始資料
  const newCard = structuredClone(cardProps);
  let hasUpdated = false;

  // 處理卡片中的每個區塊
  newCard.blocks = newCard.blocks.map((block) => {
    // 尋找對應詞性的 result words
    const matchingWords = result.words.filter(
      (word) => word.partOfSpeech === block.partOfSpeech,
    );

    if (!matchingWords.length) return block;

    // 處理每個定義
    block.definitions = block.definitions.map((def) => {
      // 尋找英文定義
      const engDef = def.definition.find((item) => item.lang === LangEnum.EN);
      if (!engDef) return def;

      // 檢查是否已有中文定義
      const hasZhDef = def.definition.some((item) => item.lang === targetLang);
      if (hasZhDef) return def;

      // 尋找最匹配的定義
      let bestMatchScore = 0;
      let bestMatchZhDef = '';

      for (const wordData of matchingWords) {
        const enDefinitions = wordData.definitions.filter((d) => isEnglish(d));
        const zhDefinitions = wordData.definitions.filter((d) => !isEnglish(d));

        if (!zhDefinitions.length) continue;

        for (const enDef of enDefinitions) {
          const score = similarity(engDef.content, enDef);
          if (score > bestMatchScore && score > 60) {
            bestMatchScore = score;
            bestMatchZhDef = zhDefinitions[0];
          }
        }
      }

      // 如果找到足夠匹配的中文定義，將其加入
      if (bestMatchZhDef) {
        def.definition.push({
          lang: targetLang,
          content: bestMatchZhDef,
        });
        hasUpdated = true;
      }

      return def;
    });

    return block;
  });

  // 只返回有更新的卡片
  return hasUpdated ? newCard : undefined;
}

function similarity(a: string, b: string): number {
  const lengthA = a.length;
  const lengthB = b.length;
  const maxLength = Math.max(lengthA, lengthB);
  const distance = levenshtein(a, b);
  return ((maxLength - distance) / maxLength) * 100;
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = [];

  // Initialize matrix
  for (let i = 0; i <= b.length; i++) {
    matrix[i] = [i];
  }
  for (let j = 0; j <= a.length; j++) {
    matrix[0][j] = j;
  }

  // Fill in the rest of the matrix
  for (let i = 1; i <= b.length; i++) {
    for (let j = 1; j <= a.length; j++) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          Math.min(
            matrix[i][j - 1] + 1, // insertion
            matrix[i - 1][j] + 1, // deletion
          ),
        );
      }
    }
  }

  return matrix[b.length][a.length];
}
