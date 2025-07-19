'use client'; // Added

import { DeckCollection, Lang } from '@/type'; // Assuming WithId<Document> is handled by DeckCollection
import Link from 'next/link';
import { useCallback, useEffect, useState } from 'react'; // Added
import { useSession } from 'next-auth/react'; // Added for client-side session
import { useTranslation } from '@/context/LanguageContext'; // Added
import { LangCodeToName } from '@/types/lang';

interface MarketDeck extends Pick<DeckCollection, 'name' | 'isPublic'> {
	_id: string;
	cardInfo: {
		length: number;
		langs: Lang[];
	};
}

export default function Content() {
	const { t } = useTranslation(); // Added
	const [decks, setDecks] = useState<MarketDeck[]>([]);
	const [loading, setLoading] = useState(true);
	const { data: session } = useSession();
	const userId = session?.user?.id || '';

	const fetchPublicDecks = useCallback(async () => {
		setLoading(true);
		try {
			const resPublic = await fetch('/api/deck/public?type=full');
			if (!resPublic.ok) {
				console.error('Failed to fetch public decks');
				setDecks([]);
				setLoading(false);
				return;
			}
			const publicDecksData = await resPublic.json();
			const allPublicDecks: MarketDeck[] = publicDecksData.decks || [];
			const filteredDecks = allPublicDecks.filter(
				(deck) => deck.cardInfo.length !== 0,
			);
			setDecks(filteredDecks);
		} catch (error) {
			console.error('Error fetching public decks:', error);
			setDecks([]);
		}
		setLoading(false);
		if (userId) {
			fetchPublicDecks();
		} else if (session === null) {
			fetchPublicDecks();
		}
	}, [userId, session]);

	useEffect(() => {
		fetchPublicDecks();
	}, [fetchPublicDecks]);

	if (loading) {
		return (
			<div className='text-center text-gray-500 dark:text-gray-400 p-10'>
				{t('common.loadingText')}
			</div>
		);
	}

	return (
		<div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 p-4 w-da max-w-screen-xl mx-auto'>
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
							<p className='text-gray-600 dark:text-gray-300'>
								{deck.cardInfo.length} {t('market.cardsSuffix')}{' '}
							</p>
							<p>
								{t('market.languagesLabel')}{' '}
								{deck.cardInfo.langs.length > 0
									? deck.cardInfo.langs
											.map((lang) => LangCodeToName(lang))
											.join(', ')
									: t('market.noLanguages')}
							</p>
						</Link>
					);
				})
			) : (
				<div className='col-span-full row-span-4 text-center text-2xl font-bold flex items-center justify-center h-full text-gray-500 dark:text-gray-400'>
					<p>{t('market.noPublicDecks')}</p>
				</div>
			)}
		</div>
	);
}
