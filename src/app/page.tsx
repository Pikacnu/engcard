'use client';
import Link from 'next/link';
import { NavBar } from './../components/navbar';
import { useTranslation } from '@/context/LanguageContext';
import { LanguageSwitcher } from './../components/client/LanguageSwitcher';
import { Easing, motion } from 'framer-motion';
import {
  Library,
  Camera,
  Cpu,
  BarChart3,
  ArrowRight,
  Github,
} from 'lucide-react';

export default function Home() {
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
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] as Easing },
    },
  };

  const features = [
    {
      icon: <Library className='w-8 h-8 text-blue-500' />,
      title: t('page.home.feature1.title'),
      description: t('page.home.feature1.description'),
      color: 'blue',
    },
    {
      icon: <Camera className='w-8 h-8 text-purple-500' />,
      title: t('page.home.feature2.title'),
      description: t('page.home.feature2.description'),
      color: 'purple',
    },
    {
      icon: <Cpu className='w-8 h-8 text-indigo-500' />,
      title: t('page.home.feature3.title'),
      description: t('page.home.feature3.description'),
      color: 'indigo',
    },
    {
      icon: <BarChart3 className='w-8 h-8 text-cyan-500' />,
      title: t('page.home.feature4.title'),
      description: t('page.home.feature4.description'),
      color: 'cyan',
    },
  ];

  return (
    <div className='flex flex-col items-center h-screen bg-white dark:bg-slate-950 w-full overflow-x-hidden relative selection:bg-blue-100 dark:selection:bg-blue-900/30'>
      {/* Dynamic Background Effects */}
      <div className='absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none'>
        <div className='absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-[120px]' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-[120px]' />
      </div>

      <NavBar />

      <main className='flex items-center flex-col w-full px-6 py-16 md:py-24 z-10'>
        {/* Hero Section */}
        <div className='w-full max-w-6xl grid lg:grid-cols-2 gap-12 items-center mb-24'>
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: 'easeOut' }}
            className='flex flex-col items-center lg:items-start text-center lg:text-left'
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className='inline-flex items-center gap-2 px-4 py-2 mb-8 text-sm font-semibold tracking-wide text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 rounded-full border border-blue-100 dark:border-blue-800/50'
            >
              <span className='relative flex h-2 w-2'>
                <span className='animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75'></span>
                <span className='relative inline-flex rounded-full h-2 w-2 bg-blue-500'></span>
              </span>
              AI-Powered Vocabulary Master
            </motion.div>

            <h1 className='text-5xl md:text-7xl font-black mb-8 leading-[1.1] tracking-tight text-slate-900 dark:text-white'>
              {t('page.home.title')}
              <span className='block text-3xl md:text-4xl mt-4 font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-600 to-indigo-500 dark:from-blue-400 dark:to-purple-400'>
                {t('page.home.subtitle')}
              </span>
            </h1>

            <p className='text-slate-600 dark:text-slate-400 text-lg md:text-xl max-w-xl leading-relaxed mb-10'>
              {t('page.home.description')}
            </p>

            <div className='flex flex-col sm:flex-row gap-4 w-full sm:w-auto'>
              <Link
                href='/dashboard'
                className='group flex items-center justify-center bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 px-10 rounded-2xl transition-all shadow-lg shadow-blue-500/25 hover:shadow-blue-500/40 transform hover:-translate-y-1 active:scale-95'
              >
                {t('page.home.getStartedButton')}
                <ArrowRight className='ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform' />
              </Link>

              <Link
                href='https://github.com/Pikacnu/engcard'
                target='_blank'
                className='flex items-center justify-center bg-white dark:bg-slate-900 text-slate-900 dark:text-white font-bold py-4 px-10 rounded-2xl transition-all border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800 shadow-sm transform hover:-translate-y-1 active:scale-95'
              >
                <Github className='mr-2 w-5 h-5' />
                {t('page.home.githubButton')}
              </Link>
            </div>
          </motion.div>

          {/* Interactive Card Preview or Visual */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, rotate: 5 }}
            animate={{ opacity: 1, scale: 1, rotate: 0 }}
            transition={{ duration: 1, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
            className='hidden lg:flex justify-center relative'
          >
            <div className='relative w-80 h-[450px] bg-white dark:bg-slate-900 rounded-[3rem] border-[8px] border-slate-900 dark:border-slate-800 shadow-2xl overflow-hidden'>
              <div className='absolute top-0 w-full h-6 bg-slate-900 dark:border-slate-800 flex justify-center items-center'>
                <div className='w-16 h-1 bg-slate-800 rounded-full' />
              </div>
              <div className='p-6 pt-12'>
                <div className='w-full h-40 bg-slate-100 dark:bg-slate-800 rounded-2xl mb-6 flex items-center justify-center overflow-hidden'>
                  <motion.div
                    animate={{ y: [0, -10, 0] }}
                    transition={{ repeat: Infinity, duration: 3 }}
                    className='text-6xl'
                  >
                    🚀
                  </motion.div>
                </div>
                <div className='space-y-4'>
                  <div className='h-6 w-3/4 bg-slate-100 dark:bg-slate-800 rounded-lg' />
                  <div className='h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-lg opacity-60' />
                  <div className='h-4 w-full bg-slate-100 dark:bg-slate-800 rounded-lg opacity-60' />
                  <div className='pt-4 grid grid-cols-2 gap-3'>
                    <div className='h-10 bg-blue-500/20 rounded-xl' />
                    <div className='h-10 bg-slate-100 dark:bg-slate-800 rounded-xl' />
                  </div>
                </div>
              </div>
            </div>
            {/* Decors */}
            <div className='absolute -top-10 -right-10 w-24 h-24 bg-yellow-400/20 rounded-full blur-2xl' />
            <div className='absolute -bottom-10 -left-10 w-32 h-32 bg-blue-400/20 rounded-full blur-2xl' />
          </motion.div>
        </div>

        {/* Features Section */}
        <div className='w-full max-w-6xl'>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className='text-center mb-16'
          >
            <h2 className='text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mb-4'>
              強大且直覺的功能
            </h2>
            <div className='w-20 h-1.5 bg-blue-600 mx-auto rounded-full' />
          </motion.div>

          <motion.div
            className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-24'
            variants={containerVariants}
            initial='hidden'
            whileInView='visible'
            viewport={{ once: true, margin: '-100px' }}
          >
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={itemVariants}
                className='group relative bg-white dark:bg-slate-900/50 p-8 rounded-[2rem] border border-slate-100 dark:border-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50 hover:border-blue-500/30 dark:hover:border-blue-400/30 transition-all duration-500 shadow-sm hover:shadow-xl hover:shadow-blue-500/5'
              >
                <div className='mb-8 p-4 bg-slate-50 dark:bg-slate-800 rounded-2xl w-fit group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 shadow-sm'>
                  {feature.icon}
                </div>
                <h3 className='text-xl font-bold text-slate-900 dark:text-white mb-4'>
                  {feature.title}
                </h3>
                <p className='text-slate-600 dark:text-slate-400 leading-relaxed mb-4'>
                  {feature.description}
                </p>
                <div className='absolute bottom-6 right-8 opacity-0 group-hover:opacity-100 transform translate-x-4 group-hover:translate-x-0 transition-all duration-500'>
                  <ArrowRight className='w-5 h-5 text-blue-500' />
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>

        {/* Bottom Language Selector Area */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className='flex items-center gap-6 p-4 md:p-6 w-full max-w-md rounded-2xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-md border border-slate-200 dark:border-slate-800 shadow-xl justify-center'
        >
          <span className='text-sm font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-widest whitespace-nowrap'>
            {t('dashboard.settings.languageLabel')}
          </span>
          <div className='h-8 w-px bg-slate-200 dark:bg-slate-800' />
          <LanguageSwitcher />
        </motion.div>
      </main>

      {/* Footer minimal */}
      <footer className='w-full py-12 px-6 border-t border-slate-100 dark:border-slate-900 z-10'>
        <div className='max-w-6xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-slate-500 dark:text-slate-500 text-sm'>
          <p>© 2026 Cardlisher. All rights reserved.</p>
          <div className='flex gap-8'>
            <Link
              href='/info/privacy'
              className='hover:text-blue-500 transition-colors'
            >
              {t('info.privacyLink')}
            </Link>
            <Link
              href='/info/tos'
              className='hover:text-blue-500 transition-colors'
            >
              {t('info.tosLink')}
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
