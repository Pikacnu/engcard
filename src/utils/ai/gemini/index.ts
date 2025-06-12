import { Content, FunctionCall, GoogleGenAI } from '@google/genai';
import { DeckCollection } from '@/type';
import db from '@/lib/db';
import {
	chatModelInstruction,
	ChatModelSchema,
	GChatModelSchema,
} from '../../ai';

const googleAIKey = process.env.GEMINI_API_KEY || '';

export const GenerativeAI = new GoogleGenAI({
	apiKey: googleAIKey,
});

export const Models = GenerativeAI.models;

async function PrepareTheDataForGenerate(userId: string): Promise<string> {
	const userDecks = await db
		.collection<DeckCollection>('deck')
		.find({
			userId,
		})
		.toArray();

	const userDecksInfo = userDecks.map((deck) => {
		return JSON.stringify({
			deckId: deck._id.toString(),
			deckName: deck.name,
			cards: deck.cards.map((card) => card.word),
		});
	});
	return `User Info : ${userDecksInfo.join(', ')}\n\n
				`;
	/*Actions Functionality:
				${
					ChatAction.AddDeck
				} : Create a new deck with the given name. and fill it with the given words.
				${ChatAction.AddCard} : Add a new card to the given deck to given Deck id.
				${ChatAction.RemoveDeck} : Remove the given deck by deckid.
				${
					ChatAction.EditDeck
				} : Edit the given deck by deckid. Add new cards if it is in the user's deck. Remove the cards if it is not in the user's deck.
				${ChatAction.ShowOuput} : If You only show the output to the user. */
}

export async function GenerateTextResponse(
	message: string,
	history: Content[],
	userId: string,
): Promise<{
	content: Content;
	data: ChatModelSchema;
	functionCall?: FunctionCall[];
}> {
	const response = await Models.generateContent({
		model: 'gemini-2.0-flash',
		contents: [...history, { role: 'user', parts: [{ text: message }] }],
		config: {
			systemInstruction: `
			prompt : ${chatModelInstruction} 
			data : ${await PrepareTheDataForGenerate(userId)}`,

			responseMimeType: 'application/json',
			responseSchema: GChatModelSchema,
		},
		/*
		tools: [
			{
				functionDeclarations: [...functions],
			},
		],
		toolConfig: {
			functionCallingConfig: {
				mode: FunctionCallingMode.ANY,
			},
		},*/
	});
	const resultText = response.text;
	if (!resultText) {
		throw new Error('No response text from Gemini AI');
	}
	const result = JSON.parse(resultText) as ChatModelSchema;
	return {
		content: {
			role: 'model',
			parts: [{ text: result.message }],
		},
		data: result,
	};
}
