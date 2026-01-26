import { db } from '@/db';
import { histories } from '@/db/schema';
import { eq, and, desc, gte, lte, count } from 'drizzle-orm';
import { auth } from '@/utils/auth';

export async function getRecentlyHistory() {
	const session = await auth();
	if (!session || !session.user?.id) {
		return [];
	}
	const recentdata = await db.query.histories.findMany({
		where: eq(histories.userId, session.user.id),
		orderBy: [desc(histories.date)],
		limit: 10,
	});
	
	// Map id to _id for backward compatibility if needed, or just return as is matching WordHistory type + id
	return recentdata.map(h => ({ ...h, _id: h.id }));
}

export async function getHistoriesByDuraction({
	start,
	end,
}: {
	start?: Date;
	end?: Date;
}) {
	const session = await auth();
	if (!session || !session.user?.id) {
		return [];
	}
	
	const whereClause = [eq(histories.userId, session.user.id)];
	if (start) whereClause.push(gte(histories.date, start));
	if (end) whereClause.push(lte(histories.date, end));

	const data = await db.query.histories.findMany({
		where: and(...whereClause),
	});

	return data.map(h => ({ ...h, _id: h.id }));
}

export async function getRecentHotWords(duraction: number) {
	const session = await auth();
	if (!session || !session.user?.id) {
		return [];
	}
	
	const data = await db
		.select({
			_id: histories.words,
			count: count(),
		})
		.from(histories)
		.where(eq(histories.userId, session.user.id))
		.groupBy(histories.words)
		.orderBy(desc(count()))
		.limit(duraction);

	return data;
}
