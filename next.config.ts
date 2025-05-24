import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
	i18n: {
		locales: ['en', 'zh-TW'],
		defaultLocale: 'en',
		localeDetection: true,
	},
	/* config options here */
};

export default nextConfig;
