'use client';

import { CardProps } from '@/type';
import Questions from '@/components/questions';
import { useCallback, useEffect, useState } from 'react';
import Deck from '@/components/deck';
import Image from 'next/image';
import List from './../components/list';
import Link from 'next/link';
import QuestionWord from '@/components/question_word';
import { CardType } from '@/type';

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

const optionCounts = 40;

export default function Home() {
	const [type, setType] = useState<CardType>(CardType.Card);
	const [cards, setCards] = useState<CardProps[]>([]);
	const [wordStartWith, setWordStartWith] = useState<string>('');
	const [count, setCount] = useState<number>(15);

	const fetchCards = useCallback((wordStartWith?: string, count = 15) => {
		wordStartWith = wordStartWith || '';
		console.log(wordStartWith);
		fetch(
			`/api/cards?count=${count}&deck_id=13${
				wordStartWith.trim().length !== 0
					? `&range=${wordStartWith}-${wordStartWith}`
					: ''
			}`,
		)
			.then((res) => res.json())
			.then((data) => {
				setCards(data);
			});
	}, []);

	useEffect(() => {
		fetchCards(wordStartWith, count);
	}, [wordStartWith, fetchCards, count, type]);

	return (
		<div className='flex flex-row items-center justify-center min-h-screen py-2 bg-gray-700'>
			{
				{
					[CardType.Card]: (
						<Deck
							cards={cards}
							onFinishClick={() => fetchCards(wordStartWith, count)}
						/>
					),
					[CardType.Questions]: (
						<Questions
							cards={cards}
							onFinishClick={() => fetchCards(wordStartWith, count)}
						/>
					),
					[CardType.List]: (
						<div className='flex-grow max-md:w-[80vw] md:max-[50vw]'>
							<List cards={cards} />
						</div>
					),
					[CardType.Word]: (
						<QuestionWord
							cards={cards}
							onFinishClick={() => fetchCards(wordStartWith, count)}
						/>
					),
				}[type]
			}
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
					onClick={() => fetchCards(wordStartWith, count)}
					className='p-2 m-2 text-black bg-sky-600 bg-opacity-10 rounded-md hover:bg-opacity-80 transition-all delay-100'
				>
					<Image
						src={`/icons/refresh.svg`}
						width={24}
						height={24}
						alt='Refresh'
					/>
				</button>
				<h4 className='text-black self-center'>
					<Image
						src={`/icons/search.svg`}
						width={24}
						height={24}
						alt='Search'
					/>
				</h4>
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
				<Link
					href={'/auth/login'}
					className='text-black self-center min-w-max'
				>
					<Image
						src={`/icons/box-arrow-in-left.svg`}
						width={24}
						height={24}
						alt='Login'
					/>
				</Link>
			</div>
		</div>
	);
}
