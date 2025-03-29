import db from '@/lib/db';
import { WordHistory } from '@/type';
import { auth } from '@/utils/auth';

export async function getRecentlyHistory() {
	const session = await auth();
	if (!session) {
		return [];
	}
	const recentdata = db
		.collection<WordHistory>('history')
		.find(
			{
				userId: session.user?.id,
			},
			{ sort: { date: -1 }, limit: 10 },
		)
		.toArray();
	return recentdata;
}

export async function getHistoriesByDuraction({
	start,
	end,
}: {
	start?: Date;
	end?: Date;
}): Promise<WordHistory[]> {
	const session = await auth();
	if (!session) {
		return [];
	}
	const data = db
		.collection<WordHistory>('history')
		.find({
			userId: session.user?.id,
			date: { $gte: start, $lte: end },
		})
		.toArray();
	return data;
}

export async function getRecentHotWords(duraction: number) {
	const session = await auth();
	if (!session) {
		return [];
	}
	const data = await db
		.collection<WordHistory>('history')
		.aggregate([
			{
				$match: {
					userId: session.user?.id,
				},
			},
			{
				$group: {
					_id: '$words',
					count: { $sum: 1 },
				},
			},
			{
				$sort: { count: -1 },
			},
			{
				$limit: duraction,
			},
		])
		.toArray();

	return data;
}
