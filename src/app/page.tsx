import Link from 'next/link';
import { NavBar } from './../components/navbar';

export default function Home() {
	return (
		<div className='flex flex-col items-center justify-center min-h-max flex-grow p-0 bg-gray-700 w-full h-full'>
			<NavBar />
			<div className='flex-grow flex items-center justify-center flex-col'>
				<h1 className='flex items-center justify-center'>
					<span className='text-4xl font-bold text-white'>Cardlisher</span>
					<span className='text-2xl font-bold text-white'>.</span>
				</h1>
				<p className='text-gray-300 text-lg mt-2'>
					A flashcard app for learning vocabulary.
				</p>
			</div>

			<div className='flex gap-4 bg-white bg-opacity-5 items-center justify-center p-4 w-full max-w-4xl'>
				<p>Quick Link:</p>
				<Link
					href='/tempword'
					className='bg-gray-600 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded transition-all duration-200'
				>
					7000 單 owob
				</Link>
			</div>
		</div>
	);
}
