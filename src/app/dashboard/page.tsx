'use server';
import { getRecentlyHistory, getRecentHotWords } from '@/actions/history';

export default async function DashBoard() {
	const recentHistory = await getRecentlyHistory();
	const hotWord = await getRecentHotWords(5);
	const hotWords = hotWord
		.map((word) => {
			const count = word.count;
			const words = word._id.map((w: string) => ({
				word: w,
				count,
			}));
			return [...words];
		})
		.flat()
		.sort((a, b) => b.count - a.count)
		.slice(0, 5);
	return (
		<div className='min-h-screen p-4 flex flex-col overflow-auto'>
			<div className='w-full max-w-4xl *:[h-1/2] flex flex-col space-y-4 *:flex-grow *:overflow-auto'>
				<div className='mb-6 bg-white p-6 rounded-lg shadow-lg'>
					<h2 className='text-2xl font-semibold mb-4 text-gray-800'>
						Recent History
					</h2>
					<ul className='list-disc pl-5 space-y-2 gap-4'>
						{recentHistory.length > 0 ? (
							recentHistory.map((item, index) => (
								<li
									key={index}
									className='text-gray-700 flex-wrap flex items-center'
								>
									<span className='font-medium flex flex-wrap gap-2'>
										{item.words.map((word, i2) => (
											<span
												key={word + index.toString() + i2.toString()}
												className='p-2 rounded-lg bg-blue-700 bg-opacity-40 mx-2'
											>
												{word}
											</span>
										))}
									</span>
									<span className='text-gray-500'>
										{' - '}
										{new Date(item.date).toLocaleString()}
									</span>
								</li>
							))
						) : (
							<li className='text-gray-500'>No recent history available.</li>
						)}
					</ul>
				</div>
				<div className='bg-white p-6 rounded-lg shadow-lg text-black'>
					<h2 className='text-2xl font-semibold mb-4 text-gray-800'>
						Hot Words Leaderboard
					</h2>
					{hotWords.length > 0 ? (
						<table className='table-auto w-full border-collapse border border-gray-200'>
							<thead>
								<tr className='bg-gray-100'>
									<th className='border border-gray-200 px-4 py-2 text-left'>
										Rank
									</th>
									<th className='border border-gray-200 px-4 py-2 text-left'>
										Word
									</th>
									<th className='border border-gray-200 px-4 py-2 text-left'>
										Count
									</th>
								</tr>
							</thead>
							<tbody>
								{hotWords.map((word, index) => (
									<tr
										key={index}
										className='hover:bg-gray-50'
									>
										<td className='border border-gray-200 px-4 py-2'>
											#{index + 1}
										</td>
										<td className='border border-gray-200 px-4 py-2 text-blue-700'>
											{word.word}
										</td>
										<td className='border border-gray-200 px-4 py-2'>
											{word.count} times
										</td>
									</tr>
								))}
							</tbody>
						</table>
					) : (
						<div className='text-gray-500'>No hot words available.</div>
					)}
				</div>
			</div>
		</div>
	);
}
