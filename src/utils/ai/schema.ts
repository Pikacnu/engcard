import { z } from 'zod';
import { GArray, GEnum, GObject, GString, GNumber } from './gemini/type'; // Ensure GNumber is imported
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

// Schema for a single grammar error (used in ChatModelSchema)
export const GrammarErrorSchema = z.object({
    message: z.string().describe("Description of the error, e.g., 'Spelling mistake' or 'Subject-verb agreement'"),
    shortMessage: z.string().optional().describe("A very brief version of the message"),
    correction: z.string().optional().describe("Suggested correction for the error"),
    offset: z.number().describe("Character offset from the beginning of the text where the error starts"),
    length: z.number().describe("Length of the erroneous text segment"),
    ruleId: z.string().optional().describe("ID of the grammar rule that was violated (optional)"),
    ruleDescription: z.string().optional().describe("Description of the rule (optional)")
});
export type GrammarErrorSchemaType = z.infer<typeof GrammarErrorSchema>;

export const ChatModelSchema = z.object({
	words: z.array(z.string()),
	action: z.enum(Object.values(ChatAction) as [string, ...string[]]),
	message: z.string(),
	changeChatName: z.string().optional(),
	targetDeckName: z.string().optional(),
	targetDeckId: z.string().optional(),
	deckId: z.string().optional(),
    grammarCheckResults: z.array(GrammarErrorSchema).optional().describe("Results of a grammar check performed on the user's input, if applicable."),
});

// Gemini schema for GrammarError
const GGrammarErrorProperties = [
    new GString('message', true),
    new GString('shortMessage', false),
    new GString('correction', false),
    new GNumber('offset', true), // Using GNumber as confirmed available
    new GNumber('length', true), // Using GNumber
    new GString('ruleId', false),
    new GString('ruleDescription', false)
];

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
		new GString('targetDeckName', false),
		new GString('targetDeckId', false),
		new GString('deckId', false),
        new GArray('grammarCheckResults', false, new GObject('GrammarErrorItem', true, { properties: GGrammarErrorProperties }), "Optional array of grammar check results.")
	],
	showName: false,
}).toSchema();
export type ChatModelSchema = z.infer<typeof ChatModelSchema>;

// Schema for a single fill-in-the-blank question from AI
export const FillInTheBlankQuestionAiSchema = z.object({
    sourceWord: z.string().describe("The word provided as input for which this question is generated."),
    originalSentence: z.string().describe("A complete, grammatically correct sentence that uses the source word in a clear context."),
    blankedSentence: z.string().describe("The originalSentence with the sourceWord (or a close variation) replaced by '____'."),
    correctWord: z.string().describe("The exact word that was replaced to create the blank."),
    options: z.array(z.string()).optional().describe("Optional: An array of 3-4 strings for multiple choice. One of these must be the correctWord."),
    difficulty: z.enum(['easy', 'medium', 'hard']).optional().describe("Optional: Estimated difficulty level, e.g., 'easy', 'medium', 'hard'.")
});

// Schema for an array of fill-in-the-blank questions (AI response)
export const FillInTheBlankQuestionsAiResponseSchema = z.array(FillInTheBlankQuestionAiSchema);

// Gemini schema representation for FillInTheBlankQuestionsAiResponseSchema
const GFillInTheBlankQuestionProperties = [
    new GString('sourceWord', true, "The word provided as input for which this question is generated."),
    new GString('originalSentence', true, "A complete, grammatically correct sentence that uses the source word in a clear context."),
    new GString('blankedSentence', true, "The originalSentence with the sourceWord (or a close variation) replaced by '____'."),
    new GString('correctWord', true, "The exact word that was replaced to create the blank."),
    new GArray('options', false, new GString('option', true), "Optional: An array of 3-4 strings for multiple choice. One of these must be the correctWord."),
    new GEnum('difficulty', ['easy', 'medium', 'hard'], false, "Optional: Estimated difficulty level, e.g., 'easy', 'medium', 'hard'.")
];

export const GFillInTheBlankQuestionsAiResponseSchema = new GArray(
    'questions', // Name of the array property in the response
    true,        // isRequired for the array itself
    new GObject(
        'questionItem', // Name for individual objects in the array
        true,           // isRequired for objects in the array
        { properties: GFillInTheBlankQuestionProperties }
    ),
    "An array of generated fill-in-the-blank questions."
).toSchema();

export type FillInTheBlankQuestionAiSchemaType = z.infer<typeof FillInTheBlankQuestionAiSchema>;
export type FillInTheBlankQuestionsAiResponseType = z.infer<typeof FillInTheBlankQuestionsAiResponseSchema>;
