'use client';

import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { ArrowLeft, FileText } from 'lucide-react';

export default function TOS() {
  const { t } = useTranslation();

  return (
    <div className='w-full max-w-4xl px-6 py-12 md:py-20'>
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
        <div className='flex items-center gap-4 mb-8'>
          <div className='w-12 h-12 rounded-2xl bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center'>
            <FileText className='w-6 h-6 text-purple-500' />
          </div>
          <h1 className='text-3xl font-black text-slate-900 dark:text-white leading-tight'>
            {t('info.tos.title')}
          </h1>
        </div>

        <main className='prose prose-slate dark:prose-invert max-w-none overflow-y-auto max-h-[60vh] pr-4 scrollbar-hide'>
          <section className='mb-10'>
            <h2 className='text-xl font-bold mb-4'>
              {t('info.tos.introTitle')}
            </h2>
            <div className='space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed'>
              <p>{t('info.tos.introP1')}</p>
              <p>{t('info.tos.introP2')}</p>
              <p>{t('info.tos.introP3')}</p>
            </div>
          </section>

          <section className='mb-10'>
            <h2 className='text-xl font-bold mb-4'>
              {t('info.tos.userRespTitle')}
            </h2>
            <div className='space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed'>
              <p>{t('info.tos.userRespP1')}</p>
              <p>{t('info.tos.userRespP2')}</p>
              <p>{t('info.tos.userRespP3')}</p>
              <p>{t('info.tos.userRespP4')}</p>
              <p>{t('info.tos.userRespP5')}</p>
            </div>
          </section>

          <section className='mb-10'>
            <h2 className='text-xl font-bold mb-4'>
              {t('info.tos.prohibitedTitle')}
            </h2>
            <div className='space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed'>
              <p>{t('info.tos.prohibitedP1')}</p>
              <p>{t('info.tos.prohibitedP2')}</p>
              <p>{t('info.tos.prohibitedP3')}</p>
              <p>{t('info.tos.prohibitedP4')}</p>
            </div>
          </section>

          <section className='mb-10'>
            <h2 className='text-xl font-bold mb-4'>
              {t('info.tos.terminationTitle')}
            </h2>
            <div className='space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed'>
              <p>{t('info.tos.terminationP1')}</p>
              <ul className='list-disc pl-5 space-y-2'>
                <li>{t('info.tos.terminationL1')}</li>
                <li>{t('info.tos.terminationL2')}</li>
                <li>{t('info.tos.terminationL3')}</li>
                <li>{t('info.tos.terminationL4')}</li>
                <li>{t('info.tos.terminationL5')}</li>
              </ul>
              <p>{t('info.tos.terminationP2')}</p>
            </div>
          </section>

          <section className='mt-12 pt-10 border-t border-slate-100 dark:border-slate-800'>
            <p className='text-slate-600 dark:text-slate-400 leading-relaxed'>
              {t('info.tos.contactUsP1')}{' '}
              <Link
                href='mailto:pika@mail.pikacnu.com'
                className='text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-bold underline underline-offset-4 decoration-2'
              >
                pika@mail.pikacnu.com
              </Link>
              .
            </p>
          </section>
        </main>
      </motion.div>
    </div>
  );
}
