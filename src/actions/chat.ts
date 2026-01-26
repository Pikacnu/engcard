'use server';

import { GET } from '@/app/api/word/route';
import { db } from '@/db';
import { chatSessions, decks, cards, wordCache } from '@/db/schema';
import { eq, and, inArray } from 'drizzle-orm';
import { FunctionCall } from '@google/genai';
import {
  ChatSession,
  ChatAction,
  CardProps,
} from '@/type';
import { auth, ChatModelSchema, GenerateTextResponse } from '@/utils';
import { Session } from 'next-auth';

export async function getChatList() {
  const session = await auth();
  if (!session || !session.user?.id) {
    return {
      error: 'Not authenticated',
    };
  }

  const sessions = await db.query.chatSessions.findMany({
      where: eq(chatSessions.userId, session.user.id),
      orderBy: (chatSessions, { desc }) => [desc(chatSessions.updatedAt)]
  });

  return sessions.map((chat) => ({
      chatName: chat.chatName || 'New Chat',
      _id: chat.id,
  }));
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
  if (!session || !session.user?.id) {
    return {
      error: 'Not authenticated',
    };
  }

  const [newChat] = await db.insert(chatSessions).values({
    userId: session.user.id,
    history: [],
    chatName: 'New Chat',
  }).returning();

  return {
    id: newChat.id,
  };
}

export async function getChatHistory(chatId: string) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return {
      error: 'Not authenticated',
    };
  }
  
  const chatSession = await db.query.chatSessions.findFirst({
      where: eq(chatSessions.id, chatId),
  });

  if (!chatSession) {
    return {
      error: 'Chat not found',
    };
  }
  
  const history = (chatSession.history || []) as ChatSession['history'];

  return history.map((historyItem) => {
    if (historyItem.action && historyItem.action.action === ChatAction.ShowOuput) {
      return {
        ...historyItem.content,
        action: {
          action: ChatAction.ShowOuput,
          words: historyItem.action.words,
        },
        grammerFix: historyItem.grammerFix || [],
      };
    }
    return historyItem.content;
  });
}

