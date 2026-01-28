'use client';

import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { Mail, User, Tag, ArrowLeft } from 'lucide-react';

export default function About() {
  const { t } = useTranslation();

  return (
    <div className='w-full max-w-2xl px-6 py-12 md:py-20'>
      <motion.div
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        className='mb-8'
      >
        <Link
          href='/info'
          className='inline-flex items-center text-sm font-bold text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 transition-colors'
        >
          <ArrowLeft className='mr-2 w-4 h-4' />
          {t('info.title')}
        </Link>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className='p-8 md:p-12 rounded-[2.5rem] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl'
      >
        <h1 className='text-3xl font-black mb-10 text-slate-900 dark:text-white'>
          {t('info.about.title')}
        </h1>

        <div className='space-y-8'>
          <div className='flex items-start gap-6'>
            <div className='w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center shrink-0'>
              <User className='w-6 h-6 text-blue-500' />
            </div>
            <div>
              <h2 className='text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1'>
                {t('info.about.creatorLabel')}
              </h2>
              <p className='text-xl font-bold text-slate-900 dark:text-white'>
                Pikacnu
              </p>
            </div>
          </div>

          <div className='flex items-start gap-6'>
            <div className='w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center shrink-0'>
              <Mail className='w-6 h-6 text-purple-500' />
            </div>
            <div>
              <h2 className='text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1'>
                {t('info.about.emailLabel')}
              </h2>
              <Link
                href='mailto:pika@mail.pikacnu.com'
                className='text-xl font-bold text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline underline-offset-4 decoration-2'
              >
                pika@mail.pikacnu.com
              </Link>
            </div>
          </div>

          <div className='flex items-start gap-6'>
            <div className='w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center shrink-0'>
              <Tag className='w-6 h-6 text-emerald-500' />
            </div>
            <div>
              <h2 className='text-sm font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-1'>
                {t('info.about.versionLabel')}
              </h2>
              <p className='text-xl font-bold text-slate-900 dark:text-white'>
                0.0.1
              </p>
            </div>
          </div>
        </div>

        <div className='mt-12 pt-10 border-t border-slate-100 dark:border-slate-800'>
          <p className='text-slate-600 dark:text-slate-400 leading-relaxed font-medium'>
            EngCard is an open-source project dedicated to making language
            learning more efficient and enjoyable through modern technology and
            AI integration.
          </p>
        </div>
      </motion.div>
    </div>
  );
}
