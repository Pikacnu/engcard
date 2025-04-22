import { NavBar } from '@/components/navbar';
import Image from 'next/image';

export default function DownloadPage() {
	return (
		<>
			<NavBar></NavBar>
			<div className='flex flex-col items-center justify-center min-h-screen bg-gray-700 w-full h-full p-4'>
				<h1 className='text-4xl font-bold text-white mb-4'>Download</h1>
				<p className='text-gray-300 text-lg mb-4'>
					Download the latest version of Cardlisher for your platform.
				</p>
				<div className='flex gap-4 bg-white bg-opacity-5 items-center justify-center mt-4 p-4'>
					<a
						href='/release/cardlisher-desktop.exe'
						className='bg-gray-600 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded mt-2 transition-all duration-200 flex gap-2'
					>
						<Image
							src='/platform/windows.svg'
							alt='Windows'
							width={24}
							height={24}
							className=''
						></Image>
						Windows
					</a>
					<a
						href='/release/cardlisher-android.apk'
						className='bg-gray-600 hover:bg-gray-800 text-white font-bold py-2 px-4 rounded mt-2 transition-all duration-200 flex gap-2'
					>
						<Image
							src='/platform/android.svg'
							alt='Android'
							width={24}
							height={24}
							className=''
						></Image>
						Android
					</a>
				</div>
			</div>
		</>
	);
}
