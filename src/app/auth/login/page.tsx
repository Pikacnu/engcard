'use client'; // Added

import SignInButton from '@/components/account/signin';
import { LoginMethod } from '@/type';
import { useSession } from 'next-auth/react'; // Changed from auth
import { redirect } from 'next/navigation';
import { useTranslation } from '@/context/LanguageContext'; // Added
import { useEffect } from 'react'; // Added for session redirect

export default function Login() {
	const { t } = useTranslation(); // Added
	const { data: session, status } = useSession(); // Changed to useSession

	useEffect(() => { // Added useEffect for redirect
		if (status === 'authenticated') {
			redirect('/dashboard');
		}
	}, [status]);

	if (status === 'loading') {
		return ( // Added loading state
			<div className='w-full h-screen flex justify-center items-center dark:bg-gray-900'>
				<p className="dark:text-white">{t('common.loadingText')}</p>
			</div>
		);
	}
	
	// If already authenticated (e.g. due to fast redirect), this might not be strictly necessary
	// but good for initial check before useEffect runs.
	if (session) {
	  redirect('/dashboard');
	  return null; // Ensure nothing else renders during redirect
	}

	return (
		<div className='w-full h-screen flex justify-center items-center dark:bg-gray-900'>
			{/* The left panel with login buttons */}
			<div className='flex top-0 left-0 h-full bg-black bg-opacity-50 dark:bg-gray-800 dark:bg-opacity-70 z-50 w-[30vw] items-center justify-center flex-col max-md:w-full p-4 md:p-0'>
				<h2 className='text-white dark:text-gray-100 text-2xl pb-4'>
					{t('auth.login.title')} {/* Translated */}
				</h2>
				<SignInButton
					provider={LoginMethod.Discord}
					className='p-2 shadow-lg hover:bg-opacity-80 transition-all duration-100'
				/>
				<SignInButton
					provider={LoginMethod.Google}
					className='p-2 shadow-lg hover:bg-opacity-80 transition-all duration-100'
				/>
			</div>
			{/* The right panel (decorative on larger screens) */}
			<div className='flex flex-grow justify-center items-center bg-white bg-opacity-70 dark:bg-gray-700 dark:bg-opacity-50 h-full w-full max-md:hidden'></div>
		</div>
	);
}
