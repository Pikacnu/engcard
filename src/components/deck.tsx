'use client';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Card from './card';
import { CardProps, DeckType } from '@/type';
import { CardWhenEmpty } from '@/utils/blank_value'; // This might be refactored if List component handles its empty state
import { useTranslation } from '@/context/LanguageContext'; // Added

export default function Deck({
	cards,
	onFinishClick,
	updateCurrentWord,
	deckType = DeckType.ChangeByButton,
}: {
	cards: CardProps[];
	onFinishClick?: () => void;
	updateCurrentWord?: Dispatch<SetStateAction<CardProps | undefined>>;
	deckType?: DeckType;
}) {
	const { t } = useTranslation(); // Added
	const [index, setIndex] = useState(0);

	useEffect(() => {
		setIndex(0);
		if (cards && cards.length > 0) {
			// Ensure cards exist before accessing
			updateCurrentWord?.(cards[0]);
		} else {
			updateCurrentWord?.(undefined); // Or CardWhenEmpty if that's the desired behavior
		}
	}, [cards, updateCurrentWord]);

	return (
		<div className='flex flex-col h-full max-md:w-[80vw] md:w-[60%] md:min-w-96 pb-16 flex-grow'>
			<div
				className='flex flex-grow w-full md:h-[80vh] h-[60vh] pb-8 cursor-pointer' // Added cursor-pointer for clarity
				onClick={() => {
					if (deckType === DeckType.AutoChangeToNext) {
						// Ensure cards array is not empty before proceeding
						if (!cards || cards.length === 0) return;

						// Calculate the next potential index.
						// The logic of index + 0.5 seems intended for flipping halfway through the last card.
						// This might need to be re-evaluated for clarity, but preserving current logic.
						const nextIndexCandidate = index + 0.5;

						if (nextIndexCandidate < cards.length) {
							updateCurrentWord?.(cards[Math.floor(nextIndexCandidate)]);
							setIndex(nextIndexCandidate);
						} else if (nextIndexCandidate === cards.length) {
							// If it's exactly at the end
							updateCurrentWord?.(cards[cards.length - 1]); // ensure current word is the last one
							setIndex(nextIndexCandidate); // allow to reach the point of onFinishClick
						}

						// The original logic for onFinishClick:
						// if (index === cards.length - 0.5) return onFinishClick?.();
						// This means after showing the last card and attempting one more "half-click"
						if (index >= cards.length - 0.5 && index < cards.length) {
							// Adjusted condition
							if (onFinishClick) onFinishClick();
						}
					}
				}}
			>
				{cards && cards.length > 0 && cards[Math.floor(index)] ? ( // Check if cards exist and index is valid
					<Card card={cards[Math.floor(index)]} />
				) : (
					<Card card={CardWhenEmpty} /> // Fallback if no cards or index out of bounds
				)}
			</div>
			{cards &&
				cards.length > 0 && ( // Only show progress bar if there are cards
					<div className='w-full rounded-full h-2.5 bg-gray-300 dark:bg-gray-700 select-none'>
						<div
							className='bg-blue-600 dark:bg-blue-500 rounded-full h-2.5 transition-all duration-100 text-xs font-medium text-blue-100 text-end p-0.5 leading-none'
							style={{
								width: `${Math.min(100, ((index + 1) / cards.length) * 100)}%`,
							}}
						>
							{/* Text can be added here if needed, but it's very small */}
						</div>
					</div>
				)}
			{deckType === DeckType.ChangeByButton &&
				cards &&
				cards.length > 0 && ( // Only show buttons if there are cards
					<div className='flex flex-row items-center justify-between w-full mt-4'>
						<button
							className='bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white p-2 rounded-lg shadow transition-colors'
							onClick={() => {
								if (index > 0) {
									const newIndex = index - 1;
									setIndex(newIndex);
									updateCurrentWord?.(cards[Math.floor(newIndex)]);
								}
							}}
							disabled={index === 0}
						>
							{t('components.deck.previousButton')}
						</button>
						<div className='text-sm text-gray-600 dark:text-gray-400'>
							{Math.floor(index) + 1} / {cards.length}
						</div>
						<button
							className='bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white p-2 rounded-lg shadow transition-colors'
							onClick={() => {
								if (index < cards.length - 1) {
									const newIndex = index + 1;
									setIndex(newIndex);
									updateCurrentWord?.(cards[Math.floor(newIndex)]);
								} else {
									if (onFinishClick) onFinishClick();
								}
							}}
						>
							{t('components.deck.nextButton')}
						</button>
					</div>
				)}
		</div>
	);
}
