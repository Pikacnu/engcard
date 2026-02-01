import Dexie, { type Table } from 'dexie';
import type { Blocks } from '@/type-shared';
import { FSRSCardSelect, FSRSReviewLogSelect } from '@/db/schema';

export interface OfflineDeck {
  id: string; // UUID from Server
  name: string;
  isPublic?: boolean;
}

export interface OfflineCard {
  id: string; // UUID from Server
  deckId: string;
  word: string;
  phonetic: string | null;
  audio: string | null;
  blocks: Blocks[] | null;
}

export type OfflineFSRSCard = Omit<FSRSCardSelect, 'userId'> & {
  updatedAt?: Date;
};

export type OfflineFSRSReviewLog = Omit<FSRSReviewLogSelect, 'userId'>;

export interface SyncMeta {
  key: string; // e.g., 'decks_all', 'deck_123', 'fsrs_all'
  lastSyncedAt: Date;
}

export interface OfflineHistory {
  id: string;
  words: string[];
  date: Date;
}

export interface OfflineHotWord {
  word: string;
  count: number;
}

export class CardlisherOfflineDB extends Dexie {
  decks!: Table<OfflineDeck>;
  cards!: Table<OfflineCard>;
  syncMeta!: Table<SyncMeta>;
  fsrsCards!: Table<OfflineFSRSCard>;
  fsrsReviewLogs!: Table<OfflineFSRSReviewLog>;
  histories!: Table<OfflineHistory>;
  hotWords!: Table<OfflineHotWord>;
  pendingFSRS!: Table<{
    id: string; // cardId
    rating: number;
    reviewedAt: Date;
  }>;

  constructor() {
    super('CardlisherDB');
    this.version(4).stores({
      decks: 'id, userId, updatedAt, isPublic',
      cards: 'id, deckId, word',
      fsrsCards: 'id, cardId, due, state, updatedAt',
      fsrsReviewLogs: 'id, fsrsCardId, review',
      histories: 'id, date',
      hotWords: 'word, count',
      pendingFSRS: 'id',
      syncMeta: 'key',
    });
  }
}

export const offlineDB = new CardlisherOfflineDB();
export default offlineDB;
