import { CardProps, PartOfSpeech, PartOfSpeechShort } from '@/type';
import { useState, useEffect, useMemo, Dispatch, SetStateAction } from 'react';
import Card from '@/components/card';
import { shuffle } from '@/utils/functions';
import { CardWhenEmpty } from '@/utils/blank_value';

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
	const [index, setIndex] = useState(0);
	const [card, setCard] = useState<CardProps[]>(
		cards.length === 0 ? [CardWhenEmpty] : cards,
	);
	const [isCorrect, setIsCorrect] = useState(false);
	const currentCards: WithAnswer<CardProps>[] = useMemo(() => {
		if (card.length === 0)
			return [
				...Array(3).fill(CardWhenEmpty),
				Object.assign(CardWhenEmpty, { answer: false }),
			];
		if (index >= card.length) {
			setIndex(0);
			return [CardWhenEmpty, CardWhenEmpty, CardWhenEmpty, CardWhenEmpty];
		}
		const answer = card[index];
		const question = shuffle(card.filter((_, i) => i !== index))
			.slice(0, 3)
			.map((card) => ({
				...card,
				answer: false,
			}));
		return shuffle([Object.assign(answer, { answer: true }), ...question]);
	}, [card, index]);

	useEffect(() => {
		if (cards.length === 0) {
			setCard([CardWhenEmpty]);
			return;
		}
		setCard(cards);
		updateCurrentWord?.(cards[0]);
	}, [cards, updateCurrentWord]);

	return (
		<div className='flex flex-col items-center justify-center w-full md:max-w-[60vw] h-full md:m-4'>
			<div className=' max-w-full w-full max-h-[80vh] pb-8'>
				{!isCorrect ? (
					<div className='flex flex-col '>
						<div className=' text-xl m-8 p-4 bg-black bg-opacity-45 rounded-lg flex flex-row flex-warp *:rounded-lg *:m-2 *:p-2 '>
							<h1>Question:</h1>
							<h1 className=' bg-blue-600 bg-opacity-40'>{card[index].word}</h1>
							<h1 className=' bg-green-400 bg-opacity-10 border-2'>
								{
									PartOfSpeechShort[
										card[index].blocks[0].partOfSpeech || PartOfSpeech.Error
									]
								}
							</h1>
						</div>
						<div className='flex flex-col items-center *:w-full'>
							{currentCards &&
								currentCards.map((card, i) => (
									<button
										key={i}
										className={` p-2 md:max-w-[20vw] max-md:max-w-[60vw] m-2 rounded-lg border-2`}
										onClick={(e) => {
											if (card.answer) {
												setIsCorrect(true);
											} else {
												e.currentTarget.classList.add('bg-red-500');
											}
										}}
									>
										{card.blocks[0].definitions[0].definition[0].content}
									</button>
								))}
						</div>
					</div>
				) : (
					<div
						className='w-full max-h-[60vh] h-[70vh] relative'
						onClick={() => {
							if (index === card.length - 1) {
								setIsCorrect(false);
								setIndex(0);
								if (onFinishClick) onFinishClick();
								return;
							}
							setIndex(index + 1);
							setIsCorrect(false);
							updateCurrentWord?.(card[index + 1]);
						}}
					>
						<Card card={Object.assign(card[index], { flipped: true })} />
					</div>
				)}
			</div>
			<div className='w-full bg-gray-200 rounded-full h-5.5 dark:bg-gray-700 select-none'>
				<div
					className='bg-blue-600 rounded-full duration-100 transition-all text-xs font-medium text-blue-100 text-end p-1 leading-none'
					style={{
						width: `${Math.min(100, ((index + 1) / cards.length) * 100)}%`,
					}}
				>
					{`${Math.min(
						100,
						Number((((index + 1) / cards.length) * 100).toFixed(1)),
					)}%`}
				</div>
			</div>
		</div>
	);
}
