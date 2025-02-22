'use client';

import { CardProps } from '@/type';
import { useState } from 'react';
import Spell from './spell';

export default function Questions({ cards }: { cards: CardProps[] }) {
	const [index, setIndex] = useState(0);
	return (
		<div className='flex flex-col h-full w-[40vw] min-w-[20vw]'>
			<Spell
				card={cards[index]}
				onAnsweredClick={() => {
					setIndex((prev) => {
						if (prev === cards.length - 1) return prev;
						return prev + 1;
					});
				}}
			></Spell>
		</div>
	);
}
