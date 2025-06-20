import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext'; // Adjust path if necessary
import { SessionProvider } from 'next-auth/react';

const geistSans = Geist({
	variable: '--font-geist-sans',
	subsets: ['latin'],
});

const geistMono = Geist_Mono({
	variable: '--font-geist-mono',
	subsets: ['latin'],
});

export const metadata: Metadata = {
	title: 'cardlisher',
	description: 'A flashcard app',
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang='en'>
			<head>
				<meta
					name='viewport'
					content='width=device-width, initial-scale=1, maximum-scale=1'
				/>
			</head>
			<body
				className={`${geistSans.variable} ${geistMono.variable} antialiased w-full relative h-dvh text-white`}
			>
				<ThemeProvider>
					<LanguageProvider>
						<SessionProvider>
							<div className='flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 w-full h-full min-h-max '>
								{children}
							</div>
						</SessionProvider>
					</LanguageProvider>
				</ThemeProvider>
			</body>
		</html>
	);
}
