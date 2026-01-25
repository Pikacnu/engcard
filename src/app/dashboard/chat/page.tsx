'use client';

import {
  createChatSession,
  deleteChatSession,
  getChatHistory,
  getChatList,
  sendMessage,
} from '@/actions/chat';
import { WithStringId, WithStringObjectId, ChatAction } from '@/type';
import { Content } from '@google/genai';
import { useCallback, useEffect, useRef, useState, useTransition } from 'react';
import { useScrollToBottom } from '@/hooks/scrollToBottom';
import { useTranslation } from '@/context/LanguageContext'; // Added

export default function Chat() {
  const { t } = useTranslation(); // Added
  const [message, setMessage] = useState('');
  const [history, setHistory] = useState<
    WithStringId<
      Content & {
        action?: {
          action: ChatAction;
          words: string[];
        };
        grammerFix?: {
          offsetWords: number;
          lengthWords: number;
          correctedText: string;
        }[];
      }
    >[]
  >([]);
  const [chatId, setChatId] = useState('');
  const [chatList, setChatList] = useState<
    WithStringObjectId<{
      chatName: string;
    }>[]
  >([]);
  const [isSending, startSending] = useTransition();
  const [loading, setLoading] = useState(true);

  const chatRef = useRef<HTMLDivElement>(null);
  useScrollToBottom(chatRef, [chatId]);

  useEffect(() => {
    (async () => {
      let chatListData = await getChatList();
      if (!Array.isArray(chatListData)) {
        console.error(chatListData.error);
        setChatList([]);
      }
      chatListData = chatListData as WithStringObjectId<{
        chatName: string;
      }>[];
      setChatList(chatListData);
      if (chatListData.length > 0) {
        setChatId(chatListData[0]._id);
      } else {
        const newChat = await createChatSession();
        if ('error' in newChat) {
          console.error(newChat.error);
          return setChatId('');
        }
        setChatId(newChat.id);
        setChatList([
          ...chatListData,
          { _id: newChat.id, chatName: 'New Chat' },
        ]);
      }
      setLoading(false);
    })();
  }, []);

  useEffect(() => {
    (async () => {
      if (!chatId) return;
      setLoading(true);
      const chatHistory = await getChatHistory(chatId);
      if ('error' in chatHistory) {
        setLoading(false);
        console.error(chatHistory.error);
        return;
      }
      console.log(chatHistory);
      setLoading(false);
      setHistory(chatHistory);
    })();
  }, [chatId]);

  const handleSendMessage = useCallback(
    (message: string) => {
      sendMessage
        .bind(null, chatId, message)()
        .then((data) => {
          if ('error' in data) {
            console.error(data.error);
            setHistory(history.slice(0, -1)); // Revert optimistic update
            return;
          }
          setHistory((prev) => [
            ...prev,
            Object.assign(data.content, {
              grammerFix: data.grammerFix,
            }),
          ]);
          setMessage('');
        });
    },
    [chatId, history],
  );

  return (
    <div className='flex flex-row max-md:flex-col flex-grow  items-center justify-center h-full *:md:h-full dark:bg-gray-700'>
      <div className='flex flex-col max-md:flex-grow min-w-32 flex-shrink-0 max-md:justify-center max-md:items-center max-md:flex-row max-md:max-h-16 max-md:w-full dark:bg-gray-800 p-2 sticky top-0'>
        <div className='flex flex-row justify-center items-center'>
          {chatList.map((chat) => {
            const isActive = chat._id === chatId;
            const color = isActive
              ? 'bg-green-500 text-white dark:bg-green-600'
              : 'bg-gray-600 hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 text-white';
            return (
              <div
                key={chat._id}
                className='flex flex-row *:px-2 *:py-1 *:m-1'
              >
                <button
                  className={`flex flex-row rounded-sm ${color} text-md overflow-ellipsis`}
                  onClick={() => setChatId(chat._id)}
                  title={chat.chatName} // Added title for better UX on truncated names
                >
                  {chat.chatName}
                </button>
                <button
                  className='flex flex-row  rounded-sm bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 text-white'
                  title={t('dashboard.chat.deleteChatButton')} // Added title
                  aria-label={t('dashboard.chat.deleteChatButton')} // Added aria-label
                  onClick={() => {
                    deleteChatSession
                      .bind(null, chat._id)()
                      .then((data) => {
                        if ('error' in data) {
                          console.error(data.error);
                          return;
                        }
                        setChatList(chatList.filter((c) => c._id !== chat._id));
                      });
                    setChatId('');
                  }}
                >
                  x
                </button>
              </div>
            );
          })}
          <button
            className='bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-sm px-2 py-1 m-1 self-end text-center'
            disabled={loading}
            title={t('dashboard.chat.newChatButton')} // Added title
            onClick={async () => {
              const data = await createChatSession();
              if ('error' in data) {
                console.error(data.error);
                return setChatId('');
              }
              setChatList((prev) => [
                ...prev,
                { _id: data.id, chatName: 'New Chat' },
              ]);
              setChatId(data.id);
            }}
          >
            +
          </button>
        </div>
      </div>
      <div className='flex flex-col flex-grow bg-gray-200 dark:bg-gray-800 max-md:max-h-full max-md:w-full'>
        <div
          ref={chatRef}
          className='flex flex-col flex-grow overflow-y-auto p-2 space-y-2'
        >
          {history.map((content, contentIndex) => {
            const { role, parts, action } = content;
            const isUser = role === 'user';
            console.log('Render message:', content);
            const messageBgColor = isUser
              ? 'bg-blue-500 dark:bg-blue-600 text-white'
              : 'bg-gray-300 dark:bg-gray-600 text-black dark:text-white';
            const messageAlign = isUser ? 'self-end' : 'self-start';
            const partsDirection = isUser ? 'flex-row-reverse' : 'flex-row';

            return (
              <div
                className={`flex w-full ${
                  isUser ? 'justify-end' : 'justify-start'
                }`}
                key={content.id}
              >
                <div className={`flex flex-col max-w-[70%]`}>
                  {parts?.map((part, index) => {
                    console.log('Render part:', part);
                    if (part.text) {
                      return (
                        <div
                          className={`p-3 m-1 rounded-xl shadow ${messageBgColor} ${messageAlign}`}
                          key={`${content.id}-part-${index}`}
                        >
                          {part.text}
                          {action && action.action === ChatAction.ShowOuput && (
                            <div
                              className={`flex text-sm flex-wrap *:p-1 *:bg-yellow-200 dark:*:bg-yellow-700 *:rounded-lg *:m-1 ${partsDirection}`}
                            >
                              {action.words.map((word) => (
                                <p key={word}>{word}</p>
                              ))}
                            </div>
                          )}
                          {content.grammerFix &&
                            Array.isArray(content.grammerFix) &&
                            content.grammerFix?.length > 0 && (
                              <>
                                <p className='pt-2'>
                                  {t('dashboard.chat.grammerFixLabel')}:
                                </p>
                                {/* Translated */}
                                <p className=' text-gray-900 flex flex-wrap'>
                                  {
                                    history[contentIndex - 1]?.parts
                                      ?.map((part) => part.text)
                                      ?.join(' ')
                                      ?.split(' ')
                                      ?.reduce(
                                        (acc, word, idx) => {
                                          const fix = content.grammerFix?.find(
                                            (f) =>
                                              f.offsetWords <= idx &&
                                              f.offsetWords + f.lengthWords >
                                                idx,
                                          );
                                          if (idx <= acc.index) return acc;
                                          const nodes = acc.node;
                                          if (fix) {
                                            nodes.push(
                                              <span
                                                key={`${content.id}-fix-${idx}`}
                                                className='text-red-500'
                                              >
                                                {fix.correctedText}
                                              </span>,
                                            );
                                            acc.index +=
                                              fix.lengthWords + fix.offsetWords;
                                          } else {
                                            nodes.push(
                                              <span
                                                key={`${content.id}-word-${idx}`}
                                                className='text-black dark:text-white pl-2'
                                              >
                                                {word}
                                              </span>,
                                            );
                                            acc.index += 1;
                                          }
                                          return {
                                            index: acc.index,
                                            node: nodes,
                                          };
                                        },
                                        {
                                          index: 0,
                                          node: [],
                                        } as {
                                          index: number;
                                          node: React.ReactNode[];
                                        },
                                      )?.node
                                  }
                                </p>
                              </>
                            )}
                        </div>
                      );
                    }
                    if (part.functionCall) {
                      const func = part.functionCall;
                      switch (func.name) {
                        case 'word_list':
                          return (
                            <div
                              className={`p-3 m-1 rounded-xl shadow ${messageBgColor} ${messageAlign}`}
                              key={`${content.id}-part-${index}`}
                            >
                              <p>
                                {t('dashboard.chat.wordListFunctionCallLabel')}:
                              </p>
                              <ul className='list-disc list-inside'>
                                {(func.args!.words as string[]).map(
                                  (word, wordIndex) => (
                                    <li key={`${content.id}-word-${wordIndex}`}>
                                      {word}
                                    </li>
                                  ),
                                )}
                              </ul>
                            </div>
                          );
                        case 'grammer_correction': {
                          const corrections = func.args!.grammerFixes as Array<{
                            offsetWords: number;
                            lengthWords: number;
                            correctedText: string;
                          }>;
                          return (
                            <div
                              className={`p-3 m-1 rounded-xl shadow ${messageBgColor} ${messageAlign}`}
                              key={`${content.id}-part-${index}`}
                            >
                              <p className='pt-2'>
                                {t('dashboard.chat.grammerFixLabel')}:
                              </p>
                              <p className=' text-gray-900 flex flex-wrap'></p>
                            </div>
                          );
                        }
                      }
                    }
                    return null;
                  })}
                </div>
              </div>
            );
          })}
          {isSending && (
            <div className='flex flex-row self-start *:w-2 *:h-2 *:rounded-full *:bg-blue-500 *:m-2 ml-3'>
              <div className='animate-bounce'></div>
              <div className='animate-bounce animation-delay-100'></div>
              <div className='animate-bounce animation-delay-200'></div>
            </div>
          )}
        </div>
        <div className='flex flex-row rounded-t-md flex-grow bg-opacity-50 *:mx-2 justify-center w-full mb-4 pt-2 md:max-h-16 max-md:max-h-12 sticky bottom-0'>
          <input
            type='text'
            value={message}
            disabled={isSending}
            placeholder={t('dashboard.chat.inputPlaceholder')} // Translated
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={(e) => {
              // Added Enter key press functionality
              if (
                e.key === 'Enter' &&
                !e.shiftKey &&
                message.trim() !== '' &&
                !isSending
              ) {
                e.preventDefault(); // Prevents newline in some browsers
                // Trigger send logic
                setHistory((prev) => [
                  ...prev,
                  {
                    id: Number(prev.length.toString() + Date.now()).toString(
                      16,
                    ),
                    role: 'user',
                    parts: [{ text: message }],
                  },
                ]);
                startSending(() => handleSendMessage(message));
              }
            }}
            className='flex-grow h-full px-4 text-lg bg-gray-300 dark:bg-gray-700 text-black dark:text-white p-1 border-2 border-gray-400 dark:border-gray-600 rounded-xl focus:ring-blue-500 focus:border-blue-500'
          />
          <button
            className='w-auto px-4 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg p-2'
            disabled={isSending || message.trim() === ''}
            onClick={() => {
              setHistory((prev) => [
                ...prev,
                {
                  id: Number(prev.length.toString() + Date.now()).toString(16),
                  role: 'user',
                  parts: [{ text: message }],
                },
              ]);
              startSending(() => handleSendMessage(message));
            }}
          >
            {t('dashboard.chat.sendButton')} {/* Translated */}
          </button>
        </div>
      </div>
    </div>
  );
}
