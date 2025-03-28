'use client';

import { CardProps } from '@/type';
import { useEffect, useState } from 'react';
import Spell from './spell';
import { CardWhenEmpty } from '@/utils/blank_value';

export default function Questions({
	cards,
	onFinishClick,
}: {
	cards: CardProps[];
	onFinishClick?: () => void;
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
	}, [index, cards]);

	return (
		<div className='flex flex-col h-full max-md:w-[80vw] w-[60vw] min-w-[20vw] justify-center relative'>
			<Spell
				card={cardData[index]}
				className='pb-8 h-3/5 md:h-4/5'
				onAnsweredClick={() => {
					setIndex((prev) => {
						if (prev === cardData.length - 1) return prev;
						return prev + 1;
					});
					if (index === cardData.length - 1) onFinishClick?.();
				}}
			></Spell>

			<div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 select-none'>
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
