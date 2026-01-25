'use server';
import { GET } from '@/app/api/word/route';
import db from '@/lib/db';
import { FunctionCall } from '@google/genai';
import {
  WithStringObjectId,
  ChatSession,
  ChatAction,
  DeckCollection,
  WordCollection,
  Deck,
  CardProps,
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

// 執行 Function Call 的處理函數
async function executeFunctionCall(
  functionCall: FunctionCall,
  session: Session,
): Promise<Record<string, unknown>> {
  const name = functionCall.name;
  const args = (functionCall.args || {}) as Record<string, unknown>;

  try {
    switch (name) {
      case 'add_deck': {
        const result = await chatActionFunctions[ChatAction.AddDeck](
          {
            action: ChatAction.AddDeck,
            targetDeckName: args.deckName as string,
            words: args.words as string[],
            message: args.message as string,
            grammerFix: [],
          } as ChatModelSchema,
          session,
        );
        return result && 'error' in result
          ? result
          : { success: true, message: args.message };
      }

      case 'add_card': {
        const result = await chatActionFunctions[ChatAction.AddCard](
          {
            action: ChatAction.AddCard,
            deckId: args.deckId as string,
            targetDeckName: args.deckName as string,
            words: args.words as string[],
            message: args.message as string,
            grammerFix: [],
          } as ChatModelSchema,
          session,
        );
        return result && 'error' in result
          ? result
          : { success: true, message: args.message };
      }

      case 'remove_deck': {
        const result = await chatActionFunctions[ChatAction.RemoveDeck]({
          action: ChatAction.RemoveDeck,
          deckId: args.deckId as string,
          targetDeckName: args.deckName as string,
          message: args.message as string,
          words: [],
          grammerFix: [],
        } as ChatModelSchema);
        return result && 'error' in result
          ? result
          : { success: true, message: args.message };
      }

      case 'edit_deck': {
        const result = await chatActionFunctions[ChatAction.EditDeck]({
          action: ChatAction.EditDeck,
          deckId: args.deckId as string,
          words: args.words as string[],
          message: args.message as string,
          grammerFix: [],
        } as ChatModelSchema);
        return result && 'error' in result
          ? result
          : { success: true, message: args.message };
      }

      case 'grammer_correction':
        return {
          success: true,
          grammerFix: (args.grammerFix || []) as Array<{
            offsetWords: number;
            lengthWords: number;
            correctedText: string;
          }>,
        };

      case 'word_list':
        return {
          success: true,
          words: (args.words || []) as string[],
        };

      default:
        console.warn(`Unknown function call: ${name}`);
        return { error: `Unknown function: ${name}` };
    }
  } catch (error) {
    console.error(`Error executing function ${name}:`, error);
    return { error: `Failed to execute function: ${name}` };
  }
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
        grammerFix: history.grammerFix || [],
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

  console.log('response', response);

  const id = Number(chat.history.length.toString() + Date.now()).toString(16);

  // 處理 function calls
  const functionResults: Record<string, unknown> = {};
  let grammerFix: Array<{
    offsetWords: number;
    lengthWords: number;
    correctedText: string;
  }> = [];
  let optionalValue: Record<string, unknown> = {};
  let changeChatName: string | undefined;

  if (response.functionCalls && response.functionCalls.length > 0) {
    for (const fc of response.functionCalls) {
      if (fc.name) {
        const result = await executeFunctionCall(fc, session);
        functionResults[fc.name] = result;

        // 提取 grammar fix 和其他資訊
        if (
          result &&
          typeof result === 'object' &&
          'grammerFix' in result &&
          Array.isArray(result.grammerFix)
        ) {
          grammerFix = result.grammerFix as typeof grammerFix;
        }
        if (
          result &&
          typeof result === 'object' &&
          'words' in result &&
          fc.name === 'word_list'
        ) {
          optionalValue = {
            action: ChatAction.ShowOuput,
            words: result.words || [],
          };
        }
        if (
          result &&
          typeof result === 'object' &&
          'changeChatName' in result &&
          typeof result.changeChatName === 'string'
        ) {
          changeChatName = result.changeChatName;
        }
      }
    }
  }

  // 儲存到資料庫
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
          functionCall: response.functionCalls?.[0],
          grammerFix: grammerFix,
        },
      },
      $set: {
        chatName: changeChatName || chat.chatName,
      },
    },
  );

  if (!chatSession) {
    return {
      error: 'Chat not found',
    };
  }

  return Object.assign(
    {
      message: 'success',
      content: {
        id: id,
        role: response.content.role,
        parts: response.content.parts, // 保留完整的 parts（包括 text 和 functionCall）
      },
      grammerFix: grammerFix,
      functionResults,
    },
    optionalValue,
  );
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
      setTimeout(
        async () => {
          let wordData = await db
            .collection<WordCollection>('words')
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
            } as WithId<WordCollection>;
          }

          if (wordData) {
            await db.collection<Deck>('deck').findOneAndUpdate(
              { _id: new ObjectId(deckId), userId: session.user?.id },
              {
                $push: {
                  cards: {
                    word: wordData.word,
                    phonetic: wordData.phonetic || '',
                    blocks: wordData.blocks || [],
                  },
                },
              },
            );
          }
        },
        index * 2.5 * 1_000,
      );
    });
  },
};

