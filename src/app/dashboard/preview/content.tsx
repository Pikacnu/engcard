'use client';
import { useState, useCallback, useEffect } from 'react';
import {
	CardProps,
	CardType,
	DeckCardsResponse,
	DeckType,
	UserSettingsCollection,
	type DeckResponse,
} from '@/type';
import Deck from '@/components/deck';
import Image from 'next/image';
import QuestionWord from '@/components/question_word';
import Questions from '@/components/questions';
import { useSearchParams } from 'next/navigation';
import List from '@/components/list';
import { saveHistory } from '@/utils/user-data';
import Joyride, {
	ACTIONS,
	CallBackProps,
	Status,
	STATUS,
	Step,
} from 'react-joyride';
import { useLocalStorage } from '@/hooks/localstorage';
import { useTranslation } from '@/context/LanguageContext'; // Added

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
const optionCounts = 40;

export default function Content() {
	const { t } = useTranslation(); // Added
	const [isGuideCard, setIsGuideCard] = useLocalStorage<boolean>(
		'guideDashboardPreview',
		false,
	);
	const [joyrideRun, setJoyrideRun] = useState(!isGuideCard);

	const steps: Array<Step> = [
		{
			target: '.display-area',
			content: t('dashboard.preview.joyride.step1DisplayArea'),
			placement: 'center',
		},
		{
			target: '.mark-button',
			content: t('dashboard.preview.joyride.step2MarkButton'),
			placement: 'auto',
		},
		{
			target: '.function-list',
			content: t('dashboard.preview.joyride.step3FunctionList'),
			placement: 'auto',
		},
		{
			target: '.card-button',
			content: t('dashboard.preview.joyride.step4CardButton'),
		},
		{
			target: '.questions-button',
			content: t('dashboard.preview.joyride.step5QuestionsButton'),
		},
		{
			target: '.list-button',
			content: t('dashboard.preview.joyride.step6ListButton'),
		},
		{
			target: '.word-button',
			content: t('dashboard.preview.joyride.step7WordButton'),
		},
		{
			target: '.deck-selector',
			content: t('dashboard.preview.joyride.step8DeckSelector'),
		},
	];

	const handleJoyrideCallback = (data: CallBackProps) => {
		const { status, action, step } = data;
		if (action === ACTIONS.UPDATE) {
			console.log('Update step:', step.target);
			const stepCardTypeMap = new Map([
				['.questions-button', CardType.Questions],
				['.list-button', CardType.List],
				['.card-button', CardType.Card],
				['.word-button', CardType.Word],
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
	const [decks, setDecks] = useState<DeckResponse[]>([]);
	const [isMarked, setIsMarked] = useState<boolean>(false);
	const [markedWord, setMarkedWord] = useState<CardProps[]>([]);
	const [currentWord, setWord] = useState<CardProps | undefined>(undefined);
	const searchParams = useSearchParams();
	const deckid = searchParams.get('id');
	const [selectedDeck, setSelectedDeck] = useState(deckid || '');
	const [userSettings, setUserSettings] =
		useState<UserSettingsCollection | null>(null);

	const fetchCards = useCallback(
		async (
			wordStartWithParam?: string,
			countParam = 15,
			deckidParam?: string,
		) => {
			const startWith = wordStartWithParam || '';
			const currentCount = countParam;
			const currentDeckId = deckidParam || selectedDeck;

			if (!currentDeckId) return;

			const response = await fetch(
				`/api/deck/cards?id=${currentDeckId}&count=${currentCount}&startWith=${startWith}`,
			);
			if (!response.ok) {
				setCards([]);
				return;
			}
			const deckData = (await response.json()) as DeckCardsResponse;
			setCards(deckData.cards);
		},
		[selectedDeck],
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
		const saved = markedWord.find(
			(word) => currentWord && word.word === currentWord?.word,
		);
		if (saved) {
			setIsMarked(true);
			return;
		}
		setIsMarked(false);
	}, [currentWord, markedWord]);

	useEffect(() => {
		(async () => {
			const response = await fetch('/api/deck');
			if (!response.ok) {
				setDecks([]);
				return;
			}
			const fetchedDecks: DeckResponse[] = await response.json();
			let publicDecks: DeckResponse[] = [];
			const publicDeckResponse = await fetch(`/api/deck/public`);
			if (!publicDeckResponse.ok) {
				return setDecks(fetchedDecks);
			}
			publicDecks = (await publicDeckResponse.json()).decks;
			const availableDecks = [...fetchedDecks, ...(publicDecks || [])].filter(
				(deck) => deck.card_length !== 0,
			);
			const initialDeckId = deckid || availableDecks[0]?._id || '';
			setSelectedDeck(initialDeckId);
			setDecks(availableDecks);
			if (initialDeckId) {
				fetchCards(wordStartWith, count, initialDeckId);
			}
		})();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [fetchCards]);

	useEffect(() => {
		if (selectedDeck) {
			fetchCards(wordStartWith, count, selectedDeck); // Pass params explicitly
		}
	}, [selectedDeck, wordStartWith, count, fetchCards]);

	return (
		<div className='flex flex-row-reverse max-md:flex-col items-center justify-center h-full w-full bg-gray-100 dark:bg-gray-700 text-black dark:text-white'>
			{
				<Joyride
					steps={steps}
					continuous
					showProgress
					showSkipButton
					run={joyrideRun}
					callback={handleJoyrideCallback}
					disableScrollParentFix
				/>
			}
			<div className='flex-grow flex items-center justify-center w-full display-area p-4'>
				{
					{
						[CardType.Card]: (
							<div className='max-md:w-[80vw] md:w-[50vw] lg:w-[40vw] xl:w-[30vw] flex items-center justify-center'>
								<Deck
									cards={cards}
									onFinishClick={() => {
										fetchCards(wordStartWith, count);
										saveHistory(
											cards.map((card) => card.word),
											selectedDeck || '',
										);
									}}
									updateCurrentWord={setWord}
									deckType={
										userSettings?.deckActionType || DeckType.AutoChangeToNext
									}
								/>
							</div>
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
								updateCurrentWord={setWord}
							/>
						),
						[CardType.List]: (
							<div className='max-md:w-[90vw] md:w-[70vw] lg:w-[60vw] xl:w-[50vw] flex items-center justify-center'>
								<List cards={cards} />
							</div>
						),
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
								updateCurrentWord={setWord}
							/>
						),
					}[type]
				}
			</div>
			<button
				className='absolute top-4 right-4 m-4 p-2 bg-gray-300 dark:bg-gray-600 text-black dark:text-white rounded-lg hover:bg-gray-400 dark:hover:bg-gray-500 mark-button z-20'
				onClick={() => {
					if (isMarked) {
						setMarkedWord((prev) =>
							prev.filter((word) => word.word !== currentWord?.word),
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
					alt={t('dashboard.preview.altMarked')}
				></Image>
			</button>
			<div className='flex flex-col h-full bg-gray-200 dark:bg-gray-800 max-md:flex-row max-md:h-auto max-md:w-full max-md:justify-center keyboard:hidden function-list p-2 md:space-y-2 max-md:space-x-1'>
				<button
					className={`p-2 text-black dark:text-white bg-emerald-300 dark:bg-emerald-700 rounded-md ${
						type === CardType.Card
							? 'bg-opacity-70 dark:bg-opacity-70'
							: 'bg-opacity-30 dark:bg-opacity-30 hover:bg-opacity-50 dark:hover:bg-opacity-50'
					} card-button`}
					onClick={() => setType(CardType.Card)}
					title={t('dashboard.preview.altCard')}
				>
					<Image
						src={`/icons/card.svg`}
						width={24}
						height={24}
						alt={t('dashboard.preview.altCard')}
					/>
				</button>
				<button
					className={`p-2 text-black dark:text-white bg-emerald-300 dark:bg-emerald-700 rounded-md ${
						type === CardType.Questions
							? 'bg-opacity-70 dark:bg-opacity-70'
							: 'bg-opacity-30 dark:bg-opacity-30 hover:bg-opacity-50 dark:hover:bg-opacity-50'
					} questions-button`}
					onClick={() => setType(CardType.Questions)}
					title={t('dashboard.preview.altQuestions')}
				>
					<Image
						src={`/icons/question-square.svg`}
						width={24}
						height={24}
						alt={t('dashboard.preview.altQuestions')}
					/>
				</button>
				<button
					className={`p-2 text-black dark:text-white bg-emerald-300 dark:bg-emerald-700 rounded-md ${
						type === CardType.List
							? 'bg-opacity-70 dark:bg-opacity-70'
							: 'bg-opacity-30 dark:bg-opacity-30 hover:bg-opacity-50 dark:hover:bg-opacity-50'
					} list-button`}
					onClick={() => setType(CardType.List)}
					title={t('dashboard.preview.altList')}
				>
					<Image
						src={`/icons/bookmark.svg`}
						width={24}
						height={24}
						alt={t('dashboard.preview.altList')}
					/>
				</button>
				<button
					className={`p-2 text-black dark:text-white bg-emerald-300 dark:bg-emerald-700 rounded-md ${
						type === CardType.Word
							? 'bg-opacity-70 dark:bg-opacity-70'
							: 'bg-opacity-30 dark:bg-opacity-30 hover:bg-opacity-50 dark:hover:bg-opacity-50'
					} word-button`}
					onClick={() => {
						setType(CardType.Word);
						fetchCards(wordStartWith, count * 4);
					}}
					title={t('dashboard.preview.altWordQuestions')}
				>
					<Image
						src={`/icons/collection.svg`}
						width={24}
						height={24}
						alt={t('dashboard.preview.altWordQuestions')}
					/>
				</button>
				<button
					onClick={() => fetchCards(wordStartWith, count)}
					className='p-2 text-black dark:text-white bg-sky-300 dark:bg-sky-700 bg-opacity-30 dark:bg-opacity-30 rounded-md hover:bg-opacity-50 dark:hover:bg-opacity-50 transition-all delay-100'
					title={t('dashboard.preview.altRefresh')}
				>
					<Image
						src={`/icons/refresh.svg`}
						width={24}
						height={24}
						alt={t('dashboard.preview.altRefresh')}
					/>
				</button>
				<button
					onClick={() => setCards(markedWord)}
					className='p-2 text-black dark:text-white bg-sky-300 dark:bg-sky-700 bg-opacity-30 dark:bg-opacity-30 rounded-md hover:bg-opacity-50 dark:hover:bg-opacity-50 transition-all delay-100 marked-list'
					title={t('dashboard.preview.altShowMarkedList')}
				>
					<Image
						src={`/icons/star.svg`}
						width={24}
						height={24}
						alt={t('dashboard.preview.altShowMarkedList')}
					/>
				</button>
				<div className='flex flex-col items-center text-black dark:text-white max-md:flex-row'>
					{' '}
					{/* Wrapper for search icon and selects */}
					<Image
						src={`/icons/search.svg`}
						width={24}
						height={24}
						alt={t('dashboard.preview.altSearchIcon')}
						className='mx-1'
					/>
					<select
						className='text-black dark:text-white bg-sky-200 dark:bg-sky-600 bg-opacity-50 dark:bg-opacity-50 rounded-md m-1 p-1'
						onChange={(e) => setWordStartWith(e.target.value)}
						value={wordStartWith}
						title={t('dashboard.preview.filterByLetter')}
					>
						<option value=''>{t('dashboard.preview.filterAll')}</option>{' '}
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
						className='text-black dark:text-white bg-sky-200 dark:bg-sky-600 bg-opacity-50 dark:bg-opacity-50 rounded-md m-1 p-1'
						onChange={(e) => setCount(Number(e.target.value))}
						value={count}
						title={t('dashboard.preview.setWordCount')}
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
			<div className='flex flex-col h-full bg-gray-200 dark:bg-gray-800 max-md:flex-row max-md:h-auto max-md:w-full max-md:justify-center px-2 keyboard:hidden deck-selector p-2 space-y-2 md:space-y-0'>
				<div className='flex flex-row items-center justify-center flex-grow md:hidden text-black dark:text-white'>
					<p className='self-center mr-2'>
						{t('dashboard.preview.selectedDeckLabel')}
					</p>{' '}
					<select
						className='text-black dark:text-white bg-gray-200 dark:bg-gray-700 self-center max-w-full flex-grow border-none outline-none p-1 rounded'
						onChange={(e) => {
							setSelectedDeck(e.target.value);
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
				<div className='flex-col items-center justify-start flex-grow hidden md:flex text-black dark:text-white'>
					<p className='self-center pt-2 pb-1'>
						{t('dashboard.preview.selectedDeckLabel')}
					</p>{' '}
					<div className='flex flex-col items-center text-black dark:text-white flex-grow w-full overflow-y-auto max-h-[calc(100%-2rem)]'>
						{' '}
						{decks.map((deck) => (
							<button
								key={deck._id}
								className={`p-2 m-1 text-black dark:text-white bg-emerald-300 dark:bg-emerald-700 rounded-md ${
									selectedDeck === deck._id
										? 'bg-opacity-70 dark:bg-opacity-70'
										: 'bg-opacity-30 dark:bg-opacity-30 hover:bg-opacity-50 dark:hover:bg-opacity-50'
								} w-full text-sm`}
								onClick={() => {
									setSelectedDeck(deck._id);
								}}
								title={deck.name}
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
