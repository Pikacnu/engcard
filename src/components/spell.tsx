'use client';
import { CardProps, DefinitionData, PartOfSpeech } from '@/type'; // Added PartOfSpeech
import { useState, memo, useMemo, useEffect } from 'react';
import Card from './card';
import { useTranslation } from '@/context/LanguageContext'; // Added

type DefinitionWithPartOfSpeech = {
	partOfSpeech?: PartOfSpeech; // Made optional as it's added dynamically
} & DefinitionData; // DefinitionData might need to be adjusted if 'content' is not always there

// Memoized Definition Component
const Def = memo(function Def({
	definitions,
	definitionIndex,
}: {
	definitions: DefinitionWithPartOfSpeech[];
	definitionIndex: number;
}) {
	// Guard against undefined or empty definitions array, or out-of-bounds index
	if (!definitions || definitions.length === 0 || !definitions[definitionIndex]) {
		// Consider a fallback UI or null if CardWhenEmpty's structure isn't suitable here
		return <p className="text-gray-500 dark:text-gray-400">No definition available.</p>; 
	}
	const def: DefinitionWithPartOfSpeech = definitions[definitionIndex];
	
	// Assuming def.definition[0].content is the target text.
    // The original structure was def.content, but the provided CardProps uses nested structure.
    // This needs to align with how `definitions` is actually structured when passed to `Def`.
    // For now, assuming a simpler structure for `Def` based on its original usage.
    // If `DefinitionWithPartOfSpeech` is meant to be `Definition` from `CardProps.blocks[].definitions[]`,
    // then it should be `def.definition[0].content`.
    // Let's assume `def.content` is intended for simplicity within this component for now.
    // This might be a point of inconsistency with the broader CardProps type.
	const displayContent = def.content || (def.definition && def.definition[0]?.content) || "Definition not found";


	return (
		<>
			<div className='flex flex-row overflow-hidden text-white dark:text-gray-200'>
				<p>{displayContent}</p>
			</div>
		</>
	);
});

export default function Spell({
	card,
	onAnsweredClick,
	className,
}: {
	card: CardProps;
	onAnsweredClick?: () => void;
	className?: string;
}) {
	const { t } = useTranslation(); // Added
	const [word, setWord] = useState('');
	const [correct, setCorrect] = useState(false);
	const [definitionIndex, setDefinitionIndex] = useState(0);

	const definitions = useMemo<DefinitionWithPartOfSpeech[]>(() => {
		if (!card || !card.blocks) return []; // Guard against undefined card or blocks
		return card.blocks
			.map((block) => {
				const currentPartOfSpeechDefinitions: DefinitionWithPartOfSpeech[] =
					block.definitions
						.map((def) =>
							def.definition.map((defWithLang) => ({ // Explicitly return the new object
								...defWithLang, // Spread existing properties like lang, content
								partOfSpeech: block.partOfSpeech, // Add partOfSpeech
							})),
						)
						.flat();
				return currentPartOfSpeechDefinitions;
			})
			.flat()
			.filter((data) => !!data && (data.content !== undefined && data.content !== null)); // Ensure content exists
	}, [card]);

	useEffect(() => {
		setCorrect(false);
		setDefinitionIndex(0); // Reset definition index when card changes
	}, [card]);

	return (
		<div
			className={`flex flex-row items-center justify-center flex-grow min-w-[20vw] h-[70%] max-h-[70vh] ${className} relative`}
		>
			{!correct && (
				<div className='flex flex-col items-center justify-center shadow-lg p-4 m-4 rounded-lg select-none bg-white dark:bg-gray-800 overflow-hidden flex-grow min-w-[20vw] h-full text-black dark:text-white'>
					<div className='flex relative w-full max-w-xs my-4'>
						<p className='p-2 border-2 border-transparent opacity-0 select-none pointer-events-none'>{card.word}</p> {/* For sizing */}
						<input
							type='text'
							className='text-black dark:text-white bg-gray-100 dark:bg-gray-700 p-2 rounded-xl border-2 border-blue-500 dark:border-blue-400 absolute w-full text-center'
							value={word}
							placeholder={card.word.substring(0, 1)}
							onChange={(e) =>
								setWord(() => {
									const currentCardWord = card.word;
									const ans = e.target.value || '';
									if (ans.toLocaleLowerCase() === currentCardWord.toLocaleLowerCase()) {
										setCorrect(true);
										setWord(''); // Clear input after correct answer
										return ans; // Return current value to avoid immediate clear if not desired
									}
									// Simple feedback: if length matches but not correct, clear or indicate error (optional)
									// For now, only clear if fully correct or allow user to edit.
									// if (ans.length === currentCardWord.length && ans.toLocaleLowerCase() !== currentCardWord.toLocaleLowerCase()) {
									// 	// Optionally provide feedback like shaking the input or changing border color
									// 	return ''; // Or just the first letter: card.word.substring(0,1)
									// }
									return ans;
								})
							}
						/>
					</div>
					{definitions.length > 0 ? (
						<div className='flex flex-row space-x-2 [&>button]:text-2xl items-center my-4 text-center'>
							<button
								onClick={() =>
									setDefinitionIndex((prev) => {
										if (prev === 0) return definitions.length - 1;
										return prev - 1;
									})
								}
								aria-label={t('components.spell.previousDefButtonLabel')} // Translated
                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
							>
								{'<'}
							</button>
							<Def
								definitions={definitions}
								definitionIndex={definitionIndex}
							/>
							<button
								onClick={() => {
									setDefinitionIndex((prev) => {
										if (prev === definitions.length - 1) return 0;
										return prev + 1;
									});
								}}
								aria-label={t('components.spell.nextDefButtonLabel')} // Translated
                                className="p-1 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700"
							>
								{'>'}
							</button>
						</div>
					) : (
                        <p className="my-4 text-gray-500 dark:text-gray-400">{t('components.spell.noDefinitions')}</p>
                    )}
				</div>
			)}

			{correct && (
				<div
					onClick={() => {
						if (correct && onAnsweredClick) onAnsweredClick();
					}}
					className='w-full h-full flex items-center justify-center cursor-pointer' // Added cursor-pointer
				>
					<Card card={Object.assign(card, { flipped: true })}></Card>
				</div>
			)}
		</div>
	);
}
