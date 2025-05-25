import { Content, FunctionCall, FunctionDeclaration, Schema } from '@google/generative-ai';
import { Model, model, OpenAIClient } from './openai';
import { GenerativeAI } from './gemini';
import { OpenAIHistoryTranscriber } from './functions';
import { z } from 'zod';
import { zodResponseFormat } from 'openai/helpers/zod';

export enum ModelLevel {
	Simple,
	Complex,
}

export type AiResponse<T> = 
    | { type: 'functionCall', functionCall: FunctionCall, rawText?: string | null } 
    | { type: 'data', data: T, rawText?: string | null };

export const modelMap: Record<ModelLevel, [string, string]> = {
	[ModelLevel.Simple]: ['gemini-1.0-pro', 'gpt-3.5-turbo'],
	[ModelLevel.Complex]: ['gemini-1.5-flash', 'gpt-4-turbo'],
};

export async function getParseResponse<T>(
	prompt: string,
	history: Content[],
	systemInstruction: string,
	modelType: ModelLevel,
	schema: [[z.AnyZodObject, z.AnyZodObject], Schema], 
    functions?: FunctionDeclaration[] 
): Promise<AiResponse<T>> {
	const [geminiModelName, openAIModelName] = modelMap[modelType];
	const [[zodOpenAISchema, zodGeminiSchema], GeminiAPISchema] = schema;

	// Attempt OpenAI first
	try {
		console.log('Attempting OpenAI SDK with model:', openAIModelName);
		const response = await OpenAIClient.beta.chat.completions.parse({
			model: openAIModelName,
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
		const parsedData = response.choices[0].message?.parsed;
		console.log('OpenAI SDK Success (data)');
		return { type: 'data', data: parsedData as T, rawText: response.choices[0].message?.content };
	} catch (error) {
		console.error('OpenAI SDK Error:', error);
		// Fall through to Gemini if OpenAI fails
	}

	// Attempt Google AI SDK (Gemini)
	try {
		console.log('Attempting Google AI SDK with model:', geminiModelName);
        
		const modelConfig: { 
            model: string; 
            systemInstruction: string; 
            generationConfig: {
                responseMimeType: 'application/json';
                responseSchema: Schema;
            }; 
            tools?: any[]; 
        } = {
			model: geminiModelName,
			systemInstruction: systemInstruction,
			generationConfig: {
                responseMimeType: 'application/json',
                responseSchema: GeminiAPISchema, // Always set this
            },
		};

		if (functions && functions.length > 0) {
			modelConfig.tools = [{ functionDeclarations: functions }];
            // Note: As per subtask, responseMimeType and responseSchema are now ALWAYS set.
            // This might differ from Gemini API docs which state they are not allowed if tools are provided.
            // Proceeding with subtask requirement.
		}

		const geminiEffectiveModel = GenerativeAI.getGenerativeModel(modelConfig);
		
		const result = await geminiEffectiveModel.generateContent({
			contents: [
				...history,
				{
					role: 'user',
					parts: [{ text: prompt }],
				},
			],
        });

		const response = result.response;
        const rawTextResponse = response.text(); 

		const firstPart = response.candidates?.[0]?.content?.parts?.[0];
		if (firstPart && firstPart.functionCall) {
			console.log('Google AI SDK returned function call');
			return { type: 'functionCall', functionCall: firstPart.functionCall, rawText: rawTextResponse };
		}

		try {
			const parsedResult = zodGeminiSchema.parse(JSON.parse(rawTextResponse));
			console.log('Google AI SDK Success (data)');
			return { type: 'data', data: parsedResult as T, rawText: rawTextResponse };
		} catch (parseError) {
			console.error('Google AI SDK Error: Failed to parse JSON response and no function call found.', parseError);
            console.error('Raw text from Gemini:', rawTextResponse); 
			throw new Error(`Google AI SDK: Response was not a function call and did not match expected JSON schema. Raw response: ${rawTextResponse}`);
		}

	} catch (error) {
		console.error('Google AI SDK Error:', error);
		throw new Error('Error in both AI SDKs or Gemini response processing failed.');
	}
}
