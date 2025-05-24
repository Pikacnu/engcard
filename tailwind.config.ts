import type { Config } from 'tailwindcss';

export default {
	darkMode: 'class',
	content: [
		'./src/pages/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/components/**/*.{js,ts,jsx,tsx,mdx}',
		'./src/app/**/*.{js,ts,jsx,tsx,mdx}',
	],
	theme: {
		extend: {
			keyframes: {
				'fade-in': {
					'0%': {
						opacity: '0',
					},
					'100%': {
						opacity: '1',
					},
				},
				'browse-out': {
					'0%': {
						transform: 'translateX(0%) rotateY(0deg) rotateX(0deg)',
						zIndex: '999',
					},
					'50%': {
						transform:
							'translateX(-105%) rotateY(35deg) rotateX(10deg) translateZ(-10px)',
						zIndex: '-1',
					},
					'80%': {
						opacity: '1',
					},
					'100%': {
						zIndex: '-1',
						opacity: '0',
						transform:
							'translateX(0%) rotateY(0deg) rotateX(0deg) translateZ(-10px)',
					},
				},
			},
			colors: {
				background: 'var(--background)',
				foreground: 'var(--foreground)',
			},
			animation: {
				fadein: 'fade-in 0.5s ease-in-out 0.5s 1',
				browseout: 'browse-out 0.4s ease-in-out 0.25s 1',
			},
		},
		screens: {
			sm: { raw: '(min-width: 640px)' },
			md: { raw: '(min-width: 768px)' },
			lg: { raw: '(min-width: 1024px)' },
			xl: { raw: '(min-width: 1280px)' },
			'2xl': { raw: '(min-width: 1536px)' },
			'3xl': { raw: '(min-width: 1920px)' },
			'max-sm': { raw: '(max-width: 640px)' },
			'max-md': { raw: '(max-width: 768px)' },
			'max-lg': { raw: '(max-width: 1024px)' },
			'max-xl': { raw: '(max-width: 1280px)' },
			'min-sm': { raw: '(min-width: 640px)' },
			'min-md': { raw: '(min-width: 768px)' },
			'min-lg': { raw: '(min-width: 1024px)' },
			'min-xl': { raw: '(min-width: 1280px)' },
			'max-2xl': { raw: '(max-width: 1536px)' },
			'max-3xl': { raw: '(max-width: 1920px)' },
			keyboard: { raw: '(max-height: 640px)' },
			short: { raw: '(max-height: 600px)' },
			tall: { raw: '(min-height: 900px)' },
		},
	},
	plugins: [],
} satisfies Config;
