'use client';

import { useEffect, useState } from 'react';
import { useTranslation } from '@/context/LanguageContext'; // Added

export default function SpeedReview() {
	const { t } = useTranslation(); // Added
	const [words, setWords] = useState<string[]>([]);
	const [index, setIndex] = useState(0);

	useEffect(() => {
		const fetchWords = async () => {
			const response = await fetch('/api/history/mark');
			if (!response.ok) {
				console.log('Failed to fetch words:', response.statusText);
				return;
			}
			const data = await response.json();
			setWords(data.words);
		};
		fetchWords();
	}, []); // Added empty dependency array to run once on mount

	return (
		<div className='flex flex-col items-center justify-center w-full h-full dark:bg-gray-700 dark:text-white'>
			<div className='flex flex-col items-center justify-center w-full h-full p-4 text-center'>
				<p className="text-3xl mb-4">
					<span>
						{words.length > 0 ? words[index] : t('dashboard.speedReview.noWords')} {/* Translated */}
					</span>
				</p>
				{words.length > 0 && (
					<button
						className='text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 cursor-pointer py-2 px-4 border border-blue-500 dark:border-blue-400 rounded-lg shadow hover:shadow-md transition-all'
						onClick={() => {
							if (index < words.length - 1) {
								setIndex(index + 1);
							} else {
								setIndex(0); // Reset to the first word
							}
						}}
					>
						<span>{t('dashboard.speedReview.nextWordButton')}</span> {/* Translated */}
					</button>
				)}
			</div>
		</div>
	);
}
