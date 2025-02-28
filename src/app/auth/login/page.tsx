import SignInButton from '@/components/account/signin';
import { LoginMethod } from '@/type';

export default function Login() {
	return (
		<div className='w-full h-screen flex justify-center items-center '>
			<div className='flex top-0 left-0 h-full bg-black bg-opacity-50 z-50 w-[30vw] items-center justify-center flex-col'>
				<h2 className='text-white text-2xl pb-4'> Login</h2>
				<SignInButton provider={LoginMethod.Discord} className='p-2 shadow-lg hover:bg-opacity-80 transition-all duration-100'></SignInButton>
			</div>
			<div className='flex flex-grow justify-center items-center bg-white bg-opacity-70 h-full w-full'></div>
		</div>
	);
}
