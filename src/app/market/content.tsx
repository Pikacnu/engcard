'use server';

import db from '@/lib/db';
import { auth } from '@/utils';
import { DeckCollection } from '@/type';
import Link from 'next/link';

export async function Content() {
	const publicDecks = await db
		.collection<DeckCollection>('deck')
		.find({ isPublic: true })
		.toArray();
	const userData = await auth();
	const userId = userData?.user?.id || '';
	const decks = publicDecks.filter((deck) => {
		return deck.userId !== userId && deck.cards.length !== 0;
	});
	return (
		<div className='grid grid-cols-4 max-md:grid-cols-2 grid-rows-4 gap-4 flex-grow h-svh w-[80%]'>
			{decks.length !== 0 ? (
				decks.map((deck) => {
					return (
						<Link
							key={deck._id.toString()}
							className='flex flex-col gap-2 bg-gray-800 p-4 rounded-lg hover:shadow-lg hover:bg-opacity-70 transition-all duration-200 ease-in-out'
							href={`/share?deck=${deck._id.toString()}`}
						>
							<h1 className='text-xl font-bold'>Name : {deck.name}</h1>
							<p>{deck.cards.length} cards</p>
						</Link>
					);
				})
			) : (
				<h1 className='col-span-4 row-span-4 text-center text-2xl font-bold items-center h-full justify-center text-gray-300 flex'>
					<p>No Public Decks Found</p>
				</h1>
			)}
		</div>
	);
}
