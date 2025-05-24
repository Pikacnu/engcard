'use client'; // Added

import { DeckCollection } from '@/type'; // Assuming WithId<Document> is handled by DeckCollection
import Link from 'next/link';
import { useEffect, useState } from 'react'; // Added
import { useSession } from 'next-auth/react'; // Added for client-side session
import { useTranslation } from '@/context/LanguageContext'; // Added

// If DeckCollection does not include _id, you might need to define a more specific type.
// For now, assuming DeckCollection has an _id property (e.g., from WithId<Document>)
interface MarketDeck extends DeckCollection {
	_id: string; // Ensure _id is part of the type
}

export default function Content() {
	const { t } = useTranslation(); // Added
	const [decks, setDecks] = useState<MarketDeck[]>([]);
	const [loading, setLoading] = useState(true); // Added loading state
	const { data: session } = useSession(); // Get session data
	const userId = session?.user?.id || '';

	useEffect(() => {
		async function fetchPublicDecks() {
			setLoading(true);
			try {
				// Fetch all public decks
				const resPublic = await fetch('/api/deck/public?type=full'); // Assuming this endpoint gives all public decks
				if (!resPublic.ok) {
					console.error('Failed to fetch public decks');
					setDecks([]);
					setLoading(false);
					return;
				}
				const publicDecksData = await resPublic.json();
				const allPublicDecks: MarketDeck[] = publicDecksData.decks || [];
				
				// Filter out decks belonging to the current user and decks with no cards
				const filteredDecks = allPublicDecks.filter(
					(deck) => deck.userId !== userId && deck.cards && deck.cards.length !== 0,
				);
				setDecks(filteredDecks);
			} catch (error) {
				console.error('Error fetching public decks:', error);
				setDecks([]);
			}
			setLoading(false);
		}

		if (userId) { // Only fetch if userId is available
			fetchPublicDecks();
		} else if (session === null) { // If session is explicitly null (not loading), means no user
             fetchPublicDecks(); // Still fetch, but userId will be empty string, so all public decks are shown
        }

	}, [userId, session]); // Re-fetch if userId changes

	if (loading) {
		return <div className="text-center text-gray-500 dark:text-gray-400 p-10">{t('common.loadingText')}</div>;
	}

	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 w-full max-w-screen-xl mx-auto'> {/* Responsive grid and centered content */}
			{decks.length !== 0 ? (
				decks.map((deck) => {
					return (
						<Link
							key={deck._id.toString()}
							className='flex flex-col gap-2 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200 ease-in-out'
							href={`/share?deck=${deck._id.toString()}`}
						>
							<h1 className='text-xl font-bold text-gray-800 dark:text-gray-100'>
								{t('market.deckNameLabel')} {deck.name} {/* Translated */}
							</h1>
							<p className="text-gray-600 dark:text-gray-300">
								{deck.cards.length} {t('market.cardsSuffix')} {/* Translated */}
							</p>
						</Link>
					);
				})
			) : (
				<div className='col-span-full row-span-4 text-center text-2xl font-bold flex items-center justify-center h-full text-gray-500 dark:text-gray-400'>
					<p>{t('market.noPublicDecks')}</p> {/* Translated */}
				</div>
			)}
		</div>
	);
}
