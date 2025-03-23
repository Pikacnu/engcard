'use client';
import { useState, useCallback, useEffect } from 'react';
import {
	CardProps,
	CardType,
	DeckCardsResponse,
	type DeckResponse,
} from '@/type';
import Deck from '@/components/deck';
import Image from 'next/image';
import QuestionWord from '@/components/question_word';
import Questions from '@/components/questions';
import { useSearchParams } from 'next/navigation';
import List from '@/components/list';
import { saveHistory } from '@/utils/user-data';

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

const optionCounts = 40;

export default function Preview() {
	const [type, setType] = useState<CardType>(CardType.Card);
	const [cards, setCards] = useState<CardProps[]>([]);
	const [wordStartWith, setWordStartWith] = useState<string>('');
	const [count, setCount] = useState<number>(15);
	const searchParams = useSearchParams();
	const [decks, setDecks] = useState<DeckResponse[]>([]);
	const deckid = searchParams.get('id');
	const [selectedDeck, setSelectedDeck] = useState(deckid || '');

	const fetchCards = useCallback(
		async (wordStartWith?: string, count = 15, deckid?: string) => {
			wordStartWith = wordStartWith || '';
			const response = await fetch(
				`/api/deck/cards?id=${
					deckid ? deckid : selectedDeck
				}&count=${count}&startWith=${wordStartWith}`,
			);
			if (!response.ok) {
				setCards([]);
			}
			const deckData = (await response.json()) as DeckCardsResponse;
			setCards(deckData.cards);
		},
		[selectedDeck],
	);

	useEffect(() => {
		(async () => {
			const response = await fetch('/api/deck');
			if (!response.ok) setDecks([]);
			const decks: DeckResponse[] = await response.json();
			const selectedDeck =
				!deckid || deckid?.trim().length === 0
					? decks.filter((deck) => deck.card_length !== 0)[0]?._id
					: deckid;
			setDecks(decks);
			setSelectedDeck(
				decks.filter((deck) => deck.card_length !== 0)[0]?._id || '',
			);
			const count = 15;
			const wordStartWith = '';
			const responseCards = await fetch(
				`/api/deck/cards?id=${selectedDeck}&count=${count}&startWith=${wordStartWith}`,
			);
			if (!response.ok) {
				setCards([]);
			}
			const deckData = (await responseCards.json()) as DeckCardsResponse;
			setCards(deckData.cards);
		})();
	}, [deckid]);

	useEffect(() => {
		if (selectedDeck) {
			fetchCards();
		}
	}, [selectedDeck, fetchCards]);

	return (
		<div className='flex flex-row-reverse max-md:flex-col items-center justify-center h-full w-full bg-gray-700'>
			<div className='flex-grow flex items-center justify-center w-full'>
				{
					{
						[CardType.Card]: (
							<Deck
								cards={cards}
								onFinishClick={() => {
									fetchCards(wordStartWith, count);
									saveHistory(
										cards.map((card) => card.word),
										selectedDeck || '',
									);
								}}
							/>
						),
						[CardType.Questions]: (
							<Questions
								cards={cards}
								onFinishClick={() => {
									fetchCards(wordStartWith, count);
									saveHistory(
										cards.map((card) => card.word),
										selectedDeck || '',
									);
								}}
							/>
						),
						[CardType.List]: <List cards={cards} />,
						[CardType.Word]: (
							<QuestionWord
								cards={cards}
								onFinishClick={() => {
									fetchCards(wordStartWith, count);
									saveHistory(
										cards.map((card) => card.word),
										selectedDeck || '',
									);
								}}
							/>
						),
					}[type]
				}
			</div>
			<div className='flex flex-col h-full bg-gray-200 max-md:flex-row max-md:h-16 max-md:bottom-0 max-md:w-full max-md:justify-center'>
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
						setType(CardType.Word);
						fetchCards(wordStartWith, count * 4);
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
			</div>
			<div className='flex flex-col h-full bg-gray-200 max-md:flex-row max-md:h-8 max-md:bottom-0 max-md:w-full max-md:justify-center px-2'>
				<div className='flex flex-row items-center justify-center flex-grow md:hidden'>
					{/*for mobile*/}
					<p className='text-black self-center'>Selected Deck :</p>
					<select
						className=' text-black bg-gray-200 self-center max-w-full flex-grow border-none outline-none'
						onChange={(e) => {
							setSelectedDeck(e.target.value);
							fetchCards();
						}}
						value={selectedDeck}
					>
						{(decks ? decks : []).map((deck) => (
							<option
								value={deck._id}
								key={deck.name}
							>
								{deck.name}
							</option>
						))}
					</select>
				</div>
				<div className='flex-col items-center justify-center flex-grow hidden md:flex'>
					{/*for Desktop */}
					<p className='text-black self-center pt-8'>Selected Deck :</p>
					<div className='flex flex-col items-center  text-black flex-grow'>
						{decks.map((deck) => (
							<button
								key={deck._id}
								className={`p-2 m-2 text-black bg-emerald-600 rounded-md ${
									selectedDeck === deck._id ? 'bg-opacity-40' : 'bg-opacity-10'
								} w-full`}
								onClick={() => {
									setSelectedDeck(deck._id);
								}}
							>
								{deck.name}
							</button>
						))}
					</div>
				</div>
			</div>
		</div>
	);
}
