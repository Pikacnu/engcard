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
			className={`flex flex-col bg-white p-4 rounded-lg shadow-lg text-black *:outline-none *:m-2 [&>*:not(h3)]:border-2 *:border-black *:rounded-lg overflow-auto ${className}`}
		>
			<h3>Word:</h3>
			<input
				className='p-1'
				type='text'
				value={word}
				onChange={(e) => setWord(e.target.value)}
			/>

			<h3>Part Of Speech</h3>
			<select
				value={partOfSpeech}
				onChange={(e) => setPartOfSpeech(e.target.value as PartOfSpeech)}
				className='p-2'
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

			<h3>Definitions:</h3>
			{definitions.map((definition, index) => (
				<div
					key={index}
					className='border-2 p-2 m-2 rounded-lg flex justify-center flex-col *:p-1'
				>
					{/* Definitions */}
					{definition.definition.map((def, defIndex) => (
						<div
							key={defIndex}
							className='flex gap-2'
						>
							<input
								type='text'
								value={def.content}
								placeholder='Definition'
								onChange={(e) =>
									handleNestedChange(
										index,
										'definition',
										defIndex,
										'content',
										e.target.value,
									)
								}
							/>
							<select
								value={def.lang}
								onChange={(e) =>
									handleNestedChange(
										index,
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
								className='bg-red-500 text-white px-2 my-1 rounded-lg'
								onClick={() => removeNestedItem(index, 'definition', defIndex)}
							>
								x
							</button>
						</div>
					))}
					<button
						onClick={() =>
							addNestedItem(index, 'definition', {
								lang: 'en',
								content: '',
							})
						}
					>
						Add Definition
					</button>

					{/* Synonyms */}
					<h5>Synonyms:</h5>
					{definition.synonyms &&
						definition.synonyms.map((synonym, synonymIndex) => (
							<div
								key={synonymIndex}
								className='flex gap-2'
							>
								<input
									type='text'
									value={synonym}
									placeholder='Synonym'
									onChange={(e) =>
										handleNestedChange(
											index,
											'synonyms',
											synonymIndex,
											'',
											e.target.value,
										)
									}
								/>
								<button
									className='bg-red-500 text-white px-2 my-1 rounded-lg'
									onClick={() =>
										removeNestedItem(index, 'synonyms', synonymIndex)
									}
								>
									x
								</button>
							</div>
						))}
					<button onClick={() => addNestedItem(index, 'synonyms', '')}>
						Add Synonym
					</button>

					{/* Antonyms */}
					<h5>Antonyms:</h5>
					{definition.antonyms &&
						definition.antonyms.map((antonym, antonymIndex) => (
							<div
								key={antonymIndex}
								className='flex gap-2'
							>
								<input
									type='text'
									value={antonym}
									placeholder='Antonym'
									onChange={(e) =>
										handleNestedChange(
											index,
											'antonyms',
											antonymIndex,
											'',
											e.target.value,
										)
									}
								/>
								<button
									className='bg-red-500 text-white px-2 my-1 rounded-lg'
									onClick={() =>
										removeNestedItem(index, 'antonyms', antonymIndex)
									}
								>
									x
								</button>
							</div>
						))}
					<button onClick={() => addNestedItem(index, 'antonyms', '')}>
						Add Antonym
					</button>
					<button
						onClick={() =>
							setDefinitions((prev) => prev.filter((_, i) => i !== index))
						}
						className='bg-red-500 text-white px-2 my-1 rounded-lg'
					>
						remove definition
					</button>
				</div>
			))}

			<div className='flex *:flex-grow p-1 *:p-1 items-center'>
				<select
					className='w-1/2'
					value={'-1'}
					onChange={(e) => {
						setDefinitions((prev) => [
							...prev,
							definiationHint.find(
								(d) => d.definition[0].content === e.target.value,
							) as Definition,
						]);
					}}
				>
					<option
						value={'-1'}
						disabled
					>
						Select a definition to add
					</option>
					{definiationHint.map((hint, index) => (
						<option
							key={index}
							value={hint.definition[0].content}
						>
							{hint.definition[1]
								? hint.definition[1].content
								: hint.definition[0].content}
						</option>
					))}
				</select>
				<button onClick={addDefinition}>Add Definition</button>
			</div>
			<button
				className=' max-w-1/5 w-2/5 self-center p-1'
				onClick={handleAddCard}
			>
				Add Card
			</button>
		</div>
	);
}
