'use client';
import List from '@/components/list';
import Add from './add';
import Search from './search';
import {
	use,
	useCallback,
	useEffect,
	useMemo,
	useRef,
	useState,
	useTransition,
} from 'react';
import { CardProps, DeckCollection } from '@/type';
import { FileToBase64 } from '@/utils/base64';
import { useTranslation } from '@/context/LanguageContext';
import { CallBackProps, Joyride, Status, STATUS, Step } from 'react-joyride';
import { useLocalStorage } from '@/hooks/localstorage';
import { useDevice } from '@/hooks/useDevice';

export default function EditPage({
	params,
}: {
	params: Promise<{ id: string }>;
}) {
	const { t } = useTranslation();
	const { id } = use(params);
	const [deck, setDeck] = useState<DeckCollection | null>();
	const [isPending, startTransition] = useTransition();
	const [processingWordTimestamp, setProcessingWordTimestamp] = useState(0);
	const file = useRef<HTMLInputElement>(null);
	const cardProcessing: CardProps = useMemo(
		() => ({
			word: t('dashboard.deckEdit.processingWord'), // Translated
			phonetic: '',
			blocks: [],
			flipped: true,
		}),
		[t],
	);
	const { isMobile } = useDevice();

	const refresh = useCallback(() => {
		fetch(`/api/deck?id=${id}`)
			.then((res) => res.json())
			.then((data) => {
				if (data.error) {
					return;
				}
				let deckData: DeckCollection = data as DeckCollection;
				if (processingWordTimestamp > 0) {
					deckData = {
						...data,
						cards: data.cards.filter(
							(card: CardProps) => card.word !== cardProcessing.word,
						),
					};
				}
				setDeck(deckData);
			});
	}, [id, processingWordTimestamp, cardProcessing.word]);

	useEffect(() => {
		refresh();
	}, [refresh]);

	const [isGuideEdit, setIsGuideEdit] = useLocalStorage<boolean>(
		'guideEdit',
		false,
	);

	const [joyrideRun, setJoyrideRun] = useState(!isGuideEdit);
	const steps: Array<Step> = [
		{
			target: '.add-area',
			content: t('dashboard.deckEdit.joyride.step1Content'),
			placement: isMobile ? 'center' : 'right',
		},
		{
			target: '.upload-area',
			content: t('dashboard.deckEdit.joyride.step2Content'),
			placement: 'top',
		},
		{
			target: '.search-area',
			content: t('dashboard.deckEdit.joyride.step3Content'),
			placement: 'top',
		},
		{
			target: '.list-area',
			content: t('dashboard.deckEdit.joyride.step4Content'),
			placement: isMobile ? 'center' : 'auto',
		},
	];
	const handleJoyrideCallback = (data: CallBackProps) => {
		const { status } = data;
		if (([STATUS.FINISHED, STATUS.SKIPPED] as Array<Status>).includes(status)) {
			setJoyrideRun(false);
			setIsGuideEdit(true);
		}
	};

	useEffect(() => {
		const now = new Date().getTime();
		if (processingWordTimestamp > 0 && now - processingWordTimestamp <= 0) {
			console.log('Processing word completed or cancelled');
			setProcessingWordTimestamp(0);
			refresh();
			return;
		}
	}, [processingWordTimestamp, refresh]);

	const [isClient, setIsClient] = useState(false);
	useEffect(() => {
		setIsClient(true);
	}, []);

	return (
		<div className='flex flex-row h-full max-md:flex-col *:max-md:w-full *:max-md:min-h-full dark:bg-gray-700'>
			{isPending && (
				<div className=' fixed z-10 inset-0 flex items-center justify-center bg-black bg-opacity-50 h-full w-full top-0 left-0'>
					<svg
						aria-hidden='true'
						className='w-16 h-16 animate-spin text-gray-600 dark:text-gray-400 fill-blue-600'
						viewBox='0 0 100 101'
						fill='none'
						xmlns='http://www.w3.org/2000/svg'
					>
						<path
							d='M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z'
							fill='currentColor'
						/>
						<path
							d='M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z'
							fill='currentFill'
						/>
					</svg>
					<span className='sr-only'>{t('common.loadingSrOnly')}</span>
				</div>
			)}
			<div className='hidden'>
				{isClient && (
					<Joyride
						steps={steps}
						continuous
						showProgress
						showSkipButton
						disableCloseOnEsc
						run={joyrideRun}
						callback={handleJoyrideCallback}
					/>
				)}
			</div>
			<Add
				className='md:max-w-[40vw] w-full md:flex-grow dark:bg-gray-800 add-area'
				id={id}
				onAdd={refresh}
			/>
			<div className='md:max-w-[40vw] xl:w-full overflow-clip dark:bg-gray-800 p-2 '>
				<div className='flex flex-row items-center justify-center bg-slate-200 dark:bg-slate-700 p-2 rounded-lg text-black dark:text-white upload-area'>
					<p className='flex-grow'>
						{t('dashboard.deckEdit.uploadImagePrompt')}
					</p>
					<button
						className='bg-blue-500 dark:bg-blue-600 text-white p-2 rounded-lg hover:bg-blue-600 dark:hover:bg-blue-500'
						onClick={() => {
							const input = document.querySelector(
								'input[type="file"]',
							) as HTMLInputElement | null;
							if (input) {
								input.click();
							}
						}}
					>
						{t('dashboard.deckEdit.uploadButton')} {/* Translated */}
					</button>
					<input
						hidden
						type='file'
						accept='image/*'
						ref={file}
						onInput={async (e) => {
							const target = e.target as HTMLInputElement;
							const file = target.files?.[0];
							if (!file) {
								return;
							}
							try {
								startTransition(async () => {
									let uploadingFile = file;

									if (file.size > 5 * 1024 * 1024) {
										const image = new Image();
										image.src = URL.createObjectURL(file);
										await new Promise((resolve) => {
											image.onload = resolve;
										});
										const canvas = document.createElement('canvas');
										const ctx = canvas.getContext('2d');
										if (!ctx) {
											return;
										}
										canvas.width = image.width;
										canvas.height = image.height;
										ctx.drawImage(image, 0, 0);
										const dataUrl = canvas.toDataURL(
											'image/jpeg',
											file.size > 10 * 1024 * 1024 ? 0.5 : 0.7,
										);
										const blob = await fetch(dataUrl).then((res) => res.blob());
										uploadingFile = new File(
											[blob],
											`${file.name.split('.')[0]}.jpg`,
											{
												type: 'image/jpeg',
											},
										);
									}
									let res;
									try {
										res = await fetch(`/api/ocr/deck?deckId=${id}`, {
											method: 'POST',
											headers: {
												'Content-Type': uploadingFile.type,
												'Content-Length': `${uploadingFile.size}`,
											},
											body: new Blob([uploadingFile], {
												type: uploadingFile.type,
											}),
										});
									} catch (e) {
										console.log(e);

										const base64 = await FileToBase64(uploadingFile);

										res = await fetch(`/api/ocr/deck?deckId=${id}`, {
											method: 'POST',
											headers: {
												'Content-Type': 'base64',
											},
											body: JSON.stringify({
												base64: base64,
												filename: file.name,
												mimeType: file.type,
											}),
										});
									}
									try {
										const json = await res.json();
										if (!res.ok) {
											startTransition(() => {
												alert(
													`${t('dashboard.deckEdit.alertErrorPrefix')}${
														json.error
													}`,
												);
											});
											return;
										}
										console.log(json);
										const timeoutFn = (time: number) => {
											setProcessingWordTimestamp((prev) =>
												prev === time ? 0 : prev,
											);
											refresh();
										};
										setTimeout(
											timeoutFn.bind(null, new Date().getTime()),
											(json.time || 4) * 1000,
										);
										setProcessingWordTimestamp(Date.now());
									} catch (e) {
										console.log(e);
										startTransition(() => {
											alert(t('dashboard.deckEdit.alertUploadError')); // Translated
										});
									}
									startTransition(() => {
										refresh();
									});
								});
							} catch (e) {
								console.log(e);
							}
						}}
					/>
				</div>
				<div className='search-area'>
					<Search
						deckid={id}
						onAdd={refresh}
					/>
				</div>
			</div>
			<List
				cards={(deck ? deck.cards : []).concat(
					processingWordTimestamp > 0 ? [cardProcessing] : [],
				)}
				className='max-h-full md:max-w-[30vw] xl:min-w-[30vw] w-1/5 max-md:w-full overflow-hidden dark:bg-gray-800 list-area'
			/>
		</div>
	);
}
