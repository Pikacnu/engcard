import { useState, useEffect } from 'react';

export const useAudio = (url: string) => {
	const [audio] = useState<HTMLAudioElement | undefined>(
		typeof Audio !== 'undefined' ? new Audio(url) : undefined,
	);
	const [playing, setPlaying] = useState(false);

	const toggle = () => setPlaying(!playing);

	useEffect(() => {
		if (playing) {
			audio?.play();
		} else {
			audio?.pause();
		}
	}, [playing, audio]);

	useEffect(() => {
		audio?.addEventListener('ended', () => setPlaying(false));
		return () => {
			audio?.removeEventListener('ended', () => setPlaying(false));
		};
	}, [audio]);

	return [playing, toggle];
};
