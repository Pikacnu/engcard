'use client';
import { CardProps, DefinitionData, PartOfSpeech } from '@/type';
import { useState, memo, useMemo, useEffect } from 'react';
import Card from './card';

type DefinitionWithPartOfSpeech = {
	partOfSpeech?: PartOfSpeech;
} & DefinitionData;

const Def = memo(function Def({
	definitions,
	definitionIndex,
}: {
	definitions: DefinitionWithPartOfSpeech[];
	definitionIndex: number;
}) {
	const def: DefinitionWithPartOfSpeech = definitions[definitionIndex] || {
		lang: 'tw',
		content: 'Error',
	};
	return (
		<>
			<div className='flex flex-row overflow-hidden'>
				<p>{def.content}</p>
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
	const [word, setWord] = useState('');
	const [correct, setCorrect] = useState(false);
	const [definitionIndex, setDefinitionIndex] = useState(0);
	const definitions = useMemo<DefinitionWithPartOfSpeech[]>(
		() =>
			card.blocks
				.map((block) => {
					const currentPartOfSpeechDefinitions: DefinitionWithPartOfSpeech[] =
						block.definitions
							.map((def) =>
								def.definition.map((defWithLang) =>
									Object.assign(defWithLang, {
										partOfSpeech: block.partOfSpeech,
									}),
								),
							)
							.flat();
					return currentPartOfSpeechDefinitions;
				})
				.flat()
				.filter((data) => !!data),
		[card],
	);
	useEffect(() => {
		setCorrect(false);
	}, [card]);
	return (
		<div
			className={`flex flex-row items-center justify-center flex-grow min-w-[20vw] h-[70%] max-h-[70vh] ${className} relative`}
		>
			{!correct && (
				<div className='flex flex-col items-center justify-center shadow-lg p-4 m-4 rounded-lg select-none bg-blue-100 dark:bg-gray-800 overflow-hidden flex-grow min-w-[20vw] h-full'>
					<div className='flex relative'>
						<p className='p-2 border-2 opacity-0'>{card.word}</p>
						<input
							type='text'
							className=' text-black dark:text-white bg-transparent p-2 rounded-xl border-2 border-blue-500 absolute w-full'
							value={word}
							placeholder={card.word.substring(0, 1)}
							onChange={(e) =>
								setWord(() => {
									const word = card.word;
									const ans = e.target.value || '';
									if (ans.toLocaleLowerCase() === word.toLocaleLowerCase()) {
										setCorrect(true);
										setWord('');
										return ans;
									}
									if (ans.length === word.length) {
										return card.word.substring(0, 1);
									}
									return ans;
								})
							}
						/>
					</div>
					<div className='flex flex-row space-x-2 [&>button]:text-2xl items-center'>
						<button
							onClick={() =>
								setDefinitionIndex((prev) => {
									if (prev === 0) return definitions.length - 1;
									return prev - 1;
								})
							}
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
						>
							{'>'}
						</button>
					</div>
				</div>
			)}

			{correct && (
				<div
					onClick={() => {
						if (correct && onAnsweredClick) onAnsweredClick();
					}}
					className='w-full h-full flex items-center justify-center'
				>
					<Card card={Object.assign(card, { flipped: true })}></Card>
				</div>
			)}
		</div>
	);
}
