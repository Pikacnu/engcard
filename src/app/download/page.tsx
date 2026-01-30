'use client';

import { NavBar } from '@/components/navbar';
import Image from 'next/image';
import { useTranslation } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import {
  Download,
  Monitor,
  Smartphone,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';

export default function DownloadPage() {
  const { t } = useTranslation();

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' } as const,
    },
  };

  const platforms = [
    {
      id: 'windows',
      name: t('download.buttonWindows'),
      description: t('download.windows.description'),
      href: '/release/cardlisher-desktop.exe',
      iconUrl: '/platform/windows.svg',
      lucideIcon: <Monitor className='w-6 h-6' />,
      color: 'blue',
      features: [
        t('download.windows.feature1'),
        t('download.windows.feature2'),
        t('download.windows.feature3'),
      ],
    },
    {
      id: 'android',
      name: t('download.buttonAndroid'),
      description: t('download.android.description'),
      href: '/release/cardlisher-android.apk',
      iconUrl: '/platform/android.svg',
      lucideIcon: <Smartphone className='w-6 h-6' />,
      color: 'emerald',
      features: [
        t('download.android.feature1'),
        t('download.android.feature2'),
        t('download.android.feature3'),
      ],
    },
  ];

  return (
    <div className='flex flex-col min-h-screen bg-white dark:bg-slate-950 w-full overflow-y-auto overflow-x-hidden relative selection:bg-blue-100 dark:selection:bg-blue-900/30'>
      {/* Dynamic Background Effects */}
      <div className='absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none'>
        <div className='absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-[120px]' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-[120px]' />
      </div>

      <NavBar />

      <main className='flex-grow flex flex-col items-center px-6 py-16 md:py-24 z-10'>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className='text-center mb-16'
        >
          <div className='inline-flex items-center gap-2 px-4 py-2 mb-6 text-sm font-semibold tracking-wide text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800/50'>
            <Download className='w-4 h-4' />
            {t('download.multiPlatformSupport')}
          </div>
          <h1 className='text-4xl md:text-6xl font-black mb-6 text-slate-900 dark:text-white leading-tight'>
            {t('download.title')}
          </h1>
          <p className='text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-2xl mx-auto'>
            {t('download.description')}
          </p>
        </motion.div>

        <motion.div
          variants={containerVariants}
          initial='hidden'
          animate='visible'
          className='grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl'
        >
          {platforms.map((platform) => (
            <motion.div
              key={platform.id}
              variants={itemVariants}
              className='group relative'
            >
              <div className='h-full p-8 md:p-8 rounded-[2.5rem] bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 shadow-xl shadow-slate-200/50 dark:shadow-none flex flex-col'>
                <div className='flex items-center justify-between mb-8'>
                  <div
                    className={`p-4 rounded-2xl bg-${platform.color}-50 dark:bg-${platform.color}-900/20 group-hover:scale-110 transition-transform duration-300`}
                  >
                    {platform.iconUrl ? (
                      <Image
                        src={platform.iconUrl}
                        alt={platform.name}
                        width={32}
                        height={32}
                        className={
                          platform.id === 'windows' ? 'dark:invert' : ''
                        }
                      />
                    ) : (
                      platform.lucideIcon
                    )}
                  </div>
                  <div className='text-slate-300 dark:text-slate-700'>
                    {platform.lucideIcon}
                  </div>
                </div>

                <h3 className='text-2xl font-bold mb-4 text-slate-900 dark:text-white flex items-center gap-2'>
                  {platform.name}
                  {platform.id === 'web' && (
                    <span className='text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 border border-amber-200 dark:border-amber-800/50 uppercase tracking-tighter'>
                      無法離線
                    </span>
                  )}
                </h3>
                <p className='text-slate-600 dark:text-slate-400 mb-8 flex-grow leading-relaxed'>
                  {platform.description}
                </p>

                <div className='space-y-3 mb-10'>
                  {platform.features.map((feature) => (
                    <div
                      key={feature}
                      className='flex items-center gap-3 text-sm font-medium text-slate-500 dark:text-slate-400'
                    >
                      <CheckCircle2
                        className={`w-4 h-4 text-${platform.color}-500`}
                      />
                      {feature}
                    </div>
                  ))}
                </div>

                <a
                  href={platform.href}
                  className={`flex items-center justify-center gap-3 py-4 px-8 rounded-2xl font-bold text-white transition-all transform hover:-translate-y-1 active:scale-95 shadow-lg shadow-${platform.color}-500/25 hover:shadow-${platform.color}-500/40 ${
                    platform.id === 'windows'
                      ? 'bg-blue-600 hover:bg-blue-700'
                      : platform.id === 'android'
                        ? 'bg-emerald-600 hover:bg-emerald-700'
                        : 'bg-slate-700 hover:bg-slate-800'
                  }`}
                >
                  {platform.id === 'web' ? 'Open in Browser' : 'Download Now'}
                  <ArrowRight className='w-5 h-5 group-hover:translate-x-1 transition-transform' />
                </a>
              </div>
            </motion.div>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
          className='mt-20 text-center'
        >
          <p className='text-slate-500 dark:text-slate-400 text-sm'>
            Current Version: 0.0.1 • Released April 2025
          </p>
        </motion.div>
      </main>
    </div>
  );
}
