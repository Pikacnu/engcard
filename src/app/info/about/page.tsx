import Link from 'next/link';

export default function About() {
	return (
		<div className='flex flex-col items-center min-h-screen py-2 bg-gray-700 w-full max-h-[calc(100vh-200px)]'>
			<h1 className='text-2xl font-bold text-white'>About</h1>
			<div className='flex flex-col items-start mt-4 w-full px-4 [&>p]:px-4'>
				<h2 className=' text-xl'>Creator:</h2>
				<p className='text-white'>Pikacnu</p>
				<h2 className=' text-xl'>Email:</h2>
				<p>
					<Link href='mailto:pika@mail.pikacnu.com'>pika@mail.pikacnu.com</Link>
				</p>
				<h2 className=' text-xl'>Version:</h2>
				<p className='text-white'>0.0.1</p>
			</div>
		</div>
	);
}
