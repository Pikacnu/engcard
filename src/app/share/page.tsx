import { Suspense } from 'react';
import Preview from './Page-Main';

export default function Page() {
	return (
		<Suspense>
			<Preview />
		</Suspense>
	);
}
