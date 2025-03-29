'use server';
import { GET } from '@/app/api/word/route';
import db from '@/lib/db';
import {
	WithStringObjectId,
	ChatSession,
	ChatAction,
	DeckCollection,
	Word,
	Deck,
} from '@/type';
import { auth, ChatModelSchema, GenerateTextResponse } from '@/utils';
import { ObjectId, WithId } from 'mongodb';
import { Session } from 'next-auth';

export async function getChatList() {
	const session = await auth();
	if (!session) {
		return {
			error: 'Not authenticated',
		};
	}

	const chatSessions: WithId<ChatSession>[] = await db
		.collection<ChatSession>('chat')
		.find({
			userId: session.user?.id,
		})
		.toArray();

	const chatList: WithStringObjectId<{
		chatName: string;
	}>[] = chatSessions.map((chat) => {
		const { _id, ...rest } = chat;
		return {
			chatName: rest.chatName,
			_id: _id.toString(),
		};
	});

	return chatList || [];
}

export async function createChatSession() {
	const session = await auth();
	if (!session) {
		return {
			error: 'Not authenticated',
		};
	}

	const chatSession = await db.collection<ChatSession>('chat').insertOne({
		userId: session.user?.id || '',
		history: [],
		chatName: 'New Chat',
	});

	return {
		id: chatSession.insertedId.toString(),
	};
}

export async function getChatHistory(chatId: string) {
	const session = await auth();
	if (!session) {
		return {
			error: 'Not authenticated',
		};
	}
	if (!ObjectId.isValid(chatId)) {
		return {
			error: 'Invalid chat id',
		};
	}

	const chatSession = await db.collection<ChatSession>('chat').findOne({
		_id: new ObjectId(chatId),
	});

	if (!chatSession) {
		return {
			error: 'Chat not found',
		};
	}

	return chatSession.history.map((history) => {
		if (history.action && history.action.action === ChatAction.ShowOuput) {
			return {
				...history.content,
				action: {
					action: ChatAction.ShowOuput,
					words: history.action.words,
				},
			};
		}
		return history.content;
	});
}

export async function chagneChatName(deckId: string, name: string) {
	const session = await auth();
	if (!session) {
		return {
			error: 'Not authenticated',
		};
	}
	if (!ObjectId.isValid(deckId)) {
		return {
			error: 'Invalid chat id',
		};
	}

	const chatSession = await db.collection<ChatSession>('chat').findOneAndUpdate(
		{
			_id: new ObjectId(deckId),
			userId: session.user?.id,
		},
		{
			$set: {
				chatName: name,
			},
		},
	);
	if (!chatSession) {
		return {
			error: 'Chat not found',
		};
	}
	return {
		message: 'success',
	};
}

export async function sendMessage(chatId: string, message: string) {
	const session = await auth();
	if (!session) {
		return {
			error: 'Not authenticated',
		};
	}
	if (!ObjectId.isValid(chatId)) return { error: 'Invalid chat id' };

	const chat = await db.collection<ChatSession>('chat').findOne({
		_id: new ObjectId(chatId),
	});

	if (!chat) {
		return {
			error: 'Chat not found',
		};
	}
	if (!chat.userId || chat.userId !== session.user?.id)
		return { error: 'Chat not found' };

	const messageId = Number(
		chat.history.length.toString() + Date.now(),
	).toString(16);

	db.collection<ChatSession>('chat').updateOne(
		{ _id: new ObjectId(chatId) },
		{
			$push: {
				history: {
					content: {
						id: messageId,
						role: 'user',
						parts: [{ text: message }],
					},
				},
			},
		},
	);

	const response = await GenerateTextResponse(
		message,
		chat.history.map((h) => {
			return {
				role: h.content.role,
				parts: h.content.parts,
			};
		}),
		session.user?.id || '',
	);

	const id = Number(chat.history.length.toString() + Date.now()).toString(16);
	const chatSession = await db.collection<ChatSession>('chat').findOneAndUpdate(
		{
			_id: new ObjectId(chatId),
			userId: session.user?.id,
		},
		{
			$push: {
				history: {
					content: {
						id: id,
						...response.content,
					},
					action: response.data,
				},
			},
			$set: {
				chatName: response.data.changeChatName
					? response.data.changeChatName
					: chat.chatName,
			},
		},
	);

	if (!chatSession) {
		return {
			error: 'Chat not found',
		};
	}

	const optionalValue =
		response.data.action === ChatAction.ShowOuput
			? {
					action: ChatAction.ShowOuput,
					words: response.data.words,
			  }
			: {};

	const runFunctionResult = await chatActionFunctions[
		response.data.action as ChatAction
	](response.data, session);

	if (
		chatActionFunctions instanceof Object &&
		runFunctionResult &&
		'error' in runFunctionResult
	) {
		console.error(runFunctionResult.error);
	}

	return Object.assign(
		{
			message: 'success',
			content: {
				id: id,
				role: response.content.role,
				parts: [{ text: response.data.message }],
			},
		},
		optionalValue,
	);
}

