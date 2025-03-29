import { signOut } from '@/utils/auth';
import Image from 'next/image';

export default function SignOutButton({ className }: { className?: string }) {
	return (
		<form
			action={async () => {
				'use server';
				await signOut();
			}}
		>
			<button
				className={`p-2 m-2 text-black bg-teal-500 rounded-md ${className}`}
			>
				<Image
					src='/icons/box-arrow-in-left.svg'
					alt='logout'
					width={24}
					height={24}
					className='cursor-pointer'
				></Image>
			</button>
		</form>
	);
}
