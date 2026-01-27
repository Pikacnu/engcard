import { CardProps, PartOfSpeech, LangEnum } from '@/type';
import { JishoResponse } from './type';

export async function getWordFromJishoOrg(
  word: string,
): Promise<CardProps[] | null> {
  const response = await fetch(
    `https://jisho.org/api/v1/search/words?keyword=${encodeURIComponent(word)}`,
  );
  if (!response.ok) {
    return null;
  }
  const data = (await response.json()) as JishoResponse;
  if (!data || data.meta.status !== 200 || data.data.length === 0) {
    return null;
  }
  return data.data.map((item) => {
    const result: CardProps = {
      word: item.slug,
      phonetic: item.japanese[0]?.reading || '',
      blocks: [
        {
          partOfSpeech: (item.senses[0]?.parts_of_speech[0] ||
            'noun') as PartOfSpeech,
          definitions: item.senses.map((sense) => ({
            definition: sense.english_definitions.map((definition) => ({
              lang: LangEnum.EN,
              content: definition,
            })),
            synonyms: sense.links.map((link) => link.text),
            antonyms: [],
            example: [],
          })),
        },
      ],
    };
    return result;
  });
}
