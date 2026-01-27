import { CardProps, PartOfSpeech, LangEnum } from '@/type';
import { textRecognizeSchema } from '../ai/schema';
import { isChinese, isEnglish } from '../functions/functions';
import { similarity } from '@/utils/dict';

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
