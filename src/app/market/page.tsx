import { Suspense } from 'react';
import Content from './content';

export default function Market() {
	return (
		<div className='flex flex-col items-center justify-center min-h-screen py-2 bg-gray-700 w-full mt-16'>
			<h1>
				<span className='text-2xl font-bold text-white'>
					Market(Explore Public Decks)
				</span>
			</h1>
			<Suspense fallback={<div>Loading...</div>}>
				<Content></Content>
			</Suspense>
		</div>
	);
}
