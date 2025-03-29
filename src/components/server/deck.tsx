'use client';
import { getDeck } from '@/actions/deck';
import Deck from '@/components/deck';
import { DeckCollection } from '@/type';
import { WithId } from 'mongodb';
import { useEffect, useState } from 'react';

export default function DeckPreview({
	deckId,
	onClose,
}: {
	deckId: string;
	onClose: () => void;
}) {
	const [deck, setDeck] = useState<DeckCollection | null>(null);
	const [loaded, setLoaded] = useState(false);
	console.log(deckId);
	useEffect(() => {
		getDeck
			.bind(null, deckId)()
			.then((deck: WithId<DeckCollection>) => {
				setLoaded(true);
				if (!deck) {
					return;
				}
				setDeck(deck);
			});
	}, [deckId]);
	if (!loaded) {
		return (
			<div className='flex items-center justify-between w-full rounded-xl bg-yellow-300 bg-opacity-70 m-2 p-2'>
				<h1>Loading</h1>
				<button
					onClick={() => {
						onClose();
					}}
				>
					Close
				</button>
			</div>
		);
	}
	if (!deck || !deck.cards || deck.cards.length === 0) {
		return (
			<div className='flex items-center justify-between w-full rounded-xl bg-red-600 bg-opacity-70 m-2 p-2'>
				<h1>Deck not found</h1>
				<button
					onClick={() => {
						onClose();
					}}
				>
					Close
				</button>
			</div>
		);
	}
	return (
		<div className='absoulte w-full h-screen bg-black bg-opacity-20 top-0 left-0 items-center justify-center flex'>
			<button
				className='absolute top-0 right-0 p-2 m-2 rounded-md bg-blue-600 text-white'
				onClick={() => {
					onClose();
				}}
			>
				Close
			</button>
			{deck && <Deck cards={deck.cards} />}
		</div>
	);
}
