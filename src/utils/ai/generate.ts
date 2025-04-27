import { Content, Schema } from '@google/generative-ai';
import { Model, model, OpenAIClient } from './openai';
import { GenerativeAI } from './gemini';
import { OpenAIHistoryTranscriber } from './functions';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

export enum ModelLevel {
	Simple,
	Complex,
}

export const modelMap: Record<ModelLevel, [string, string]> = {
	[ModelLevel.Simple]: ['gemini-2.0-flash', 'gpt-4.1-nano'],
	[ModelLevel.Complex]: ['gemini-2.0-flash', 'gpt-4.1-mini'],
};

export async function getParseResponse<T>(
	prompt: string,
	history: Content[],
	systemInstruction: string,
	modelType: ModelLevel,
	// [[zod for openai,zod for gemini], GeminiAISchema]: [z.AnyZodObject, z.AnyZodObject],
	schema: [[z.AnyZodObject, z.AnyZodObject], Schema],
): Promise<T> {
	const [geminiModel, openAIModel] = modelMap[modelType];
	const [[zodOpenAISchema, zodGeminiSchema], GeminiAISchema] = schema;
	try {
		console.log('try OpenAI SDK And OpenAI Model :');
		const response = await OpenAIClient.beta.chat.completions.parse({
			model: openAIModel,
			messages: [
				{
					role: 'system',
					content: systemInstruction,
				},
				...OpenAIHistoryTranscriber(history),
				{
					role: 'user',
					content: prompt,
				},
			],
			response_format: zodResponseFormat(
				model === Model.OpenAI ? zodOpenAISchema : zodGeminiSchema,
				'data',
			),
		});
		const result = response.choices[0].message?.parsed;
		console.log('OpenAI SDK Success');
		return result as T;
	} catch (error) {
		console.error('OpenAI SDK Error :', error);
	}
	try {
		console.log('try Google AI SDK And Gemini Model :');
		const Model = GenerativeAI.getGenerativeModel({
			model: geminiModel,
			systemInstruction: systemInstruction,
			generationConfig: {
				responseMimeType: 'application/json',
				responseSchema: GeminiAISchema,
			},
		});
		const response = await Model.generateContent({
			contents: [
				...history,
				{
					role: 'user',
					parts: [{ text: prompt }],
				},
			],
		});
		const result = response.response.text();
		const parsedResult = JSON.parse(result) as z.infer<typeof zodOpenAISchema>;
		console.log('Google AI SDK Success');
		return parsedResult as T;
	} catch (error) {
		console.error('Google AI SDK Error :', error);
	}
	throw new Error('Error in both AI SDKs');
}
