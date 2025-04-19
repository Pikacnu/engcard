'use client';
import { useState } from 'react';
import {
	PartOfSpeech,
	PartOfSpeechShort,
	Definition,
	Lang,
	CardProps,
} from '@/type';
import { addCard } from '@/actions/deck';
import { Langs } from '@/types/lang';

export default function Add({
	defaultValue,
	id,
	className,
	AddInfo,
}: {
	defaultValue?: CardProps;
	id: string;
	className?: string;
	AddInfo?: {
		deckid: string;
		onAdd?: () => void;
	};
}) {
	const [word, setWord] = useState('');
	const [partOfSpeech, setPartOfSpeech] = useState<PartOfSpeech>(
		PartOfSpeech.Noun,
	);
	const [definitions, setDefinitions] = useState<Definition[]>(
		defaultValue ? defaultValue.blocks.map((d) => d.definitions).flat() : [],
	);
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
			<h3>Definition:</h3>
			{definitions &&
				definitions.length > 0 &&
				definitions.map((definition, index) => (
					<div
						key={index}
						className='*:m-2 *:flex *:gap-2 *:justify-center *:flex-col'
					>
						<div>
							<div className='flex'>
								<h5>Part Of Speech</h5>
								<select
									value={partOfSpeech}
									onChange={(e) =>
										setPartOfSpeech(e.target.value as PartOfSpeech)
									}
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
							</div>

							{definition.definition &&
								definition.definition.length > 0 &&
								definition.definition.map((def, defIndex) => (
									<div
										key={defIndex}
										className='border-2 p-2 m-2 rounded-lg flex flex-row'
									>
										<input
											className='flex-grow'
											type='text'
											value={def.content}
											placeholder='Definition'
											onChange={(e) => {
												setDefinitions((prev) => {
													const newDefinitions = [...prev];
													newDefinitions[index].definition[defIndex].content =
														e.target.value;
													return newDefinitions;
												});
											}}
										/>
										<select
											value={def.lang}
											onChange={(e) => {
												setDefinitions((prev) => {
													const newDefinitions = [...prev];
													newDefinitions[index].definition[defIndex].lang = e
														.target.value as Lang;
													return newDefinitions;
												});
											}}
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
											onClick={() => {
												setDefinitions((prev) => [
													...prev.filter((_, i) => i !== index),
													{
														...prev[index],
														definition: prev[index].definition.filter(
															(_, i) => i !== defIndex,
														),
													},
												]);
											}}
										>
											x
										</button>
									</div>
								))}

							<button
								onClick={() => {
									setDefinitions((prev) => {
										return [
											...prev.filter((_, i) => i !== index),
											{
												...prev[index],
												definition: [
													...prev[index].definition,
													{
														lang: 'en',
														content: '',
													},
												],
											},
										];
									});
								}}
							>
								Add Definition
							</button>
						</div>
						<div>
							<h5>Example:</h5>
							{definition.example &&
								definition.example.length > 0 &&
								definition.example.map((example, exampleIndex) => (
									<div
										className='*:m-2 *:flex *:gap-2 *:justify-center *:flex-row'
										key={exampleIndex}
									>
										{example &&
											example.length > 0 &&
											example.map((ex, exIndex) => (
												<div
													key={exIndex}
													className='border-2 p-2 m-2 rounded-lg'
												>
													<input
														className='flex-grow'
														type='text'
														value={ex.content}
														placeholder='Example'
														onChange={(e) => {
															setDefinitions((prev) => [
																...prev.filter((_, i) => i !== index),
																{
																	...prev[index],
																	example: prev[index].example
																		? prev[index].example.map((ex, i) =>
																				i === exampleIndex
																					? ex.map((ea, j) =>
																							j === exIndex
																								? {
																										...ea,
																										content: e.target.value,
																								  }
																								: ea,
																					  )
																					: ex,
																		  )
																		: [],
																},
															]);
														}}
													/>
													<select
														value={ex.lang}
														onChange={(e) => {
															setDefinitions((prev) => [
																...prev.filter((_, i) => i !== index),
																{
																	...prev[index],
																	example: prev[index].example
																		? prev[index].example.map((ex, i) =>
																				i === exampleIndex
																					? ex.map((ea, j) =>
																							j === exIndex
																								? {
																										...ea,
																										lang: e.target
																											.value as Lang,
																								  }
																								: ea,
																					  )
																					: ex,
																		  )
																		: [],
																},
															]);
														}}
													>
														{['en', 'tw'].map((lang) => (
															<option
																key={lang}
																value={lang}
															>
																{lang}
															</option>
														))}
													</select>
													<button
														onClick={() => {
															setDefinitions((prev) => [
																...prev.filter((_, i) => i !== index),
																{
																	...prev[index],
																	example: prev[index].example
																		? prev[index].example.map((ex, i) =>
																				i === exampleIndex
																					? ex.filter((_, j) => j !== exIndex)
																					: ex,
																		  )
																		: [],
																},
															]);
														}}
													>
														x
													</button>
												</div>
											))}
									</div>
								))}
							<button
								onClick={() => {
									setDefinitions((prev) => [
										...prev.filter((_, i) => i !== index),
										{
											...prev[index],
											example: [
												...(prev[index].example ?? []),
												[
													{
														lang: 'en',
														content: '',
													},
												],
											],
										},
									]);
								}}
							>
								Add Example
							</button>
						</div>
						<div>
							<h5>Synonyms:</h5>
							{definition.synonyms &&
								definition.synonyms.length > 0 &&
								definition.synonyms.map((synonym, synonymIndex) => (
									<div
										key={synonymIndex}
										className='border-2 p-2 m-2 rounded-lg'
									>
										<input
											type='text'
											value={synonym}
											placeholder='Synonym'
											onChange={(e) => {
												setDefinitions((prev) => [
													...prev.filter((_, i) => i !== index),
													{
														...prev[index],
														synonyms: (prev[index].synonyms ?? []).map((s, i) =>
															i === synonymIndex ? e.target.value : s,
														),
													},
												]);
											}}
										/>
										<button
											onClick={() => {
												setDefinitions((prev) => [
													...prev.filter((_, i) => i !== index),
													{
														...prev[index],
														synonyms: (prev[index].synonyms ?? []).filter(
															(_, i) => i !== synonymIndex,
														),
													},
												]);
											}}
										>
											x
										</button>
									</div>
								))}
							<button
								onClick={() => {
									setDefinitions((prev) => [
										...prev.filter((_, i) => i !== index),
										{
											...prev[index],
											synonyms: [...(prev[index].synonyms ?? []), ''],
										},
									]);
								}}
							>
								Add Synonym
							</button>
							<h5>Antonyms:</h5>
							{definition.antonyms &&
								definition.antonyms.length > 0 &&
								definition.antonyms.map((antonym, antonymIndex) => (
									<div
										key={antonymIndex}
										className='border-2 p-2 m-2 rounded-lg'
									>
										<input
											type='text'
											value={antonym}
											placeholder='Antonym'
											onChange={(e) => {
												setDefinitions((prev) => [
													...prev.filter((_, i) => i !== index),
													{
														...prev[index],
														antonyms: (prev[index].antonyms ?? []).map((a, i) =>
															i === antonymIndex ? e.target.value : a,
														),
													},
												]);
											}}
										/>
										<button
											onClick={() => {
												setDefinitions((prev) => [
													...prev.filter((_, i) => i !== index),
													{
														...prev[index],
														antonyms: (prev[index].antonyms ?? []).filter(
															(_, i) => i !== antonymIndex,
														),
													},
												]);
											}}
										>
											x
										</button>
									</div>
								))}
							<button
								onClick={() => {
									setDefinitions((prev) => [
										...prev.filter((_, i) => i !== index),
										{
											...prev[index],
											antonyms: [...(prev[index].antonyms ?? []), ''],
										},
									]);
								}}
							>
								Add Antonym
							</button>
						</div>
					</div>
				))}
			<button
				onClick={() => {
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
				}}
			>
				Add Definition
			</button>
			<button
				onClick={() =>
					addCard
						.bind(null, id, word, definitions, partOfSpeech)()
						.then(() => {
							if (AddInfo?.onAdd) {
								AddInfo.onAdd();
							}
							setWord('');
							setDefinitions([]);
							setPartOfSpeech(PartOfSpeech.Noun);
						})
				}
			>
				Add Card
			</button>
		</div>
	);
}
