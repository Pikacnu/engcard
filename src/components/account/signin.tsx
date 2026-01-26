'use client';

import { LoginMethod } from '@/type';
import { authClient } from '@/lib/auth-client';
import { useTranslation } from '@/context/LanguageContext';
export default function SignInButton({
  provider,
  className,
}: {
  provider: LoginMethod;
  className?: string;
}) {
  const { t } = useTranslation();

  let buttonText = '';
  if (provider === LoginMethod.Discord) {
    buttonText = t('auth.signInDiscord');
  } else if (provider === LoginMethod.Google) {
    buttonText = t('auth.signInGoogle');
  } else {
    buttonText = t('auth.signInWith');
  }

  return (
    <button
      onClick={async () => {
        await authClient.signIn.social({
          provider: provider.toLowerCase() as 'discord' | 'google',
          callbackURL: '/dashboard',
        });
      }}
      className={`p-2 m-2 text-black dark:text-white bg-teal-400 hover:bg-teal-500 dark:bg-teal-600 dark:hover:bg-teal-500 rounded-md shadow-md dark:shadow-gray-700 ${className}`}
    >
      {buttonText} {/* Translated */}
    </button>
  );
}
