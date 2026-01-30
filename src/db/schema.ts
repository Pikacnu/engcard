import {
  timestamp,
  pgTable,
  text,
  primaryKey,
  integer,
  boolean,
  jsonb,
  uniqueIndex,
  index,
  uuid,
  vector,
  doublePrecision,
} from 'drizzle-orm/pg-core';
import { relations, type InferSelectModel } from 'drizzle-orm';
import type {
  Blocks,
  ChatSession,
  DeckType,
  OCRProcessType,
  LangEnum,
} from '@/type-shared';
import type { DictionaryItemMetadata } from '@/utils/ai/schema';
import { Rating, State } from 'ts-fsrs';

// info about pg vector https://orm.drizzle.team/docs/guides/vector-similarity-search

// --- Better Auth Tables ---

export const users = pgTable('user', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  emailVerified: boolean('emailVerified').default(false).notNull(),
  image: text('image'),
  createdAt: timestamp('createdAt').defaultNow().notNull(),
  updatedAt: timestamp('updatedAt')
    .defaultNow()
    .$onUpdate(() => /* @__PURE__ */ new Date())
    .notNull(),
});

export const sessions = pgTable(
  'session',
  {
    id: text('id').primaryKey(),
    expiresAt: timestamp('expiresAt').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text('ipAddress'),
    userAgent: text('userAgent'),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
  },
  (table) => [index('session_userId_idx').on(table.userId)],
);

export const accounts = pgTable(
  'account',
  {
    id: text('id').primaryKey(),
    accountId: text('accountId').notNull(),
    providerId: text('providerId').notNull(),
    userId: text('userId')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    accessToken: text('accessToken'),
    refreshToken: text('refreshToken'),
    idToken: text('idToken'),
    accessTokenExpiresAt: timestamp('accessTokenExpiresAt'),
    refreshTokenExpiresAt: timestamp('refreshTokenExpiresAt'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt')
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('account_userId_idx').on(table.userId)],
);

export const verifications = pgTable(
  'verification',
  {
    id: text('id').primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expiresAt').notNull(),
    createdAt: timestamp('createdAt').defaultNow().notNull(),
    updatedAt: timestamp('updatedAt')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('verification_identifier_idx').on(table.identifier)],
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
    //availableSearchTarget: text('availableSearchTarget').array(),
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

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, {
    fields: [sessions.userId],
    references: [users.id],
  }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, {
    fields: [accounts.userId],
    references: [users.id],
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

export const dictionaryItems = pgTable(
  'dictionary_items',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    term: text('term').notNull(),
    languageCode: text('language_code').array().notNull(),
    embedding: vector('embedding', { dimensions: 1536 }),
    metadata: jsonb('metadata').notNull().$type<DictionaryItemMetadata>(),
    createdAt: timestamp('created_at', { mode: 'date' }).defaultNow().notNull(),
  },
  (t) => [
    index('dictionary_items_embedding_idx').using(
      'hnsw',
      t.embedding.op('vector_cosine_ops'),
    ),
    index('dictionary_items_metadata_idx').using('gin', t.metadata),
  ],
);

export const FSRSCard = pgTable(
  'fsrs_card',
  {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: text('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    cardId: text('card_id')
      .notNull()
      .references(() => cards.id, { onDelete: 'cascade' }),

    // 核心數值：務必使用 doublePrecision
    due: timestamp('due', { mode: 'date' }).defaultNow().notNull(),
    stability: doublePrecision('stability').notNull(),
    difficulty: doublePrecision('difficulty').notNull(),

    elapsedDays: integer('elapsed_days').notNull(),
    scheduledDays: integer('scheduled_days').notNull(),
    reps: integer('reps').notNull(),
    lapses: integer('lapses').notNull(),
    state: integer('state').$type<State>().notNull(),
    learningSteps: integer('learning_steps').notNull(),

    // 第一次加入時沒有複習過，應為可空
    lastReview: timestamp('last_review', { mode: 'date' }),
  },
  (table) => [
    index('fsrs_card_user_id_idx').on(table.userId),
    index('fsrs_card_due_idx').on(table.due),
    uniqueIndex('fsrs_user_card_unique').on(table.userId, table.cardId),
  ],
);

export const FSRSReviewLog = pgTable('fsrs_review_log', {
  id: uuid('id').primaryKey().defaultRandom(),
  userId: text('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  // 類型必須匹配 FSRSCard.id (uuid)
  fsrsCardId: uuid('fsrs_card_id')
    .notNull()
    .references(() => FSRSCard.id, { onDelete: 'cascade' }),

  rating: integer('rating').$type<Rating>().notNull(),
  state: integer('state').$type<State>().notNull(),
  due: timestamp('due', { mode: 'date' }).notNull(),
  stability: doublePrecision('stability').notNull(),
  difficulty: doublePrecision('difficulty').notNull(),
  elapsedDays: integer('elapsed_days').notNull(),
  lastElapsedDays: integer('last_elapsed_days').notNull(),
  scheduledDays: integer('scheduled_days').notNull(),
  review: timestamp('review', { mode: 'date' }).defaultNow().notNull(),
});
export type FSRSCardSelect = InferSelectModel<typeof FSRSCard>;
export type FSRSReviewLogSelect = InferSelectModel<typeof FSRSReviewLog>;
