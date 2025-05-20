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

export default function Chat() {
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
				return;
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
	}, [chatId, chatList]);

	return (
		<div className='flex flex-row max-md:flex-col flex-grow md:*:m-4 max-md:*:m-1 items-center justify-center h-full *:md:h-full'>
			<div className='flex flex-col max-md:flex-grow min-w-32 flex-shrink-0 max-md:justify-center max-md:items-center max-md:flex-row max-md:max-h-16'>
				{chatList.map((chat) => {
					const isActive = chat._id === chatId;
					const color = isActive
						? 'bg-green-500 text-white'
						: ' bg-gray-700 text-white';
					return (
						<div
							className='flex flex-row justify-center items-center'
							key={chat._id}
						>
							<button
								className={`flex flex-row m-1 p-1 rounded-lg ${color} text-md overflow-ellipsis`}
								key={chat._id}
								onClick={() => setChatId(chat._id)}
							>
								{chat.chatName}
							</button>
							<button
								className='flex flex-row p-1 m-1 rounded-lg bg-red-500 text-white'
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
					className=' w-full bg-blue-500 text-white rounded-lg p-2 self-end '
					disabled={loading}
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
			<div className='flex flex-col flex-grow bg-gray-800 rounded-lg max-md:max-h-[80vh] max-md:w-full'>
				<div className='flex flex-col flex-grow overflow-y-auto'>
					{history.map((content) => {
						const { role, parts, action } = content;
						const direction = role === 'user' ? 'flex-row-reverse' : 'flex-row';
						return (
							<div
								className={`flex ${direction} w-full`}
								key={content.id}
							>
								{parts.map((part) => {
									if (part.text) {
										return (
											<div
												className={`flex flex-col p-2 m-2 rounded-lg bg-gray-700 text-white ${direction}`}
												key={part.text}
											>
												{part.text}
												{action && action.action === ChatAction.ShowOuput && (
													<div className='flex flex-row text-sm flex-wrap *:p-1 *:bg-opacity-40 *:bg-yellow-300 *:rounded-lg *:m-1'>
														{action.words.map((word) => (
															<p key={word}>{word}</p>
														))}
													</div>
												)}
											</div>
										);
									}
								})}
							</div>
						);
					})}
					{isSending && (
						<div className='flex flex-row self-start *:w-2 *:h-2 *:rounded-full *:bg-blue-500 *:m-2'>
							<div className='animate-bounce'></div>
							<div className='animate-bounce animation-delay-100'></div>
							<div className='animate-bounce animation-delay-200'></div>
						</div>
					)}
				</div>
				<div className='flex flex-row rounded-t-md flex-grow bg-opacity-50 *:mx-4 justify-center w-full mb-4 pt-2 md:max-h-16 max-md:max-h-12'>
					<input
						type='text'
						value={message}
						disabled={isSending}
						placeholder='Type a message'
						onChange={(e) => setMessage(e.target.value)}
						className='flex-grow h-full px-4 text-lg bg-gray-700 text-white p-1 border-2 border-black rounded-xl'
					/>
					<button
						className=' w-16 bg-blue-500 text-white rounded-lg p-2'
						disabled={isSending}
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
											setHistory(history.slice(0, -1));
											return;
										}
										setHistory((prev) => [...prev, data.content]);
										setMessage('');
									}),
							);
						}}
					>
						Send
					</button>
				</div>
			</div>
		</div>
	);
}
