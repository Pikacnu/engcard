'use client';

import { CardProps, DeckCardsResponse } from '@/type';
import Questions from '@/components/questions';
import { useCallback, useEffect, useState } from 'react';
import Deck from '@/components/deck';
import Image from 'next/image';
import List from '../../components/list';
import QuestionWord from '@/components/question_word';
import { CardType } from '@/type';
import { useSearchParams } from 'next/navigation';
import { saveHistory } from '@/utils/user-data';

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

const optionCounts = 40;

export default function Home() {
	const [type, setType] = useState<CardType>(CardType.Card);
	const [cards, setCards] = useState<CardProps[]>([]);
	const [wordStartWith, setWordStartWith] = useState<string>('');
	const [count, setCount] = useState<number>(15);
	const searchParams = useSearchParams();
	const deckid = searchParams.get('deck');
	const [isMarked, setIsMarked] = useState<boolean>(false);
	const [markedWord, setMarkedWord] = useState<CardProps[]>([]);
	const [currentWord, setWord] = useState<CardProps | undefined>(undefined);

	const fetchCards = useCallback(
		async (wordStartWith?: string, count = 15) => {
			wordStartWith = wordStartWith || '';
			const response = await fetch(
				`/api/deck/cards?id=${deckid}&count=${count}&startWith=${wordStartWith}`,
			);
			if (!response.ok) {
				setCards([]);
			}
			const deckData = (await response.json()) as DeckCardsResponse;
			setCards(deckData.cards);
		},
		[deckid],
	);

	useEffect(() => {
		fetchCards(wordStartWith, count);
	}, [fetchCards, wordStartWith, count]);

	useEffect(() => {
		saveHistory(
			cards.map((card) => card.word),
			deckid || '',
			'',
		);
	}, [cards, deckid]);

	useEffect(() => {
		const saved = markedWord.find(
			(word) => currentWord && word.word === currentWord?.word,
		);
		if (saved) {
			setIsMarked(true);
			return;
		}
		setIsMarked(false);
	}, [currentWord, markedWord]);

	return (
		<div className='flex flex-row items-center justify-center min-h-screen py-2 bg-gray-700 w-full'>
			{
				{
					[CardType.Card]: (
						<div>
							<Deck
								cards={cards}
								onFinishClick={() => {
									fetchCards(wordStartWith, count);
									saveHistory(
										cards.map((card) => card.word),
										'',
									);
								}}
								updateCurrentWord={setWord}
							/>
						</div>
					),
					[CardType.Questions]: (
						<Questions
							cards={cards}
							onFinishClick={() => {
								fetchCards(wordStartWith, count);
								saveHistory(
									cards.map((card) => card.word),
									'',
								);
							}}
							updateCurrentWord={setWord}
						/>
					),
					[CardType.List]: (
						<div className='max-md:w-[80vw] md:max-[50vw] flex items-center justify-center'>
							<List cards={cards} />
						</div>
					),
					[CardType.Word]: (
						<QuestionWord
							cards={cards}
							onFinishClick={() => {
								fetchCards(wordStartWith, count);
								saveHistory(
									cards.map((card) => card.word),
									'',
								);
							}}
							updateCurrentWord={setWord}
						/>
					),
				}[type]
			}

			<button
				className='absolute top-0 right-0 m-4 p-2 bg-gray-500 text-white rounded-lg'
				onClick={() => {
					if (isMarked) {
						setMarkedWord((prev) =>
							prev.filter((word) => word.word !== currentWord?.word),
						);
					} else {
						setMarkedWord((prev) => [...prev, currentWord!]);
					}
					setIsMarked((prev) => !prev);
				}}
			>
				<Image
					src={`/icons/star${isMarked ? '-fill' : ''}.svg`}
					width={24}
					height={24}
					alt='Marked'
				></Image>
			</button>
			<div className=' absolute flex flex-col left-0 h-full bg-gray-50 max-md:flex-row max-md:h-16 max-md:bottom-0 max-md:w-full max-md:justify-center'>
				<button
					className={`p-2 m-2 text-black bg-emerald-600 rounded-md ${
						type === CardType.Card ? 'bg-opacity-40' : 'bg-opacity-10'
					}`}
					onClick={() => setType(CardType.Card)}
				>
					<Image
						src={`/icons/card.svg`}
						width={24}
						height={24}
						alt='Card'
					/>
				</button>
				<button
					className={`p-2 m-2 text-black bg-emerald-600 rounded-md ${
						type === CardType.Questions ? 'bg-opacity-40' : 'bg-opacity-10'
					}`}
					onClick={() => setType(CardType.Questions)}
				>
					<Image
						src={`/icons/question-square.svg`}
						width={24}
						height={24}
						alt='Questions'
					/>
				</button>
				<button
					className={`p-2 m-2 text-black bg-emerald-600 rounded-md ${
						type === CardType.List ? 'bg-opacity-40' : 'bg-opacity-10'
					}`}
					onClick={() => setType(CardType.List)}
				>
					<Image
						src={`/icons/bookmark.svg`}
						width={24}
						height={24}
						alt='List'
					/>
				</button>
				<button
					className={`p-2 m-2 text-black bg-emerald-600 rounded-md ${
						type === CardType.Word ? 'bg-opacity-40' : 'bg-opacity-10'
					}`}
					onClick={() => {
						fetchCards(wordStartWith, count * 4);
						setType(CardType.Word);
					}}
				>
					<Image
						src={`/icons/collection.svg`}
						width={24}
						height={24}
						alt='Word Questions'
					/>
				</button>
				<button
					onClick={() => {
						fetchCards(wordStartWith, count);
						saveHistory(
							cards.map((card) => card.word),
							'',
						);
					}}
					className='p-2 m-2 text-black bg-sky-600 bg-opacity-10 rounded-md hover:bg-opacity-80 transition-all delay-100'
				>
					<Image
						src={`/icons/refresh.svg`}
						width={24}
						height={24}
						alt='Refresh'
					/>
				</button>
				<button
					onClick={() => setCards(markedWord)}
					className='p-2 m-2 text-black bg-sky-600 bg-opacity-10 rounded-md hover:bg-opacity-80 transition-all delay-100'
				>
					<Image
						src={`/icons/star.svg`}
						width={24}
						height={24}
						alt='Refresh'
					/>
				</button>
				<button
					className={`p-2 m-2 text-black bg-emerald-600 rounded-md max-md:absolute right-0 max-md:bottom-16 `}
					onClick={() => {
						console.log(deckid);
						fetch('/api/deck/public', {
							method: 'POST',
							body: JSON.stringify({
								id: deckid,
							}),
						}).then((res) => {
							if (res.ok) {
								alert('Deck Added to your collection');
								return;
							} else {
								res.json().then((data) => {
									alert(data.error);
								});
							}
						});
					}}
				>
					+
				</button>
				<select
					className=' text-black bg-sky-600 bg-opacity-10 rounded-md m-2'
					onChange={(e) => setWordStartWith(e.target.value)}
					value={wordStartWith}
				>
					<option value=''>All</option>
					{alphabet.map((letter) => (
						<option
							key={letter}
							value={letter}
						>
							{letter}
						</option>
					))}
				</select>
				<select
					className=' text-black bg-sky-600 bg-opacity-10 rounded-md m-2'
					onChange={(e) => setCount(Number(e.target.value))}
					value={count}
				>
					{Array(optionCounts + 1)
						.fill(0)
						.map((_, i) => i * 5)
						.slice(1)
						.map((count) => (
							<option
								key={count}
								value={count}
							>
								{count}
							</option>
						))}
				</select>
			</div>
		</div>
	);
}
