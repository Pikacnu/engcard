import z from 'zod';
import { GObject, GString, GArray, GEnum } from './ai/gemini/type';

export * from './ai/prompt';
export * from './ai/functions';
export * from './ai/schema';

export const wordSchema = z.object({
	word: z.string(),
	phonetic: z.string(),
	zh: z.array(z.string()),
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
					definition: z.array(
						z.object({
							lang: z.enum(['en', 'tw', 'ja']),
							content: z.string(),
						}),
					),
					synonyms: z.array(z.string()),
					antonyms: z.array(z.string()),
					example: z.array(
						z.array(
							z.object({
								lang: z.enum(['en', 'tw']),
								content: z.string(),
							}),
						),
					),
				}),
			),
		}),
	),
});

export const GwordSchema = new GObject('wordSchema', false, {
	properties: [
		new GString('word', true),
		new GString('phonetic', true),
		new GArray('zh', true, new GString('zhItem', true)),
		new GArray(
			'blocks',
			true,
			new GObject('block', true, {
				properties: [
					new GEnum(
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
					new GArray(
						'definitions',
						true,
						new GObject('definition', true, {
							properties: [
								new GArray(
									'definition',
									true,
									new GObject('definitionItem', true, {
										properties: [
											new GEnum('lang', ['en', 'tw', 'ja'], true),
											new GString('content', true),
										],
									}),
								),
								new GArray('synonyms', true, new GString('synonym', true)),
								new GArray('antonyms', true, new GString('antonym', true)),
								new GArray(
									'example',
									true,
									new GArray(
										'exampleItem',
										true,
										new GObject('exampleObject', true, {
											properties: [
												new GEnum('lang', ['en', 'tw'], true),
												new GString('content', true),
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
