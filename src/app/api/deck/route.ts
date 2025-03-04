import db from '@/lib/db';
import { auth } from '@/utils/auth';
import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
	const user = await auth();
	if (!user) {
		return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
	}
	const userId = user.user?.id;
	const decks = await db.collection('deck').find({ userId }).toArray();
	return NextResponse.json(decks);
}

export async function POST(req: NextRequest) {
	const user = await auth();
	if (!user) {
		return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
	}
	const userId = user.user?.id;
	const { name, isPublic } = await req.json();
	const deck = await db
		.collection('deck')
		.insertOne({ name, isPublic, userId });
	return NextResponse.json(deck);
}
