'use client';

import { CardProps, PartOfSpeech, PartOfSpeechShort } from '@/type';
import { useState, useEffect, useMemo, Dispatch, SetStateAction } from 'react';
import Card from '@/components/card';
// Removed direct import of CardWhenEmpty
import { shuffle } from '@/utils/functions';
import { useTranslation } from '@/context/LanguageContext'; // Added

type WithAnswer<T> = T & { answer: boolean };

export default function QuestionWord({
	cards,
	onFinishClick,
	updateCurrentWord,
}: {
	cards: CardProps[];
	onFinishClick?: () => void;
	children?: React.ReactNode;
	updateCurrentWord?: Dispatch<SetStateAction<CardProps | undefined>>;
}) {
	const { t } = useTranslation(); // Added

	// Define CardWhenEmpty using translations
	const CardWhenEmpty: CardProps = useMemo(
		() => ({
			word: t('components.list.empty.word'),
			phonetic: t('components.list.empty.phonetic'),
			blocks: [
				{
					partOfSpeech: PartOfSpeech.Error,
					definitions: [
						{
							definition: [
								{
									lang: 'en',
									content: t('components.list.empty.errorContent'),
								},
							],
							example: [],
							synonyms: [],
							antonyms: [],
						},
					],
				},
			],
			flipped: true,
		}),
		[t],
	);

	const [index, setIndex] = useState(0);
	const [cardData, setCard] = useState<CardProps[]>(
		cards && cards.length > 0 ? cards : [CardWhenEmpty],
	);
	const [isCorrect, setIsCorrect] = useState(false);

	const currentCards: WithAnswer<CardProps>[] = useMemo(() => {
		if (
			!cardData ||
			cardData.length === 0 ||
			cardData[0].word === CardWhenEmpty.word
		) {
			// Check against translated empty word
			return [
				{ ...CardWhenEmpty, answer: false }, // Ensure all have answer prop
				{ ...CardWhenEmpty, answer: false },
				{ ...CardWhenEmpty, answer: false },
				{ ...CardWhenEmpty, answer: false },
			];
		}
		if (index >= cardData.length) {
			// This case should ideally not be reached if index is reset correctly
			return [
				{ ...CardWhenEmpty, answer: false },
				{ ...CardWhenEmpty, answer: false },
				{ ...CardWhenEmpty, answer: false },
				{ ...CardWhenEmpty, answer: false },
			];
		}
		const answer = cardData[index];
		const questionOptions = shuffle(cardData.filter((_, i) => i !== index))
			.slice(0, 3)
			.map((c) => ({
				...c,
				answer: false,
			}));
		return shuffle([{ ...answer, answer: true }, ...questionOptions]);
	}, [cardData, index, CardWhenEmpty]); // Added CardWhenEmpty dependency

	useEffect(() => {
		if (!cards || cards.length === 0) {
			setCard([CardWhenEmpty]);
			updateCurrentWord?.(undefined);
			setIndex(0);
			return;
		}
		setCard(cards);
		// updateCurrentWord?.(cards[index] || cards[0]); // Initial updateCurrentWord
		// Let's ensure index is reset if cards change fundamentally
		setIndex(0); // Reset index when new cards are provided
	}, [cards, updateCurrentWord, CardWhenEmpty]); // Added CardWhenEmpty dependency

	useEffect(() => {
		// This effect updates the current word when the index changes or when cards initially load
		if (cardData && cardData.length > 0 && index < cardData.length) {
			updateCurrentWord?.(cardData[index]);
		} else if (cardData && cardData.length > 0) {
			// Handle case where index might be out of bounds temporarily
			updateCurrentWord?.(cardData[0]);
		} else {
			updateCurrentWord?.(undefined);
		}
	}, [index, cardData, updateCurrentWord]);

	return (
		<div className='flex flex-col items-center justify-center w-full md:max-w-[60vw] h-full md:m-4 dark:bg-gray-700 rounded-lg shadow'>
			<div className='max-w-full w-full max-h-[80vh] pb-8 p-4'>
				{!isCorrect ? (
					<div className='flex flex-col '>
						<div className='text-xl m-4 md:m-8 p-4 bg-gray-100 dark:bg-black dark:bg-opacity-45 rounded-lg flex flex-row flex-wrap items-center *:rounded-lg *:m-1 *:p-2 text-black dark:text-white'>
							<h1 className='font-semibold'>
								{t('components.questionWord.questionLabel')}
							</h1>{' '}
							{/* Translated */}
							<h1 className='bg-blue-200 dark:bg-blue-600 bg-opacity-80 dark:bg-opacity-40'>
								{cardData[index]?.word || CardWhenEmpty.word}
							</h1>
							<h1 className='bg-green-200 dark:bg-green-400 bg-opacity-40 dark:bg-opacity-20 border-2 border-green-300 dark:border-green-500'>
								{
									PartOfSpeechShort[
										cardData[index]?.blocks[0]?.partOfSpeech ||
											PartOfSpeech.Error
									]
								}
							</h1>
						</div>
						<div className='flex flex-col items-center *:w-full space-y-2'>
							{currentCards &&
								currentCards.map(
									(
										c,
										i, // Changed card to c
									) => (
										<button
											key={i}
											className={`p-3 md:max-w-[30vw] max-md:max-w-[70vw] m-1 rounded-lg border-2 border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700 text-black dark:text-white transition-colors`}
											onClick={(e) => {
												if (c.answer) {
													setIsCorrect(true);
												} else {
													e.currentTarget.classList.remove(
														'dark:bg-gray-800',
														'bg-white',
														'dark:hover:bg-gray-700',
														'hover:bg-gray-100',
													);
													e.currentTarget.classList.add(
														'bg-red-500',
														'dark:bg-red-600',
														'text-white',
													);
												}
											}}
										>
											{c.blocks[0]?.definitions[0]?.definition[0]?.content ||
												CardWhenEmpty.blocks[0].definitions[0].definition[0]
													.content}
										</button>
									),
								)}
						</div>
					</div>
				) : (
					<div
						className='w-full min-w-[60vw] max-h-[70vh] md:max-h-[60vh] h-[70vh] relative cursor-pointer' // Added cursor-pointer
						onClick={() => {
							if (index === cardData.length - 1) {
								setIsCorrect(false);
								setIndex(0);
								if (onFinishClick) onFinishClick();
								return;
							}
							setIndex(index + 1);
							setIsCorrect(false);
							// updateCurrentWord is handled by useEffect
						}}
					>
						<Card
							card={Object.assign(cardData[index] || CardWhenEmpty, {
								flipped: true,
							})}
						/>
					</div>
				)}
			</div>
			{cardData &&
				cardData.length > 0 &&
				cardData[0].word !== CardWhenEmpty.word && ( // Only show progress if not empty card
					<div className='w-[90%] rounded-full h-2.5 bg-gray-300 dark:bg-gray-600 select-none mt-2 mb-4'>
						<div
							className='bg-blue-600 dark:bg-blue-500 rounded-full h-2.5 transition-all duration-100'
							style={{
								width: `${Math.min(
									100,
									((index + 1) / cardData.length) * 100,
								)}%`, // Use cardData.length
							}}
						></div>
					</div>
				)}
		</div>
	);
}
