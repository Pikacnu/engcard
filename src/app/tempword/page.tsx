'use client';

import Joyride, {
	ACTIONS,
	CallBackProps,
	Status,
	STATUS,
	Step,
} from 'react-joyride';
import { CardProps, DeckType, UserSettingsCollection, CardType } from '@/type';
import Questions from '@/components/questions';
import { useCallback, useEffect, useState } from 'react';
import Deck from '@/components/deck';
import Image from 'next/image';
import List from '../../components/list';
import QuestionWord from '@/components/question_word';
import { useLocalStorage } from '@/hooks/localstorage';
import { useTranslation } from '@/context/LanguageContext'; // Added

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
const optionCounts = 40;

export default function TempWordPage() {
	// Renamed component for clarity
	const { t } = useTranslation(); // Added
	const [isGuideCard, setIsGuideCard] = useLocalStorage<boolean>(
		'guideCard', // Consider renaming this localStorage key if it conflicts with dashboard's preview guide
		false,
	);
	const [joyrideRun, setJoyrideRun] = useState(!isGuideCard);

	const steps: Array<Step> = [
		{
			target: '.display',
			content: t('tempword.joyride.step1Display'), // Using new tempword keys for clarity
			placement: 'center',
		},
		{
			target: '.mark-button',
			content: t('tempword.joyride.step2MarkButton'),
		},
		{
			target: '.function-list',
			content: t('tempword.joyride.step3FunctionList'),
			placement: 'auto',
		},
		{
			target: '.deck', // Assuming class name for Card button is 'deck'
			content: t('tempword.joyride.step4DeckArea'),
		},
		{
			target: '.questions', // Assuming class name for Questions button is 'questions'
			content: t('tempword.joyride.step5QuestionsArea'),
		},
		{
			target: '.list', // Assuming class name for List button is 'list'
			content: t('tempword.joyride.step6ListArea'),
		},
		{
			target: '.word', // Assuming class name for Word button is 'word'
			content: t('tempword.joyride.step7WordArea'),
		},
		{
			target: '.marked', // Assuming class name for Marked List button is 'marked'
			content: t('tempword.joyride.step8MarkedArea'),
		},
	];

	const handleJoyrideCallback = (data: CallBackProps) => {
		const { status, action, step } = data;
		if (action === ACTIONS.UPDATE) {
			console.log('Update step:', step.target);
			const stepCardTypeMap = new Map([
				['.questions', CardType.Questions],
				['.list', CardType.List],
				['.deck', CardType.Card],
				['.word', CardType.Word],
			]);
			const cardType = stepCardTypeMap.get(step.target as string);
			if (cardType !== undefined) {
				console.log('Card type:', cardType);
				setType(cardType);
			}
		}
		if (([STATUS.FINISHED, STATUS.SKIPPED] as Array<Status>).includes(status)) {
			setJoyrideRun(false);
			setIsGuideCard(true);
		}
	};

	const [type, setType] = useState<CardType>(CardType.Card);
	const [cards, setCards] = useState<CardProps[]>([]);
	const [wordStartWith, setWordStartWith] = useState<string>('');
	const [count, setCount] = useState<number>(15);
	const [isMarked, setIsMarked] = useState<boolean>(false);
	const [markedWord, setMarkedWord] = useState<CardProps[]>([]);
	const [currentWord, setWord] = useState<CardProps | undefined>(undefined);
	const [userSettings, setUserSettings] =
		useState<UserSettingsCollection | null>(null);

	const fetchCards = useCallback(
		(wordStartWithParam?: string, countParam = 15) => {
			// Renamed
			const startWith = wordStartWithParam || ''; // Use local param
			const currentCount = countParam; // Use local param
			console.log(startWith);
			fetch(
				`/api/cards?count=${currentCount}&deck_id=13${
					// Assuming deck_id=13 is intentional for tempword
					startWith.trim().length !== 0
						? `&range=${startWith}-${startWith}`
						: ''
				}`,
			)
				.then((res) => res.json())
				.then((data) => {
					setCards(data);
				});
		},
		[],
	);

	useEffect(() => {
		(async () => {
			const response = await fetch('/api/settings');
			if (response.ok) {
				const data = await response.json();
				setUserSettings(data);
			} else {
				console.error('Failed to fetch settings:', await response.json());
			}
		})();
	}, []);

	useEffect(() => {
		fetchCards(wordStartWith, count);
	}, [wordStartWith, fetchCards, count, type]); // type was in dependencies, kept it

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
		<div className='flex flex-row items-center justify-center min-h-screen py-2 bg-gray-100 dark:bg-gray-700 text-black dark:text-white'>
			<Joyride
				steps={steps}
				continuous
				showProgress
				showSkipButton
				run={joyrideRun}
				callback={handleJoyrideCallback}
			/>
			<div className='display flex-grow flex items-center justify-center p-4 w-full'>
				{
					{
						[CardType.Card]: (
							<div className='max-md:w-[80vw] md:w-[60%] md:min-w-96 flex items-center justify-center'>
								<Deck
									cards={cards}
									onFinishClick={() => fetchCards(wordStartWith, count)}
									updateCurrentWord={setWord}
									deckType={
										userSettings?.deckActionType || DeckType.AutoChangeToNext
									}
								/>
							</div>
						),
						[CardType.Questions]: (
							<div className='w-full max-w-2xl'>
								<Questions
									cards={cards}
									onFinishClick={() => fetchCards(wordStartWith, count)}
									updateCurrentWord={setWord}
								/>
							</div>
						),
						[CardType.List]: (
							<div className='max-md:w-[90vw] md:w-[70vw] lg:w-[60vw] xl:w-[50vw] flex items-center justify-center'>
								<List cards={cards} />{' '}
								{/* List has its own dark mode styling */}
							</div>
						),
						[CardType.Word]: (
							<QuestionWord
								cards={cards}
								onFinishClick={() => fetchCards(wordStartWith, count)}
								updateCurrentWord={setWord}
							/>
						),
					}[type]
				}
			</div>

			<button
				className='absolute top-4 right-4 m-4 p-2 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 mark-button'
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
				} // Reusing key
			>
				<Image
					src={`/icons/star${isMarked ? '-fill' : ''}.svg`}
					width={24}
					height={24}
					alt={t('tempword.altMarked')} // Translated
				></Image>
			</button>
			<div className='absolute flex flex-col left-0 h-full bg-gray-200 dark:bg-gray-800 p-2 space-y-2 max-md:flex-row max-md:h-auto max-md:w-full max-md:bottom-0 max-md:left-0 max-md:justify-around max-md:space-y-0 max-md:p-1 keyboard:hidden function-list'>
				<button
					className={`p-2 text-black dark:text-white bg-emerald-300 dark:bg-emerald-700 rounded-md ${
						type === CardType.Card
							? 'bg-opacity-70 dark:bg-opacity-70'
							: 'bg-opacity-30 dark:bg-opacity-30 hover:bg-opacity-50 dark:hover:bg-opacity-50'
					} deck`}
					onClick={() => setType(CardType.Card)}
					title={t('tempword.altCard')}
				>
					<Image
						src={`/icons/card.svg`}
						width={24}
						height={24}
						alt={t('tempword.altCard')} // Translated
					/>
				</button>
				<button
					className={`p-2 text-black dark:text-white bg-emerald-300 dark:bg-emerald-700 rounded-md ${
						type === CardType.Questions
							? 'bg-opacity-70 dark:bg-opacity-70'
							: 'bg-opacity-30 dark:bg-opacity-30 hover:bg-opacity-50 dark:hover:bg-opacity-50'
					} questions`}
					onClick={() => setType(CardType.Questions)}
					title={t('tempword.altQuestions')}
				>
					<Image
						src={`/icons/question-square.svg`}
						width={24}
						height={24}
						alt={t('tempword.altQuestions')} // Translated
					/>
				</button>
				<button
					className={`p-2 text-black dark:text-white bg-emerald-300 dark:bg-emerald-700 rounded-md ${
						type === CardType.List
							? 'bg-opacity-70 dark:bg-opacity-70'
							: 'bg-opacity-30 dark:bg-opacity-30 hover:bg-opacity-50 dark:hover:bg-opacity-50'
					} list`}
					onClick={() => setType(CardType.List)}
					title={t('tempword.altList')}
				>
					<Image
						src={`/icons/bookmark.svg`}
						width={24}
						height={24}
						alt={t('tempword.altList')} // Translated
					/>
				</button>
				<button
					className={`p-2 text-black dark:text-white bg-emerald-300 dark:bg-emerald-700 rounded-md ${
						type === CardType.Word
							? 'bg-opacity-70 dark:bg-opacity-70'
							: 'bg-opacity-30 dark:bg-opacity-30 hover:bg-opacity-50 dark:hover:bg-opacity-50'
					} word`}
					onClick={() => {
						fetchCards(wordStartWith, count * 4);
						setType(CardType.Word);
					}}
					title={t('tempword.altWordQuestions')}
				>
					<Image
						src={`/icons/collection.svg`}
						width={24}
						height={24}
						alt={t('tempword.altWordQuestions')} // Translated
					/>
				</button>
				<button
					onClick={() => fetchCards(wordStartWith, count)}
					className='p-2 text-black dark:text-white bg-sky-300 dark:bg-sky-700 bg-opacity-30 dark:bg-opacity-30 rounded-md hover:bg-opacity-50 dark:hover:bg-opacity-50 transition-all delay-100'
					title={t('tempword.altRefresh')}
				>
					<Image
						src={`/icons/refresh.svg`}
						width={24}
						height={24}
						alt={t('tempword.altRefresh')} // Translated
					/>
				</button>
				<button
					onClick={() => setCards(markedWord)} // This might need adjustment if markedWord is empty
					className='p-2 text-black dark:text-white bg-sky-300 dark:bg-sky-700 bg-opacity-30 dark:bg-opacity-30 rounded-md hover:bg-opacity-50 dark:hover:bg-opacity-50 transition-all delay-100 marked z-20'
					title={t('tempword.altShowMarkedList')}
				>
					<Image
						src={`/icons/star.svg`}
						width={24}
						height={24}
						alt={t('tempword.altShowMarkedList')}
					/>
				</button>
				<div className='flex flex-col max-md:flex-row items-center text-black dark:text-white mt-auto md:mt-0'>
					<Image
						src={`/icons/search.svg`}
						width={24}
						height={24}
						alt={t('tempword.altSearchIcon')} // Translated
						className='mx-1 hidden md:block' // Hidden on mobile where layout is tight
					/>
					<select
						className='text-black dark:text-white bg-sky-200 dark:bg-sky-600 bg-opacity-50 dark:bg-opacity-50 rounded-md m-1 p-1 w-full md:w-auto'
						onChange={(e) => setWordStartWith(e.target.value)}
						value={wordStartWith}
						title={t('dashboard.preview.filterByLetter')} // Reusing key
					>
						<option value=''>{t('tempword.filterAll')}</option>{' '}
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