async function addWords(words: string[], deckId: string, session: Session) {
	words.map((word, index) => {
		setTimeout(async () => {
			await GET(new Request(`http://localhost:3000/api/word?word=${word}`));
			const wordData = await db
				.collection<Word>('words')
				.findOne({ word: word });
			if (wordData) {
				await db.collection<Deck>('deck').findOneAndUpdate(
					{ _id: new ObjectId(deckId), userId: session.user?.id },
					{
						$push: {
							cards: {
								word: wordData.word,
								phonetic: wordData.phonetic,
								blocks: wordData.blocks,
							},
						},
					},
				);
			}
		}, index * 2.5 * 1_000);
	});
}

const chatActionFunctions: Record<
	ChatAction,
	(
		data: ChatModelSchema,
		userData?: Session,
	) => Promise<void | { error: string }> | void
> = {
	[ChatAction.DoNothing]: async () => {},
	[ChatAction.ShowOuput]: async () => {},
	[ChatAction.AddDeck]: async (data, userData) => {
		const session = userData || (await auth());
		if (!session) return { error: 'Not authenticated' };
		if (!data.newDeckName) return { error: 'No deck name provided' };
		const deckId = (
			await db.collection<DeckCollection>('deck').insertOne({
				userId: session.user?.id || '',
				name: data.newDeckName || '',
				isPublic: false,
				cards: [],
			})
		).insertedId.toString();
		await addWords(data.words, deckId, session);
		return;
	},
	[ChatAction.RemoveDeck]: async (data) => {
		const session = await auth();
		if (!session) return { error: 'Not authenticated' };
		if (!data.deckId) return { error: 'No deck id provided' };
		if (!ObjectId.isValid(data.deckId)) return { error: 'Invalid deck id' };
		const deck = await db.collection<Deck>('deck').findOneAndDelete({
			_id: new ObjectId(data.deckId),
			userId: session.user?.id,
		});
		if (!deck) return { error: 'Deck not found' };
		return;
	},
	[ChatAction.EditDeck]: async (data) => {
		const session = await auth();
		if (!session) return { error: 'Not authenticated' };
		if (!data.deckId) return { error: 'No deck id provided' };
		if (!ObjectId.isValid(data.deckId)) return { error: 'Invalid deck id' };

		const currentDeckData = await db
			.collection<Deck>('deck')
			.findOne({ _id: new ObjectId(data.deckId) });
		if (!currentDeckData) return { error: 'Deck not found' };

		const originalDeckWords = currentDeckData.cards.map((card) => card.word);

		const newWords = data.words.filter(
			(word) => !originalDeckWords.includes(word),
		);
		const removedWords = originalDeckWords.filter(
			(word) => !data.words.includes(word),
		);

		const deck = await db.collection<Deck>('deck').findOneAndUpdate(
			{ _id: new ObjectId(data.deckId), userId: session.user?.id },
			{
				$set: {
					name: data.newDeckName,
					cards: currentDeckData.cards.filter((card) =>
						removedWords.includes(card.word),
					),
				},
			},
		);
		await addWords(newWords, data.deckId, session);

		if (!deck) return { error: 'Deck not found' };
		return;
	},
	[ChatAction.AddCard]: async () => {},
};

export async function deleteChatSession(chatId: string) {
	const session = await auth();
	if (!session) {
		return {
			error: 'Not authenticated',
		};
	}
	if (!ObjectId.isValid(chatId)) {
		return {
			error: 'Invalid chat id',
		};
	}

	const chatSession = await db
		.collection<ChatSession>('chat')
		.findOneAndDelete({
			_id: new ObjectId(chatId),
			userId: session.user?.id,
		});

	if (!chatSession) {
		return {
			error: 'Chat not found',
		};
	}

	return {
		message: 'success',
	};
}
