import type { Config } from 'tailwindcss';

export default {
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
	},
	plugins: [],
} satisfies Config;
