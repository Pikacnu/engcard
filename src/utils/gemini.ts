import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import z from 'zod';
import { GObject, GString, GArray, GEnum } from './gemini-type';

const apikey = process.env.GEMINI_API_KEY || '';
export const aiClient = new OpenAI({
	baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
	apiKey: apikey,
});

export const wordSchema = z.object({
	word: z.string(),
	phonetic: z.string(),
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
							lang: z.string(),
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
											new GString('lang', true),
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

const GenerativeAI = new GoogleGenerativeAI(apikey);
export const TextModel = GenerativeAI.getGenerativeModel({
	model: 'gemini-2.0-flash',
});

export const WordModel = GenerativeAI.getGenerativeModel({
	model: 'gemini-2.0-flash',
	generationConfig: {
		responseMimeType: 'application/json',
		responseSchema: GwordSchema.toSchema(),
	},
	systemInstruction: `
You are an expert in the field of English linguistics. Your task is to explain the given word while ensuring professionalism and completeness. Based on the provided data, refine and enhance the explanations while preserving all original information.
Your response must meet the following requirements:
Maintain the original order and count of all input data.
Provide translations of the word in both English and 臺灣正體.
Retain all definitions and parts of speech as given in the input data.
Process the data in JSON format and return the output in the same JSON structure.
Ensure that no information is lost or omitted during processing.
Make sure that the output is grammatically correct and professional.`,
});
