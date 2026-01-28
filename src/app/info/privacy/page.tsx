'use client';

import Link from 'next/link';
import { useTranslation } from '@/context/LanguageContext';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield } from 'lucide-react';

export default function PrivacyPolicyPage() {
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
          <div className='w-12 h-12 rounded-2xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center'>
            <Shield className='w-6 h-6 text-emerald-500' />
          </div>
          <h1 className='text-3xl font-black text-slate-900 dark:text-white leading-tight'>
            {t('info.privacy.title')}
          </h1>
        </div>

        <main className='prose prose-slate dark:prose-invert max-w-none overflow-y-auto max-h-[60vh] pr-4 scrollbar-hide'>
          <section className='mb-10'>
            <h2 className='text-xl font-bold mb-4'>
              {t('info.privacy.introTitle')}
            </h2>
            <p className='text-slate-600 dark:text-slate-400 leading-relaxed'>
              {t('info.privacy.introP1')}
            </p>
          </section>

          <section className='mb-10'>
            <h2 className='text-xl font-bold mb-4'>
              {t('info.privacy.infoCollectTitle')}
            </h2>
            <p className='text-slate-600 dark:text-slate-400 leading-relaxed'>
              {t('info.privacy.infoCollectP1')}
            </p>
          </section>

          <section className='mb-10'>
            <h2 className='text-xl font-bold mb-4'>
              {t('info.privacy.howWeUseTitle')}
            </h2>
            <div className='space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed'>
              <p>{t('info.privacy.howWeUseP1')}</p>
              <p>{t('info.privacy.howWeUseP2')}</p>
              <p>{t('info.privacy.howWeUseP3')}</p>
              <p>{t('info.privacy.howWeUseP4')}</p>
            </div>
          </section>

          <section className='mb-10'>
            <h2 className='text-xl font-bold mb-4'>
              {t('info.privacy.yourRightsTitle')}
            </h2>
            <div className='space-y-4 text-slate-600 dark:text-slate-400 leading-relaxed'>
              <p>{t('info.privacy.yourRightsP1')}</p>
              <p>{t('info.privacy.yourRightsP2')}</p>
              <p>{t('info.privacy.yourRightsP3')}</p>
              <p>{t('info.privacy.yourRightsP4')}</p>
              <p>{t('info.privacy.yourRightsP5')}</p>
            </div>
          </section>

          <section>
            <h2 className='text-xl font-bold mb-4'>
              {t('info.privacy.contactUsTitle')}
            </h2>
            <p className='text-slate-600 dark:text-slate-400 leading-relaxed'>
              {t('info.privacy.contactUsP1')}{' '}
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
