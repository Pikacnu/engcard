'use client';
import { CardProps, PartOfSpeech } from '@/type'; // Added PartOfSpeech
import Image from 'next/image';
import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext'; // Added

export default function List({
	cards,
	className,
}: {
	cards: CardProps[];
	className?: string;
}) {
	const { t } = useTranslation(); // Added

	// Revised CardWhenEmpty definition using t()
	const CardWhenEmpty: CardProps = {
		word: t('components.list.empty.word'),
		phonetic: t('components.list.empty.phonetic'),
		blocks: [
			{
				partOfSpeech: PartOfSpeech.Error, // Assuming PartOfSpeech.Error exists or is handled
				definitions: [
					{
						// This structure assumes 'definition' is an array of objects
						// each with lang and content.
						// For a simple error message, this might be simplified further
						// depending on how Card component renders it.
						definition: [
							{
								lang: 'en', // lang attribute indicates the original language of this piece, not the display language
								content: t('components.list.empty.errorContent'),
                                                                // No 'partOfSpeech' or 'definition' fields here per revised CardProps structure.
							},
						],
						// example, synonyms, antonyms can be empty arrays or omitted if optional
						example: [],
						synonyms: [],
						antonyms: [],
					},
				],
			},
		],
		// _id, audio, flipped etc. can be omitted if they are optional in CardProps
		// or set to default/null values if required.
		flipped: true, // Make it show details by default
	};
	
	const displayCards = cards && cards.length > 0 ? cards : [CardWhenEmpty];

	return (
		<div
			className={`flex flex-col w-full md:max-w-[25vw] h-full bg-white dark:bg-gray-800 rounded-lg shadow-lg text-black dark:text-white ${className}`}
		>
			<div className='bg-gray-100 dark:bg-gray-700 p-2 rounded-t-lg'>
				<Link href={'/dashboard/preview'}>
					<Image
						src='/icons/arrow-left.svg'
						alt={t('components.list.altBackArrow')} // Translated
						width={24}
						height={24}
						className='cursor-pointer dark:filter dark:invert' // Added dark mode styling for icon visibility
					/>
				</Link>
			</div>
			<div className='overflow-y-auto flex-grow p-2'>
				{displayCards.map((card, index) => (
					<div
						key={card.word + index} // Consider using a more unique key if available (e.g., card._id)
						className='p-3 border-b border-gray-200 dark:border-gray-700 last:border-b-0 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors'
					>
						<h3 className='font-semibold text-lg text-gray-800 dark:text-gray-100'>
							{card.word}
						</h3>
						{card.phonetic && (
							<p className='text-sm text-gray-500 dark:text-gray-400'>
								{card.phonetic}
							</p>
						)}
						{card.blocks && card.blocks[0] && card.blocks[0].definitions[0] && card.blocks[0].definitions[0].definition[0] && (
							<p className='text-xs text-gray-600 dark:text-gray-300 mt-1'>
								{card.blocks[0].definitions[0].definition[0].content}
							</p>
						)}
					</div>
				))}
			</div>
		</div>
	);
}
