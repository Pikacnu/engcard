'use client';

import { useEffect, useState } from 'react';

export default function SpeedReview() {
	const [words, setWords] = useState<string[]>([]);
	const [index, setIndex] = useState(0);
	useEffect(() => {
		const fetchWords = async () => {
			const response = await fetch('/api/history/mark');
			if (!response.ok) {
				console.log('Failed to fetch words:', response.statusText);
				return;
			}
			const data = await response.json();
			setWords(data.words);
		};
		fetchWords();
	});

	return (
		<div className='flex flex-col items-center justify-center w-full h-full'>
			<div className='flex flex-col items-center justify-center w-full h-full'>
				<p>
					<span>{words.length > 0 ? words[index] : 'No words available'}</span>
				</p>
				{words.length > 0 && (
					<button
						className='text-blue-500 hover:text-blue-700 cursor-pointer'
						onClick={() => {
							if (index < words.length - 1) {
								setIndex(index + 1);
							} else {
								setIndex(0); // Reset to the first word
							}
						}}
					>
						<span>Next Word</span>
					</button>
				)}
			</div>
		</div>
	);
}
