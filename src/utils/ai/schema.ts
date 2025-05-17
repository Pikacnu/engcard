import { z } from 'zod';
import { GArray, GEnum, GObject, GString } from './gemini/type';
import { ChatAction, PartOfSpeech } from '@/type';

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

export const GTextRecognizeSchema = new GObject('textRecognizeSchema', false, {
	properties: [
		new GArray(
			'words',
			true,
			new GObject('wordItem', true, {
				properties: [
					new GString('word', true),
					new GArray('translations', true, new GString('translation', true)),
					new GArray('definitions', true, new GString('definition', true)),
					new GArray('examples', true, new GString('example', true)),
					new GString('phonetic', false),
					new GEnum('partOfSpeech', Object.values(PartOfSpeech), false),
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
	newDeckName: z.string().optional(),
	deckId: z.string().optional(),
});

export const GChatModelSchema = new GObject('chatModelSchema', false, {
	properties: [
		new GArray('words', true, new GString('word', true)),
		new GEnum(
			'action',
			Object.values(ChatAction) as [string, ...string[]],
			true,
		),
		new GString('message', true),
		new GString('changeChatName', false),
		new GString('newDeckName', false),
		new GString('deckId', false),
	],
	showName: false,
}).toSchema();
export type ChatModelSchema = z.infer<typeof ChatModelSchema>;
