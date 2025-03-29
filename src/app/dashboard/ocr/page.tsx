'use client';

export default function OCR() {
	return (
		<div className='flex flex-col items-center justify-center h-full bg-gray-700 w-full'>
			<div className='flex flex-row'>
				{/*
				<input
					type='file'
					accept='image/*'
					onChange={async (e) => {
						const file = e.target.files?.[0];
						if (!file) {
							return;
						}
						try {
							const res = await fetch('/api/ocr', {
								method: 'POST',
								headers: {
									'Content-Type': file.type,
								},
								body: file,
							});
							if (!res.ok) {
								throw new Error('Failed to upload image');
							}
							const json = await res.json();
							console.log(json);
						} catch (e) {
							console.error(e);
						}
					}}
				/>
        */}
			</div>
		</div>
	);
}
