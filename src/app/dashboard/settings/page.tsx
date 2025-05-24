'use client';

import { DeckType, UserSettingsCollection } from '@/type';
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslation } from '@/context/LanguageContext'; // Added

export default function Settings() {
	const { t } = useTranslation(); // Added
	const [isLoading, setIsLoading] = useState(true);
	const [settings, setSettings] = useState<UserSettingsCollection | null>(null);

	useEffect(() => {
		(async () => {
			setIsLoading(true);
			const res = await fetch('/api/settings');
			setIsLoading(false);
			if (res.ok) {
				const data = await res.json();
				setSettings(data);
			} else {
				alert(`${t('dashboard.settings.alertLoadFailed')}${res.status} ${res.statusText}`); // Translated
			}
		})();
	}, [t]); // Added t to dependency array

	const updateSettings = useCallback(
		async (
			name: keyof UserSettingsCollection,
			value: UserSettingsCollection[keyof UserSettingsCollection],
		) => {
			const res = await fetch('/api/settings', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json',
				},
				body: JSON.stringify({
					name,
					value,
				}),
			});
			if (res.ok) {
				res
					.json()
					.then(
						(
							data: Record<
								keyof UserSettingsCollection,
								UserSettingsCollection[keyof UserSettingsCollection]
							>,
						) => {
							console.log('Settings updated:', data);
							setSettings(
								(prev) =>
									Object.assign({ ...prev }, data) as UserSettingsCollection,
							);
						},
					);
			} else {
				console.error('Failed to update settings:', await res.json());
			}
		},
		[],
	);

	return (
		<div className='flex flex-col w-full h-full flex-grow dark:bg-gray-700 dark:text-white'>
			{isLoading || !settings ? (
				<div className='flex items-center justify-center h-[80vh]'>
					<Image
						src='/icons/loading.svg'
						alt={t('common.loading')} // Translated
						width={64}
						height={64}
						className='w-12 h-12 animate-spin text-gray-600 dark:text-gray-300 fill-blue-600'
					/>
					<p className='text-2xl text-gray-500 dark:text-gray-400'>{t('common.loadingText')}</p> {/* Translated */}
				</div>
			) : (
				<div className='flex flex-col w-full h-full flex-grow items-center p-4 *:w-full'>
					<h1 className='text-2xl text-center font-semibold mb-6 text-gray-800 dark:text-gray-100'>{t('dashboard.settings.title')}</h1> {/* Translated */}

					<div className='flex flex-col m-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow'>
						<div className='flex flex-row items-center justify-between'>
							<label htmlFor='deckActionType' className="text-gray-700 dark:text-gray-200">
								{t('dashboard.settings.deckActionLabel')}
							</label>
							<input
								id='deckActionType'
								type='checkbox'
								className="form-checkbox h-5 w-5 text-blue-600 dark:text-blue-400 bg-gray-300 dark:bg-gray-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500 dark:focus:ring-blue-300"
								checked={settings.deckActionType === DeckType.AutoChangeToNext}
								onChange={(e) => {
									updateSettings(
										'deckActionType',
										e.target.checked
											? DeckType.AutoChangeToNext
											: DeckType.ChangeByButton,
									);
								}}
							/>
						</div>
					</div>
					<div className='flex flex-col m-4 p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow'>
						<div className='flex flex-row items-center justify-between flex-wrap'>
							<label htmlFor='ocrProcessType' className="text-gray-700 dark:text-gray-200">
								{t('dashboard.settings.ocrProcessLabel')}
							</label>
							<select
								id='ocrProcessType'
								value={settings.ocrProcessType}
								className='text-black dark:text-white bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-md p-2 m-1 focus:ring-blue-500 dark:focus:ring-blue-300 focus:border-blue-500 dark:focus:border-blue-300'
								onChange={(e) => {
									updateSettings(
										'ocrProcessType',
										parseInt(
											e.target.value,
										) as UserSettingsCollection['ocrProcessType'],
									);
								}}
							>
								<option value='0'>{t('dashboard.settings.ocrOptionOnlyImage')}</option>
								<option value='1'>{t('dashboard.settings.ocrOptionOnlyDefinition')}</option>
								<option value='2'>{t('dashboard.settings.ocrOptionFullySource')}</option>
							</select>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
