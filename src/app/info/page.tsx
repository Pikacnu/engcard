import Link from 'next/link';

export default function Info() {
	return (
		<div className='flex flex-col items-center justify-center min-h-screen py-2 bg-gray-700 w-full'>
			<h1 className='text-2xl font-bold text-white'>Info</h1>
			<div className='flex items-center justify-center mt-4 gap-4 w-[80%] flex-wrap'>
				<Link href='/info/about'>
					<div className='bg-gray-600 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded transition-all duration-200 mb-2'>
						About
					</div>
				</Link>
				<Link href='/info/tos'>
					<div className='bg-gray-600 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded transition-all duration-200 mb-2'>
						Terms of Service
					</div>
				</Link>
				<Link href='/info/privacy'>
					<div className='bg-gray-600 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded transition-all duration-200 mb-2'>
						Privacy Policy
					</div>
				</Link>
			</div>
		</div>
	);
}
