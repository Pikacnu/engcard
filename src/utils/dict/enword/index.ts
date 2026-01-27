import {
  PartOfSpeech,
  CardProps,
  EnWordDefinition,
  Definition,
  LangEnum,
  RelationType,
  EnWordPartOfSpeechToPartOfSpeech,
  EnWordPartOfSpeech,
  Blocks,
} from '@/type';

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
