import Link from 'next/link';
import Image from 'next/image';

export function NavBar() {
	return (
		<div className='sickey top-0 z-10 flex items-center justify-between w-full bg-white bg-opacity-30 backdrop-blur-sm shadow-lg '>
			<div className='flex items-center justify-center'>
				<Link
					href={'/'}
					className='flex items-center justify-center p-2 m-2 text-white bg-white bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-full'
				>
					<Image
						src={`/icons/home.svg`}
						width={24}
						height={24}
						alt='Home'
					/>
				</Link>
				<Link
					href={'/info'}
					className='flex items-center justify-center p-2 m-2 text-white bg-white bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-full'
				>
					<Image
						src={`/icons/info.svg`}
						width={24}
						height={24}
						alt='Info'
					/>
				</Link>
				<Link
					href={'/market'}
					className='flex items-center justify-center p-2 m-2 text-white bg-white bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-full'
				>
					<Image
						src={`/icons/shop.svg`}
						width={24}
						height={24}
						alt='Market'
					/>
				</Link>
				<Link
					href={'/download'}
					className='flex items-center justify-center p-2 m-2 text-white bg-white bg-opacity-0 hover:bg-opacity-20 transition-all duration-200 rounded-full'
				>
					<Image
						src={`/icons/download.svg`}
						width={24}
						height={24}
						alt='Download'
					/>
				</Link>
			</div>
			<Link
				href={'/auth/login'}
				className='text-black self-center min-w-max
							bg-white bg-opacity-0 hover:bg-opacity-10 transition-all duration-200 p-2 m-2 hover:shadow-xl shadow-white rounded-full'
			>
				<Image
					src={`/icons/box-arrow-in-left.svg`}
					width={24}
					height={24}
					alt='Login'
				/>
			</Link>
		</div>
	);
}
