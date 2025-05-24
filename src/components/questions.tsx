'use client';

import { CardProps, PartOfSpeech } from '@/type'; // Added PartOfSpeech
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Spell from './spell';
// Removed direct import of CardWhenEmpty, will define it using t()
import { useTranslation } from '@/context/LanguageContext'; // Added

export default function Questions({
	cards,
	onFinishClick,
	updateCurrentWord,
}: {
	cards: CardProps[];
	onFinishClick?: () => void;
	updateCurrentWord?: Dispatch<SetStateAction<CardProps | undefined>>;
}) {
	const { t } = useTranslation(); // Added

	// Define CardWhenEmpty using translations
	const CardWhenEmpty: CardProps = {
		word: t('components.list.empty.word'), // Reusing keys from list.tsx
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
	};

	const [index, setIndex] = useState(0);
	const [cardData, setCard] = useState<CardProps[]>(
		cards && cards.length > 0 ? cards : [CardWhenEmpty], // Ensure cards is not undefined
	);

	useEffect(() => {
		if (!cards || cards.length === 0) {
			setCard([CardWhenEmpty]);
			updateCurrentWord?.(undefined); // Or CardWhenEmpty if needed for initial state
			setIndex(0); // Reset index
			return;
		}
		setCard(cards);
		updateCurrentWord?.(cards[index] || cards[0]); // Ensure index is valid
		// setIndex(0); // Reset index when cards change, handled by initial state of cardData
	}, [index, cards, updateCurrentWord, CardWhenEmpty]); // Added CardWhenEmpty as it's now defined with t()

	return (
		<div className='flex flex-col h-full max-md:w-[90vw] w-[70vw] md:w-[60vw] lg:w-[50vw] min-w-[20vw] justify-center relative p-4 dark:bg-gray-700 rounded-lg shadow-md'>
			<Spell
				card={(cardData && cardData.length > 0 && cardData[index]) ? cardData[index] : CardWhenEmpty} // Ensure cardData[index] exists
				className='pb-8 h-[60vh] md:h-[70vh] relative' // Adjusted height slightly
				onAnsweredClick={() => {
					setIndex((prev) => {
						if (prev === cardData.length - 1) {
                            if (onFinishClick) onFinishClick(); // Call onFinishClick if it's the last card
                            return 0; // Loop back to start or handle end of deck
                        }
						return prev + 1;
					});
					// updateCurrentWord is handled by useEffect based on index change
				}}
			/>

			{cardData && cardData.length > 0 && cardData[0].word !== t('components.list.empty.word') && ( // Only show skip if not empty card
                <button
                    className='bg-gray-400 hover:bg-gray-500 dark:bg-gray-600 dark:hover:bg-gray-500 text-white p-2 rounded-lg absolute bottom-4 right-4 m-4 text-sm'
                    onClick={() => {
                        setIndex((prev) => {
                            if (prev === cardData.length - 1) {
                                if (onFinishClick) onFinishClick();
                                return 0; // Loop to start
                            }
                            return prev + 1;
                        });
                        // updateCurrentWord handled by useEffect
                    }}
                >
                    {t('components.questions.skipButton')} {/* Translated */}
                </button>
            )}

			{cardData && cardData.length > 0 && cardData[0].word !== t('components.list.empty.word') && ( // Only show progress if not empty card
                <div className='w-full rounded-full h-2.5 bg-gray-300 dark:bg-gray-600 select-none mt-4'>
                    <div
                        className='bg-blue-600 dark:bg-blue-500 rounded-full h-2.5 transition-all duration-100'
                        style={{
                            width: `${Math.min(100, ((index + 1) / cardData.length) * 100)}%`, // Use cardData.length
                        }}
                    >
                        {/* Optional: Text inside progress bar, though it's very small */}
                    </div>
                </div>
            )}
		</div>
	);
}
