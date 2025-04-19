import { NavBar } from '@/components/navbar';

export default function InfoLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className='flex flex-col items-center justify-center min-h-screen bg-gray-700 w-full h-full relative'>
			<NavBar />
			{children}
		</div>
	);
}
