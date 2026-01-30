'use client';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { redirect } from 'next/navigation';
import Joyride, {
  ACTIONS,
  CallBackProps,
  Status,
  STATUS,
  Step,
} from 'react-joyride';
import { useLocalStorage } from '@/hooks/localstorage';
import { useTranslation } from '@/context/LanguageContext';
import { ThemeToggler } from './../../components/ThemeToggler';
import { useTheme } from '@/context/ThemeContext';
import SettingsProvider from './../../context/SettingsContext';
import {
  Home,
  Search,
  Library,
  PlayCircle,
  MessageCircle,
  Store,
  Settings,
  LogOut,
  MoreHorizontal,
} from 'lucide-react';

export default function DashBoardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { t } = useTranslation();
  const [isBiMenuOpen, setIsBiMenuOpen] = useState(false);
  const [isGuideDashboard, setIsGuideDashboard] = useLocalStorage<boolean>(
    'guideDashboard',
    false,
  );
  const [joyrideRun, setJoyrideRun] = useState(!isGuideDashboard);
  const theme = useTheme();

  const steps: Array<Step> = [
    {
      target: '.content-area',
      content: t('dashboard.joyride.step1Content'),
      placement: 'center',
    },
    {
      target: '.main-nav',
      content: t('dashboard.joyride.step2Content'),
      placement: 'auto',
    },
    {
      target: '.home-link',
      content: t('dashboard.joyride.step3Content'),
    },
    {
      target: '.search-link',
      content: t('dashboard.joyride.step4Content'),
    },
    {
      target: '.deck-link',
      content: t('dashboard.joyride.step5Content'),
    },
    {
      target: '.preview-link',
      content: t('dashboard.joyride.step6Content'),
    },
    {
      target: '.chat-link',
      content: t('dashboard.joyride.step7Content'),
    },
    {
      target: '.market-link',
      content: t('dashboard.joyride.step8Content'),
    },
    {
      target: '.more-options',
      content: t('dashboard.joyride.step9Content'),
    },
    // {
    //   target: '.tempword',
    //   content: t('dashboard.joyride.step10Content'),
    // },
    {
      target: '.logout',
      content: t('dashboard.joyride.step11Content'),
    },
    {
      target: '.settings',
      content: t('dashboard.joyride.step12Content'),
    },
  ];

  const handleJoyrideCallback = (data: CallBackProps) => {
    const { status, action, step } = data;
    if (action === ACTIONS.UPDATE) {
      console.log('update step:', step.target);
      if (step.target === '.more-options') {
        setIsBiMenuOpen(true);
      }
      if (step.target === '.content-area') {
        setIsBiMenuOpen(false);
      }
    }
    if (([STATUS.FINISHED, STATUS.SKIPPED] as Array<Status>).includes(status)) {
      console.log('joyride finished or skipped');
      setJoyrideRun(false);
      setIsGuideDashboard(true);
    }
  };

  const [isClient, setIsClient] = useState(false);
  useEffect(() => {
    setIsClient(true);
    setJoyrideRun(!isGuideDashboard);
  }, [isGuideDashboard]);

  return (
    // Outer div: bg-gray-100 dark:bg-gray-700
    <div
      className={`flex flex-row max-md:flex-col-reverse w-full h-dvh bg-gray-100 dark:bg-gray-700 relative dashboard-layout ${theme}`}
    >
      {isClient && (
        <Joyride
          steps={steps}
          continuous
          showProgress
          showSkipButton
          scrollToFirstStep
          disableScrolling
          disableCloseOnEsc
          run={joyrideRun}
          callback={handleJoyrideCallback}
        />
      )}

      {/* Navbar div (main-nav): bg-white dark:bg-gray-800 text-black dark:text-white */}
      <div className='flex flex-col max-md:flex-row h-full bg-white dark:bg-gray-800 text-black dark:text-white md:left-0 md:top-0 max-md:h-16 max-md:bottom-0 max-md:w-full justify-between items-center keyboard:hidden main-nav delay-0 '>
        {isBiMenuOpen ? (
          // Buttons: bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-700 dark:bg-opacity-40 dark:hover:bg-emerald-600
          <div className='*:bg-emerald-100 dark:*:bg-emerald-700 dark:*:bg-opacity-40 *:p-2 *:m-2 *:rounded-md *:text-center flex flex-col max-md:flex-row '>
            {/* <Link
              href={'/tempword'}
              className='w-10 break-words max-md:w-auto max-md:h-10 tempword text-black'
            >
              {t('dashboard.navigation.sevenThousandWords')}
            </Link> */}
            <button
              onClick={() => redirect('/auth/logout')}
              className='logout'
            >
              <LogOut
                size={24}
                className='cursor-pointer'
              />
            </button>
            <Link
              href={'/dashboard/settings'}
              className='settings'
            >
              <Settings
                size={24}
                className='cursor-pointer'
              />
            </Link>
            <ThemeToggler></ThemeToggler>
            <button
              className='more-options'
              onClick={() => setIsBiMenuOpen(false)}
            >
              <MoreHorizontal
                size={24}
                className='cursor-pointer'
              />
            </button>
          </div>
        ) : (
          <div className='*:bg-emerald-100 dark:*:bg-emerald-700 dark:*:bg-opacity-40 *:p-2 *:m-2 *:rounded-md *:text-center flex flex-col max-md:flex-row'>
            <Link
              href='/dashboard'
              className='home-link'
            >
              <Home
                size={24}
                className='cursor-pointer'
              />
            </Link>
            <Link
              href='/dashboard/search'
              className='search-link'
            >
              <Search
                size={24}
                className='cursor-pointer'
              />
            </Link>
            <Link
              href='/dashboard/deck'
              className='deck-link'
            >
              <Library
                size={24}
                className='cursor-pointer'
              />
            </Link>
            <Link
              href='/dashboard/preview'
              className='preview-link'
            >
              <PlayCircle
                size={24}
                className='cursor-pointer'
              />
            </Link>
            <Link
              href='/dashboard/chat'
              className='chat-link'
            >
              <MessageCircle
                size={24}
                className='cursor-pointer'
              />
            </Link>
            <Link
              href='/market?fromPage=dashboard'
              className='market-link'
            >
              <Store
                size={24}
                className='cursor-pointer'
              />
            </Link>
            <button
              className='more-options'
              onClick={() => setIsBiMenuOpen(true)}
            >
              <MoreHorizontal
                size={24}
                className='cursor-pointer'
              />
            </button>
          </div>
        )}
      </div>
      {/* The content area should inherit its background from the outer div's dark:bg-gray-700 */}
      <SettingsProvider>
        <div className='flex-grow w-full overflow-auto h-full relative content-area'>
          {children}
        </div>
      </SettingsProvider>
    </div>
  );
}
