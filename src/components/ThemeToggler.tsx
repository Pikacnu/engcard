'use client';

import { useTheme } from '@/context/ThemeContext';
import { useTranslation } from '@/context/LanguageContext'; // For potential tooltips/labels

export const ThemeToggler = () => {
	const { theme, toggleTheme } = useTheme();
	const { t } = useTranslation(); // For accessibility or labels if needed

	return (
		<button
			onClick={toggleTheme}
			className='p-2 m-2 rounded-full hover:bg-white hover:bg-opacity-20 transition-all duration-200 dark:bg-white'
			aria-label={
				theme === 'dark'
					? t('common.theme.switchToLight')
					: t('common.theme.switchToDark')
			}
			title={
				theme === 'dark'
					? t('common.theme.switchToLight')
					: t('common.theme.switchToDark')
			}
		>
			{theme === 'dark' ? (
				// Icon for Light Mode (e.g., Sun)
				// Updated className here
				<svg
					xmlns='http://www.w3.org/2000/svg'
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
					className='text-gray-700 dark:text-black'
				>
					<circle
						cx='12'
						cy='12'
						r='5'
					></circle>
					<line
						x1='12'
						y1='1'
						x2='12'
						y2='3'
					></line>
					<line
						x1='12'
						y1='21'
						x2='12'
						y2='23'
					></line>
					<line
						x1='4.22'
						y1='4.22'
						x2='5.64'
						y2='5.64'
					></line>
					<line
						x1='18.36'
						y1='18.36'
						x2='19.78'
						y2='19.78'
					></line>
					<line
						x1='1'
						y1='12'
						x2='3'
						y2='12'
					></line>
					<line
						x1='21'
						y1='12'
						x2='23'
						y2='12'
					></line>
					<line
						x1='4.22'
						y1='19.78'
						x2='5.64'
						y2='18.36'
					></line>
					<line
						x1='18.36'
						y1='5.64'
						x2='19.78'
						y2='4.22'
					></line>
				</svg>
			) : (
				// Icon for Dark Mode (e.g., Moon)
				// Updated className here
				<svg
					xmlns='http://www.w3.org/2000/svg'
					width='24'
					height='24'
					viewBox='0 0 24 24'
					fill='none'
					stroke='currentColor'
					strokeWidth='2'
					strokeLinecap='round'
					strokeLinejoin='round'
					className='text-gray-700 dark:text-black'
				>
					<path d='M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z'></path>
				</svg>
			)}
		</button>
	);
};
