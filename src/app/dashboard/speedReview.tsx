'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/context/LanguageContext'; // Added
import Deck from '@/components/deck';
import { CardProps, DeckType, UserSettingsCollection } from '@/type';

export default function SpeedReview() {
	const { t } = useTranslation(); // Added
	const [words, setWords] = useState<CardProps[]>([]);
	const [deckActionType, setDeckActionType] = useState<DeckType>(
		DeckType.AutoChangeToNext,
	);

	useEffect(() => {
		const getData = async () => {
			let response = await fetch('/api/history/mark');
			if (!response.ok) {
				console.log('Failed to fetch words:', response.statusText);
				return;
			}
			const cardData = await response.json();
			setWords(cardData.words);

			response = await fetch('/api/settings');
			if (!response.ok) {
				console.log('Failed to fetch settings:', response.statusText);
				return;
			}
			const settings = (await response.json()) as UserSettingsCollection;
			if (!settings) {
				console.log('No settings found');
				return;
			}
			setDeckActionType(settings.deckActionType || DeckType.AutoChangeToNext);
		};
		getData();
	}, []); // Added empty dependency array to run once on mount

	return (
		<div className='flex flex-col items-center justify-center w-full h-full dark:bg-gray-700 dark:text-white'>
			<div className='flex flex-col items-center justify-center w-full h-full p-4 text-center'>
				{words.length <= 0 ? (
					<p className='text-3xl mb-4 dark:text-gray-200 text-gray-500'>
						<span>{t('dashboard.speedReview.noWords')}</span>
					</p>
				) : (
					<div className='w-full max-w-4xl [&>*]:max-w-full [&>*]:min-w-1/2 relative flex items-center'>
						<Deck
							cards={words}
							onFinishClick={() => {
								setWords((prev) => [...prev]);
							}}
							deckType={deckActionType}
						></Deck>
					</div>
				)}
			</div>
		</div>
	);
}
