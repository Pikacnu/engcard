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
	CardProps,
    GrammarError,
} from '@/type';
import { auth, ChatModelSchema, GenerateTextResponse } from '@/utils';
import { ObjectId, WithId } from 'mongodb';
import { Session } from 'next-auth';
import { functions as aiDefinedFunctions, chatModelInstruction } from '@/utils/ai/prompt';
import { Content, FunctionCall, Part } from '@google/generative-ai'; 
import { ModelLevel, AiResponse } from '@/utils/ai/generate'; 
import { GChatModelSchema } from '@/utils/ai/schema';
import { aiFeatures } from '@/config'; 
import { checkTextGrammar } from '@/lib/grammar'; 
import { v4 as uuidv4 } from 'uuid'; // Added import for uuid

// Helper to get current chat from DB, ensuring it's fresh
async function getFreshChat(chatId: ObjectId): Promise<ChatSession | null> {
    return await db.collection<ChatSession>('chat').findOne({ _id: chatId });
}

// Helper to save a history item
async function saveHistoryItem(chatId: ObjectId, item: ChatSession['history'][0]): Promise<void> {
    await db.collection<ChatSession>('chat').updateOne(
        { _id: chatId },
        { $push: { history: item as any } } 
    );
}

// Helper to generate a unique ID for history items
function generateHistoryId(): string { // Parameter removed
    return uuidv4();
}

// Helper to map string function names to ChatAction enum values
function getChatActionFromString(actionName: string): ChatAction | undefined {
    if (Object.values(ChatAction).includes(actionName as ChatAction)) {
        return actionName as ChatAction;
    }
    return undefined;
}


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
    if (!session?.user?.id) {
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
        userId: session.user.id, 
    });

    if (!chatSession) {
        return {
            error: 'Chat not found or not authorized',
        };
    }

    return chatSession.history.map((historyItem) => {
        const { content, action, grammarCheckResults } = historyItem;
        
        const frontendHistoryItem: any = { 
            id: content.id,
            role: content.role,
            parts: content.parts,
        };

        if (action) {
            frontendHistoryItem.action = action; 
        }
        if (grammarCheckResults) {
            frontendHistoryItem.grammarCheckResults = grammarCheckResults;
        }
        
        return frontendHistoryItem;
    });
}

