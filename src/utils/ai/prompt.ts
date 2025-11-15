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
- availableSearchTarget must contain search terms in source language, including the original word and its variations
- Synonyms and antonyms must be accurately translated to target language

**Language-Specific Guidelines:**
- If source is Japanese: use Kanji for definitions/examples, Hiragana for phonetics

**Structural Organization:**
Group all definitions by part of speech (noun, verb, adjective, adverb, etc.) into cohesive blocks rather than fragmenting into separate entries per definition.`;

export const wordSystemInstructionCreator = (
  source: LangEnum[],
  target: LangEnum,
): string => {
  return CORE_SYSTEM_TEMPLATE.replace(
    /source language/g,
    source.map((l) => LangEnglishNames[l]).join(', '),
  )
    .replace(/target language/g, LangEnglishNames[target])
    .replace(
      /source and target languages/g,
      `${source.map((l) => LangEnglishNames[l]).join(', ')} (${source.join(
        ', ',
      )}) and ${LangEnglishNames[target]} (${target})`,
    );
};

// 精簡的示例對話 - 針對效能優化
export const wordGeminiHistory: Content[] = [
  // 英文示例 - 展示基本轉換格式
  {
    role: 'user',
    parts: [
      {
        text: '[{"word":"search","phonetic":"/sɜːt͡ʃ/","meanings":[{"partOfSpeech":"noun","definitions":[{"definition":"An attempt to find something.","example":"The search for the keys started in earnest."}]},{"partOfSpeech":"verb","definitions":[{"definition":"To look in (a place) for something.","example":"I searched the garden for the keys."}]}]}]',
      },
    ],
  },
  {
    role: 'model',
    parts: [
      {
        text: '{"word":"search","phonetic":"/sɜːt͡ʃ/","availableSearchTarget":["search","searching","searches","searched"],"blocks":[{"partOfSpeech":"noun","definitions":[{"definition":[{"content":"An attempt to find something.","lang":"en"},{"content":"尋找某物的嘗試。","lang":"zh-tw"}],"synonyms":["quest","hunt","exploration"],"antonyms":["abandonment","neglect"],"example":[[{"content":"The search for the keys started in earnest.","lang":"en"},{"content":"尋找鑰匙的工作認真地開始了。","lang":"zh-tw"}],[{"content":"The police conducted a thorough search.","lang":"en"},{"content":"警察進行了徹底的搜索。","lang":"zh-tw"}],[{"content":"The search continues for survivors.","lang":"en"},{"content":"搜尋倖存者的工作繼續進行。","lang":"zh-tw"}]]}]},{"partOfSpeech":"verb","definitions":[{"definition":[{"content":"To look in (a place) for something.","lang":"en"},{"content":"在某處尋找某物。","lang":"zh-tw"}],"synonyms":["seek","hunt","explore"],"antonyms":["ignore","overlook"],"example":[[{"content":"I searched the garden for the keys.","lang":"en"},{"content":"我在花園裡找鑰匙。","lang":"zh-tw"}],[{"content":"She searched her bag.","lang":"en"},{"content":"她搜查了她的包。","lang":"zh-tw"}],[{"content":"We searched the entire house.","lang":"en"},{"content":"我們搜索了整棟房子。","lang":"zh-tw"}]]}]}],"zh-tw":["搜尋","搜索"]}',
      },
    ],
  },
  // 日文示例 - 展示日文處理
  {
    role: 'user',
    parts: [
      {
        text: '[{"word":"勉強","phonetic":"べんきょう","meanings":[{"partOfSpeech":"noun","definitions":[{"definition":"知識や技能を身につけるための学習活動。","example":"毎日三時間勉強している。"}]},{"partOfSpeech":"verb","definitions":[{"definition":"学習して知識を身につける。","example":"試験のために一生懸命勉強した。"}]}]}]',
      },
    ],
  },
  {
    role: 'model',
    parts: [
      {
        text: '{"word":"勉強","phonetic":"べんきょう","availableSearchTarget":["勉強","べんきょう","ベンキョウ","study","learning"],"blocks":[{"partOfSpeech":"noun","definitions":[{"definition":[{"content":"知識や技能を身につけるための学習活動。","lang":"ja"},{"content":"為了獲得知識或技能而進行的學習活動。","lang":"zh-tw"}],"synonyms":["学習","修習","研修"],"antonyms":["怠惰","放棄"],"example":[[{"content":"毎日三時間勉強している。","lang":"ja"},{"content":"我每天讀書三小時。","lang":"zh-tw"}],[{"content":"彼女は勉強熱心だ。","lang":"ja"},{"content":"她很認真讀書。","lang":"zh-tw"}],[{"content":"勉強の成果が出た。","lang":"ja"},{"content":"讀書的成果顯現出來了。","lang":"zh-tw"}]]}]},{"partOfSpeech":"verb","definitions":[{"definition":[{"content":"学習して知識を身につける。","lang":"ja"},{"content":"通過學習獲得知識。","lang":"zh-tw"}],"synonyms":["学ぶ","習う","修める"],"antonyms":["怠ける","諦める"],"example":[[{"content":"試験のために一生懸命勉強した。","lang":"ja"},{"content":"為了考試而拼命讀書。","lang":"zh-tw"}],[{"content":"図書館で勉強する。","lang":"ja"},{"content":"在圖書館讀書。","lang":"zh-tw"}],[{"content":"友達と一緒に勉強した。","lang":"ja"},{"content":"和朋友一起讀書。","lang":"zh-tw"}]]}]}],"zh-tw":["學習","讀書","研究"]}',
      },
    ],
  },
  // 多語言示例 - 展示複雜處理
  {
    role: 'user',
    parts: [
      {
        text: '[{"word":"technology","phonetic":"/tɛkˈnɒlədʒi/","meanings":[{"partOfSpeech":"noun","definitions":[{"definition":"The application of scientific knowledge for practical purposes.","example":"Modern technology has changed our lives."}]}]}]',
      },
    ],
  },
  {
    role: 'model',
    parts: [
      {
        text: '{"word":"technology","phonetic":"/tɛkˈnɒlədʒi/","availableSearchTarget":["technology","technologies","technological","tech"],"blocks":[{"partOfSpeech":"noun","definitions":[{"definition":[{"content":"The application of scientific knowledge for practical purposes.","lang":"en"},{"content":"為實用目的而應用科學知識。","lang":"zh-tw"},{"content":"実用的な目的のための科学的知識の応用。","lang":"ja"}],"synonyms":["innovation","engineering","science"],"antonyms":["primitiveness","backwardness"],"example":[[{"content":"Modern technology has changed our lives.","lang":"en"},{"content":"現代科技改變了我們的生活。","lang":"zh-tw"},{"content":"現代の技術は私たちの生活を変えました。","lang":"ja"}],[{"content":"We rely on technology every day.","lang":"en"},{"content":"我們每天都依賴科技。","lang":"zh-tw"},{"content":"私たちは毎日技術に頼っています。","lang":"ja"}],[{"content":"Technology continues to advance rapidly.","lang":"en"},{"content":"科技持續快速發展。","lang":"zh-tw"},{"content":"技術は急速に進歩し続けています。","lang":"ja"}]]}]}],"zh-tw":["科技","技術","科學技術"],"ja":["技術","テクノロジー","科学技術"]}',
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

export const getTextRecognizeModelInstructionWithLanguage = (
  targetLang: LangEnum | LangEnum[],
) => {
  return textRecognizeModelInstruction.replace(
    /English/g,
    Array.isArray(targetLang)
      ? targetLang.map((l) => LangEnglishNames[l]).join(', ')
      : LangEnglishNames[targetLang],
  );
};

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
