'use client';
import List from '@/components/list';
import Add from './add';
import Search from '@/app/dashboard/search/page';
import { use, useCallback, useEffect, useState } from 'react';
import { DeckCollection } from '@/type';

export default function EditPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = use(params);
	const [deck, setDeck] = useState<DeckCollection | null>();

	const refresh = useCallback(() => {
		fetch(`/api/deck?id=${id}`)
			.then((res) => res.json())
			.then((data) => {
				if (data.error) {
					return;
				}
				console.log(data);
				setDeck(data);
			});
	}, [id]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	return (
		<div className='flex flex-row h-full gap-2'>
			<List
				cards={deck ? deck.cards : []}
				className='max-h-full max-w-[20vw] w-1/5 overflow-hidden'
			/>
			<Add
				className='max-w-2/5 w-2/5'
				id={id}
			/>
			<div className='max-w-1/5 w-2/5 overflow-clip'>
				<Search
					addInfo={{
						deckid: id,
						onAdd: refresh,
					}}
				/>
			</div>
		</div>
	);
}
