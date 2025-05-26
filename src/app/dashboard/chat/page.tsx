'use client';

import {
	createChatSession,
	deleteChatSession,
	getChatHistory,
	getChatList,
	sendMessage,
} from '@/actions/chat';
import { WithStringId, WithStringObjectId, ChatAction } from '@/type';
import { Content } from '@google/generative-ai';
import { useEffect, useRef, useState, useTransition } from 'react';
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
			}
		>[]
	>([]);
	const [chatId, setChatId] = useState('');
	const [chatList, setChatList] = useState<
		| WithStringObjectId<{
				chatName: string;
		  }>[]
	>([]);
	const [isSending, startSending] = useTransition();
	const [loading, setLoading] = useState(true);
	const isInitChat = useRef(false);
	const chatRef = useRef<HTMLDivElement>(null);
	useScrollToBottom(chatRef, [chatId]);

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
		let currentId = chatId;
		if (!currentId || currentId === '') {
			if (chatList && chatList.length > 0) {
				currentId = chatList[0]._id;
				setChatId(currentId);
			} else {
				if (isInitChat.current) return;
				isInitChat.current = true;
				createChatSession().then((data) => {
					if ('error' in data) {
						console.error(data.error);
						return setChatId('');
					}
					setChatId(data.id);
					currentId = data.id;
				});
			}
		}
		getChatHistory
			.bind(null, currentId)()
			.then((data) => {
				if (!Array.isArray(data)) {
					console.error(data.error);
					setHistory([]);
					return;
				}
				setHistory(data);
			});
	}, [chatId, chatList, isInitChat]);

	return (
		<div className='flex flex-row max-md:flex-col flex-grow md:*:m-4 max-md:*:m-1 items-center justify-center h-full *:md:h-full dark:bg-gray-700'>
			<div className='flex flex-col max-md:flex-grow min-w-32 flex-shrink-0 max-md:justify-center max-md:items-center max-md:flex-row max-md:max-h-16 dark:bg-gray-800 p-2 rounded-lg'>
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
					className='w-full bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg p-2 self-end mt-2'
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
				<div
					ref={chatRef}
					className='flex flex-col flex-grow overflow-y-auto p-2 space-y-2'
				>
					{history.map((content) => {
						const { role, parts, action } = content;
						const isUser = role === 'user';
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
									{parts.map((part, index) => {
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
												</div>
											);
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
				<div className='flex flex-row rounded-t-md flex-grow bg-opacity-50 *:mx-2 justify-center w-full mb-4 pt-2 md:max-h-16 max-md:max-h-12'>
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
								startSending(() =>
									sendMessage
										.bind(null, chatId, message)()
										.then((data) => {
											if ('error' in data) {
												console.error(data.error);
												setHistory(history.slice(0, -1)); // Revert optimistic update
												return;
											}
											setHistory((prev) => [...prev, data.content]);
											setMessage('');
										}),
								);
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
							startSending(() =>
								sendMessage
									.bind(null, chatId, message)()
									.then((data) => {
										if ('error' in data) {
											console.error(data.error);
											setHistory(history.slice(0, -1)); // Revert optimistic update
											return;
										}
										setHistory((prev) => [...prev, data.content]);
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
