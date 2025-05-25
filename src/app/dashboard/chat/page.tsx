'use client';

import {
	createChatSession,
	createChatSession,
	deleteChatSession,
	getChatHistory,
	getChatList,
	sendMessage,
} from '@/actions/chat';
import { WithStringId, WithStringObjectId, ChatAction, GrammarError } from '@/type'; // Added GrammarError
import { ChatModelSchema } from '@/utils'; // Added ChatModelSchema
import { Content } from '@google/generative-ai';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useScrollToBottom } from '@/hooks/scrollToBottom';
import { useTranslation } from '@/context/LanguageContext'; // Added
import Joyride, {
	Step,
	CallBackProps,
	ACTIONS,
	STATUS,
	Status,
} from 'react-joyride';
import { useLocalStorage } from '@/hooks/localstorage';

export default function Chat() {
	const { t } = useTranslation(); // Added
	const [message, setMessage] = useState('');
	// Updated history state definition
	const [history, setHistory] = useState<
		Array<{
			id: string;
			role: string; // 'user', 'model', 'tool'
			parts: Array<{ text?: string | null } & Record<string, any>>; // Flexible parts
			action?: ChatModelSchema;
			grammarCheckResults?: GrammarError[];
		}>
	>([]);
	const [chatId, setChatId] = useState('');
	const [chatList, setChatList] = useState<
		| WithStringObjectId<{
				chatName: string;
		  }>[]
	>([]);
	const [isSending, startSending] = useTransition();
	const [loading, setLoading] = useState(true);
	const chatRef = useRef<HTMLDivElement>(null);
	useScrollToBottom(chatRef, [chatId]); // Assuming this hook doesn't need translation context

	useEffect(() => {
		getChatList().then((data) => {
			setLoading(false);
			if (!Array.isArray(data)) {
				console.error(data.error);
				return setChatList([]);
			}
			setChatList(data);
		});
	}, [chatId]);

	useEffect(() => {
		if (chatId) { // If chatId is already set (e.g., from a previous state or user click)
			getChatHistory.bind(null, chatId)().then((data) => {
				if (!Array.isArray(data)) {
					console.error(data.error);
					setHistory([]);
					return;
				}
				setHistory(data);
			});
		} else { // chatId is not set (it's initially an empty string)
			if (!loading) { // Only proceed if the initial chat list loading is complete
				if (chatList && chatList.length > 0) {
					// If chatList is populated, set the first chat as active
					setChatId(chatList[0]._id);
				} else if (chatList && chatList.length === 0) {
					// If chatList is empty after loading, create a new chat session
					// Add a state to prevent multiple creations if this effect somehow re-triggers quickly
					// For this subtask, we'll assume the chatId change is sufficient to prevent immediate re-triggering of this specific block.
					createChatSession().then(newChatData => {
						if ('id' in newChatData) {
							setChatId(newChatData.id);
							// The first useEffect (which depends on chatId) will re-run
							// and call getChatList(), which should include the new chat.
						} else {
							// Handle error, e.g., log it or show a user-facing message
							console.error("Failed to create new chat session:", newChatData.error);
						}
					});
				}
			}
			// If still loading, or chatList isn't ready in some other way, do nothing and wait.
		}
	}, [chatId, chatList, loading]); // Ensure all dependencies are listed

	const [guideChatPage, setGuideChatPage] = useLocalStorage(
		'guideChatPage',
		false,
	);
	const [joyrideRun, setJoyrideRun] = useState(!guideChatPage);

	const steps: Array<Step> = [
		{
			target: '.joyride-chat-list-sidebar',
			content: t('dashboard.chat.joyride.step1Sidebar'),
			disableBeacon: true,
		},
		{
			target: '.joyride-chat-new-button',
			content: t('dashboard.chat.joyride.step2NewChat'),
		},
		{
			target: '.joyride-chat-history-area',
			content: t('dashboard.chat.joyride.step3History'),
		},
		{
			target: '.joyride-chat-message-input',
			content: t('dashboard.chat.joyride.step4Input'),
		},
		{
			target: '.joyride-chat-send-button',
			content: t('dashboard.chat.joyride.step5Send'),
		},
	];

	const handleJoyrideCallback = (data: CallBackProps) => {
		const { action, index, status, type } = data;
		if ([STATUS.FINISHED, STATUS.SKIPPED].includes(status as Status)) {
			setJoyrideRun(false);
			setGuideChatPage(true);
		}
		console.log('Joyride callback data for chat page', data);
	};

	return (
		<div className='flex flex-row max-md:flex-col flex-grow md:*:m-4 max-md:*:m-1 items-center justify-center h-full *:md:h-full dark:bg-gray-700'>
			<Joyride
				steps={steps}
				run={joyrideRun}
				callback={handleJoyrideCallback}
				continuous
				showProgress
				showSkipButton
				styles={{
					options: {
						zIndex: 10000, // Ensure it's above other elements
						primaryColor: '#007bff', // Example color
					},
				}}
			/>
			<div className='flex flex-col max-md:flex-grow min-w-32 flex-shrink-0 max-md:justify-center max-md:items-center max-md:flex-row max-md:max-h-16 dark:bg-gray-800 p-2 rounded-lg joyride-chat-list-sidebar'>
				{chatList.map((chat) => {
					const isActive = chat._id === chatId;
					const color = isActive
						? 'bg-green-500 text-white dark:bg-green-600'
						: 'bg-gray-600 hover:bg-gray-500 dark:bg-gray-700 dark:hover:bg-gray-600 text-white';
					return (
						<div
							className='flex flex-row justify-center items-center'
							key={chat._id}
						>
							<button
								className={`flex flex-row m-1 p-1 rounded-lg ${color} text-md overflow-ellipsis`}
								key={chat._id}
								onClick={() => setChatId(chat._id)}
								title={chat.chatName} // Added title for better UX on truncated names
							>
								{chat.chatName}
							</button>
							<button
								className='flex flex-row p-1 m-1 rounded-lg bg-red-500 hover:bg-red-600 dark:bg-red-600 dark:hover:bg-red-500 text-white'
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
					className='w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg p-2 self-end mt-2 joyride-chat-new-button'
					disabled={loading}
					title={t('dashboard.chat.newChatButton')} // Added title
					onClick={async () => {
						const data = await createChatSession();
						if ('error' in data) {
							console.error(data.error);
							return setChatId('');
						}
						setChatId(data.id);
					}}
				>
					+
				</button>
			</div>
			<div className='flex flex-col flex-grow bg-gray-200 dark:bg-gray-800 rounded-lg max-md:max-h-[80vh] max-md:w-full'>
				<div ref={chatRef} className='flex flex-col flex-grow overflow-y-auto p-2 space-y-2 joyride-chat-history-area'>
					{history.map((content) => {
						const { role, parts, action } = content;
						const isUser = role === 'user';
						const messageBgColor = isUser ? 'bg-blue-500 dark:bg-blue-600 text-white' : 'bg-gray-300 dark:bg-gray-600 text-black dark:text-white';
						const messageAlign = isUser ? 'self-end' : 'self-start';
						const partsDirection = isUser ? 'flex-row-reverse' : 'flex-row';


						return (
							<div
								className={`flex w-full ${isUser ? 'justify-end' : 'justify-start'}`}
								key={content.id}
							>
								<div className={`flex flex-col max-w-[70%]`}>
									{parts.map((part, index) => {
										if (part.text) {
											return (
												<div
													className={`p-3 m-1 rounded-xl shadow ${messageBgColor} ${messageAlign}`}
													key={`${content.id}-part-${index}`}
												>
													{part.text}
													{/* Display ShowOuput action words if present (assuming action is on the top-level contentItem) */}
													{content.action && content.action.action === ChatAction.ShowOuput && content.action.words && (
														<div className={`flex text-sm flex-wrap *:p-1 *:bg-yellow-200 dark:*:bg-yellow-700 *:rounded-lg *:m-1 ${partsDirection}`}>
															{content.action.words.map((word) => (
																<p key={word}>{word}</p>
															))}
														</div>
													)}
												</div>
											);
										}
										// Placeholder for rendering other part types like functionCall or functionResponse if needed directly
										if (part.functionCall) {
											return (
												<div className={`p-3 m-1 rounded-xl shadow ${messageBgColor} ${messageAlign} text-xs italic`} key={`${content.id}-part-${index}`}>
													{t('dashboard.chat.functionCallLabel', { name: part.functionCall.name, args: JSON.stringify(part.functionCall.args)})}
												</div>
											);
										}
										if (part.functionResponse) {
											return (
												<div className={`p-3 m-1 rounded-xl shadow ${messageBgColor} ${messageAlign} text-xs italic`} key={`${content.id}-part-${index}`}>
													{t('dashboard.chat.functionResponseLabel', { name: part.functionResponse.name, response: JSON.stringify(part.functionResponse.response)})}
												</div>
											);
										}
										return null;
									})}
                                    {/* Render Grammar Check Results */}
                                    {content.grammarCheckResults && content.grammarCheckResults.length > 0 && (
                                        <div className="mt-1 pl-3 pr-3">
                                            {content.grammarCheckResults.map((error, errIdx) => (
                                                <div key={`err-${content.id}-${errIdx}`} className="text-xs text-gray-500 dark:text-gray-400 py-0.5">
                                                    <p><strong>{t('dashboard.chat.grammarErrorLabel', { default: 'Grammar Alert:' })}</strong> {error.message}</p>
                                                    {error.correction && (
                                                        <p><strong>{t('dashboard.chat.suggestionLabel', { default: 'Suggestion:' })}</strong> {error.correction}</p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
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
				<div className='flex flex-row rounded-t-md flex-grow bg-opacity-50 *:mx-2 justify-center w-full mb-4 pt-2 md:max-h-16 max-md:max-h-12'>
					<input
						type='text'
						value={message}
						disabled={isSending}
						placeholder={t('dashboard.chat.inputPlaceholder')} // Translated
						onChange={(e) => setMessage(e.target.value)}
						onKeyPress={(e) => { // Added Enter key press functionality
							if (e.key === 'Enter' && !e.shiftKey && message.trim() !== '' && !isSending) {
								e.preventDefault(); // Prevents newline in some browsers
								// Trigger send logic
								setHistory((prev) => [
									...prev,
									{
										id: Number(prev.length.toString() + Date.now()).toString(16),
										role: 'user',
										parts: [{ text: message }],
									},
								]);
								startSending(() =>
									sendMessage
										.bind(null, chatId, message)()
										.then((data) => {
											if ('error' in data) {
												console.error(data.error);
												setHistory(history.slice(0, -1)); // Revert optimistic update
												return;
											}
                                            // Assuming 'data' from server action is the full history item
                                            // or data.content is. The backend returns an object with 'content' and 'grammarCheckResults'.
                                            // The history item type on frontend expects these to be merged.
                                            const newHistoryItem = {
                                                id: data.content.id,
                                                role: data.content.role,
                                                parts: data.content.parts,
                                                action: (data as any).action, // Cast if action is not directly on content
                                                grammarCheckResults: (data as any).grammarCheckResults,
                                            };
											setHistory((prev) => [...prev, newHistoryItem]);
											setMessage('');
										}),
								);
							}
						}}
						className='flex-grow h-full px-4 text-lg bg-gray-300 dark:bg-gray-700 text-black dark:text-white p-1 border-2 border-gray-400 dark:border-gray-600 rounded-xl focus:ring-blue-500 focus:border-blue-500 joyride-chat-message-input'
					/>
					<button
						className='w-auto px-4 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg p-2 joyride-chat-send-button'
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
							startSending(() =>
								sendMessage
									.bind(null, chatId, message)()
									.then((data) => {
										if ('error' in data) {
											console.error(data.error);
											setHistory(history.slice(0, -1)); // Revert optimistic update
											return;
										}
                                            const newHistoryItem = {
                                                id: data.content.id,
                                                role: data.content.role,
                                                parts: data.content.parts,
                                                action: (data as any).action,
                                                grammarCheckResults: (data as any).grammarCheckResults,
                                            };
											setHistory((prev) => [...prev, newHistoryItem]);
										setMessage('');
									}),
							);
						}}
					>
						{t('dashboard.chat.sendButton')} {/* Translated */}
					</button>
				</div>
			</div>
		</div>
	);
}
