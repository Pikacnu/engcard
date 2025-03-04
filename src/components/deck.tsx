'use client';
import { useEffect, useState } from 'react';
import Card from './card';
import { CardProps, PartOfSpeech } from '@/type';

const CardWhenEmpty: CardProps = {
	word: 'No Cards',
	phonetic: 'No Cards',
	blocks: [
		{
			partOfSpeech: PartOfSpeech.Error,
			definitions: [
				{
					definition: [
						{
							lang: 'en',
							content: 'Error Occured, Please Report to Developer',
						},
						{
							lang: 'tw',
							content: '發生錯誤，請回報給開發者',
						},
					],
				},
			],
		},
	],
};

export default function Deck({
	cards,
	onFinishClick,
}: {
	cards: CardProps[];
	onFinishClick?: () => void;
}) {
	const [index, setIndex] = useState(0);

	useEffect(() => {
		setIndex(0);
	}, [cards]);

	return (
		<div className='flex flex-col h-full max-md:w-[80vw] md:w-[60vw] pb-16'>
			<div
				className='flex flex-grow w-full md:h-[80vh] h-[60vh] pb-8'
				onClick={() => {
					if (index <= cards.length - 1) return setIndex(index + 0.5);
					if (index === cards.length - 0.5) return onFinishClick?.();
				}}
			>
				{(cards[Math.floor(index)] && (
					<Card card={cards[Math.floor(index)]} />
				)) || <Card card={CardWhenEmpty} />}
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
