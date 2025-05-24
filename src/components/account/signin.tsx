'use client'; // Added

import { LoginMethod } from '@/type';
import { signIn } from 'next-auth/react'; // Changed to next-auth/react for client-side signIn
import { useTranslation } from '@/context/LanguageContext'; // Added

export default function SignInButton({
	provider,
	className,
}: {
	provider: LoginMethod;
	className?: string;
}) {
	const { t } = useTranslation(); // Added

	// Determine the specific translation key based on the provider
	let buttonText = '';
	if (provider === LoginMethod.Discord) {
		buttonText = t('auth.signInDiscord');
	} else if (provider === LoginMethod.Google) {
		buttonText = t('auth.signInGoogle');
	} else {
		// Fallback or generic text if provider is something else or for future providers
		buttonText = t('auth.signInWith');
	}

	return (
		// The form is removed as signIn from 'next-auth/react' is a function call, not a form action.
		// If you still need a form for other reasons, this would need adjustment.
		<button
			onClick={async () => {
				// No 'use server' needed here as signIn is a client-side function
				await signIn(provider.toLowerCase(), {
					// provider name for next-auth is typically lowercase
					redirectTo: '/dashboard',
				});
			}}
			className={`p-2 m-2 text-black dark:text-white bg-teal-400 hover:bg-teal-500 dark:bg-teal-600 dark:hover:bg-teal-500 rounded-md shadow-md dark:shadow-gray-700 ${className}`}
		>
			{buttonText} {/* Translated */}
		</button>
	);
}
