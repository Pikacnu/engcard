'use client';
import { CardProps } from '@/type';
import { useCallback, useEffect, useState, useTransition } from 'react';
import Card from '@/components/card';
import { addCardFromDB } from '@/actions/deck';
import { useTranslation } from '@/context/LanguageContext'; // Added

type PageProps = {
	deckid?: string;
	onAdd?: () => void;
};

export default function Search({ deckid, onAdd }: PageProps) {
	const { t } = useTranslation(); // Added
	const [word, setWord] = useState<string>('');
	const [card, setCard] = useState<CardProps | null>(null);
	const [isPending, startTransition] = useTransition();

	const getWord = useCallback(() => {
		if (!word) {
			return;
		}
		startTransition(async () => {
			// 'use client'; // Already a client component
			const res = await fetch(`/api/word?word=${word}`);
			console.log(res);
			const json = await res.json();
			startTransition(() => {
				if (!json || json.error) {
					setCard(null);
					return;
				}
				setCard(Object.assign(json, { flipped: true }));
			});
		});
	}, [word]);

	useEffect(() => {
		if (!document) {
			return;
		}
		function handleKeyDown(e: KeyboardEvent) {
			if (e.key !== 'Enter') return;
			getWord();
		}
		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [word, getWord]);

	return (
		<div className='flex flex-col items-center justify-start pt-5 h-full bg-white dark:bg-gray-800 w-full text-black dark:text-white rounded-lg shadow max-md:pb-32'>
			<div className='flex flex-row max-md:text-md mb-4 sticky top-0 z-20 bg-white dark:bg-gray-800 w-full justify-center'>
				<input
					className='p-2 m-2 rounded-md text-black dark:text-white bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
					type='text'
					value={word}
					placeholder={t('dashboard.deckEdit.search.inputPlaceholder')} // Translated
					onChange={(e) => setWord(e.target.value)}
				/>
				<button
					className='md:hidden p-2 m-2 rounded-md bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white'
					onClick={getWord}
					disabled={isPending}
				>
					{t('dashboard.deckEdit.search.searchButton')} {/* Translated */}
				</button>
				{deckid && (
					<button
						className='p-2 m-2 rounded-md bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white'
						onClick={async () => {
							if (!word || !card) return; // Ensure word and card exist before adding
							await addCardFromDB.bind(null, deckid, word)();
							if (onAdd) {
								onAdd();
							}
						}}
						disabled={isPending || !card} // Disable if no card to add
					>
						{t('dashboard.deckEdit.search.addButton')} {/* Translated */}
					</button>
				)}
			</div>
			{(isPending && (
				<div className='flex flex-col items-center justify-center h-auto'>
					<svg
						aria-hidden='true'
						className='w-16 h-16 animate-spin text-gray-500 dark:text-gray-400 fill-blue-600'
						viewBox='0 0 100 101'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
							fill='currentColor'
						/>
						<path
							d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
							fill='currentFill'
						/>
					</svg>
					<span className='sr-only'>{t('common.loadingSrOnly')}</span>{' '}
					{/* Translated */}
					<p className='text-lg text-gray-500 dark:text-gray-400'>
						{t('common.loadingText')}
					</p>
				</div>
			)) ||
				(card && (
					<div className='flex flex-col items-center justify-center h-auto min-w-1/5 max-w-4/5 w-4/5 max-md:min-w-[90vw] mt-4 overflow-y-auto'>
						<Card card={card} />
					</div>
				))}
		</div>
	);
}
