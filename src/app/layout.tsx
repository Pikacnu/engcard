import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext'; // Adjust path if necessary
import { SerwistProvider } from '@/lib/serwist';
import { Suspense } from 'react';

export const dynamic = 'force-dynamic';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const APP_NAME = 'Cardlisher';
const APP_DEFAULT_TITLE = 'Cardlisher';
const APP_TITLE_TEMPLATE = '%s - Cardlisher';
const APP_DESCRIPTION = 'A Powerful Flashcard Application';

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_DEFAULT_TITLE,
    template: APP_TITLE_TEMPLATE,
  },
  description: APP_DESCRIPTION,
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_DEFAULT_TITLE,
    // startUpImage: [],
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
  twitter: {
    card: 'summary',
    title: {
      default: APP_DEFAULT_TITLE,
      template: APP_TITLE_TEMPLATE,
    },
    description: APP_DESCRIPTION,
  },
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
          content='width=device-width, initial-scale=1, maximum-scale=1, theme-color="#000000"'
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased w-full relative h-dvh text-white`}
      >
        <ThemeProvider>
          <LanguageProvider>
            <SerwistProvider
              swUrl='/serwist/sw.js'
              cacheOnNavigation={true}
              reloadOnOnline={true}
            >
              <div className='flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-700 w-full h-full min-h-max '>
                <Suspense fallback={null}>
                  {children}
                </Suspense>
              </div>
            </SerwistProvider>
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
