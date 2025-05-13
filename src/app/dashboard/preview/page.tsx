import { Suspense } from 'react';
import Content from './content';

export default function Preview() {
	return (
		<Suspense>
			<Content />
		</Suspense>
	);
}
