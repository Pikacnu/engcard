import { CardProps, PartOfSpeech } from '@/type';
import Questions from '@/components/questions';

export default function Home() {
	//generate about 10 cards with each card having 1-3 blocks
	const cards: CardProps[] = [
		{
			word: 'Hello',
			phonetic: 'hɛˈloʊ',
			blocks: [
				{
					partOfSpeech: PartOfSpeech.Interjection,
					definitions: [
						{
							definition: [
								{
									lang: 'en',
									content: 'used as a greeting or to begin a conversation',
								},
							],
							example: [
								[
									{
										lang: 'en',
										content: 'hello there, Katie!',
									},
								],
							],
						},
					],
				},
			],
		},
		{
			word: 'World',
			phonetic: 'wɝːld',
			blocks: [
				{
					partOfSpeech: PartOfSpeech.Noun,
					definitions: [
						{
							definition: [
								{
									lang: 'en',
									content: 'the earth and all people and things on it',
								},
							],
							example: [
								[
									{
										lang: 'en',
										content: 'he was doing his bit to save the world',
									},
								],
							],
						},
					],
				},
			],
		},
		{
			word: 'Goodbye',
			phonetic: 'ɡʊdˈbaɪ',
			blocks: [
				{
					partOfSpeech: PartOfSpeech.Interjection,
					definitions: [
						{
							definition: [
								{
									lang: 'en',
									content:
										'used to express good wishes when parting or at the end of a conversation',
								},
							],
							example: [
								[
									{
										lang: 'en',
										content: 'goodbye, everyone!',
									},
								],
							],
						},
					],
				},
			],
		},
		{
			word: 'Love',
			phonetic: 'lʌv',
			blocks: [
				{
					partOfSpeech: PartOfSpeech.Noun,
					definitions: [
						{
							definition: [
								{
									lang: 'en',
									content: 'an intense feeling of deep affection',
								},
							],
							example: [
								[
									{
										lang: 'en',
										content:
											'babies fill parents with intense feelings of love',
									},
								],
							],
						},
					],
				},
			],
		},
		{
			word: 'Hate',
			phonetic: 'heɪt',
			blocks: [
				{
					partOfSpeech: PartOfSpeech.Noun,
					definitions: [
						{
							definition: [
								{
									lang: 'en',
									content: 'intense or passionate dislike',
								},
							],
							example: [
								[
									{
										lang: 'en',
										content: 'feelings of hate and revenge',
									},
								],
							],
						},
					],
				},
			],
		},
		{
			word: 'Peace',
			phonetic: 'pis',
			blocks: [
				{
					partOfSpeech: PartOfSpeech.Noun,
					definitions: [
						{
							definition: [
								{
									lang: 'en',
									content: 'freedom from disturbance; quiet and tranquility',
								},
							],
							example: [
								[
									{
										lang: 'en',
										content: 'the peace of a deep sleep',
									},
								],
							],
						},
					],
				},
			],
		},
		{
			word: 'War',
			phonetic: 'wɔːr',
			blocks: [
				{
					partOfSpeech: PartOfSpeech.Noun,
					definitions: [
						{
							definition: [
								{
									lang: 'en',
									content:
										'a state of armed conflict between different countries or different groups within a country',
								},
							],
							example: [
								[
									{
										lang: 'en',
										content: 'Japan declared war on Germany',
									},
								],
							],
						},
					],
				},
			],
		},
	];
	return (
		<div className='flex flex-col items-center justify-center min-h-screen py-2 bg-gray-700'>
			<Questions cards={cards}></Questions>
		</div>
	);
}
