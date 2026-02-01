'use client';

import { useState, useCallback } from 'react';
import { offlineDB } from '@/lib/offline-db';
import { DeckSelect, FSRSCardSelect } from '@/db/schema';
import { CardProps } from '@/type';

export function useOfflineSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const syncFSRSCards = useCallback(async (deckId?: string) => {
    setIsSyncing(true);
    try {
      const url = deckId
        ? `/api/history/fsrs?deckId=${deckId}`
        : `/api/history/fsrs`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('Failed to fetch FSRS data');
      const data = (await res.json()) as {
        fsrs: FSRSCardSelect;
        card: CardProps;
      }[];

      await offlineDB.transaction('rw', [offlineDB.fsrsCards], async () => {
        for (const item of data) {
          await offlineDB.fsrsCards.put(item.fsrs);
        }
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const pushPendingReviews = useCallback(async () => {
    const pending = await offlineDB.pendingFSRS.toArray();
    if (pending.length === 0) return;

    setIsSyncing(true);
    try {
      for (const review of pending) {
        const res = await fetch('/api/history/fsrs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cardId: review.id,
            rating: review.rating,
          }),
        });
        if (res.ok) {
          await offlineDB.pendingFSRS.delete(review.id);
        }
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const syncDecks = useCallback(
    async (
      remoteDecks: Omit<
        DeckSelect,
        'allows' | 'userId' | 'updatedAt' | 'createdAt'
      >[],
    ) => {
      setIsSyncing(true);
      try {
        await offlineDB.transaction('rw', [offlineDB.decks], async () => {
          for (const deck of remoteDecks) {
            await offlineDB.decks.put({
              id: deck.id,
              name: deck.name,
              isPublic: deck.isPublic || false,
            });
          }
        });

        await offlineDB.syncMeta.put({
          key: 'decks_all',
          lastSyncedAt: new Date(),
        });
      } catch (err) {
        setError(err as Error);
        console.error('Failed to sync decks:', err);
      } finally {
        setIsSyncing(false);
      }
    },
    [],
  );

  const syncDeckCards = useCallback(
    async (
      deckId: string,
      remoteCards: (CardProps & {
        id?: string;
        _id?: string;
      })[],
    ) => {
      setIsSyncing(true);
      try {
        await offlineDB.transaction('rw', [offlineDB.cards], async () => {
          for (const card of remoteCards) {
            await offlineDB.cards.put({
              id:
                card.id ||
                card._id ||
                `${Math.random().toString(36).substring(2, 9)}`,
              deckId: deckId,
              word: card.word,
              phonetic: card.phonetic || null,
              audio: card.audio || null,
              blocks: card.blocks || null,
            });
          }
        });

        await offlineDB.syncMeta.put({
          key: `deck_cards_${deckId}`,
          lastSyncedAt: new Date(),
        });
      } catch (err) {
        setError(err as Error);
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

  const submitReview = useCallback(
    async (cardId: string, rating: number, fsrsCard?: FSRSCardSelect) => {
      // 1. Try online
      if (navigator.onLine) {
        try {
          const res = await fetch('/api/history/fsrs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cardId, rating }),
          });
          if (res.ok) return true;
        } catch (err) {
          console.warn('Online sync failed, falling back to offline', err);
        }
      }

      // 2. Offline fallback
      await offlineDB.pendingFSRS.put({
        id: cardId,
        rating,
        reviewedAt: new Date(),
      });

      // Update local FSRS card if provided (optional but good for UI)
      if (fsrsCard) {
        // Here we could use ts-fsrs to calculate next state locally
        // For now, at least mark it as "reviewed" locally so it doesn't show up in "Due" if we were clever
        // But the simplest is just to wait for the next sync
      }
      return false;
    },
    [],
  );

  return {
    isSyncing,
    error,
    syncDecks,
    syncDeckCards,
    syncFSRSCards,
    pushPendingReviews,
    submitReview,
    prefetchAudio,
  };
}
