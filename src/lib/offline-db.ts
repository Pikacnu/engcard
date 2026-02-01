import Dexie, { type Table } from 'dexie';
import type { Blocks } from '@/type-shared';

export interface OfflineDeck {
  id: string; // UUID from Server
  name: string;
  userId: string;
  updatedAt: Date;
}

export interface OfflineCard {
  id: string; // UUID from Server
  deckId: string;
  word: string;
  phonetic: string | null;
  audio: string | null;
  blocks: Blocks[] | null;
  order: number;
  updatedAt: Date;
}

export interface SyncMeta {
  key: string; // e.g., 'decks_all' or 'deck_123'
  lastSyncedAt: Date;
}

export class CardlisherOfflineDB extends Dexie {
  decks!: Table<OfflineDeck>;
  cards!: Table<OfflineCard>;
  syncMeta!: Table<SyncMeta>;

  constructor() {
    super('CardlisherDB');
    this.version(2).stores({
      decks: 'id, userId, updatedAt',
      cards: 'id, deckId, word',
      syncMeta: 'key',
    });
  }
}

export const offlineDB = new CardlisherOfflineDB();
export default offlineDB;
