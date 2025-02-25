'use client';

import { CardProps } from '@/type';
import Questions from '@/components/questions';
import { useCallback, useEffect, useState } from 'react';
import Deck from '@/components/deck';

enum CardType {
	Questions = 'Questions',
	Card = 'Card',
}

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

export default function Home() {
	const [type, setType] = useState<CardType>(CardType.Card);
	const [cards, setCards] = useState<CardProps[]>([]);
	const [wordStartWith, setWordStartWith] = useState<string>('');

	const fetchCards = useCallback((wordStartWith?: string) => {
		wordStartWith = wordStartWith || '';
		console.log(wordStartWith);
		fetch(
			`/api/cards?count=15&deck_id=13${
				wordStartWith.trim().length !== 0
					? `&range=${wordStartWith}-${wordStartWith}`
					: ''
			}`,
		)
			.then((res) => res.json())
			.then((data) => {
				console.log(data);
				setCards(data);
			});
	}, []);

	useEffect(() => {
		fetchCards(wordStartWith);
	}, [wordStartWith, fetchCards]);

	return (
		<div className='flex flex-row items-center justify-center min-h-screen py-2 bg-gray-700'>
			{type === CardType.Questions ? (
				<Questions
					cards={cards}
					onFinishClick={() => {
						fetchCards(wordStartWith);
					}}
				/>
			) : (
				<Deck
					cards={cards}
					onFinishClick={() => {
						fetchCards(wordStartWith);
					}}
				/>
			)}
			<div className=' absolute flex flex-col left-0 h-full md:w-32 bg-gray-50 max-md:flex-row max-md:h-16 max-md:bottom-0 max-md:w-full'>
				<button
					className={`p-2 m-2 text-black bg-emerald-600 rounded-md ${
						type === CardType.Card ? 'bg-opacity-40' : 'bg-opacity-10'
					}`}
					onClick={() => setType(CardType.Card)}
				>
					Card
				</button>
				<button
					className={`p-2 m-2 text-black bg-emerald-600 rounded-md ${
						type === CardType.Questions ? 'bg-opacity-40' : 'bg-opacity-10'
					}`}
					onClick={() => setType(CardType.Questions)}
				>
					Questions
				</button>
				<button
					onClick={() => fetchCards(wordStartWith)}
					className='p-2 m-2 text-black bg-sky-600 bg-opacity-10 rounded-md hover:bg-opacity-80 transition-all delay-100'
				>
					Refresh
				</button>
				<h4 className='text-md text-black self-center'>Word Start With:</h4>
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
			</div>
		</div>
	);
}
