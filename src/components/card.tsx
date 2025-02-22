'use client';

import { CardProps } from '@/type';
import { useEffect, useState } from 'react';

export default function Card({ card }: { card: CardProps }) {
	const { word, phonetic, blocks } = card;
	const [flipped, setFlipped] = useState(card.flipped || false);

	useEffect(() => {
		setFlipped(card.flipped || false);
	}, [card]);

	return (
		<div
			className='flex flex-col w-[40vw] min-w-[20vw] shadow-lg p-4 m-4 rounded-lg select-none bg-blue-100 dark:bg-gray-800 overflow-hidden flex-grow'
			onClick={() => setFlipped(!flipped || true)}
		>
			{!flipped && (
				<div className='flex flex-col items-center justify-center flex-grow relative'>
					<h1 className='text-4xl'>{word}</h1>
					<p className='text-xl'>{phonetic}</p>
					<p className='absolute bottom-5 text-gray-500'>Click to Flip</p>
				</div>
			)}
			{flipped && (
				<div className='flex-grow w-full'>
					<div className='flex flex-row items-center *:p-2'>
						<h1 className=' text-4xl'>{word}</h1>
						<p className='text-xl'>{phonetic}</p>
					</div>
					{blocks.map((block, index) => (
						<div
							key={index}
							className='flex flex-col m-4'
						>
							<div className='inline-flex flex-row'>
								<h2 className='text-xl p-1 bg-opacity-40 bg-blue-600 border-2 border-blue-700'>
									{block.partOfSpeech}
								</h2>
								{block.phonetic && (
									<p className='p-4 bg-opacity-40 bg-blue-600 border-2 border-blue-700'>
										{block.phonetic}
									</p>
								)}
							</div>
							{block.definitions.map((definition, index) => (
								<div
									key={index}
									className='flex flex-col'
								>
									<h2>Definition : </h2>
									{definition.definition.map((def, index) => (
										<div
											key={index}
											className='flex flex-row'
										>
											<p className='mr-4 border-2 min-w-8 text-center self-center'>
												{def.lang}
											</p>
											<p>{def.content}</p>
										</div>
									))}
									{definition.example && (
										<>
											<hr className='p-2' />
											<div className='flex flex-col *:ml-4'>
												<h3 className='ml-0'>Examples:</h3>
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
									<div className=' grid grid-cols-2 *:m-2 border list-decimal'>
										{definition.synonyms && (
											<div>
												<h3>Synonyms:</h3>
												{definition.synonyms.map((synonym, index) => (
													<li key={index}>{synonym}</li>
												))}
											</div>
										)}
										{definition.antonyms && (
											<div>
												<h3>Antonyms:</h3>
												{definition.antonyms.map((antonym, index) => (
													<li key={index}>{antonym}</li>
												))}
											</div>
										)}
									</div>
								</div>
							))}
						</div>
					))}
				</div>
			)}
		</div>
	);
}
