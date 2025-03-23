import { GoogleGenerativeAI } from '@google/generative-ai';
import { GObject, String } from './gen-ai-type';

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey || '');

const model = genAI.getGenerativeModel({
	model: 'gemini-2.0-flash-exp',
	systemInstruction:
		'you are a professional translater\ntranslate the following text from [source language(default is english)] to [target language(default is zh-tw)]. Ensure that the translation is fluent, contextually accurate, and maintains the original tone and style. If multiple valid translations exist, provide a few options and briefly explain their differences. For technical terms or culturally specific expressions, choose the most appropriate translation based on context and provide explanations if necessary.',
});

const generationConfig = {
	temperature: 1,
	topP: 0.95,
	topK: 40,
	maxOutputTokens: 8192,
	responseMimeType: 'application/json',
	responseSchema: new GObject('response', true, {
		properties: [new String('text', true), new String('translation', true)],
		showName: false,
	}).toSchema(),
};

export async function run() {
	const chatSession = model.startChat({
		generationConfig,
		history: [],
	});

	const result = await chatSession.sendMessage('INSERT_INPUT_HERE');
	console.log(result.response.text());
}
