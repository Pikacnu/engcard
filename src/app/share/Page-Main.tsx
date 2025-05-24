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
import { useTranslation } from '@/context/LanguageContext'; // Added

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
const optionCounts = 40;

export default function Home() {
	// Component name is "Home" but it's for the share page
	const { t } = useTranslation(); // Added
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
		async (wordStartWithParam?: string, countParam = 15) => {
			// Renamed params
			const startWith = wordStartWithParam || '';
			const currentCount = countParam;
			if (!deckid) return; // Guard clause if deckid is null

			const response = await fetch(
				`/api/deck/cards?id=${deckid}&count=${currentCount}&startWith=${startWith}`,
			);
			if (!response.ok) {
				setCards([]);
				return;
			}
			const deckData = (await response.json()) as DeckCardsResponse;
			setCards(deckData.cards);
		},
		[deckid],
	);

	useEffect(() => {
		if (deckid) {
			// Fetch only if deckid is present
			fetchCards(wordStartWith, count);
		}
	}, [fetchCards, wordStartWith, count, deckid]); // Added deckid to dependencies

	useEffect(() => {
		if (cards && cards.length > 0 && deckid) {
			// Ensure cards and deckid exist
			saveHistory(
				cards.map((card) => card.word),
				deckid,
				'', // Assuming empty string for collectionId in share context
			);
		}
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
		<div className='flex flex-row items-center justify-center min-h-screen py-2 bg-gray-100 dark:bg-gray-700 w-full text-black dark:text-white'>
			{
				{
					[CardType.Card]: (
						<div className=''>
							<Deck
								cards={cards}
								onFinishClick={() => {
									fetchCards(wordStartWith, count);
									// saveHistory logic is now in its own useEffect
								}}
								updateCurrentWord={setWord}
							/>
						</div>
					),
					[CardType.Questions]: (
						<div className='w-full max-w-2xl'>
							<Questions
								cards={cards}
								onFinishClick={() => {
									fetchCards(wordStartWith, count);
								}}
								updateCurrentWord={setWord}
							/>
						</div>
					),
					[CardType.List]: (
						<div className='max-md:w-[90vw] md:w-[70vw] lg:w-[60vw] xl:w-[50vw] flex items-center justify-center'>
							<List cards={cards} />
						</div>
					),
					[CardType.Word]: (
						<div className='w-full max-w-lg'>
							<QuestionWord
								cards={cards}
								onFinishClick={() => {
									fetchCards(wordStartWith, count);
								}}
								updateCurrentWord={setWord}
							/>
						</div>
					),
				}[type]
			}

			<button
				className='absolute top-4 right-4 m-4 p-2 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500'
				onClick={() => {
					if (isMarked) {
						setMarkedWord((prev) =>
							prev.filter(
								(word) => currentWord && word.word !== currentWord?.word,
							),
						);
					} else {
						if (currentWord) setMarkedWord((prev) => [...prev, currentWord!]);
					}
					setIsMarked((prev) => !prev);
				}}
				title={
					isMarked
						? t('dashboard.preview.unmarkWord')
						: t('dashboard.preview.markWord')
				}
			>
				<Image
					src={`/icons/star${isMarked ? '-fill' : ''}.svg`}
					width={24}
					height={24}
					alt={t('sharePage.altMarked')} // Translated
				></Image>
			</button>
			<div className='absolute flex flex-col left-0 h-full bg-gray-200 dark:bg-gray-800 p-2 space-y-2 max-md:flex-row max-md:h-auto max-md:w-full max-md:bottom-0 max-md:left-0 max-md:justify-around max-md:space-y-0 max-md:p-1 keyboard:hidden'>
				<button
					className={`p-2 text-black dark:text-white bg-emerald-300 dark:bg-emerald-700 rounded-md ${
						type === CardType.Card
							? 'bg-opacity-70 dark:bg-opacity-70'
							: 'bg-opacity-30 dark:bg-opacity-30 hover:bg-opacity-50 dark:hover:bg-opacity-50'
					}`}
					onClick={() => setType(CardType.Card)}
					title={t('sharePage.altCard')}
				>
					<Image
						src={`/icons/card.svg`}
						width={24}
						height={24}
						alt={t('sharePage.altCard')} // Translated
					/>
				</button>
				<button
					className={`p-2 text-black dark:text-white bg-emerald-300 dark:bg-emerald-700 rounded-md ${
						type === CardType.Questions
							? 'bg-opacity-70 dark:bg-opacity-70'
							: 'bg-opacity-30 dark:bg-opacity-30 hover:bg-opacity-50 dark:hover:bg-opacity-50'
					}`}
					onClick={() => setType(CardType.Questions)}
					title={t('sharePage.altQuestions')}
				>
					<Image
						src={`/icons/question-square.svg`}
						width={24}
						height={24}
						alt={t('sharePage.altQuestions')} // Translated
					/>
				</button>
				<button
					className={`p-2 text-black dark:text-white bg-emerald-300 dark:bg-emerald-700 rounded-md ${
						type === CardType.List
							? 'bg-opacity-70 dark:bg-opacity-70'
							: 'bg-opacity-30 dark:bg-opacity-30 hover:bg-opacity-50 dark:hover:bg-opacity-50'
					}`}
					onClick={() => setType(CardType.List)}
					title={t('sharePage.altList')}
				>
					<Image
						src={`/icons/bookmark.svg`}
						width={24}
						height={24}
						alt={t('sharePage.altList')} // Translated
					/>
				</button>
				<button
					className={`p-2 text-black dark:text-white bg-emerald-300 dark:bg-emerald-700 rounded-md ${
						type === CardType.Word
							? 'bg-opacity-70 dark:bg-opacity-70'
							: 'bg-opacity-30 dark:bg-opacity-30 hover:bg-opacity-50 dark:hover:bg-opacity-50'
					}`}
					onClick={() => {
						fetchCards(wordStartWith, count * 4); // Potentially load more for this type
						setType(CardType.Word);
					}}
					title={t('sharePage.altWordQuestions')}
				>
					<Image
						src={`/icons/collection.svg`}
						width={24}
						height={24}
						alt={t('sharePage.altWordQuestions')} // Translated
					/>
				</button>
				<button
					onClick={() => {
						fetchCards(wordStartWith, count);
						// saveHistory logic moved to useEffect
					}}
					className='p-2 text-black dark:text-white bg-sky-300 dark:bg-sky-700 bg-opacity-30 dark:bg-opacity-30 rounded-md hover:bg-opacity-50 dark:hover:bg-opacity-50 transition-all delay-100'
					title={t('sharePage.altRefresh')}
				>
					<Image
						src={`/icons/refresh.svg`}
						width={24}
						height={24}
						alt={t('sharePage.altRefresh')} // Translated
					/>
				</button>
				<button
					onClick={() => setCards(markedWord)} // This might need adjustment if markedWord is empty
					className='p-2 text-black dark:text-white bg-sky-300 dark:bg-sky-700 bg-opacity-30 dark:bg-opacity-30 rounded-md hover:bg-opacity-50 dark:hover:bg-opacity-50 transition-all delay-100'
					title={t('sharePage.altMarkedList')}
				>
					<Image
						src={`/icons/star.svg`}
						width={24}
						height={24}
						alt={t('sharePage.altMarkedList')} // Translated
					/>
				</button>
				<button
					className={`p-2 text-black dark:text-white bg-purple-300 dark:bg-purple-700 rounded-md hover:bg-opacity-50 dark:hover:bg-opacity-50 max-md:absolute right-1 max-md:bottom-[calc(4rem+0.5rem)]`} // Adjusted mobile position
					title={t('sharePage.addToCollectionButton')} // Translated title
					aria-label={t('sharePage.addToCollectionButton')} // Translated aria-label
					onClick={() => {
						if (!deckid) return;
						fetch('/api/deck/public', {
							method: 'POST',
							headers: { 'Content-Type': 'application/json' }, // Added header
							body: JSON.stringify({
								id: deckid,
							}),
						}).then(async (res) => {
							// Made async for await res.json()
							if (res.ok) {
								alert(t('sharePage.alertDeckAdded')); // Translated
								return;
							} else {
								const data = await res.json(); // await for json
								alert(`${t('sharePage.alertErrorPrefix')}${data.error}`); // Translated
							}
						});
					}}
				>
					+ {/* Consider an icon or more descriptive text */}
				</button>
				<div className='flex md:flex-col max-md:flex-row items-center text-black dark:text-white mt-auto md:mt-0'>
					{' '}
					{/* Wrapper for selects */}
					<select
						className='text-black dark:text-white bg-sky-200 dark:bg-sky-600 bg-opacity-50 dark:bg-opacity-50 rounded-md m-1 p-1 w-full md:w-auto'
						onChange={(e) => setWordStartWith(e.target.value)}
						value={wordStartWith}
						title={t('dashboard.preview.filterByLetter')} // Reusing key
					>
						<option value=''>{t('sharePage.filterAll')}</option>{' '}
						{/* Translated */}
						{alphabet.map((letter) => (
							<option
								key={letter}
								value={letter}
							>
								{letter.toUpperCase()}
							</option>
						))}
					</select>
					<select
						className='text-black dark:text-white bg-sky-200 dark:bg-sky-600 bg-opacity-50 dark:bg-opacity-50 rounded-md m-1 p-1 w-full md:w-auto'
						onChange={(e) => setCount(Number(e.target.value))}
						value={count}
						title={t('dashboard.preview.setWordCount')} // Reusing key
					>
						{Array(optionCounts + 1)
							.fill(0)
							.map((_, i) => i * 5)
							.slice(1)
							.map((c) => (
								<option
									key={c}
									value={c}
								>
									{c}
								</option>
							))}
					</select>
				</div>
			</div>
		</div>
	);
}
