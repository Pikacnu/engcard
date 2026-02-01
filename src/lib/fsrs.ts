'use client';

import { FSRSCardSelect } from '@/db/schema';
import {
  createEmptyCard,
  Card,
  fsrs,
  generatorParameters,
  Rating,
  RecordLogItem,
  FSRSParameters,
} from 'ts-fsrs';

export const getFSRS = (userParams?: Partial<FSRSParameters>) => {
  const params = generatorParameters({
    enable_fuzz: true,
    ...userParams,
  });
  return fsrs(params);
};

export const defaultFSRS = getFSRS();

export const toFSRSCard = (data: FSRSCardSelect): Card => ({
  due: data.due,
  stability: data.stability,
  difficulty: data.difficulty,
  elapsed_days: data.elapsedDays,
  scheduled_days: data.scheduledDays,
  reps: data.reps,
  lapses: data.lapses,
  state: data.state,
  last_review: data.lastReview || undefined,
  learning_steps: data.learningSteps,
});

export const createInitialFSRSCard = (userId: string, cardId: string) => {
  const emptyCard = createEmptyCard(new Date());
  return {
    userId,
    cardId,
    due: emptyCard.due,
    stability: emptyCard.stability,
    difficulty: emptyCard.difficulty,
    elapsedDays: emptyCard.elapsed_days,
    scheduledDays: emptyCard.scheduled_days,
    reps: emptyCard.reps,
    lapses: emptyCard.lapses,
    state: emptyCard.state,
    lastReview: emptyCard.last_review,
    learningSteps: emptyCard.learning_steps,
  };
};

export const repeatCard = (
  card: Card,
  rating: Rating,
  now: Date = new Date(),
): RecordLogItem => {
  const sc = defaultFSRS.repeat(card, now) as unknown as Record<
    string,
    RecordLogItem
  >;
  const ratingKey = Rating[rating];

  const result = sc[ratingKey];
  if (!result) {
    return sc['Good'];
  }
  return result;
};
