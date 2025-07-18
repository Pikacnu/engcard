'use client';
import { CardProps } from '@/type';
import {
	useCallback,
	useEffect,
	useMemo,
	useState,
	useTransition,
} from 'react';
import Card from '@/components/card';
import List from '@/components/list';
import { useTranslation } from '@/context/LanguageContext';

enum Type {
	card,
	cards,
}

export default function Search() {
	const { t } = useTranslation();
	const [word, setWord] = useState<string>('');
	const [card, setCard] = useState<CardProps | null>(null);
	const [cards, setCards] = useState<CardProps[]>([]);
	const [type, setType] = useState<Type>(Type.card);
	const [isPending, startTransition] = useTransition();
	const [isScearched, setIsSearched] = useState<boolean>(false);
	const notFoundString = useMemo(
		() => `${t('dashboard.search.noResults')}`.replace('{{word}}', word || ''),
		[t, word],
	);

	const getWord = useCallback(() => {
		if (!word) {
			return;
		}
		setIsSearched(true);
		startTransition(async () => {
			const res = await fetch(`/api/word?word=${word}`);
			const json = await res.json();
			startTransition(() => {
				if (!json || json.error) {
					setCard(null);
					setCards([]);
					return;
				}
				const resultType = Array.isArray(json) ? Type.cards : Type.card;
				setType(resultType);
				if (resultType === Type.card) {
					setCard(Object.assign(json, { flipped: true }));
				} else {
					console.log(json);
					setCards(json);
				}
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
		<div className='flex flex-col items-center justify-start pt-10 h-full bg-gray-100 dark:bg-gray-700 w-full text-black dark:text-white'>
			<div className='flex flex-row mb-4'>
				<input
					className='p-2 m-2 rounded-md text-black dark:text-white bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 focus:ring-blue-500 focus:border-blue-500'
					type='text'
					placeholder={t('dashboard.search.inputPlaceholder')}
					value={word}
					onChange={(e) => setWord(e.target.value)}
				/>
				<button
					className='md:hidden p-2 m-2 rounded-md bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white'
					onClick={getWord}
					disabled={isPending}
				>
					{t('dashboard.search.searchButton')}
				</button>
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
					<span className='sr-only'>{t('common.loadingSrOnly')}</span>
					<p className='text-lg text-gray-500 dark:text-gray-400'>
						{t('common.loadingText')}
					</p>
				</div>
			)) ||
				(type === Type.card && card && <Card card={card} />) ||
				(type === Type.cards && cards && cards.length > 0 && (
					<div className='mt-4 w-full max-w-2xl'>
						<List cards={cards} />
					</div>
				))}
			{!isPending &&
				!card &&
				(!cards || cards.length === 0) &&
				word &&
				isScearched && (
					<p className='mt-4 text-gray-500 dark:text-gray-400'>
						{`${notFoundString}`}
					</p>
				)}
		</div>
	);
}
