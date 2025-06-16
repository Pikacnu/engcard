'use client';
import { CardProps, PartOfSpeech } from '@/type'; // Added PartOfSpeech
import Image from 'next/image';
import { useTranslation } from '@/context/LanguageContext'; // Added
import Card from './card';
import { useState, useMemo, useEffect } from 'react';

export default function List({
	cards,
	className,
}: {
	cards: CardProps[];
	className?: string;
}) {
	const { t } = useTranslation(); // Added

	const CardWhenEmpty: CardProps = useMemo(
		() => ({
			word: t('components.list.empty.word'),
			phonetic: t('components.list.empty.phonetic'),
			blocks: [
				{
					partOfSpeech: PartOfSpeech.Error,
					definitions: [
						{
							definition: [
								{
									lang: 'en',
									content: t('components.list.empty.errorContent'),
								},
							],
							example: [],
							synonyms: [],
							antonyms: [],
						},
					],
				},
			],
			flipped: true,
		}),
		[t],
	);
	const [isFoucs, setIsFocus] = useState(false);
	const [foucsIndex, setFocusIndex] = useState(0);
	const [card, setCard] = useState<CardProps[]>(
		cards && cards.length && cards.length > 0
			? cards.map((card) => ({ ...card, flipped: true }))
			: [CardWhenEmpty],
	);

	const cardData = useMemo(() => card[foucsIndex], [card, foucsIndex]);
	useEffect(() => {
		setCard(
			cards && cards.length && cards.length > 0
				? cards.map((card) => ({ ...card, flipped: true }))
				: [CardWhenEmpty],
		);
		setFocusIndex(0);
		setIsFocus(false);
	}, [cards, CardWhenEmpty]);

	return (
		<div
			className={`flex flex-col h-full max-md:w-[90vw] w-[50vw] min-w-[20vw] ${className} relative max-h-[60vh] flex-grow`}
		>
			{isFoucs ? (
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
			) : (
				<div className='flex flex-col overflow-auto shadow-xl bg-black bg-opacity-50 rounded-lg p-4 flex-grow'>
					{card.map((card, index) => (
						<div
							className='pb-8 shadow-md rounded-lg dark:bg-gray-800 bg-gray-100 p-4 m-4 text-black dark:text-white cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors duration-200'
							key={`${card.word}-${index}`}
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
