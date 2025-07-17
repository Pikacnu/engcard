import { useMemo } from 'react';

export default function TestTextParser({ text }: { text: string }) {
	const parsedResult = useMemo(() => {
		const regex =
			/([\u4E00-\u9FFF\wぁ-ゔゞァ-・ヽヾ゛゜ー一-龯-]+)\^([\w \u4E00-\u9FFFぁ-ゔゞァ-・ヽヾ゛゜ー一-龯 ]*)\./gm;
		const result: Record<string, string> = {};
		let match;
		while ((match = regex.exec(text)) !== null) {
			if (match.index === regex.lastIndex) {
				regex.lastIndex++;
			}
			if (match[2].length > match[1].length) {
				console.warn(
					`Warning: The value "${match[2]}" is longer than the key "${match[1]}".`,
				);
			}
			result[match[1]] = match[2];
		}
		return result;
	}, [text]);

	return (
		<div className='p-4 bg-gray-100 dark:bg-gray-800 rounded-lg shadow text-black dark:text-white'>
			<h2 className='text-xl font-bold mb-4'>Parsed Result</h2>
			{Object.entries(parsedResult).map(([key, value]) => (
				<span
					key={key}
					className='mb-2 relative inline-flex'
					style={{
						paddingLeft:
							value.length > key.length
								? `${Math.floor((value.length - key.length) / 2)}em`
								: undefined,
						paddingRight:
							value.length > key.length
								? `${Math.floor((value.length - key.length) / 2)}em`
								: undefined,
					}}
				>
					{key}
					<sup className='absolute left-1/2 transform -translate-x-1/2 w-full text-center'>
						{value}
					</sup>
				</span>
			))}
		</div>
	);
}
