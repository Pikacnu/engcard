'use client';

import { DeckType, UserSettingsCollection } from '@/type';
import { useCallback, useEffect, useState } from 'react';

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
					<svg
						aria-hidden='true'
						className='w-12 h-12 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600'
						viewBox='0 0 100 101'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							d='M100 50.5C100 78.2091 78.2091 100 50.5 100C22.7909 100 1 78.2091 1 50.5C1 22.7909 22.7909 1 50.5 1C78.2091 1 100 22.7909 100 50.5Z'
							fill='none'
						/>
						<path
							d='M93.9716 50.5C93.9716 76.9534 76.9534 93.9716 50.5 93.9716C24.0466 93.9716 7.02844 76.9534 7.02844 50.5C7.02844 24.0466 24.0466 7.02844 50.5 7.02844C76.9534 7.02844 93.9716 24.0466 93.9716 50.5Z'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						/>
						<path
							d='M93.9716 50.5C93.9716 76.9534 76.9534 93.9716 50.5 93.9716C24.0466 93.9716 7.02844 76.9534 7.02844 50.5C7.02844 24.0466 24.0466 7.02844 50.5 7.02844C76.9534 7.02844 93.9716 24.
            0466 93.9716 50.5Z'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						/>
						<path
							d='M93.9716 50.5C93.9716 76.9534 76.9534 93.9716 50.5 93.9716C24.0466 93.9716 7.02844 76.9534 7.02844 50.5C7.02844 24.0466 24.0466 7.02844 50.5 7.02844C76.9534 7.02844 93.9716 24.0466 93.9716 50.5Z'
							stroke='currentColor'
							strokeWidth='2'
							strokeLinecap='round'
							strokeLinejoin='round'
						/>
					</svg>
					<p className='text-2xl text-gray-500'>Loading...</p>
				</div>
			) : (
				<div className='flex flex-col w-full h-full flex-grow items-center p-4'>
					<h1 className='text-2xl'>Settings</h1>

					<div className='flex flex-col m-4 p-4 bg-gray-800 rounded-lg'>
						<div className='flex flex-row items-center justify-between'>
							<h2>Is word card auto change to next when open</h2>
							<input
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
				</div>
			)}
		</div>
	);
}
