'use client'; // Added

import { authClient } from '@/lib/auth-client';
import Image from 'next/image';
import { useTranslation } from '@/context/LanguageContext'; // Added

export default function SignOutButton({ className }: { className?: string }) {
  const { t } = useTranslation(); // Added

  return (
    // logout with better-auth
    <button
      onClick={async () => {
        // No 'use server' needed here
        await authClient.signOut({
          fetchOptions: {
            onSuccess: () => {
              window.location.href = '/';
            },
          },
        });
      }}
      className={`p-2 m-2 text-black dark:text-white bg-red-400 hover:bg-red-500 dark:bg-red-600 dark:hover:bg-red-500 rounded-md shadow-md dark:shadow-gray-700 ${className}`}
      title={t('components.account.signOutAlt')} // Added title for better UX
    >
      <Image
        src='/icons/box-arrow-in-left.svg' // This icon might be confusing for logout, consider box-arrow-right.svg
        alt={t('components.account.signOutAlt')} // Translated
        width={24}
        height={24}
        className='cursor-pointer dark:filter dark:invert' // Added dark mode styling for icon
      />
    </button>
  );
}
