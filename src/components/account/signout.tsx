'use client'; // Added

import { authClient } from '@/lib/auth-client';
import { useTranslation } from '@/context/LanguageContext'; // Added
import { LogOut } from 'lucide-react';

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
      className={`p-2 m-2 text-black dark:text-white bg-red-400 hover:bg-red-500 dark:bg-red-600 dark:hover:bg-red-500 rounded-md shadow-md dark:shadow-gray-700 flex items-center justify-center ${className}`}
      title={t('components.account.signOutAlt')} // Added title for better UX
    >
      <LogOut size={24} />
    </button>
  );
}
