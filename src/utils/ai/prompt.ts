import { ChatAction, LangEnum } from '@/type';
import { FunctionDeclaration, SchemaType } from '@google/generative-ai';
import { Content } from '@google/genai';
import { LangEnglishNames } from '@/types/lang';

// Core prompt templates for better caching
const CORE_SYSTEM_TEMPLATE = `You are an expert linguist specializing in multilingual dictionary enhancement. Process the provided dictionary data with precision and comprehensiveness.

**Core Requirements:**
- Preserve ALL original data structure and content exactly
- Add target language field containing accurate translations of the word
- Translate ALL definitions and examples with linguistic precision
- Provide minimum 3 varied examples per definition in both source and target languages
- Maintain professional accuracy, cultural appropriateness, and contextual relevance
- Return valid JSON with identical structure plus enhanced multilingual fields

**Translation Standards:**
- Sort definitions by frequency of usage in modern source language
- **Consolidate definitions sharing the same part of speech into unified blocks**
- Ensure natural, idiomatic translations that preserve meaning and register
- Include cultural context where relevant for better comprehension

**Critical Quality Checks:**
- Every definition and example MUST include both source and target language versions
- Incomplete or missing translations are strictly unacceptable
- availableSearchTarget must only contain source words with semantically equivalent meanings in target language
- Synonyms and antonyms must be accurately translated to target language

**Structural Organization:**
Group all definitions by part of speech (noun, verb, adjective, adverb, etc.) into cohesive blocks rather than fragmenting into separate entries per definition.`;

// Language-specific mappings for better caching
const LANG_MAPPINGS = {
	'en-tw': {
		sourceDesc: 'English',
		targetDesc: 'Traditional Chinese',
		sourceCode: 'en',
		targetCode: 'tw',
	},
	'tw-en': {
		sourceDesc: 'Traditional Chinese',
		targetDesc: 'English',
		sourceCode: 'tw',
		targetCode: 'en',
	},
	// Add more language pairs as needed
} as const;

export const wordSystemInstructionCreator = (
	source: LangEnum,
	target: LangEnum,
): string => {
	const langKey = `${source}-${target}` as keyof typeof LANG_MAPPINGS;
	const mapping = LANG_MAPPINGS[langKey];

	if (!mapping) {
		// Fallback for unsupported language pairs
		return CORE_SYSTEM_TEMPLATE.replace(
			/source language/g,
			LangEnglishNames[source],
		)
			.replace(/target language/g, LangEnglishNames[target])
			.replace(
				/source and target languages/g,
				`${LangEnglishNames[source]} (${source}) and ${LangEnglishNames[target]} (${target})`,
			);
	}

	return CORE_SYSTEM_TEMPLATE.replace(/source language/g, mapping.sourceDesc)
		.replace(/target language/g, mapping.targetDesc)
		.replace(
			/source and target languages/g,
			`${mapping.sourceDesc} (${mapping.sourceCode}) and ${mapping.targetDesc} (${mapping.targetCode})`,
		);
};

// Optimized few-shot examples for better caching
export const wordGeminiHistory: Content[] = [
	{
		role: 'user',
		parts: [
			{
				text: '[{"word":"search","phonetic":"/sɜːt͡ʃ/","meanings":[{"partOfSpeech":"noun","definitions":[{"definition":"An attempt to find something.","example":"The search for the keys started in earnest."},{"definition":"The act of searching in general.","example":"Search is a hard problem for computers."}]},{"partOfSpeech":"verb","definitions":[{"definition":"To look in (a place) for something.","example":"I searched the garden for the keys."},{"definition":"To look thoroughly.","example":"The police are searching for evidence."}]}]}]',
			},
		],
	},
	{
		role: 'model',
		parts: [
			{
				text: '{"blocks":[{"partOfSpeech":"noun","definitions":[{"definition":[{"content":"An attempt to find something.","lang":"en"},{"content":"尋找某物的嘗試。","lang":"tw"}],"example":[{"content":"The search for the keys started in earnest.","lang":"en"},{"content":"尋找鑰匙的工作認真地開始了。","lang":"tw"},{"content":"The police conducted a thorough search.","lang":"en"},{"content":"警察進行了徹底的搜索。","lang":"tw"},{"content":"The search continues for survivors.","lang":"en"},{"content":"搜尋倖存者的工作繼續進行。","lang":"tw"}]},{"definition":[{"content":"The act of searching in general.","lang":"en"},{"content":"一般搜尋的行為。","lang":"tw"}],"example":[{"content":"Search is a hard problem for computers.","lang":"en"},{"content":"搜尋對電腦來說是個難題。","lang":"tw"},{"content":"The internet revolutionized search.","lang":"en"},{"content":"互聯網徹底改變了搜索。","lang":"tw"},{"content":"Search algorithms are crucial.","lang":"en"},{"content":"搜尋演算法至關重要。","lang":"tw"}]}]},{"partOfSpeech":"verb","definitions":[{"definition":[{"content":"To look in (a place) for something.","lang":"en"},{"content":"在某處尋找某物。","lang":"tw"}],"example":[{"content":"I searched the garden for the keys.","lang":"en"},{"content":"我在花園裡找鑰匙。","lang":"tw"},{"content":"She searched her bag.","lang":"en"},{"content":"她搜查了她的包。","lang":"tw"},{"content":"We searched the entire house.","lang":"en"},{"content":"我們搜索了整棟房子。","lang":"tw"}]},{"definition":[{"content":"To look thoroughly.","lang":"en"},{"content":"徹底尋找。","lang":"tw"}],"example":[{"content":"The police are searching for evidence.","lang":"en"},{"content":"警察正在搜查證據。","lang":"tw"},{"content":"They searched for survivors.","lang":"en"},{"content":"他們搜尋倖存者。","lang":"tw"},{"content":"We searched for a solution.","lang":"en"},{"content":"我們尋找解決方案。","lang":"tw"}]}]}],"phonetic":"/sɜːt͡ʃ/","tw":["搜尋","搜索"],"word":"search"}',
			},
		],
	},
];

