'use client';

import { DeckType, UserSettingsCollection } from '@/type';
import { useCallback, useEffect, useState } from 'react';
import Image from 'next/image';

export default function Settings() {
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
				alert(`Failed to load settings: ${res.status} ${res.statusText}`);
			}
		})();
	}, []);

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
		<div className='flex flex-col w-full h-full flex-grow'>
			{isLoading || !settings ? (
				<div className='flex items-center justify-center h-[80vh]'>
					<Image
						src='/icons/loading.svg'
						alt='loading'
						width={64}
						height={64}
						className='w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600'
					/>
					<p className='text-2xl text-gray-500'>Loading...</p>
				</div>
			) : (
				<div className='flex flex-col w-full h-full flex-grow items-center p-4 *:w-full'>
					<h1 className='text-2xl'>Settings</h1>

					<div className='flex flex-col m-4 p-4 bg-gray-800 rounded-lg'>
						<div className='flex flex-row items-center justify-between'>
							<label htmlFor='deckActionType'>
								Is word card auto change to next when open
							</label>
							<input
								id='deckActionType'
								type='checkbox'
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
					<div className='flex flex-col m-4 p-4 bg-gray-800 rounded-lg'>
						<div className='flex flex-row items-center justify-between flex-wrap'>
							<label htmlFor='ocrProcessType'>Image Process Type</label>
							<select
								id='ocrProcessType'
								value={settings.ocrProcessType}
								className='text-black m-1'
								onChange={(e) => {
									updateSettings(
										'ocrProcessType',
										parseInt(
											e.target.value,
										) as UserSettingsCollection['ocrProcessType'],
									);
								}}
							>
								<option value='0'>Only Data From Image</option>
								<option value='1'>
									Only Use Definition From Scanned Image
								</option>
								<option value='2'>Fully From Source</option>
							</select>
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
