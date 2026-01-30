'use client';

import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { Info, ShieldCheck, FileText, ArrowRight } from 'lucide-react';

export default function InfoPage() {
  const { t } = useTranslation();

  const links = [
    {
      href: '/info/about',
      icon: <Info className='w-6 h-6 text-blue-500' />,
      title: t('info.aboutLink'),
      description: t('info.about.description'),
      color: 'blue',
    },
    {
      href: '/info/tos',
      icon: <FileText className='w-6 h-6 text-purple-500' />,
      title: t('info.tosLink'),
      description: t('info.tos.description'),
      color: 'purple',
    },
    {
      href: '/info/privacy',
      icon: <ShieldCheck className='w-6 h-6 text-emerald-500' />,
      title: t('info.privacyLink'),
      description: t('info.privacy.description'),
      color: 'emerald',
    },
  ];

  return (
    <div className='w-full max-w-4xl px-6 py-12 md:py-20'>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='text-center mb-16'
      >
        <h1 className='text-4xl md:text-5xl font-black mb-4 text-slate-900 dark:text-white leading-tight'>
          {t('info.title')}
        </h1>
        <p className='text-slate-600 dark:text-slate-400 text-lg max-w-2xl mx-auto'>
          {t('info.intro')}
        </p>
      </motion.div>

      <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
        {links.map((link, index) => (
          <motion.div
            key={link.href}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Link
              href={link.href}
              className='group'
            >
              <div className='h-full p-8 rounded-3xl bg-white/50 dark:bg-slate-900/50 backdrop-blur-xl border border-slate-200 dark:border-slate-800 hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-300 transform hover:-translate-y-2 flex flex-col'>
                <div
                  className={`w-14 h-14 rounded-2xl bg-${link.color}-50 dark:bg-${link.color}-900/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}
                >
                  {link.icon}
                </div>
                <h3 className='text-xl font-bold mb-3 text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors'>
                  {link.title}
                </h3>
                <p className='text-slate-600 dark:text-slate-400 text-sm leading-relaxed mb-6 flex-grow'>
                  {link.description}
                </p>
                <div className='flex items-center text-sm font-bold text-blue-600 dark:text-blue-400'>
                  {t('info.learnMore')}
                  <ArrowRight className='ml-1 w-4 h-4 group-hover:translate-x-1 transition-transform' />
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
