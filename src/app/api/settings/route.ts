import db from '@/lib/db';
import {
	DeckType,
	LangEnum,
	OCRProcessType,
	UserSettingsCollection,
} from '@/type';
import { auth } from '@/utils';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
	const url = new URL(req.url);
	const params = url.searchParams;

	const name = params.get('name') as keyof UserSettingsCollection;

	const session = await auth();

	if (!session) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}

	const result = await db
		.collection<UserSettingsCollection>('settings')
		.findOne({
			userId: session.user?.id || '',
		});

	if (!result) {
		const newSettings: UserSettingsCollection = {
			userId: session.user?.id || '',
			deckActionType: DeckType.AutoChangeToNext,
			ocrProcessType: OCRProcessType.FromSource,
			targetLang: LangEnum.EN,
			usingLang: LangEnum.TW,
		};
		const result = await db
			.collection<UserSettingsCollection>('settings')
			.insertOne(newSettings);
		if (!result) {
			return NextResponse.json(
				{ error: 'Failed to create settings' },
				{ status: 500 },
			);
		}
		if (!name) {
			return NextResponse.json(
				Object.assign(newSettings, {
					_id: result.insertedId.toString(),
				}),
			);
		}
		return NextResponse.json({ [name]: newSettings[name] });
	}

	if (!name) {
		return NextResponse.json(
			Object.assign(result, {
				_id: result?._id.toString(),
			}),
		);
	}

	return NextResponse.json({ [name]: result[name] });
}

export async function POST(req: Request) {
	const session = await auth();
	if (!session) {
		return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
	}
	const { name, value } = await req.json();
	if (!name || value === undefined) {
		return NextResponse.json({ error: 'Need two arguments' }, { status: 400 });
	}
	const result = await db
		.collection<UserSettingsCollection>('settings')
		.updateOne(
			{
				userId: session.user?.id || '',
			},
			{
				$set: {
					[name]: value,
				},
			},
		);
	if (!result) {
		return NextResponse.json(
			{ error: 'Failed to update settings' },
			{ status: 500 },
		);
	}
	return NextResponse.json({ [name]: value });
}
