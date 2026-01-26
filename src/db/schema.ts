import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  boolean,
  jsonb,
  uniqueIndex,
} from 'drizzle-orm/pg-core';
import { relations, type InferSelectModel } from 'drizzle-orm';
import type { AdapterAccountType } from 'next-auth/adapters';
import type {
  Blocks,
  ChatSession,
  DeckType,
  OCRProcessType,
  LangEnum,
} from '@/type-shared';

// --- Auth Tables (Standard for @auth/drizzle-adapter) ---

export const users = pgTable('user', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: text('name'),
  email: text('email').unique(),
  emailVerified: timestamp('emailVerified', { mode: 'date' }),
  image: text('image'),
});

export const accounts = pgTable(
  'account',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').$type<AdapterAccountType>().notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('providerAccountId').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (account) => [
    primaryKey({
      columns: [account.provider, account.providerAccountId],
    }),
  ],
);

export const sessions = pgTable('session', {
  sessionToken: text('sessionToken').primaryKey(),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { mode: 'date' }).notNull(),
});

export const verificationTokens = pgTable(
  'verificationToken',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { mode: 'date' }).notNull(),
  },
  (verificationToken) => [
    primaryKey({
      columns: [verificationToken.identifier, verificationToken.token],
    }),
  ],
);

export const authenticators = pgTable(
  'authenticator',
  {
    credentialID: text('credentialID').notNull().unique(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    providerAccountId: text('providerAccountId').notNull(),
    credentialPublicKey: text('credentialPublicKey').notNull(),
    counter: integer('counter').notNull(),
    credentialDeviceType: text('credentialDeviceType').notNull(),
    credentialBackedUp: boolean('credentialBackedUp').notNull(),
    transports: text('transports'),
  },
  (authenticator) => [
    primaryKey({
      columns: [authenticator.userId, authenticator.credentialID],
    }),
  ],
);

// --- Application Tables ---

// Decks
export const decks = pgTable('deck', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  name: text('name').notNull(),
  isPublic: boolean('isPublic').default(false).notNull(),
  allows: text('allows').array(), // For sharing permissions
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow().notNull(),
});

// Cards
export const cards = pgTable('card', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  deckId: text('deckId')
    .notNull()
    .references(() => decks.id, { onDelete: 'cascade' }),
  word: text('word').notNull(),
  phonetic: text('phonetic'),
  audio: text('audio'),
  flipped: boolean('flipped').default(false),
  blocks: jsonb('blocks').$type<Blocks[]>(),
  order: integer('order').default(0),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
});

// Word History
export const histories = pgTable('history', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  deckId: text('deckId'),
  words: text('words').array(),
  date: timestamp('date', { mode: 'date' }).defaultNow().notNull(),
});

// User Settings
export const settings = pgTable('settings', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .unique()
    .references(() => users.id, { onDelete: 'cascade' }),
  deckActionType: integer('deckActionType').default(1), // Default to ChangeByButton (1)
  ocrProcessType: integer('ocrProcessType').default(0), // Default to OnlyFromImage (0)
  targetLang: text('targetLang').default('zh-tw'),
  usingLang: text('usingLang').array().default(['zh-tw']),
});

// Chat Sessions
export const chatSessions = pgTable('chat', {
  id: text('id')
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  userId: text('userId')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  chatName: text('chatName'),
  history: jsonb('history').$type<ChatSession['history']>(),
  createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
  updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
});

// Word Cache
export const wordCache = pgTable(
  'word_cache',
  {
    word: text('word').notNull(),
    available: boolean('available').default(true),
    sourceLang: text('sourceLang').array(),
    targetLang: text('targetLang').notNull(),
    availableSearchTarget: text('availableSearchTarget').array(),
    data: jsonb('data'),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
    updatedAt: timestamp('updatedAt', { mode: 'date' }).defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.word, t.targetLang] })],
);

// Saved Decks (Public decks saved by users)
export const savedDecks = pgTable(
  'saved_deck',
  {
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    deckId: text('deckId')
      .notNull()
      .references(() => decks.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.userId, t.deckId] })],
);

// Share Links
export const shares = pgTable('share', {
  deckId: text('deckId')
    .primaryKey()
    .references(() => decks.id, { onDelete: 'cascade' }),
  isPublic: boolean('isPublic').default(false).notNull(),
  allows: text('allows').array(),
});

// --- Relations ---

export const usersRelations = relations(users, ({ one, many }) => ({
  accounts: many(accounts),
  sessions: many(sessions),
  decks: many(decks),
  histories: many(histories),
  settings: one(settings, {
    fields: [users.id],
    references: [settings.userId],
  }),
}));

export const decksRelations = relations(decks, ({ one, many }) => ({
  author: one(users, {
    fields: [decks.userId],
    references: [users.id],
  }),
  cards: many(cards),
  share: one(shares, {
    fields: [decks.id],
    references: [shares.deckId],
  }),
}));

export const sharesRelations = relations(shares, ({ one }) => ({
  deck: one(decks, {
    fields: [shares.deckId],
    references: [decks.id],
  }),
}));

export const cardsRelations = relations(cards, ({ one }) => ({
  deck: one(decks, {
    fields: [cards.deckId],
    references: [decks.id],
  }),
}));

export const markedWords = pgTable(
  'marked_word',
  {
    id: text('id')
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    word: text('word').notNull(),
    deckId: text('deckId')
      .notNull()
      .references(() => decks.id, { onDelete: 'cascade' }),
    createdAt: timestamp('createdAt', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [uniqueIndex('user_word_deck_unique').on(t.userId, t.word, t.deckId)],
);

// --- Inferred Types ---
export type SettingsSelect = InferSelectModel<typeof settings>;

export type UserSettingsCollection = Omit<
  SettingsSelect,
  'deckActionType' | 'ocrProcessType' | 'targetLang' | 'usingLang'
> & {
  deckActionType: DeckType;
  ocrProcessType: OCRProcessType;
  targetLang: LangEnum;
  usingLang: LangEnum[];
};

export type UserSettings = Omit<UserSettingsCollection, 'userId' | 'id'>;
