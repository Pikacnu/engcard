'use client';

import { CardProps } from '@/type';
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Spell from './spell';
import { CardWhenEmpty } from '@/utils/blank_value';

export default function Questions({
	cards,
	onFinishClick,
	updateCurrentWord,
}: {
	cards: CardProps[];
	onFinishClick?: () => void;
	updateCurrentWord?: Dispatch<SetStateAction<CardProps | undefined>>;
}) {
	const [index, setIndex] = useState(0);
	const [cardData, setCard] = useState<CardProps[]>(
		cards.length === 0 ? [CardWhenEmpty] : cards,
	);
	useEffect(() => {
		if (!cards || cards.length === 0) {
			setCard([CardWhenEmpty]);
			return;
		}
		setCard(cards);
		updateCurrentWord?.(cards[index]);
	}, [index, cards, updateCurrentWord]);

	return (
		<div className='flex flex-col h-full max-md:w-[80vw] w-[60vw] min-w-[20vw] justify-center relative'>
			<Spell
				card={cardData[index]}
				className='pb-8 h-[60vh] md:h-[80vh] relative'
				onAnsweredClick={() => {
					setIndex((prev) => {
						if (prev === cardData.length - 1) return prev;
						return prev + 1;
					});
					updateCurrentWord?.(cardData[index + 1]);
					if (index === cardData.length - 1) onFinishClick?.();
				}}
			></Spell>

			<button
				className='bg-gray-500 text-white p-2 rounded-lg absolute bottom-0 right-0 m-4'
				onClick={() => {
					setIndex((prev) => {
						if (prev === cardData.length - 1) return prev;
						return prev + 1;
					});
					if (index < cardData.length - 1) return;
					onFinishClick?.();
					setIndex(0);
				}}
			>
				{'Skip'}
			</button>

			<div className='w-full rounded-full h-2.5 bg-gray-700 select-none'>
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
