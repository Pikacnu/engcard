import {
	Content,
	FunctionCall,
	GoogleGenerativeAI,
} from '@google/generative-ai';
import { DeckCollection } from '@/type';
import db from '@/lib/db';
import {
	chatModelInstruction,
	ChatModelSchema,
	GChatModelSchema,
	GTextRecognizeSchema,
	GwordSchema,
	textRecognizeModelInstruction,
	wordSystemInstruction,
} from '../../ai';

const googleAIKey = process.env.GEMINI_API_KEY || '';

export const GenerativeAI = new GoogleGenerativeAI(googleAIKey);
export const TextModel = GenerativeAI.getGenerativeModel({
	model: 'gemini-2.0-flash',
});

export const WordModel = GenerativeAI.getGenerativeModel({
	model: 'gemini-2.0-flash',
	generationConfig: {
		responseMimeType: 'application/json',
		responseSchema: GwordSchema.toSchema(),
	},
	systemInstruction: wordSystemInstruction,
});

export const TextRecognizeModel = GenerativeAI.getGenerativeModel({
	model: 'gemini-2.0-flash',
	generationConfig: {
		responseMimeType: 'application/json',
		responseSchema: GTextRecognizeSchema,
	},
	systemInstruction: textRecognizeModelInstruction,
});

export const ChatModel = GenerativeAI.getGenerativeModel({
	model: 'gemini-2.0-flash',
	systemInstruction: chatModelInstruction,
	//tools: [{ googleSearch: {} }],
});

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
	const ChatModel = GenerativeAI.getGenerativeModel({
		model: 'gemini-2.0-flash',
		systemInstruction: `
		prompt : ${chatModelInstruction} 
		data : ${await PrepareTheDataForGenerate(userId)}`,
	});

	const response = await ChatModel.generateContent({
		contents: [...history, { role: 'user', parts: [{ text: message }] }],
		generationConfig: {
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
	const resultText = response.response.text();
	const result = JSON.parse(resultText) as ChatModelSchema;
	const functionCall = response.response.functionCalls();
	return {
		content: {
			role: 'model',
			parts: [{ text: result.message }],
		},
		data: result,
		functionCall,
	};
}
