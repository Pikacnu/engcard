import { db } from '@/db';
import { decks } from '@/db/schema';
import { auth } from '@/utils/auth';
import { eq } from 'drizzle-orm';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
	const url = new URL(request.url);
	const params = url.searchParams;
	const id = params.get('id');

	const user = await auth();
	const userId = user?.user?.id || '';
	
	if (!id) {
		if (!user) {
			// If user is not logged in, return public decks
            const publicDecks = await db.query.decks.findMany({
                where: eq(decks.isPublic, true),
                with: {
                    cards: true
                }
            });

			const deckData = publicDecks.map((deck) => ({
                id: deck.id,
                _id: deck.id, // Compat
                name: deck.name,
                isPublic: deck.isPublic,
                cards_length: deck.cards.length,
            }));
			return NextResponse.json(deckData);
		}
		
        // If user is logged in, return their decks
        const userDecks = await db.query.decks.findMany({
            where: eq(decks.userId, userId),
            with: {
                cards: true
            }
        });

		const deckData = userDecks.map((deck) => ({
			_id: deck.id,
            id: deck.id,
			name: deck.name,
			isPublic: deck.isPublic,
			cards_length: deck.cards.length,
		}));
		return NextResponse.json(deckData);
	}
    
	if (id.trim().length === 0) {
		return NextResponse.json({ error: 'Deck ID is required' }, { status: 400 });
	}

    const deck = await db.query.decks.findFirst({
        where: eq(decks.id, id),
        with: {
            cards: true
        }
    });

	if (!deck) {
		return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
	}
	if (deck.isPublic) {
		// If deck is public, return it
		return NextResponse.json({ ...deck, _id: deck.id });
	}
	if (deck.userId !== userId) {
		// If deck is not public and user is not the owner, return 403
		return NextResponse.json(
			{ error: 'You are not authorized to access this deck' },
			{ status: 403 },
		);
	}
	// If deck is not public and user is the owner, return it
	return NextResponse.json({ ...deck, _id: deck.id });
}

export async function POST(req: NextRequest) {
	const user = await auth();
	if (!user) {
		return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
	}
	const userId = user.user?.id;
    if (!userId) {
		return NextResponse.json({ error: 'Not authorized' }, { status: 401 });
    }

	const { name, isPublic } = await req.json();
    
    const [newDeck] = await db.insert(decks).values({
        userId: userId,
        name: name || 'New Deck',
        isPublic: isPublic || false
    }).returning();

	return NextResponse.json({ ...newDeck, _id: newDeck.id });
}
