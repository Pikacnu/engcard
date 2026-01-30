import {
  createEmptyCard,
  formatDate,
  fsrs,
  generatorParameters,
  Rating,
  Grades,
} from 'ts-fsrs';

const params = generatorParameters({
  enable_fuzz: true,
  enable_short_term: true,
});

const f = fsrs(params);
const card = createEmptyCard(new Date());
const scheduling_cards = f.repeat(card, 10);

for (const item of scheduling_cards) {
  // grades = [Rating.Again, Rating.Hard, Rating.Good, Rating.Easy]
  const grade = item.log.rating;
  const { log, card } = item;
  console.group(`${Rating[grade]}`);
  console.table({
    [`card_${Rating[grade]}`]: {
      ...card,
      due: formatDate(card.due),
      last_review: formatDate(card.last_review as Date),
    },
  });
  console.table({
    [`log_${Rating[grade]}`]: {
      ...log,
      review: formatDate(log.review),
    },
  });
  console.groupEnd();
  console.log(
    '----------------------------------------------------------------',
  );
}
