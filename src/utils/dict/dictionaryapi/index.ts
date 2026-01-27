import { CardProps, DictionaryAPIData, PartOfSpeech, LangEnum } from '@/type';

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
