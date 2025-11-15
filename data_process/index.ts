import Bun from 'bun';

export default async function init() {
  const file = await Bun.file('data_process/sch.txt').text();
  const words = file
    .replaceAll('\r', '')
    .split('\n')
    .map((line) => line.split(' ').filter((word) => word.length > 0));
  const wrongFormats = words
    .filter((word) => word.length !== 3)
    .map((word) =>
      word
        .join(' ')
        .replaceAll(' ', '')
        .replace(/([A-z]+)(\W+)(\d+)/, '$1 $2 $3')
        .split(' '),
    );
  const correctFormats = words.filter((word) => word.length === 3);
  const allWords = [...correctFormats, ...wrongFormats].map((word) =>
    word.splice(0, 2),
  );
  const sortedByWord = allWords.sort((a, b) => a[0].localeCompare(b[0]));
  const getFullDataFromAPI = [];
  for (const word of sortedByWord) {
    const res = await fetch(
      `https://api.dictionaryapi.dev/api/v2/entries/en/${word[0]}`,
    );
    if (!res.ok) {
      getFullDataFromAPI.push({
        word: word[0],
        phonetic: 'No Data',
        PartOfSpeech: ['No Data'],
        meaning: word[1],
      });
      continue;
    }
    const data = (await res.json())[0] as DictionaryData;
    getFullDataFromAPI.push({
      word: word[0],
      phonetic: data.phonetic,
      PartOfSpeech: data.meanings.map((meaning) => meaning.partOfSpeech),
      meaning: word[1],
    });
    await new Promise((resolve) => setTimeout(resolve, 1000 * 0.5));
    console.log(
      `${sortedByWord.indexOf(word)}/${sortedByWord.length} ${(
        (sortedByWord.indexOf(word) / sortedByWord.length) *
        100
      ).toFixed(2)}%`,
    );
  }
  /*
	const getFullDataFromAPI = await Promise.all(
		sortedByWord.map(async (word) => {
			
		}),
	);*/
  Bun.write(
    'data_process/sch_2.json',
    JSON.stringify(getFullDataFromAPI, null, 2),
  );
}

init();

type DictionaryData = {
  word: string;
  phonetic: string;
  phonetics: { text: string; audio?: string }[];
  orign: string;
  meanings: {
    partOfSpeech: string;
    definitions: {
      definition: string;
      example: string;
      synonyms: string[];
      antonyms: string[];
    }[];
  }[];
};
