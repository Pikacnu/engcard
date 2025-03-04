'use client';

import DeckPreview from '@/components/server/deck';
import { ObjectId, WithId, Document } from 'mongodb';
import { useEffect, useState, useCallback } from 'react';
import AddDeck from '@/components/server/adddeck';
import { deleteDeck } from '@/actions/deck';
import Link from 'next/link';

type Deck = WithId<Document> & { name: string; public: boolean };

const delay = 500;

export default function Deck() {
	const [decks, setDecks] = useState<Deck[]>([]);
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
		<>
			{deckId && (
				<DeckPreview
					deckId={deckId.toString()}
					onClose={() => setDeckId(null)}
				/>
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
						onSubmit={() => {
							setIsOpenAddArea(false);
							setTimeout(() => {
								updateDecks();
							}, delay);
						}}
					/>
				</div>
			)}
			<div className=' h-full flex-grow grid grid-cols-4 lg:grid-rows-3 lg:gap-6 max-lg:grid-cols-2 max-lg:grid-rows-3 max-lg:gap-3 *:rounded-lg *:shadow-lg *:bg-black *:bg-opacity-25 '>
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
									{deck.public ? 'Yes' : 'No'}
								</h1>
								<button
									className='flex flex-col bg-black bg-opacity-40 p-2 rounded-lg'
									onClick={() => setDeckId(deck._id)}
								>
									Preview
								</button>
							</div>
							<div className='flex flex-col m-4 bg-green-600 bg-opacity-30 rounded-lg p-4 *:bg-opacity-80 *:rounded-md *:p-2'>
								<h2>Options :</h2>
								<Link
									className=' bg-gray-600 '
									href={`/dashboard/deck/edit/${deck._id.toString()}`}
								>
									Edit
								</Link>
								<button
									className=' bg-red-700'
									onClick={() => {
										deleteDeck.bind(null, deck._id.toString())();
										setTimeout(() => {
											updateDecks();
										}, delay);
									}}
								>
									Delete
								</button>
							</div>
						</div>
					))) || (
					<h1 className='col-span-4 row-span-4 text-center'>No Decks Found</h1>
				)}

				<button
					className='shadow p-4 rounded-lg'
					onClick={() => setIsOpenAddArea(true)}
				>
					Add
				</button>
			</div>
		</>
	);
}
