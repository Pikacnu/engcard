import db from '@/lib/db';
import { DeckType, UserSettingsCollection } from '@/type';
import { auth } from '@/utils/auth';
import { WithId } from 'mongodb';

export async function getSettings(): Promise<UserSettingsCollection> {
	const session = await auth();
	if (!session) {
		throw new Error('Unauthorized');
	}
	let settings = await db
		.collection<UserSettingsCollection>('settings')
		.findOne({
			userId: session.user?.id,
		});
	if (!settings) {
		settings = {
			userId: session.user?.id || '',
			deckActionType: DeckType.ChangeByButton,
		} as WithId<UserSettingsCollection>;
		await db.collection<UserSettingsCollection>('settings').insertOne(settings);
	}
	return Object.assign(settings, {
		_id: settings._id.toString(),
	});
}

export async function updateSettings(
	name: keyof UserSettingsCollection,
	value: UserSettingsCollection[keyof UserSettingsCollection],
) {
	const session = await auth();
	if (!session) {
		throw new Error('Unauthorized');
	}
	const settings = await db
		.collection<UserSettingsCollection>('settings')
		.findOne({
			userId: session.user?.id,
		});
	if (!settings) {
		throw new Error('Settings not found');
	}
	await db.collection<UserSettingsCollection>('settings').updateOne(
		{
			userId: session.user?.id,
		},
		{
			$set: {
				[name]: value,
			},
		},
	);
}
