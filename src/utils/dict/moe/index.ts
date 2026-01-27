import { Definition } from '@/type';
import { MoeResponse, ZhPartOfSpeech, ZhPartOfSpeechMap } from './type';

export async function getWordFromMoeDict(word: string) {
  const response = await fetch(
    `https://www.moedict.tw/uni/${encodeURIComponent(word)}`,
  );
  if (!response.ok) {
    return null;
  }
  const data = (await response.json()) as MoeResponse;
  if (!data || Object.keys(data).length === 0) {
    return null;
  }
  const definationsWithType: Record<Partial<ZhPartOfSpeech>, Definition[]> = {
    副: [],
    動: [],
    名: [],
    形: [],
    量: [],
    代: [],
    介: [],
    連: [],
    嘆: [],
    感: [],
    縮: [],
    片: [],
  };
  data.heteronyms.forEach((heteronym) => {
    heteronym.definitions.forEach((definition) => {
      const partOfSpeech = (definition.type || '名') as ZhPartOfSpeech;
      definationsWithType[partOfSpeech].push({
        definition: [{ lang: 'zh-tw', content: definition.def }],
        antonyms: definition.antonyms ? definition.antonyms.split('、') : [],
        example: definition.example
          ? definition.example.map((ex) => [{ lang: 'zh-tw', content: ex }])
          : [],
        synonyms: definition.synonyms ? definition.synonyms.split('、') : [],
      });
    });
  });
  return {
    word: data.title,
    phonetic: data.heteronyms[0]?.bopomofo2 || '',
    blocks: Object.entries(definationsWithType)
      .filter(([, defs]) => defs.length > 0)
      .map(([partOfSpeech, definitions]) => ({
        partOfSpeech: ZhPartOfSpeechMap[partOfSpeech as ZhPartOfSpeech],
        definitions,
      })),
  };
}
