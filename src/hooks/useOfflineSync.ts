'use client';

import { useState, useCallback, useEffect } from 'react';
import { offlineDB } from '@/lib/offline-db';
import { DeckSelect, FSRSCardSelect } from '@/db/schema';
import { CardProps } from '@/type';
import { repeatCard } from '@/lib/fsrs';
import { Card } from 'ts-fsrs';
import { useDevice } from './useDevice';

export function useOfflineSync() {
  const [isSyncing, setIsSyncing] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const { isOnline } = useDevice();

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
        // Simple merge: keep local if local is newer (for now just overwrite)
        for (const item of data) {
          const local = await offlineDB.fsrsCards.get(item.fsrs.id);
          if (local && local.updatedAt && item.fsrs.updatedAt && local.updatedAt > item.fsrs.updatedAt) {
            continue;
          }
          await offlineDB.fsrsCards.put(item.fsrs);
        }
      });
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  const syncHistory = useCallback(async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/history/recent');
      if (res.ok) {
        const data = await res.json();
        await offlineDB.histories.clear();
        await offlineDB.histories.bulkPut(data);
      }

      const hotRes = await fetch('/api/history/hot');
      if (hotRes.ok) {
        const hotData = await hotRes.json();
        await offlineDB.hotWords.clear();
        await offlineDB.hotWords.bulkPut(hotData);
      }
    } catch (err) {
      console.error('Failed to sync history:', err);
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
      console.error('Failed to push pending reviews:', err);
    } finally {
      setIsSyncing(false);
    }
  }, []);

  useEffect(() => {
    if (isOnline) {
      pushPendingReviews();
    }
  }, [isOnline, pushPendingReviews]);

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
    async (cardId: string, rating: number) => {
      const cardFromLocal = await offlineDB.fsrsCards.get(cardId);
      if (!cardFromLocal) return false;

      // 1. Calculate next state locally
      const localCard: Card = {
        ...cardFromLocal,
        elapsed_days: cardFromLocal.elapsedDays,
        scheduled_days: cardFromLocal.scheduledDays,
        learning_steps: cardFromLocal.learningSteps,
        last_review: cardFromLocal.lastReview || undefined,
      };

      const { card: newCard, log: newLog } = repeatCard(localCard, rating);

      // 2. Update local DB immediately (CamelCase mapping)
      await offlineDB.transaction('rw', [offlineDB.fsrsCards, offlineDB.fsrsReviewLogs, offlineDB.pendingFSRS], async () => {
        await offlineDB.fsrsCards.put({
          ...cardFromLocal,
          due: newCard.due,
          stability: newCard.stability,
          difficulty: newCard.difficulty,
          elapsedDays: newCard.elapsed_days,
          scheduledDays: newCard.scheduled_days,
          reps: newCard.reps,
          lapses: newCard.lapses,
          state: newCard.state,
          lastReview: newCard.last_review || null,
          learningSteps: newCard.learning_steps,
          updatedAt: new Date(),
        });

        await offlineDB.fsrsReviewLogs.add({
          id: crypto.randomUUID(),
          fsrsCardId: cardId,
          rating: newLog.rating,
          state: newLog.state,
          due: newLog.due,
          stability: newLog.stability,
          difficulty: newLog.difficulty,
          elapsedDays: newLog.elapsed_days,
          lastElapsedDays: newLog.last_elapsed_days,
          scheduledDays: newLog.scheduled_days,
          review: newLog.review,
        });

        await offlineDB.pendingFSRS.put({
          id: cardId,
          rating,
          reviewedAt: new Date(),
        });
      });

      // 3. Try to sync if online
      if (navigator.onLine) {
        try {
          const res = await fetch('/api/history/fsrs', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cardId, rating }),
          });
          if (res.ok) {
            await offlineDB.pendingFSRS.delete(cardId);
            return true;
          }
        } catch (err) {
          console.warn('Online sync failed, will retry later', err);
        }
      }

      return false;
    },
    [],
  );

  return {
    isSyncing,
    error,
    isOnline,
    syncDecks,
    syncDeckCards,
    syncFSRSCards,
    syncHistory,
    pushPendingReviews,
    submitReview,
    prefetchAudio,
  };
}
