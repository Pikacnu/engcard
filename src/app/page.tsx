import Link from 'next/link';
import { NavBar } from './../components/navbar';

export default function Home() {
	return (
		<div className='flex flex-col items-center h-screen p-0 bg-gradient-to-b from-gray-800 to-gray-900 w-full overflow-y-auto'>
			<NavBar />
			<div className='flex items-center flex-col w-full mt-8 px-4 pb-8'>
				<h1 className='flex flex-col sm:flex-row items-center justify-center mb-6 text-center'>
					<span className='text-5xl md:text-6xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500 tracking-wide p-2'>
						English Card
					</span>
					<span className='text-xl sm:text-2xl font-bold text-blue-300 sm:ml-2 mt-2 sm:mt-0 p-2'>
						Learn English. More Effectively.
					</span>
				</h1>
				<p className='text-gray-200 text-xl mt-4 max-w-2xl text-center leading-relaxed'>
					English Card is a flashcard app designed for vocabulary learning,
					featuring Image recognition, and interactive practice to help you
					efficiently memorize and review English words.
				</p>
				<div className='mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 w-full max-w-6xl flex-grow'>
					<div className='bg-white bg-opacity-5 backdrop-blur-sm rounded-xl p-8 flex flex-col items-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-700 hover:border-blue-500'>
						<span className='text-5xl mb-4'>🗂️</span>
						<p className='text-white font-semibold text-lg mb-2'>
							Card Management
						</p>
						<p className='text-gray-300 text-center'>
							Create, edit, and delete flashcards to flexibly manage your
							learning content.
						</p>
					</div>
					<div className='bg-white bg-opacity-5 backdrop-blur-sm rounded-xl p-8 flex flex-col items-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-700 hover:border-blue-500'>
						<span className='text-5xl mb-4'>📷</span>
						<p className='text-white font-semibold text-lg mb-2'>
							Image Import
						</p>
						<p className='text-gray-300 text-center'>
							Upload images of words and texts to automatically generate
							flashcards using OCR technology.
						</p>
					</div>
					<div className='bg-white bg-opacity-5 backdrop-blur-sm rounded-xl p-8 flex flex-col items-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-700 hover:border-blue-500'>
						<span className='text-5xl mb-4'>🤖</span>
						<p className='text-white font-semibold text-lg mb-2'>
							AI Word Processing
						</p>
						<p className='text-gray-300 text-center'>
							Advanced AI to analyze words, provide definitions, examples, and
							generate relevant practice exercises.
						</p>
					</div>
					<div className='bg-white bg-opacity-5 backdrop-blur-sm rounded-xl p-8 flex flex-col items-center transform transition-all duration-300 hover:scale-105 hover:shadow-xl border border-gray-700 hover:border-blue-500'>
						<span className='text-5xl mb-4'>📊</span>
						<p className='text-white font-semibold text-lg mb-2'>
							Progress Tracking
						</p>
						<p className='text-gray-300 text-center'>
							Monitor your learning journey with detailed analytics and
							performance insights to optimize your study strategy.
						</p>
					</div>
				</div>
				<div className='flex flex-col sm:flex-row gap-4 mt-14 mb-20'>
					<Link
						href='/dashboard'
						className='bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 px-8 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 text-center'
					>
						Get Started
					</Link>
					<Link
						href='https://github.com/Pikacnu/engcard'
						target='_blank'
						className='bg-gray-800 hover:bg-gray-900 text-white font-bold py-4 px-8 rounded-full transition-all duration-200 shadow-lg hover:shadow-xl border border-gray-700 hover:border-gray-600 transform hover:-translate-y-1 text-center mt-4 sm:mt-0'
					>
						GitHub
					</Link>
				</div>
			</div>
		</div>
	);
}
