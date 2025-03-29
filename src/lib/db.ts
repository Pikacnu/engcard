import { Deck, Word } from '@/type';
import client from './client';

const dbName = process.env.NODE_ENV === 'development' ? 'test' : 'prod';

const db = client.db(dbName);

//init

export const words = db.collection<Word>('words');
(async () => {
	const exists = await words.indexExists('text');
	if (exists) {
		await words.createIndex({
			title: 'text',
			description: 'text',
			tags: 'text',
		});
	}
})();

export const decks = db.collection<Deck>('decks');

export default db;
