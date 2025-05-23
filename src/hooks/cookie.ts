export default function useCookie() {
	const getCookie = (name: string) => {
		if (typeof document === 'undefined') return null;
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) return parts.pop()?.split(';').shift() || null;
		return null;
	};

	const setCookie = (name: string, value: string, days: number) => {
		let expires = '';
		if (days) {
			const date = new Date();
			date.setTime(date.getTime() + days * 24 * 60 * 60 * 1000);
			expires = `; expires=${date.toUTCString()}`;
		}
		document.cookie = `${name}=${value || ''}${expires}; path=/`;
	};

	return { getCookie, setCookie };
}