/*const chatActionFunctions: Record<
	ChatAction,
	(
		session: Session,
		...data: { [key: string]: string | string[] | number | boolean }[]
	) => Promise<void | { error: string }> | void
> = {
	[ChatAction.DoNothing]: async () => {},
	[ChatAction.ShowOuput]: async () => {},
	[ChatAction.AddDeck]: async (userData, data) => {
		const session = userData || (await auth());
		if (!session) return { error: 'Not authenticated' };
		if (!data.deckName || typeof data.deckName !== 'string')
			return { error: 'No deck name provided' };
		const deckId = (
			await db.collection<DeckCollection>('deck').insertOne({
				userId: session.user?.id || '',
				name: data.deckName || '',
				isPublic: false,
				cards: [],
			})
		).insertedId.toString();
		await addWords(data.words as string[], deckId, session);
		return;
	},
	[ChatAction.RemoveDeck]: async (userData, data) => {
		const session = userData || (await auth());
		if (!session) return { error: 'Not authenticated' };
		if (!data.deckId) return { error: 'No deck id provided' };
		if (!ObjectId.isValid(data.deckId as string))
			return { error: 'Invalid deck id' };
		const deck = await db.collection<Deck>('deck').findOneAndDelete({
			_id: new ObjectId(data.deckId as string),
			userId: session.user?.id,
		});
		if (!deck) return { error: 'Deck not found' };
		return;
	},
	[ChatAction.EditDeck]: async (userData, data) => {
		const session = userData || (await auth());

		const words = data.words as string[];
		const deckId = data.deckId as string;
		if (!session) return { error: 'Not authenticated' };
		if (!deckId) return { error: 'No deck id provided' };
		if (!ObjectId.isValid(deckId as string))
			return { error: 'Invalid deck id' };

		const currentDeckData = await db
			.collection<Deck>('deck')
			.findOne({ _id: new ObjectId(data.deckId as string) });
		if (!currentDeckData) return { error: 'Deck not found' };

		const originalDeckWords = currentDeckData.cards.map((card) => card.word);
		const newWords = words.filter((word) => !originalDeckWords.includes(word));
		const removedWords = originalDeckWords.filter(
			(word) => !words.includes(word),
		);

		const deck = await db.collection<Deck>('deck').findOneAndUpdate(
			{ _id: new ObjectId(deckId), userId: session.user?.id },
			{
				$set: {
					cards: currentDeckData.cards.filter((card) =>
						removedWords.includes(card.word),
					),
				},
			},
		);
		await addWords(newWords, deckId, session);

		if (!deck) return { error: 'Deck not found' };
		return;
	},
	[ChatAction.AddCard]: async () => {},
}; */

async function addWords(words: string[], deckId: string, session: Session) {
  words.map((word, index) => {
    setTimeout(
      async () => {
        await GET(new Request(`http://localhost:3000/api/word?word=${word}`));
        const wordData = await db
          .collection<WordCollection>('words')
          .findOne({ word: word });
        if (wordData) {
          await db.collection<Deck>('deck').findOneAndUpdate(
            { _id: new ObjectId(deckId), userId: session.user?.id },
            {
              $push: {
                cards: {
                  word: wordData.word,
                  phonetic: wordData.phonetic || '',
                  blocks: wordData.blocks || [],
                },
              },
            },
          );
        }
      },
      index * 2.5 * 1_000,
    );
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
