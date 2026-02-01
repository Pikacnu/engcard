'use client';

import { useState, useCallback } from 'react';
import { offlineDB } from '@/lib/offline-db';
import { DeckSelect } from '@/db/schema';

export function useOfflineSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const syncDecks = useCallback(async (remoteDecks: DeckSelect[]) => {
    setIsSyncing(true);
    try {
      await offlineDB.transaction('rw', [offlineDB.decks], async () => {
        for (const deck of remoteDecks) {
          await offlineDB.decks.put({
            id: deck.id,
            name: deck.name,
            userId: deck.userId || '',
            updatedAt: new Date(deck.updatedAt || Date.now()),
          });
        }
      });

      await offlineDB.syncMeta.put({
        key: 'decks_all',
        lastSyncedAt: new Date(),
      });
    } catch (err: any) {
      setError(err);
      console.error('Failed to sync decks:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const syncDeckCards = useCallback(
    async (deckId: string, remoteCards: any[]) => {
      setIsSyncing(true);
      try {
        await offlineDB.transaction('rw', [offlineDB.cards], async () => {
          for (const card of remoteCards) {
            await offlineDB.cards.put({
              id: card.id || card._id,
              deckId: deckId,
              word: card.word,
              phonetic: card.phonetic || null,
              audio: card.audio || null,
              blocks: card.blocks || null,
              order: card.order || 0,
              updatedAt: new Date(),
            });
          }
        });

        await offlineDB.syncMeta.put({
          key: `deck_cards_${deckId}`,
          lastSyncedAt: new Date(),
        });
      } catch (err: any) {
        setError(err);
        console.error(`Failed to sync cards for deck ${deckId}:`, err);
      } finally {
        setIsSyncing(false);
      }
    },
    [],
  );

  const prefetchAudio = useCallback(async (urls: (string | undefined)[]) => {
    const validUrls = Array.from(
      new Set(
        urls.filter((url): url is string => !!url && url.startsWith('http')),
      ),
    );

    await Promise.allSettled(
      validUrls.map((url) => fetch(url, { mode: 'no-cors' })),
    );
  }, []);

  return {
    isSyncing,
    error,
    syncDecks,
    syncDeckCards,
    prefetchAudio,
  };
}
