'use client';

import DeckPreview from '@/components/server/deck';
import { ObjectId, WithId, Document } from 'mongodb';
import { useEffect, useState, useCallback } from 'react';
import AddDeck from '@/components/server/adddeck';
import { deleteDeck, getShareDeck } from '@/actions/deck';
import Link from 'next/link';
import { redirect } from 'next/navigation';

type Deck = WithId<Document> & { name: string; public: boolean };

export default function Deck() {
	const [decks, setDecks] = useState<Deck[] | null>(null);
	const [deckId, setDeckId] = useState<ObjectId | null>(null);
	const [isOpenAddArea, setIsOpenAddArea] = useState(false);

	const updateDecks = useCallback(() => {
		fetch('/api/deck')
			.then((res) => res.json())
			.then((data) => {
				if (data.error) {
					return;
				}
				setDecks(data);
			});
	}, []);
	useEffect(() => {
		updateDecks();
	}, [updateDecks]);

	return (
		<div className='flex flex-col w-full h-full flex-grow'>
			{deckId && (
				<div className='absolute w-full h-screen overflow-hidden bg-black bg-opacity-40 top-0 left-0 flex items-center justify-center'>
					<DeckPreview
						deckId={`${deckId.toString()}`}
						onClose={() => setDeckId(null)}
					/>
				</div>
			)}
			{isOpenAddArea && (
				<div
					className='absolute w-full h-screen bg-black bg-opacity-40 top-0 left-0 flex items-center justify-center'
					onClick={(e) => {
						if (e.target === e.currentTarget) {
							setIsOpenAddArea(false);
						}
					}}
				>
					<AddDeck
						onSubmit={async () => {
							setIsOpenAddArea(false);
							updateDecks();
						}}
					/>
				</div>
			)}
			{decks === null ? (
				<div className='flex items-center justify-center h-[80vh]'>
					<svg
						aria-hidden='true'
						className='w-16 h-16 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600'
						viewBox='0 0 100 101'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
							fill='currentColor'
						/>
						<path
							d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
							fill='currentFill'
						/>
					</svg>
					<span className='sr-only'>Loading...</span>
				</div>
			) : (
				<div className=' p-4 flex-grow grid grid-cols-4 max-sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 lg:grid-rows-3 lg:gap-6 max-lg:grid-cols-2 max-lg:grid-rows-3 max-lg:gap-3 *:rounded-lg *:shadow-lg *:bg-black *:bg-opacity-25 '>
					{(decks &&
						decks.map((deck) => (
							<div
								className=' grid grid-cols-2 items-center justify-center p-2 bg-gray-700 gap-4 *:*:m-2'
								key={deck._id.toString()}
							>
								<div className='flex flex-col shadow-lg p-2 rounded-lg bg-blue-700 bg-opacity-70'>
									<h1>
										<p className=' border-2 inline p-1 m-1'>Name :</p>
										{deck.name}
									</h1>
									<h1>
										<p className=' border-2 inline p-1 m-1'>Public :</p>
										{deck.isPublic ? 'Yes' : 'No'}
									</h1>
									<button
										className='flex flex-col bg-black bg-opacity-40 p-2 rounded-lg'
										onClick={() => setDeckId(deck._id)}
									>
										Preview
									</button>
								</div>
								<div className='flex flex-col m-4 bg-green-600 bg-opacity-30 rounded-lg p-4 *:bg-opacity-80 *:rounded-md *:p-2'>
									{/*<h2>Options :</h2>*/}
									<Link
										className=' bg-gray-600 '
										href={`/dashboard/deck/edit/${deck._id.toString()}`}
									>
										Edit
									</Link>
									<button
										className=' bg-red-700'
										onClick={async () => {
											await deleteDeck.bind(null, deck._id.toString())();
											updateDecks();
										}}
									>
										Delete
									</button>
									<button
										className='bg-blue-700 bg-opacity-40'
										onClick={async () => {
											const searchparams = await getShareDeck(
												deck._id.toString(),
											);
											redirect(`/share?${searchparams}`);
										}}
									>
										Share
									</button>
								</div>
							</div>
						))) || (
						<h1 className='col-span-4 row-span-4 text-center'>
							No Decks Found
						</h1>
					)}

					<button
						className='shadow p-4 rounded-lg'
						onClick={() => setIsOpenAddArea(true)}
					>
						Add
					</button>
				</div>
			)}
		</div>
	);
}