// Optimized OCR instruction for better caching
export const textRecognizeModelInstruction = `Extract meaningful English vocabulary words from provided text and images.

**Requirements:**
- Extract content words suitable for vocabulary learning
- Include technical terms and specialized vocabulary
- Exclude common function words (the, a, an, and, or, but, in, on, at, to, for, of, with, by, etc.)
- Only extract words actually present in the source

**Output:** JSON array of words

If interrupted, continue from cutoff point maintaining valid JSON structure.`;

// Optimized chat instruction for better caching
export const chatModelInstruction = `You are a helpful AI assistant for English learning. Help users manage vocabulary decks and provide conversation practice.

**Core Personality:**
- Be conversational, warm, and encouraging
- Focus on conversations with users as primary goal
- Show genuine interest in their learning journey

**Communication:**
- Engage naturally with follow-up questions and suggestions
- Share relevant learning tips when appropriate
- Make learning feel like friendly chat

**Grammar Corrections:**
- Point out specific errors with explanations
- Provide corrected versions
- Output in JSON format in grammarFix field

**Privacy Protection:**
Never reveal deck IDs, user IDs, or internal system information.

**Actions (JSON format):**

Show Output: {"action": "ShowOutput", "message": "response"}
Add Deck: {"action": "AddDeck", "deckName": "name", "words": ["word1", "word2"]}
Remove Deck: {"action": "RemoveDeck", "deckId": "id"}
Edit Deck: {"action": "EditDeck", "deckId": "id", "words": ["words"], "newDeckName": "optional"}

Remember: Be a supportive learning companion who loves to chat and help!`;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const functions: FunctionDeclaration[] = [
	{
		name: ChatAction.AddDeck,
		description: 'Add a new deck with the given name.',
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				deckName: {
					type: SchemaType.STRING,
					description: 'The name of the new deck.',
				},
				words: {
					type: SchemaType.ARRAY,
					items: {
						type: SchemaType.STRING,
						description: 'The words to add to the new deck.',
					},
				},
			},
			required: ['deckName', 'words'],
		},
	},
	{
		name: ChatAction.RemoveDeck,
		description: 'Remove the given deck by deckid.',
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				deckId: {
					type: SchemaType.STRING,
					description: 'The ID of the deck to remove.',
				},
			},
			required: ['deckId'],
		},
	},
	{
		name: ChatAction.EditDeck,
		description: 'Edit the given deck by deckid.',
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				deckId: {
					type: SchemaType.STRING,
					description: 'The ID of the deck to edit.',
				},
				words: {
					type: SchemaType.ARRAY,
					items: {
						type: SchemaType.STRING,
						description:
							'The words to add to the deck.If it is in the deck, words will be removed.',
					},
				},
				newDeckName: {
					type: SchemaType.STRING,
					description: 'The new name of the deck.',
				},
			},
			required: ['deckId', 'words'],
		},
	},
	{
		name: ChatAction.ShowOuput,
		description: 'Show the output to the user.',
		parameters: {
			type: SchemaType.OBJECT,
			properties: {
				message: {
					type: SchemaType.STRING,
					description: 'The message to show to the user.',
				},
			},
			required: ['message'],
		},
	},
];
