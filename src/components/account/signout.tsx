import { signOut } from '@/utils/auth';

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
				Sign Out
			</button>
		</form>
	);
}
