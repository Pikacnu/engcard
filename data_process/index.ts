/*
const file = await Bun.file('data_process/sch.txt').text();
const words = file
	.replaceAll('\r', '')
	.split('\n')
	.map((line) => line.split(' ').filter((word) => word.length > 0));
const wrongFormats = words
	.filter((word) => word.length !== 3)
	.map((word) =>
		word
			.join(' ')
			.replaceAll(' ', '')
			.replace(/([A-z]+)(\W+)(\d+)/, '$1 $2 $3')
			.split(' '),
	);
const correctFormats = words.filter((word) => word.length === 3);
const allWords = [...correctFormats, ...wrongFormats].map((word) =>
	word.splice(0, 2),
);
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const sortedByWord = allWords.sort((a, b) => a[0].localeCompare(b[0]));
Bun.write('data_process/sch.json', JSON.stringify(sortedByWord, null, 2));
*/