export async function chagneChatName(deckId: string, name: string) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return {
      error: 'Not authenticated',
    };
  }

  const [updated] = await db.update(chatSessions)
    .set({ chatName: name })
    .where(and(eq(chatSessions.id, deckId), eq(chatSessions.userId, session.user.id)))
    .returning();
    
  if (!updated) {
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
  if (!session || !session.user?.id) {
    return {
      error: 'Not authenticated',
    };
  }

  // 1. Fetch current chat
  const chat = await db.query.chatSessions.findFirst({
      where: and(eq(chatSessions.id, chatId), eq(chatSessions.userId, session.user.id))
  });

  if (!chat) {
    return {
      error: 'Chat not found',
    };
  }

  const currentHistory = (chat.history || []) as ChatSession['history'];

  const messageId = Number(
    currentHistory.length.toString() + Date.now(),
  ).toString(16);

  const newUserMessage: ChatSession['history'][number] = {
      content: {
        id: messageId,
        role: 'user',
        parts: [{ text: message }],
      },
  };

  // 2. Append User Message
  // TODO: Concurrency issue if multiple messages sent at once, but acceptable for this scope
  const updatedHistoryUser: ChatSession['history'] = [...currentHistory, newUserMessage];
  
  await db.update(chatSessions)
      .set({ history: updatedHistoryUser })
      .where(eq(chatSessions.id, chatId));

  // 3. Generate Response
  // Need to map history correctly for AI
  const historyForAI = updatedHistoryUser.map((h) => {
      return {
        role: h.content.role,
        parts: h.content.parts,
      };
  });

  const response = await GenerateTextResponse(
    message,
    historyForAI,
    session.user.id,
  );

  console.log('response', response);

  const aiMessageId = Number(updatedHistoryUser.length.toString() + Date.now()).toString(16);

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
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          grammerFix = result.grammerFix as any; 
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

  const newAiMessage: ChatSession['history'][number] = {
      content: {
        id: aiMessageId,
        ...response.content,
      },
      functionCall: response.functionCalls?.[0], // Storing only first function call? Matching logic
      grammerFix: grammerFix,
  };

  const finalHistory = [...updatedHistoryUser, newAiMessage];

  // 4. Update Chat with AI response
  const [updatedChat] = await db.update(chatSessions)
    .set({ 
        history: finalHistory,
        chatName: changeChatName || chat.chatName,
    })
    .where(eq(chatSessions.id, chatId))
    .returning();

  if (!updatedChat) {
    return {
      error: 'Chat not found',
    };
  }

  return Object.assign(
    {
      message: 'success',
      content: {
        id: aiMessageId,
        role: response.content.role,
        parts: response.content.parts, 
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
    if (!session || !session.user?.id) return { error: 'Not authenticated' };
    if (!data.targetDeckName) return { error: 'No deck name provided' };
    
    const [newDeck] = await db.insert(decks).values({
        userId: session.user.id,
        name: data.targetDeckName || '',
        isPublic: false,
    }).returning();
    
    await addWords(data.words, newDeck.id);
    return;
  },
  [ChatAction.RemoveDeck]: async (data) => {
    const session = await auth();
    if (!session || !session.user?.id) return { error: 'Not authenticated' };
    let deckId = data.deckId;
    
    if (!deckId || deckId.trim() === '') {
      if (data.targetDeckName) {
        const deck = await db.query.decks.findFirst({
            where: and(eq(decks.name, data.targetDeckName), eq(decks.userId, session.user.id))
        });
        console.log('deck', deck);
        if (!deck) return { error: 'Deck not found' };
        deckId = deck.id;
      } else {
        return { error: 'No deck id provided' };
      }
    }
    
    const deleted = await db.delete(decks)
        .where(and(eq(decks.id, deckId), eq(decks.userId, session.user.id)))
        .returning();

    if (!deleted.length) return { error: 'Deck not found' };
    return;
  },
  [ChatAction.EditDeck]: async (data) => {
    const session = await auth();
    if (!session || !session.user?.id) return { error: 'Not authenticated' };
    if (!data.deckId) return { error: 'No deck id provided' };

    const currentDeck = await db.query.decks.findFirst({
        where: eq(decks.id, data.deckId),
        with: { cards: true }
    });
    
    if (!currentDeck) return { error: 'Deck not found' };

    const originalDeckWords = currentDeck.cards.map((card) => card.word);

    const newWords = data.words.filter(
      (word) => !originalDeckWords.includes(word),
    );
    const removedWords = originalDeckWords.filter(
      (word) => !data.words.includes(word),
    );

    // Remove cards
    if (removedWords.length > 0) {
        await db.delete(cards)
            .where(and(
                eq(cards.deckId, data.deckId),
                inArray(cards.word, removedWords)
            ));
    }
    
    // Add new words
    await addWords(newWords, data.deckId);

    return;
  },
  [ChatAction.AddCard]: async (data, session) => {
    if (!session || !session.user?.id) return { error: 'Not authenticated' };
    let deckId = data.deckId;
    if (!deckId || deckId.trim() === '') {
      if (data.targetDeckName) {
        const deck = await db.query.decks.findFirst({
            where: and(eq(decks.name, data.targetDeckName), eq(decks.userId, session.user.id))
        });
        if (!deck) return { error: 'Deck not found' };
        deckId = deck.id;
      } else {
        return { error: 'No deck id provided' };
      }
    }
    if (!data.words) return { error: 'No word provided' };
    
    // Using addWords helper to keep logic consistent
    await addWords(data.words, deckId);
  },
};


async function addWords(words: string[], deckId: string) {
  words.map((word, index) => {
    setTimeout(
      async () => {
        // Try getting from cache first
        const cache = await db.query.wordCache.findFirst({
            where: eq(wordCache.word, word)
        });
        
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let wordData = cache ? (cache.data as any) : null;

        if (!wordData) {
            // Need to fetch from API
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
            wordData = temp;
        }

        if (wordData) {
            await db.insert(cards).values({
               deckId,
               word: wordData.word || word,
               phonetic: wordData.phonetic || '',
               blocks: wordData.blocks || [],
            });
        }
      },
      index * 2.5 * 1_000,
    );
  });
}

export async function deleteChatSession(chatId: string) {
  const session = await auth();
  if (!session || !session.user?.id) {
    return {
      error: 'Not authenticated',
    };
  }

  const deleted = await db.delete(chatSessions)
    .where(and(
        eq(chatSessions.id, chatId),
        eq(chatSessions.userId, session.user.id)
    ))
    .returning();

  if (!deleted.length) {
    return {
      error: 'Chat not found',
    };
  }

  return {
    message: 'success',
  };
}
