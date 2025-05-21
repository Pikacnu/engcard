'use client';
import { SessionProvider } from 'next-auth/react';
import Link from 'next/link';
import Image from 'next/image';
import { useState } from 'react';
import { redirect } from 'next/navigation';
import Joyride, {
	ACTIONS,
	CallBackProps,
	Status,
	STATUS,
	Step,
} from 'react-joyride';
import { useLocalStorage } from '@/hooks/localstorage';

export default function DashBoardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [isBiMenuOpen, setIsBiMenuOpen] = useState(false);
	const [isGuideDashboard, setIsGuideDashboard] = useLocalStorage<boolean>(
		'guideDashboard',
		false,
	);
	const [joyrideRun, setJoyrideRun] = useState(!isGuideDashboard);

	const steps: Array<Step> = [
		{
			target: '.content-area',
			content: '這裡將顯示您所選功能的內容',
			placement: 'center',
		},
		{
			target: '.main-nav',
			content: '這裡是主導航欄，您可以通過它訪問各個功能',
			placement: 'auto',
		},
		{
			target: '.home-link',
			content: '點擊返回儀表板首頁',
		},
		{
			target: '.search-link',
			content: '搜索功能，可以查找單詞或牌組',
		},
		{
			target: '.deck-link',
			content: '卡片牌組管理區域',
		},
		{
			target: '.preview-link',
			content: '預覽學習內容',
		},
		{
			target: '.chat-link',
			content: '聊天功能區',
		},
		{
			target: '.market-link',
			content: '市場功能，可以獲取更多學習資源',
		},
		{
			target: '.more-options',
			content: '更多選項，包含設置和登出功能',
		},
		{
			target: '.tempword',
			content: '部份 高中 7000 單字',
		},
		{
			target: '.logout',
			content: '登出功能，點擊後將退出當前帳號',
		},
		{
			target: '.settings',
			content: '設置功能，您可以在這裡調整應用程序的設置',
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

	return (
		<div className='flex flex-row max-md:flex-col-reverse w-full h-dvh bg-gray-700 relative dashboard-layout'>
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
			<SessionProvider>
				<div className='flex flex-col max-md:flex-row h-full bg-gray-50 md:left-0 md:top-0 max-md:h-16 max-md:bottom-0 max-md:w-full justify-between text-black items-center keyboard:hidden main-nav'>
					{isBiMenuOpen ? (
						<div className='*:bg-emerald-600 *:bg-opacity-40 *:p-2 *:m-2 *:hover:bg-opacity-40 *:rounded-md *:text-center flex flex-col max-md:flex-row'>
							<Link
								href={'/tempword'}
								className='w-10 break-words max-md:w-auto max-md:h-10 tempword'
							>
								7000單
							</Link>
							<button
								onClick={() => redirect('/auth/logout')}
								className='logout'
							>
								<Image
									src='/icons/box-arrow-in-left.svg'
									alt='logout'
									width={24}
									height={24}
									className='cursor-pointer'
								></Image>
							</button>
							<Link
								href={'/dashboard/settings'}
								className='settings'
							>
								<Image
									src='/icons/gear.svg'
									alt='settings'
									width={24}
									height={24}
									className='cursor-pointer'
								></Image>
							</Link>
							<button
								className='more-options'
								onClick={() => setIsBiMenuOpen(false)}
							>
								<Image
									src='/icons/more.svg'
									alt='menu'
									width={24}
									height={24}
									className='cursor-pointer'
								></Image>
							</button>
						</div>
					) : (
						<div className='*:bg-emerald-600 *:bg-opacity-40 *:p-2 *:m-2 *:hover:bg-opacity-40 *:rounded-md *:text-center flex flex-col max-md:flex-row'>
							<Link
								href='/dashboard'
								className='home-link'
							>
								<Image
									src='/icons/home.svg'
									alt='logo'
									width={24}
									height={24}
									className='cursor-pointer'
								></Image>
							</Link>
							<Link
								href='/dashboard/search'
								className='search-link'
							>
								<Image
									src='/icons/search.svg'
									alt='search'
									width={24}
									height={24}
									className='cursor-pointer'
								></Image>
							</Link>
							<Link
								href='/dashboard/deck'
								className='deck-link'
							>
								<Image
									src='/icons/card.svg'
									alt='deck'
									width={24}
									height={24}
									className='cursor-pointer'
								></Image>
							</Link>
							<Link
								href='/dashboard/preview'
								className='preview-link'
							>
								<Image
									src='/icons/file-play.svg'
									alt='preview'
									width={24}
									height={24}
									className='cursor-pointer'
								></Image>
							</Link>
							<Link
								href='/dashboard/chat'
								className='chat-link'
							>
								<Image
									src='/icons/chat.svg'
									alt='chat'
									width={24}
									height={24}
									className='cursor-pointer'
								></Image>
							</Link>
							<Link
								href='/market'
								className='market-link'
							>
								<Image
									src='/icons/shop.svg'
									alt='market'
									width={24}
									height={24}
									className='cursor-pointer'
								></Image>
							</Link>
							<button
								className='more-options'
								onClick={() => setIsBiMenuOpen(true)}
							>
								<Image
									src='/icons/more.svg'
									alt='menu'
									width={24}
									height={24}
									className='cursor-pointer'
								></Image>
							</button>
						</div>
					)}
				</div>
				<div className='flex-grow w-full overflow-auto h-full relative content-area'>
					{children}
				</div>
			</SessionProvider>
		</div>
	);
}
