'use client';

import { CardProps, PartOfSpeechShort } from '@/type';
import { useEffect, useState } from 'react';
import { useAudio } from '@/hooks/useAudio';
import Image from 'next/image';
import { useTranslation } from '@/context/LanguageContext'; // Added

export default function Card({ card }: { card: CardProps }) {
	const { t } = useTranslation(); // Added
	const [cardData, setcardData] = useState<CardProps>(card);
	const [flipped, setFlipped] = useState(card.flipped || false);
	const [isPlaying, toggle] = useAudio(cardData.audio || '');

	useEffect(() => {
		setFlipped(card.flipped || false);
		setcardData(card);
	}, [card]);

	const { word, phonetic, blocks, audio } = cardData;
	return (
		<div
			className='flex flex-col h-full min-w-[20vw] shadow-lg p-4 m-4 rounded-lg select-none bg-white dark:bg-gray-800 overflow-hidden flex-grow text-black dark:text-white' // Updated background for light/dark
			onClick={() => {
				if (card.flipped !== true) { // Ensure card.flipped check is intentional for initial state
					setFlipped((prev) => !prev);
				}
			}}
		>
			{!flipped && (
				<div className='flex flex-col items-center justify-center flex-grow relative overflow-hidden w-full cursor-pointer'>
					<h1 className='text-4xl text-wrap whitespace-break-spaces '>
						{word}
					</h1>
					<p className='text-xl text-gray-600 dark:text-gray-400'>{phonetic}</p>
					<p className='absolute bottom-5 text-gray-400 dark:text-gray-500'>{t('components.card.clickToFlip')}</p> {/* Translated */}
				</div>
			)}
			{flipped && (
				<div className='flex-grow w-full relative h-min overflow-auto bg-inherit'>
					<div className='flex flex-row items-center *:p-2 sticky -top-1 bg-white dark:bg-gray-800 bg-inherit z-10'> {/* Added z-index */}
						<h1 className=' text-4xl whitespace-pre-wrap text-wrap '>{word}</h1>
						<p className='text-xl text-gray-600 dark:text-gray-400'>{phonetic}</p>
					</div>

					{audio && (
						<div className='flex flex-row items-center justify-start my-2'>
							<button
								className='bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white p-2 rounded-lg flex items-center justify-center'
								disabled={isPlaying as boolean}
								onClick={(e) => { // Added stopPropagation
                                    e.stopPropagation();
									if (typeof toggle === 'function') {
										toggle();
									}
								}}
							>
								<Image
									src='/icons/volume-up.svg'
									alt={t('components.card.altPlayAudio')} // Translated
									width={16} // Adjusted size for button
									height={16}
									className='object-cover' // Consider filter: invert(1) for dark mode if icon is dark
								></Image>
							</button>
						</div>
					)}

					{blocks.length > 0 &&
						blocks.map((block, index) => (
							<div
								key={index}
								className='flex flex-col my-4 mt-6' // Increased top margin
							>
								<div className='inline-flex flex-row-reverse sticky self-end top-12 z-10'> {/* Adjusted top for sticky positioning */}
									{block.partOfSpeech && (
										<h2 className='text-lg p-1 bg-opacity-40 bg-blue-500 dark:bg-blue-700 border-2 border-blue-600 dark:border-blue-500 rounded text-white'>
											{PartOfSpeechShort[block.partOfSpeech]}
										</h2>
									)}
									{block.phonetic && (
										<p className='p-1 bg-opacity-40 bg-blue-500 dark:bg-blue-700 border-2 border-blue-600 dark:border-blue-500 rounded text-white mr-1 text-lg'>
											{block.phonetic}
										</p>
									)}
								</div>
								{block.definitions.map((definition, defIdx) => ( // Changed index to defIdx
									<div
										key={defIdx} // Changed key
										className='flex flex-col pb-4 mb-2 border-b border-gray-200 dark:border-gray-700 last:border-b-0 last:pb-0 last:mb-0' // Added border for separation
									>
										<h2 className="font-semibold text-gray-700 dark:text-gray-300">{t('components.card.definitionLabel')}</h2> {/* Translated */}
										{definition.definition.map((def, subDefIdx) => ( // Changed index to subDefIdx
											<div
												key={subDefIdx} // Changed key
												className='flex flex-row pl-4 my-1' // Adjusted padding
											>
												<p className='mr-3 border-2 border-gray-300 dark:border-gray-600 min-w-8 text-center self-start px-1 rounded text-xs text-gray-500 dark:text-gray-400'>
													{def.lang}
												</p>
												<p className="text-gray-800 dark:text-gray-200">{def.content}</p>
											</div>
										))}
										{definition.example && definition.example.length > 0 && ( // Check length
											<>
												<h3 className='ml-0 mt-2 font-semibold text-gray-700 dark:text-gray-300'>{t('components.card.examplesLabel')}</h3> {/* Translated */}
												<div className='flex flex-col *:ml-4 space-y-1'> {/* Added space-y */}
													{definition.example.map((exampleSentences, exIdx) => ( // Changed index to exIdx
														<div
															key={exIdx} // Changed key
															className='flex flex-col text-sm text-gray-600 dark:text-gray-400'
														>
															{exampleSentences.map((sentence, sentIdx) => ( // Changed index to sentIdx
																<p key={sentIdx}>{sentence.content}</p> // Changed key
															))}
														</div>
													))}
												</div>
											</>
										)}
										{(definition.synonyms && definition.synonyms.length > 0) ||
											(definition.antonyms && definition.antonyms.length > 0) ? ( // Simplified conditional rendering
													<div className='grid grid-cols-1 md:grid-cols-2 gap-x-4 *:my-2 mt-2 pt-2 border-t border-gray-200 dark:border-gray-700'>
														{definition.synonyms &&
															definition.synonyms.length > 0 && (
																<div>
																	<h3 className="font-semibold text-gray-700 dark:text-gray-300">{t('components.card.synonymsLabel')}</h3> {/* Translated */}
																	<ul className="list-disc list-inside pl-2 text-sm text-gray-600 dark:text-gray-400">
																		{definition.synonyms.map((synonym, synIdx) => ( // Changed index to synIdx
																			<li key={synIdx}>{synonym}</li> // Changed key
																		))}
																	</ul>
																</div>
															)}
														{definition.antonyms &&
															definition.antonyms.length > 0 && (
																<div>
																	<h3 className="font-semibold text-gray-700 dark:text-gray-300">{t('components.card.antonymsLabel')}</h3> {/* Translated */}
																	<ul className="list-disc list-inside pl-2 text-sm text-gray-600 dark:text-gray-400">
																		{definition.antonyms.map((antonym, antIdx) => ( // Changed index to antIdx
																			<li key={antIdx}>{antonym}</li> // Changed key
																		))}
																	</ul>
																</div>
															)}
													</div>
												) : <hr className='mt-4 border-gray-200 dark:border-gray-700' />}
									</div>
								))}
							</div>
						))}
				</div>
			)}
		</div>
	);
}
