import { getDeck } from '@/actions/deck';
import List from '@/components/list';
import { redirect } from 'next/navigation';
import Add from './add';
import Search from '@/app/dashboard/search/page';

export default async function EditPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { id } = await params;
	const deck = await getDeck(id);
	if (!deck) {
		redirect('/dashboard/deck');
	}
	return (
		<div className='flex flex-row h-full gap-2'>
			<List
				cards={deck.cards}
				className='max-h-[80vh] max-w-[20vw] w-1/5 overflow-hidden'
			/>
			<Add
				className='max-w-2/5 w-2/5'
				id={id}
			/>
			<div className='max-w-1/5 w-2/5 overflow-clip'>
				<Search />
			</div>
		</div>
	);
}
