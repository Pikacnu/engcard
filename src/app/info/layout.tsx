import { NavBar } from '@/components/navbar';

export default function InfoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className='flex flex-col min-h-screen bg-white dark:bg-slate-950 w-full relative selection:bg-blue-100 dark:selection:bg-blue-900/30'>
      {/* Dynamic Background Effects */}
      <div className='absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none'>
        <div className='absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-400/10 dark:bg-blue-500/5 rounded-full blur-[120px]' />
        <div className='absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-purple-400/10 dark:bg-purple-500/5 rounded-full blur-[120px]' />
      </div>

      <NavBar />
      <div className='flex-grow flex flex-col items-center z-10'>
        {children}
      </div>
    </div>
  );
}
