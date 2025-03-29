'use client';

import { CardProps, PartOfSpeechShort } from '@/type';
import { useEffect, useState } from 'react';
import { useAudio } from '@/hooks/useAudio';
import Image from 'next/image';

export default function Card({ card }: { card: CardProps }) {
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
			className='flex flex-col h-full min-w-[20vw] shadow-lg p-4 m-4 rounded-lg select-none bg-blue-100 dark:bg-gray-800 overflow-hidden flex-grow'
			onClick={() => setFlipped(!flipped || true)}
		>
			{!flipped && (
				<div className='flex flex-col items-center justify-center flex-grow relative overflow-hidden'>
					<h1 className='text-4xl text-wrap whitespace-break-spaces '>
						{word}
					</h1>
					<p className='text-xl'>{phonetic}</p>
					<p className='absolute bottom-5 text-gray-500'>Click to Flip</p>
				</div>
			)}
			{flipped && (
				<div className='flex-grow w-full relative h-min overflow-auto bg-inherit'>
					<div className='flex flex-row items-center *:p-2 sticky -top-1 bg-inherit'>
						<h1 className=' text-4xl whitespace-pre-wrap text-wrap '>{word}</h1>
						<p className='text-xl'>{phonetic}</p>
					</div>

					{audio && (
						<div className='flex flex-row items-center justify-start'>
							<button
								className='bg-blue-500 text-white p-2 rounded-lg'
								disabled={isPlaying as boolean}
								onClick={() => {
									if (typeof toggle === 'function') {
										toggle();
									}
								}}
							>
								<Image
									src='/icons/volume-up.svg'
									alt='play'
									width={12}
									height={12}
									className='object-cover'
								></Image>
							</button>
						</div>
					)}

					{blocks.map((block, index) => (
						<div
							key={index}
							className='flex flex-col m-4 mt-10'
						>
							<div className='inline-flex flex-row-reverse sticky self-end top-2'>
								{block.partOfSpeech && (
									<h2 className='text-xl p-1 bg-opacity-40 bg-blue-600 border-2 border-blue-700'>
										{PartOfSpeechShort[block.partOfSpeech]}
									</h2>
								)}
								{block.phonetic && (
									<p className='p-4 bg-opacity-40 bg-blue-600 border-2 border-blue-700'>
										{block.phonetic}
									</p>
								)}
							</div>
							{block.definitions.map((definition, index) => (
								<div
									key={index}
									className='flex flex-col pb-8'
								>
									<h2>Definition : </h2>
									{definition.definition.map((def, index) => (
										<div
											key={index}
											className='flex flex-row pl-8'
										>
											<p className='mr-4 border-2 min-w-8 text-center self-center'>
												{def.lang}
											</p>
											<p>{def.content}</p>
										</div>
									))}
									{definition.example && (
										<>
											<h3 className='ml-0'>Examples:</h3>
											<div className='flex flex-col *:ml-4'>
												{definition.example.map((example, index) => (
													<div
														key={index}
														className='flex flex-col'
													>
														{example.map((sentence, index) => (
															<p key={index}>{sentence.content}</p>
														))}
													</div>
												))}
											</div>
										</>
									)}
									{(definition.synonyms && definition.synonyms.length > 0) ||
										(definition.antonyms && definition.antonyms.length > 0 && (
											<div className=' grid grid-cols-2 *:m-2 border list-decimal'>
												{definition.synonyms &&
													definition.synonyms.length > 0 && (
														<div>
															<h3>Synonyms:</h3>
															{definition.synonyms.map((synonym, index) => (
																<li key={index}>{synonym}</li>
															))}
														</div>
													)}
												{definition.antonyms &&
													definition.antonyms.length > 0 && (
														<div>
															<h3>Antonyms:</h3>
															{definition.antonyms.map((antonym, index) => (
																<li key={index}>{antonym}</li>
															))}
														</div>
													)}
											</div>
										)) || <hr className='mt-4' />}
								</div>
							))}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
