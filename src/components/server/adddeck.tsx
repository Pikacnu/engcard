'use client';
import { useState } from 'react';
import { addDeck } from '@/actions/deck';

export default function AddDeck({ onSubmit }: { onSubmit?: () => void }) {
	const [name, setName] = useState('');
	const [isPublic, setPublic] = useState(false);

	return (
		<form
			onSubmit={async (e) => {
				e.preventDefault();
				await addDeck.bind(null, name, isPublic)();
				if (onSubmit) {
					onSubmit();
				}
			}}
			className=' flex flex-col items-center justify-center w-min h-min bg-gray-700 p-8 rounded-lg'
		>
			<input
				type='text'
				name='name'
				placeholder='Name'
				onChange={(e) => setName(e.target.value)}
				value={name}
				className='bg-inherit p-2 rounded-lg border-2 border-black outline-none'
			/>
			<div className='gap-2'>
				<input
					type='checkbox'
					name='public'
					id='public'
					onChange={(e) => setPublic(e.target.checked)}
					checked={isPublic}
				/>
				<label htmlFor='public'>Make this Deck to Public</label>
			</div>
			<input
				type='submit'
				className=' p-2 bg-black bg-opacity-40 rounded-lg'
			/>
		</form>
	);
}
