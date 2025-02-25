'use client';

import { CardProps } from '@/type';
import { useEffect, useState } from 'react';
import Spell from './spell';

const blankCard: CardProps = {
	word: 'No Data',
	phonetic: 'No Data',
	blocks: [
		{
			definitions: [
				{
					definition: [
						{
							lang: 'tw',
							content: 'No Data',
						},
					],
					example: [
						[
							{
								lang: 'en',
								content: 'Please Report to Developer',
							},
							{
								lang: 'tw',
								content: '請回報給開發者',
							},
						],
					],
				},
			],
		},
	],
};

export default function Questions({
	cards,
	onFinishClick,
}: {
	cards: CardProps[];
	onFinishClick?: () => void;
}) {
	const [index, setIndex] = useState(0);
	const [cardData, setCard] = useState<CardProps[]>(
		cards.length > 0 ? cards : [blankCard],
	);
	useEffect(() => {
		if (!cards) {
			setCard([blankCard]);
		}
		setCard(cards);
	}, [index, cards]);

	return (
		<div className='flex flex-col h-full w-[40vw] min-w-[20vw]'>
			<Spell
				card={cardData[index]}
				onAnsweredClick={() => {
					setIndex((prev) => {
						if (prev === cardData.length - 1) return prev;
						return prev + 1;
					});
					if (index === cardData.length - 1) onFinishClick?.();
				}}
			></Spell>
		</div>
	);
}
