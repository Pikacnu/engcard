'use client';
import { useState } from 'react';
import { addDeck } from '@/actions/deck';
import { useTranslation } from '@/context/LanguageContext'; // Added

export default function AddDeck({ onSubmit }: { onSubmit?: () => void }) {
	const { t } = useTranslation(); // Added
	const [name, setName] = useState('');
	const [isPublic, setPublic] = useState(false);

	return (
		<form
			onSubmit={async (e) => {
				e.preventDefault();
				await addDeck.bind(null, name, isPublic)();
				if (onSubmit) {
					onSubmit();
				}
				setName(''); // Clear form after submission
				setPublic(false);
			}}
			className='flex flex-col items-center justify-center w-auto min-w-[300px] h-auto bg-gray-100 dark:bg-gray-700 p-8 rounded-lg shadow-xl'
		>
			<input
				type='text'
				name='name'
				placeholder={t('components.server.adddeck.placeholderName')} // Translated
				onChange={(e) => setName(e.target.value)}
				value={name}
				className='bg-white dark:bg-gray-600 text-black dark:text-white p-2 rounded-lg border-2 border-gray-300 dark:border-gray-500 outline-none w-full mb-4'
			/>
			<div className='flex items-center gap-2 mb-4 self-start'>
				<input
					type='checkbox'
					name='public'
					id='public'
					onChange={(e) => setPublic(e.target.checked)}
					checked={isPublic}
					className="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400 bg-gray-300 dark:bg-gray-500 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:focus:ring-blue-300"
				/>
				<label htmlFor='public' className="text-black dark:text-white">{t('components.server.adddeck.labelPublic')}</label> {/* Translated */}
			</div>
			<input
				type='submit'
				value={t('components.server.adddeck.submitButton')} // Translated
				className='p-2 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-500 text-white rounded-lg cursor-pointer w-full shadow-md'
			/>
		</form>
	);
}
