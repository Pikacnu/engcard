'use client';
import { useState } from 'react';
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

export default function Deck({ cards }: { cards: CardProps[] }) {
	const [index, setIndex] = useState(0);

	return (
		<div className='flex flex-col h-full'>
			<div
				className='flex flex-grow w-full h-[80vh]'
				onClick={() => index < cards.length - 1 && setIndex(index + 0.5)}
			>
				{(cards[Math.floor(index)] && (
					<Card card={cards[Math.floor(index)]} />
				)) || <Card card={CardWhenEmpty} />}
			</div>
			<div className='w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700 select-none'>
				<div
					className='bg-blue-600 rounded-full duration-100 transition-all text-xs font-medium text-blue-100 text-end p-1 leading-none'
					style={{ width: `${((index + 1) / cards.length) * 100}%` }}
				>
					{`${(((index + 1) / cards.length) * 100).toFixed(1)}%`}
				</div>
			</div>
		</div>
	);
}
