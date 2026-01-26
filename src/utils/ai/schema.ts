import { z } from 'zod';
import { G } from './gemini/type';
import { ChatAction, PartOfSpeech } from '@/type';
import { Lang, Langs } from '@/utils/lang';

export const textRecognizeSchema = z.object({
  words: z.array(
    z.object({
      word: z.string(),
      translations: z.array(z.string()),
      definitions: z.array(z.string()),
      examples: z.array(z.string()),
      phonetic: z.string().optional(),
      partOfSpeech: z
        .enum(Object.values(PartOfSpeech) as [string, ...string[]])
        .optional(),
    }),
  ),
});

export const GTextRecognizeSchema = G.object('textRecognizeSchema', false, {
  properties: [
    G.array(
      'words',
      true,
      G.object('wordItem', true, {
        properties: [
          G.string('word', true),
          G.array('translations', true, G.string('translation', true)),
          G.array('definitions', true, G.string('definition', true)),
          G.array('examples', true, G.string('example', true)),
          G.string('phonetic', false),
          G.enum('partOfSpeech', Object.values(PartOfSpeech), false),
        ],
      }),
    ),
  ],
  showName: false,
}).toSchema();

export type textRecognizeSchema = z.infer<typeof textRecognizeSchema>;

export const ChatModelSchema = z.object({
  words: z.array(z.string()),
  action: z.enum(Object.values(ChatAction) as [string, ...string[]]),
  message: z.string(),
  changeChatName: z.string().optional(),
  targetDeckName: z.string().optional(),
  targetDeckId: z.string().optional(),
  deckId: z.string().optional(),
  grammerFix: z.array(
    z.object({
      offsetWords: z.number(),
      lengthWords: z.number(),
      correctedText: z.string(),
    }),
  ),
});

export const GChatModelSchema = G.object('chatModelSchema', false, {
  properties: [
    G.array('words', true, G.string('word', true)),
    G.enum('action', Object.values(ChatAction) as [string, ...string[]], true),
    G.string('message', true),
    G.string('changeChatName', false),
    G.string('targetDeckName', false),
    G.string('targetDeckId', false),
    G.string('deckId', false),
    G.array(
      'grammerFix',
      true,
      G.object('grammerFixItem', true, {
        properties: [
          G.string('correctedText', true),
          G.number('offsetWords', true),
          G.number('lengthWords', true),
        ],
      }),
    ),
  ],
  showName: false,
}).toSchema();
export type ChatModelSchema = z.infer<typeof ChatModelSchema>;

export type wordSchema = z.infer<typeof wordSchema>;

const wordSchema = z.object({
  word: z.string(),
  phonetic: z.string(),
  availableSearchTarget: z.array(z.string()),
  blocks: z.array(
    z.object({
      partOfSpeech: z.enum([
        'noun',
        'verb',
        'adjective',
        'adverb',
        'pronoun',
        'preposition',
        'conjunction',
        'interjection',
        'exclamation',
        'abbreviation',
        'phrase',
      ]),
      definitions: z.array(
        z.object({
          definition: z.object(
            Object.fromEntries(
              Langs.map((lang) => [
                lang,
                z.object({
                  lang: z.enum(Langs as [string, ...string[]]),
                  content: z.string(),
                }),
              ]),
            ),
          ),
          synonyms: z.array(z.string()),
          antonyms: z.array(z.string()),
          example: z.array(
            z.array(
              z.object({
                lang: z.enum(Langs as [string, ...string[]]),
                content: z.string(),
              }),
            ),
          ),
        }),
      ),
    }),
  ),
});

export const wordSchemaCreator = (Langs: Lang[]) =>
  z.object({
    word: z.string(),
    phonetic: z.string(),
    availableSearchTarget: z.array(z.string()),
    blocks: z.array(
      z.object({
        partOfSpeech: z.enum([
          'noun',
          'verb',
          'adjective',
          'adverb',
          'pronoun',
          'preposition',
          'conjunction',
          'interjection',
          'exclamation',
          'abbreviation',
          'phrase',
        ]),
        definitions: z.array(
          z.object({
            definition: z.object(
              Object.fromEntries(
                Langs.map((lang) => [
                  lang,
                  z.object({
                    lang: z.enum(Langs as [string, ...string[]]),
                    content: z.string(),
                  }),
                ]),
              ),
            ),
            synonyms: z.array(z.string()),
            antonyms: z.array(z.string()),
            example: z.array(
              z.array(
                z.object({
                  lang: z.enum(Langs as [string, ...string[]]),
                  content: z.string(),
                }),
              ),
            ),
          }),
        ),
      }),
    ),
  });

export const GwordSchemaCreator = (Langs: Lang[]) =>
  G.object('wordSchema', false, {
    properties: [
      G.string('word', true),
      G.string('phonetic', true),
      G.array(
        'availableSearchTarget',
        true,
        G.string('availableSearchItems', true),
      ),
      G.array(
        'blocks',
        true,
        G.object('block', true, {
          properties: [
            G.enum(
              'partOfSpeech',
              [
                'noun',
                'verb',
                'adjective',
                'adverb',
                'pronoun',
                'preposition',
                'conjunction',
                'interjection',
                'exclamation',
                'abbreviation',
                'phrase',
              ],
              true,
            ),
            G.array(
              'definitions',
              true,
              G.object('definition', true, {
                properties: [
                  G.array(
                    'definition',
                    true,
                    G.object('definitionItem', true, {
                      properties: Langs.map((lang) =>
                        G.object(lang, true, {
                          properties: [
                            G.enum('lang', Langs, true),
                            G.string('content', true),
                          ],
                        }),
                      ),
                    }),
                  ),
                  G.array('synonyms', true, G.string('synonym', true)),
                  G.array('antonyms', true, G.string('antonym', true)),
                  G.array(
                    'example',
                    true,
                    G.array(
                      'exampleItem',
                      true,
                      G.object('exampleObject', true, {
                        properties: [
                          G.enum('lang', Langs, true),
                          G.string('content', true),
                        ],
                      }),
                    ),
                  ),
                ],
              }),
            ),
          ],
        }),
      ),
    ],
    showName: false,
  });

export const DictionaryItemMetadataSchema = z.object({
  source_term: z.string(),
  detected_lang: z.string().describe('ISO code'),
  phonetic: z.string().optional(),
  pos: z.string().describe('noun/verb/etc'),
  definitions: z
    .object({
      en: z.string().optional(),
      zh: z.string().optional(),
      ja: z.string().optional(),
    })
    .and(z.record(z.string())),
  synonyms: z.array(z.string()),
  context_tags: z.array(z.string()),
  examples: z.array(
    z.object({
      ja: z.string().optional(),
      zh: z.string().optional(),
      en: z.string().optional(),
      nuance: z.string().optional(),
    }),
  ),
});

export type DictionaryItemMetadata = z.infer<
  typeof DictionaryItemMetadataSchema
>;