export async function changeChatName(chatId: string, newName: string) {
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

	const chatSession = await db.collection<ChatSession>('chat').findOneAndUpdate(
		{
			_id: new ObjectId(chatId),
			userId: session.user?.id,
		},
		{
			$set: {
				chatName: newName,
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
    if (!session?.user?.id) {
        return { error: 'Not authenticated' };
    }
    if (!ObjectId.isValid(chatId)) return { error: 'Invalid chat id' };

    const chatObjectId = new ObjectId(chatId);

    let currentChat = await getFreshChat(chatObjectId);
    if (!currentChat || currentChat.userId !== session.user.id) {
        return { error: 'Chat not found or not authorized' };
    }

    // 1. Save user's message
    const userMessageId = generateHistoryId(); // Updated call
    const userMessageContent: Content = { role: 'user', parts: [{ text: message }] };
    await saveHistoryItem(chatObjectId, { content: { id: userMessageId, ...userMessageContent } });
    
    currentChat = await getFreshChat(chatObjectId); 
    if (!currentChat) return { error: "Failed to refresh chat after saving user message" };

    const functionsToPass = aiFeatures.useFunctionCalling ? aiDefinedFunctions : undefined;
    let currentAiResponse = await GenerateTextResponse<ChatModelSchema>(
        message, 
        currentChat.history.map(h => h.content as Content),
        chatModelInstruction, 
        ModelLevel.Simple,    
        [[ChatModelSchema, ChatModelSchema], GChatModelSchema], 
        functionsToPass
    );

    let loopCount = 0;
    const maxLoops = 5;
    let grammarResultsForFinalMessage: GrammarError[] | undefined = undefined;

    while (aiFeatures.useFunctionCalling && currentAiResponse.type === 'functionCall' && loopCount < maxLoops) {
        loopCount++;
        const functionCall = currentAiResponse.functionCall;
        const currentAiResponseId = generateHistoryId(); // Updated call

        const aiFuncCallContent: Content = { role: 'model', parts: [{ functionCall }] };
        await saveHistoryItem(chatObjectId, { 
            content: { id: currentAiResponseId, ...aiFuncCallContent }, 
            functionCall 
        });
        currentChat = await getFreshChat(chatObjectId);
        if (!currentChat) return { error: "Failed to refresh chat after saving AI function call" };

        const functionName = functionCall.name;
        const functionArgs = functionCall.args as any; 
        let executionResultContent: Record<string, any> = { success: false, message: `Function ${functionName} execution failed or name not recognized.` };
        
        let lastGrammarCheckResultsThisIteration: GrammarError[] | undefined = undefined;
        grammarResultsForFinalMessage = undefined; 


        switch (functionName) {
            case 'checkGrammar': {
                const textToParse = functionArgs.text || '';
                const actualGrammarResults = await checkTextGrammar(textToParse);
                executionResultContent = { 
                    name: functionName, 
                    content: { summary: `Grammar check done. ${actualGrammarResults.length} issues found.`, results: actualGrammarResults } 
                };
                lastGrammarCheckResultsThisIteration = actualGrammarResults; 
                break;
            }
            default: {
                const actionKey = getChatActionFromString(functionName);
                if (actionKey && 
                    actionKey !== ChatAction.DoNothing && 
                    actionKey !== ChatAction.GrammarCheck 
                   ) {
                    const actionHandler = chatActionFunctions[actionKey];
                    if (actionHandler) {
                        const adaptedArgsAsChatModelSchema: Partial<ChatModelSchema> = { 
                            ...(functionArgs || {}), 
                            action: actionKey, 
                            message: `Executing ${functionName} via function call.` 
                        };
                        if (!Array.isArray(adaptedArgsAsChatModelSchema.words)) {
                            adaptedArgsAsChatModelSchema.words = [];
                        }

                        const handlerResult = await actionHandler(adaptedArgsAsChatModelSchema as ChatModelSchema, session);
                        executionResultContent = { 
                            name: functionName, 
                            content: { success: !handlerResult?.error, message: handlerResult?.error || `Action '${functionName}' executed successfully via function call.` } 
                        };
                    } else {
                        executionResultContent.message = `No handler found for action key: ${actionKey} derived from function ${functionName}`;
                    }
                } else {
                    executionResultContent.message = `Unknown or unhandled function call: ${functionName}. No corresponding ChatAction.`;
                    console.log(`Unsupported function call: ${functionName}`);
                }
                break;
            }
        }
        
        if (lastGrammarCheckResultsThisIteration) {
            grammarResultsForFinalMessage = lastGrammarCheckResultsThisIteration;
        }
        
        const toolResponseId = generateHistoryId(); // Updated call
        const toolMessageParts: Part[] = [{ functionResponse: { name: functionName, response: executionResultContent } }];
        const toolMessageContent: Content = { role: 'tool', parts: toolMessageParts };
        
        await saveHistoryItem(chatObjectId, { content: { id: toolResponseId, ...toolMessageContent } });
        currentChat = await getFreshChat(chatObjectId);
        if (!currentChat) return { error: "Failed to refresh chat after saving tool response" };

        currentAiResponse = await GenerateTextResponse<ChatModelSchema>(
            "", 
            currentChat.history.map(h => h.content as Content),
            chatModelInstruction,
            ModelLevel.Simple,
            [[ChatModelSchema, ChatModelSchema], GChatModelSchema],
            functionsToPass 
        );
    }

    let finalAiData: ChatModelSchema;
    const finalMessageId = generateHistoryId(); // Updated call

    if (currentAiResponse.type === 'functionCall' && loopCount >= maxLoops) {
        console.log("Max function call loops reached.");
        const maxLoopMessage = "I seem to be stuck in a loop trying to use my tools. Let's try something else. How can I help you now?";
        finalAiData = { 
            action: ChatAction.DoNothing, 
            message: maxLoopMessage,
            words: [],
        };
        grammarResultsForFinalMessage = undefined; 
        const maxLoopMsgContent: Content = { role: 'model', parts: [{ text: finalAiData.message }] };
        await saveHistoryItem(chatObjectId, { content: { id: finalMessageId, ...maxLoopMsgContent }, action: finalAiData });
    } else if (currentAiResponse.type === 'data') {
        finalAiData = currentAiResponse.data;
        const finalAiContent: Content = { role: 'model', parts: [{ text: finalAiData.message }] };
        await saveHistoryItem(chatObjectId, { 
            content: { id: finalMessageId, ...finalAiContent }, 
            action: finalAiData, 
            grammarCheckResults: grammarResultsForFinalMessage 
        });
    } else {
        console.error('Exited loop with unexpected AI response type or error:', currentAiResponse);
        const errorMessage = "Sorry, I encountered an unexpected issue while processing your request.";
        finalAiData = { 
            action: ChatAction.DoNothing, 
            message: errorMessage,
            words: [],
        };
        grammarResultsForFinalMessage = undefined;
        const errorMsgContent: Content = { role: 'model', parts: [{ text: finalAiData.message }] };
        await saveHistoryItem(chatObjectId, { content: { id: finalMessageId, ...errorMsgContent }, action: finalAiData });
    }
    
    if (finalAiData.action && 
        finalAiData.action !== ChatAction.DoNothing &&
        !(aiFeatures.useFunctionCalling && getChatActionFromString(finalAiData.action)) ) {
        await chatActionFunctions[finalAiData.action as ChatAction](finalAiData, session);
    }
    
    return {
        message: 'success',
        content: { id: finalMessageId, role: 'model', parts: [{ text: finalAiData.message }] },
        action: finalAiData,
        grammarCheckResults: grammarResultsForFinalMessage
    };
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
		if (!data.targetDeckName) return { error: 'No deck name provided' };
		const deckId = (
			await db.collection<DeckCollection>('deck').insertOne({
				userId: session.user?.id || '',
				name: data.targetDeckName || '',
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
		let deckId = data.deckId;
		if (!deckId || deckId.trim() === '') {
			if (data.targetDeckName) {
				const deck = await db
					.collection<Deck>('deck')
					.findOne({ name: data.targetDeckName, userId: session.user?.id });
				console.log('deck', deck);
				if (!deck) return { error: 'Deck not found' };
				deckId = deck._id.toString();
			} else {
				return { error: 'No deck id provided' };
			}
		}
		if (!ObjectId.isValid(deckId)) return { error: 'Invalid deck id' };
		const deck = await db.collection<Deck>('deck').findOneAndDelete({
			_id: new ObjectId(deckId),
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
					name: data.targetDeckName,
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
	[ChatAction.AddCard]: async (data, session) => {
		if (!session) return { error: 'Not authenticated' };
		let deckId = data.deckId;
		if (!deckId || deckId.trim() === '') {
			if (data.targetDeckName) {
				const deck = await db
					.collection<Deck>('deck')
					.findOne({ name: data.targetDeckName, userId: session.user?.id });
				if (!deck) return { error: 'Deck not found' };
				deckId = deck._id.toString();
			} else {
				return { error: 'No deck id provided' };
			}
		}
		if (!ObjectId.isValid(deckId)) return { error: 'Invalid deck id' };
		if (!data.words) return { error: 'No word provided' };
		const words = data.words;
		words.forEach(async (word, index) => {
			setTimeout(async () => {
				let wordData = await db
					.collection<Word>('words')
					.findOne({ word: word });
				if (!wordData) {
					const res = await GET(
						new Request(`http://localhost:3000/api/word?word=${word}`),
					);
					if (!res.ok) {
						console.log('Error fetching word data');
						return;
					}
					const temp = (await res.json()) as CardProps | null;
					if (!temp) {
						console.log('Error fetching word data');
						return;
					}
					wordData = {
						word: temp.word,
						phonetic: temp.phonetic,
						blocks: temp.blocks,
					} as WithId<Word>;
				}

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
	},
	[ChatAction.ChangeChatName]: async (data, userData) => {
		const session = userData || (await auth()); 
		if (!session) return { error: 'Not authenticated' };

		const chatId = data.targetDeckId; 
		const newName = data.changeChatName;

		if (!chatId) return { error: 'No chat ID provided for changing name.' };
		if (!newName) return { error: 'No new name provided for chat.' };
		if (!ObjectId.isValid(chatId)) return { error: 'Invalid chat ID format.' };

		return await changeChatName(chatId, newName);
	},
    [ChatAction.GrammarCheck]: async (data, userData) => {
        console.log('GrammarCheck action called with data:', data);
        return;
    },
};


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
