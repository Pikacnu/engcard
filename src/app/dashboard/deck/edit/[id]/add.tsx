'use client';
import { useEffect, useState } from 'react';
import {
	PartOfSpeech,
	PartOfSpeechShort,
	Definition,
	Lang,
	CardProps,
	Blocks,
} from '@/type';
import { addCard } from '@/actions/deck';
import { Langs } from '@/types/lang';
import { useDebounce } from './../../../../../hooks/usedebounce';
import { useTranslation } from '@/context/LanguageContext'; // Added

export default function Add({
	defaultValue,
	id,
	className,
	onAdd,
}: {
	defaultValue?: CardProps;
	id: string;
	className?: string;
	onAdd?: () => void;
}) {
	const { t } = useTranslation(); // Added
	const [word, setWord] = useState('');
	const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>(
		PartOfSpeech.Noun,
	);
	const [definitions, setDefinitions] = useState<Definition[]>(
		defaultValue ? defaultValue.blocks.map((d) => d.definitions).flat() : [],
	);
	const [definiationHint, setDefinitionHint] = useState<Definition[]>([]);

	const handleNestedChange = (
		index: number,
		nestedKey: keyof Definition,
		subIndex: number,
		subKey: string,
		value: string | number | PartOfSpeech,
	) => {
		setDefinitions((prev) => {
			const updated = [...prev];
			const nestedArray = updated[index][nestedKey] as (
				| string
				| number
				| PartOfSpeech
			)[];
			nestedArray[subIndex] = value;
			updated[index] = { ...updated[index], [nestedKey]: nestedArray };
			return updated;
		});
	};

	const addNestedItem = (
		index: number,
		nestedKey: keyof Definition,
		newItem: object | string,
	) => {
		setDefinitions((prev) => {
			const updated = [...prev];
			const nestedArray = updated[index][nestedKey] as (object | string)[];
			updated[index] = {
				...updated[index],
				[nestedKey]: [...(nestedArray || []), newItem],
			};
			return updated;
		});
	};

	const removeNestedItem = (
		index: number,
		nestedKey: keyof Definition,
		subIndex: number,
	) => {
		setDefinitions((prev) => {
			const updated = [...prev];
			const nestedArray = updated[index][nestedKey] as (
				| object
				| string
				| number
			)[];
			updated[index] = {
				...updated[index],
				[nestedKey]: nestedArray.filter((_, i) => i !== subIndex),
			};
			return updated;
		});
	};

	const addDefinition = () => {
		setDefinitions((prev) => [
			...prev,
			{
				definition: [
					{
						lang: 'en' as Lang,
						content: '',
						partOfSpeech: partOfSpeech,
						definition: '',
					},
				],
				example: [],
				synonyms: [],
				antonyms: [],
			},
		]);
	};

	const handleAddCard = () => {
		addCard(id, word, definitions, partOfSpeech).then(() => {
			if (onAdd) onAdd();
			setWord('');
			setDefinitions([]);
			setPartOfSpeech(PartOfSpeech.Noun);
		});
	};

	const debounceFunction = useDebounce();

	useEffect(() => {
		const getWord = async () => {
			const res = await fetch(`/api/word?word=${word}`);
			const data = await res.json();
			if (data.error) {
				console.log(data.error);
				return;
			}
			console.log(data.blocks.map((d: Blocks) => d.definitions).flat());
			setDefinitionHint(data.blocks.map((d: Blocks) => d.definitions).flat());
		};

		if (word) {
			debounceFunction(() => getWord());
		}
	}, [word, debounceFunction]);

	return (
		<div
			className={`flex flex-col bg-white dark:bg-gray-800 p-4 shadow-lg text-black dark:text-white *:outline-none *:m-2 [&>*:not(h3):not(button)]:border-2 *:border-black dark:*:border-gray-600 *:rounded-lg overflow-auto ${className}`}
		>
			<h3 className='text-lg font-semibold'>
				{t('dashboard.deckEdit.add.wordLabel')}
			</h3>
			<input
				className='p-1 bg-white dark:bg-gray-700'
				type='text'
				value={word}
				onChange={(e) => setWord(e.target.value)}
			/>

			<h3 className='text-lg font-semibold'>
				{t('dashboard.deckEdit.add.posLabel')}
			</h3>
			<select
				value={partOfSpeech}
				onChange={(e) => setPartOfSpeech(e.target.value as PartOfSpeech)}
				className='p-2 bg-white dark:bg-gray-700'
			>
				{Object.values(PartOfSpeechShort).map((pos) => (
					<option
						key={pos}
						value={pos}
					>
						{pos}
					</option>
				))}
			</select>

			<h3 className='text-lg font-semibold'>
				{t('dashboard.deckEdit.add.definitionsLabel')}
			</h3>
			{definitions.map(
				(
					definitionBlock,
					blockIndex, // Renamed to definitionBlock and blockIndex
				) => (
					<div
						key={blockIndex}
						className='border-2 border-gray-300 dark:border-gray-700 p-2 m-2 rounded-lg flex justify-center flex-col *:p-1 space-y-2 bg-gray-50 dark:bg-gray-700'
					>
						{/* Definitions array within a block */}
						{definitionBlock.definition.map((def, defIndex) => (
							<div
								key={defIndex}
								className='flex gap-2 items-center'
							>
								<input
									type='text'
									value={def.content}
									placeholder={t(
										'dashboard.deckEdit.add.definitionPlaceholder',
									)} // Translated
									className='flex-grow bg-white dark:bg-gray-600'
									onChange={(e) =>
										handleNestedChange(
											blockIndex, // Use blockIndex
											'definition',
											defIndex,
											'content',
											e.target.value,
										)
									}
								/>
								<select
									value={def.lang}
									className='bg-white dark:bg-gray-600'
									onChange={(e) =>
										handleNestedChange(
											blockIndex, // Use blockIndex
											'definition',
											defIndex,
											'lang',
											e.target.value as Lang,
										)
									}
								>
									{Langs.map((lang) => (
										<option
											key={lang}
											value={lang}
										>
											{lang}
										</option>
									))}
								</select>
								<button
									className='bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg'
									aria-label={t('dashboard.deckEdit.add.removeButton')} // Translated aria-label
									onClick={() =>
										removeNestedItem(blockIndex, 'definition', defIndex)
									} // Use blockIndex
								>
									x
								</button>
							</div>
						))}
						<button
							className='text-sm bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-1 px-2 rounded self-start'
							onClick={() =>
								addNestedItem(blockIndex, 'definition', {
									// Use blockIndex
									lang: 'en',
									content: '',
									partOfSpeech: partOfSpeech, // Or derive from context
									definition: '',
								})
							}
						>
							{t('dashboard.deckEdit.add.addDefinitionButton')}{' '}
							{/* Translated */}
						</button>

						{/* Synonyms */}
						<h5 className='text-md font-semibold mt-2'>
							{t('dashboard.deckEdit.add.synonymsLabel')}
						</h5>
						{definitionBlock.synonyms &&
							definitionBlock.synonyms.map((synonym, synonymIndex) => (
								<div
									key={synonymIndex}
									className='flex gap-2 items-center'
								>
									<input
										type='text'
										value={synonym}
										placeholder={t('dashboard.deckEdit.add.synonymPlaceholder')} // Translated
										className='flex-grow bg-white dark:bg-gray-600'
										onChange={(e) =>
											handleNestedChange(
												blockIndex, // Use blockIndex
												'synonyms',
												synonymIndex,
												'', // No subKey for string array
												e.target.value,
											)
										}
									/>
									<button
										className='bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg'
										aria-label={t('dashboard.deckEdit.add.removeButton')} // Translated aria-label
										onClick={
											() =>
												removeNestedItem(blockIndex, 'synonyms', synonymIndex) // Use blockIndex
										}
									>
										x
									</button>
								</div>
							))}
						<button
							className='text-sm bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-1 px-2 rounded self-start'
							onClick={() => addNestedItem(blockIndex, 'synonyms', '')}
						>
							{' '}
							{/* Use blockIndex */}
							{t('dashboard.deckEdit.add.addSynonymButton')} {/* Translated */}
						</button>

						{/* Antonyms */}
						<h5 className='text-md font-semibold mt-2'>
							{t('dashboard.deckEdit.add.antonymsLabel')}
						</h5>
						{definitionBlock.antonyms &&
							definitionBlock.antonyms.map((antonym, antonymIndex) => (
								<div
									key={antonymIndex}
									className='flex gap-2 items-center'
								>
									<input
										type='text'
										value={antonym}
										placeholder={t('dashboard.deckEdit.add.antonymPlaceholder')} // Translated
										className='flex-grow bg-white dark:bg-gray-600'
										onChange={(e) =>
											handleNestedChange(
												blockIndex, // Use blockIndex
												'antonyms',
												antonymIndex,
												'', // No subKey for string array
												e.target.value,
											)
										}
									/>
									<button
										className='bg-red-500 hover:bg-red-600 text-white px-2 py-1 rounded-lg'
										aria-label={t('dashboard.deckEdit.add.removeButton')} // Translated aria-label
										onClick={
											() =>
												removeNestedItem(blockIndex, 'antonyms', antonymIndex) // Use blockIndex
										}
									>
										x
									</button>
								</div>
							))}
						<button
							className='text-sm bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white py-1 px-2 rounded self-start'
							onClick={() => addNestedItem(blockIndex, 'antonyms', '')}
						>
							{' '}
							{/* Use blockIndex */}
							{t('dashboard.deckEdit.add.addAntonymButton')} {/* Translated */}
						</button>
						<button
							onClick={
								() =>
									setDefinitions((prev) =>
										prev.filter((_, i) => i !== blockIndex),
									) // Use blockIndex
							}
							className='bg-red-600 hover:bg-red-700 text-white px-2 py-1 mt-3 rounded-lg self-end text-sm'
						>
							{t('dashboard.deckEdit.add.removeDefinitionBlockButton')}{' '}
							{/* Translated */}
						</button>
					</div>
				),
			)}

			<div className='flex flex-col md:flex-row *:flex-grow p-1 *:p-1 items-center space-y-2 md:space-y-0 md:space-x-2'>
				<select
					className='w-full md:w-1/2 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded p-2'
					value={'-1'} // Reset select after choosing an option
					onChange={(e) => {
						if (e.target.value === '-1') return; // Ignore the placeholder option
						const selectedHint = definiationHint.find(
							(d) => d.definition[0].content === e.target.value,
						);
						if (selectedHint) {
							setDefinitions((prev) => [...prev, selectedHint]);
						}
						e.target.value = '-1'; // Reset select
					}}
				>
					<option
						value={'-1'}
						disabled
					>
						{t('dashboard.deckEdit.add.selectDefinitionHint')}{' '}
						{/* Translated */}
					</option>
					{definiationHint.map((hint, index) => (
						<option
							key={index}
							value={hint.definition[0].content}
						>
							{hint.definition[1] // Prefer second definition content if available for display
								? hint.definition[1].content
								: hint.definition[0].content}
						</option>
					))}
				</select>
				<button
					className='w-full md:w-auto bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-500 text-white py-2 px-3 rounded'
					onClick={addDefinition}
				>
					{t('dashboard.deckEdit.add.addDefinitionButton')}{' '}
					{/* Reusing for adding a new block */}
				</button>
			</div>
			<button
				className='max-w-xs w-full self-center p-2 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg mt-4'
				onClick={handleAddCard}
			>
				{t('dashboard.deckEdit.add.addCardButton')} {/* Translated */}
			</button>
		</div>
	);
}
