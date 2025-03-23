import { CardProps, PartOfSpeech } from '@/type';

export const CardWhenEmpty: CardProps = {
	word: 'No Cards',
	phonetic: 'No Cards',
	blocks: [
		{
			partOfSpeech: PartOfSpeech.Error,
			definitions: [
				{
					definition: [
						{
							lang: 'en',
							content: 'Error Occured, Please Report to Developer',
						},
						{
							lang: 'tw',
							content: '發生錯誤，請回報給開發者',
						},
					],
				},
			],
		},
	],
};
