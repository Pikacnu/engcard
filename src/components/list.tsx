import { CardProps } from '@/type';
import Card from './card';
import { useEffect, useState, useMemo } from 'react';
import Image from 'next/image';

export default function List({
	cards,
	className,
}: {
	cards: CardProps[];
	className?: string;
}) {
	const [isFoucs, setIsFocus] = useState(false);
	const [foucsIndex, setFocusIndex] = useState(0);
	const [card, setCard] = useState<CardProps[]>(
		cards.map((card) => ({ ...card, flipped: true })),
	);

	const cardData = useMemo(() => card[foucsIndex], [card, foucsIndex]);
	useEffect(() => {
		setCard(cards.map((card) => ({ ...card, flipped: true })));
		setFocusIndex(0);
		setIsFocus(false);
	}, [cards]);

	return (
		<div
			className={`flex flex-col h-full max-md:w-[80vw] w-[50vw] min-w-[20vw] ${className} relative max-h-[60vh]`}
		>
			{(isFoucs && (
				<div className='flex flex-grow w-full h-[60vh] relative'>
					<button
						className='absolute bg-white bg-opacity-50 rounded-full '
						onClick={() => {
							setIsFocus(false);
						}}
					>
						<Image
							src='/icons/left-circle-arrow.svg'
							width={30}
							height={30}
							alt='←'
						/>
					</button>
					<Card card={cardData} />
				</div>
			)) || (
				<div className='flex flex-col overflow-auto shadow-xl bg-black bg-opacity-50 rounded-lg p-4 '>
					{cards.map((card, index) => (
						<div
							className='pb-8 shadow-md rounded-lg bg-blue-100 dark:bg-gray-800 p-4 m-4'
							key={card.word}
							onClick={() => {
								setIsFocus(true);
								setFocusIndex(index);
							}}
						>
							<h4>{card.word}</h4>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
