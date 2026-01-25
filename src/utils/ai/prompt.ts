import { LangEnum } from '@/type';
import { FunctionDeclaration, Type } from '@google/genai';
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

// Optimized chat instruction for Function Calling
export const chatModelInstruction = `You are Lingo, an enthusiastic English learning companion! 🌟

**Your Role:**
Help users learn English through friendly conversation while managing their vocabulary decks.

**Personality:**
- Warm, supportive, and genuinely excited about their progress
- Natural and conversational (like chatting with a friend)
- Patient and encouraging, never judgmental
- Proactive in offering tips and asking follow-up questions

**Available Functions:**
You have 6 tools at your disposal:

1. **add_deck** - Create a new vocabulary deck with words
   - Ask for confirmation before creating
   - Suggest appropriate deck names if needed
   - Include a friendly message explaining the action

2. **add_card** - Add words to an existing deck
   - Can use deckId OR deckName to identify the deck
   - Confirm the action in your message

3. **remove_deck** - Delete a deck
   - Always confirm before deleting
   - Be empathetic about losing progress

4. **edit_deck** - Modify deck contents (add/remove words)
   - Explain what changes you're making
   - Use this for bulk operations

5. **grammer_correction** - Point out grammar errors in user's message
   - Use when you spot grammar mistakes
   - Provide offset, length, and corrected text
   - Only call this when there are actual errors

6. **word_list** - Display a list of words to the user
   - Use when user asks about specific vocabulary
   - Show words they should learn or review

**Function Calling Guidelines:**
- For casual conversation, respond directly WITHOUT calling any function
- ONLY call functions when you need to perform specific actions:
  - Creating/modifying/deleting decks
  - Correcting grammar errors
  - Showing vocabulary lists
- When calling deck functions, ALWAYS include a friendly "message" parameter
- You can call multiple functions if needed (e.g., grammer_correction + add_card)

**When to Use Functions:**
- Deck operations → use add_deck, add_card, remove_deck, edit_deck
- Grammar errors detected → use grammer_correction
- Showing vocabulary → use word_list
- General chat/teaching/tips → respond directly (NO function call)

**Examples:**
- User: "How do you say hello in English?" → Direct text response
- User: "Create a deck called Travel with hello, goodbye" → add_deck function
- User: "Add computer to Tech deck" → add_card function
- User: "I goed to school yesterday" → grammer_correction function + direct response

**Privacy:**
Never reveal internal IDs or technical details. Keep it friendly and natural!

Remember: You're here to chat, teach, and help. Be the learning buddy they deserve! 🚀`;

// Function declarations for Gemini Function Calling
export const chatActionFunctionDeclarations: FunctionDeclaration[] = [
  {
    name: 'add_deck',
    description:
      'Create a new deck with the given name and fill it with the given words.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        deckName: {
          type: Type.STRING,
          description: 'The name of the new deck.',
        },
        words: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
          description: 'Array of words to add to the new deck.',
        },
        message: {
          type: Type.STRING,
          description: 'Response message to show to the user.',
        },
      },
      required: ['deckName', 'words', 'message'],
    },
  },
  {
    name: 'add_card',
    description: 'Add new cards/words to an existing deck.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        deckId: {
          type: Type.STRING,
          description:
            'The ID of the target deck. Optional if deckName is provided.',
        },
        deckName: {
          type: Type.STRING,
          description:
            'The name of the target deck. Optional if deckId is provided.',
        },
        words: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
          description: 'Array of words to add to the deck.',
        },
        message: {
          type: Type.STRING,
          description: 'Response message to show to the user.',
        },
      },
      required: ['words', 'message'],
    },
  },
  {
    name: 'remove_deck',
    description: 'Remove a deck by its ID or name.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        deckId: {
          type: Type.STRING,
          description: 'The ID of the deck to remove.',
        },
        deckName: {
          type: Type.STRING,
          description:
            'The name of the deck to remove (alternative to deckId).',
        },
        message: {
          type: Type.STRING,
          description: 'Response message to show to the user.',
        },
      },
      required: ['message'],
    },
  },
  {
    name: 'edit_deck',
    description:
      'Edit a deck by adding or removing words. Words in the array will be added if not present, or removed if already present.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        deckId: {
          type: Type.STRING,
          description: 'The ID of the deck to edit.',
        },
        words: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
          description: 'Words to add or remove from the deck.',
        },
        newDeckName: {
          type: Type.STRING,
          description: 'Optional new name for the deck.',
        },
        message: {
          type: Type.STRING,
          description: 'Response message to show to the user.',
        },
      },
      required: ['deckId', 'words', 'message'],
    },
  },
  {
    name: 'grammer_correction',
    description: 'Provide grammar corrections for the user message.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        grammerFix: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              replaceTarget: {
                type: Type.STRING,
                description: 'The original text segment with grammar error.',
              },
              correctedText: {
                type: Type.STRING,
                description: 'The corrected text.',
              },
            },
            required: ['replaceTarget', 'correctedText'],
          },
          description: 'Optional grammar corrections for the user message.',
        },
      },
      required: ['grammerFix'],
    },
  },
  {
    name: 'word_list',
    description: 'Show a list of words to the user.',
    parameters: {
      type: Type.OBJECT,
      properties: {
        words: {
          type: Type.ARRAY,
          items: {
            type: Type.STRING,
          },
          description: 'Array of words to show to the user.',
        },
      },
      required: ['words'],
    },
  },
];
