import SignOutButton from '@/components/account/signout';

export default function DashBoard() {
	return (
		<div className='flex flex-col items-center justify-center h-full'>
			<h1 className='text-4xl font-bold'>Dashboard</h1>
			<SignOutButton />
		</div>
	);
}
