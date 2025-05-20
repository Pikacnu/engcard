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

const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');
const optionCounts = 40;

export default function Home() {
	const [isGuideCard, setIsGuideCard] = useLocalStorage<boolean>(
		'guideCard',
		false,
	);
	const [joyrideRun, setJoyrideRun] = useState(!isGuideCard);
	const steps: Array<Step> = [
		{
			target: '.display',
			content: '這裡是顯示區域，所有功能都將顯示在這',
			placement: 'center',
		},
		{
			target: '.mark-button',
			content: '這裡是標記按鈕，點擊可將單字加入標記列表',
		},
		{
			target: '.function-list',
			content: '這裡是功能列表，可以在此處切換不同的預覽與限制單字的數量',
			placement: 'auto',
		},
		{
			target: '.deck',
			content: '這裡是牌組區域，將以翻頁單字卡的行事呈現',
		},
		{
			target: '.questions',
			content: '這裡是問題區塊，用以練習單字拼寫',
		},
		{
			target: '.list',
			content: '這裡是列表區塊，可以查看當前的所有單字',
		},
		{
			target: '.word',
			content: '這裡是單字問題區塊，方便你記憶意思',
		},
		{
			target: '.marked',
			content: '這裡是標記區塊，可以在此處將單字更換成標記的單字',
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

	const fetchCards = useCallback((wordStartWith?: string, count = 15) => {
		wordStartWith = wordStartWith || '';
		console.log(wordStartWith);
		fetch(
			`/api/cards?count=${count}&deck_id=13${
				wordStartWith.trim().length !== 0
					? `&range=${wordStartWith}-${wordStartWith}`
					: ''
			}`,
		)
			.then((res) => res.json())
			.then((data) => {
				setCards(data);
			});
	}, []);

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
	}, [wordStartWith, fetchCards, count, type]);

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
		<div className='flex flex-row items-center justify-center py-2 bg-gray-700'>
			<Joyride
				steps={steps}
				continuous
				showProgress
				showSkipButton
				run={joyrideRun}
				callback={handleJoyrideCallback}
			/>
			<div className='display'>
				{
					{
						[CardType.Card]: (
							<Deck
								cards={cards}
								onFinishClick={() => fetchCards(wordStartWith, count)}
								updateCurrentWord={setWord}
								deckType={
									userSettings?.deckActionType || DeckType.AutoChangeToNext
								}
							/>
						),
						[CardType.Questions]: (
							<div>
								<Questions
									cards={cards}
									onFinishClick={() => fetchCards(wordStartWith, count)}
									updateCurrentWord={setWord}
								/>
							</div>
						),
						[CardType.List]: (
							<div className='max-md:w-[80vw] md:max-[50vw] flex items-center justify-center list'>
								<List cards={cards} />
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
				className='absolute top-0 right-0 m-4 p-2 bg-gray-500 text-white rounded-lg mark-button'
				onClick={() => {
					if (isMarked) {
						setMarkedWord((prev) =>
							prev.filter((word) => word.word !== currentWord?.word),
						);
					} else {
						setMarkedWord((prev) => [...prev, currentWord!]);
					}
					setIsMarked((prev) => !prev);
				}}
			>
				<Image
					src={`/icons/star${isMarked ? '-fill' : ''}.svg`}
					width={24}
					height={24}
					alt='Marked'
				></Image>
			</button>
			<div className='absolute flex flex-col left-0 h-full bg-gray-50 max-md:flex-row max-md:h-16 max-md:bottom-0 max-md:w-full max-md:justify-center keyboard:hidden function-list'>
				<button
					className={`p-2 m-2 text-black bg-emerald-600 rounded-md ${
						type === CardType.Card ? 'bg-opacity-40' : 'bg-opacity-10'
					} deck`}
					onClick={() => setType(CardType.Card)}
				>
					<Image
						src={`/icons/card.svg`}
						width={24}
						height={24}
						alt='Card'
					/>
				</button>
				<button
					className={`p-2 m-2 text-black bg-emerald-600 rounded-md ${
						type === CardType.Questions ? 'bg-opacity-40' : 'bg-opacity-10'
					} questions`}
					onClick={() => setType(CardType.Questions)}
				>
					<Image
						src={`/icons/question-square.svg`}
						width={24}
						height={24}
						alt='Questions'
					/>
				</button>
				<button
					className={`p-2 m-2 text-black bg-emerald-600 rounded-md ${
						type === CardType.List ? 'bg-opacity-40' : 'bg-opacity-10'
					} list`}
					onClick={() => setType(CardType.List)}
				>
					<Image
						src={`/icons/bookmark.svg`}
						width={24}
						height={24}
						alt='List'
					/>
				</button>
				<button
					className={`p-2 m-2 text-black bg-emerald-600 rounded-md ${
						type === CardType.Word ? 'bg-opacity-40' : 'bg-opacity-10'
					} word`}
					onClick={() => {
						fetchCards(wordStartWith, count * 4);
						setType(CardType.Word);
					}}
				>
					<Image
						src={`/icons/collection.svg`}
						width={24}
						height={24}
						alt='Word Questions'
					/>
				</button>
				<button
					onClick={() => fetchCards(wordStartWith, count)}
					className='p-2 m-2 text-black bg-sky-600 bg-opacity-10 rounded-md hover:bg-opacity-80 transition-all delay-100'
				>
					<Image
						src={`/icons/refresh.svg`}
						width={24}
						height={24}
						alt='Refresh'
					/>
				</button>
				<button
					onClick={() => setCards(markedWord)}
					className='p-2 m-2 text-black bg-sky-600 bg-opacity-10 rounded-md hover:bg-opacity-80 transition-all delay-100 marked'
				>
					<Image
						src={`/icons/star.svg`}
						width={24}
						height={24}
						alt='Marked'
					/>
				</button>
				<h4 className='text-black self-center'>
					<Image
						src={`/icons/search.svg`}
						width={24}
						height={24}
						alt='Search'
					/>
				</h4>
				<select
					className=' text-black bg-sky-600 bg-opacity-10 rounded-md m-2'
					onChange={(e) => setWordStartWith(e.target.value)}
					value={wordStartWith}
				>
					<option value=''>All</option>
					{alphabet.map((letter) => (
						<option
							key={letter}
							value={letter}
						>
							{letter}
						</option>
					))}
				</select>
				<select
					className=' text-black bg-sky-600 bg-opacity-10 rounded-md m-2'
					onChange={(e) => setCount(Number(e.target.value))}
					value={count}
				>
					{Array(optionCounts + 1)
						.fill(0)
						.map((_, i) => i * 5)
						.slice(1)
						.map((count) => (
							<option
								key={count}
								value={count}
							>
								{count}
							</option>
						))}
				</select>
			</div>
		</div>
	);
}
