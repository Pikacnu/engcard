import { UserSettings } from '@/type';
import { createContext, useContext, useEffect, useState } from 'react';

const settingsContext = createContext<{
	settings?: UserSettings;
	setSettings: ({
		name,
		value,
	}: {
		name: keyof UserSettings;
		value: UserSettings[keyof UserSettings];
	}) => void;
} | null>(null);

export default function SettingsProvider({
	children,
}: {
	children: React.ReactNode;
}) {
	const [settings, updateSettingsData] = useState<UserSettings>();

	useEffect(() => {
		async function getSettings() {
			const response = await fetch('/api/settings');
			if (response.ok) {
				const data = await response.json();
				updateSettingsData(data);
			} else {
				console.error('Failed to fetch settings');
			}
		}
		getSettings();
	}, []);

	const setSettings = async ({
		name,
		value,
	}: {
		name: keyof UserSettings;
		value: UserSettings[keyof UserSettings];
	}) => {
		const response = await fetch('/api/settings', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ name, value }),
		});
		if (!response.ok) {
			console.error('Failed to update settings');
			return;
		}
		updateSettingsData((prevSettings) => {
			if (!prevSettings) return prevSettings;
			return {
				...prevSettings,
				[name]: value,
			};
		});
	};

	return (
		<settingsContext.Provider value={{ settings, setSettings }}>
			{children}
		</settingsContext.Provider>
	);
}

export const useSettings = () => {
	const context = useContext(settingsContext);
	if (!context) {
		throw new Error('useSettings must be used within a SettingsProvider');
	}
	return context;
};
