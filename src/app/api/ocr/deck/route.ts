import {
  auth,
  Base64ToFile,
  getTextRecognizeModelInstructionWithLanguage,
  GTextRecognizeSchema,
  Models,
  textRecognizeModelInstruction,
  textRecognizeSchema,
  uploadFile,
} from '@/utils';
import { NextResponse } from 'next/server';
import { GET } from '@/app/api/word/route';
import {
  allowedImageExtension,
  CardProps,
  Deck,
  ExtenstionTable,
  ExtenstionToMimeType,
  LangEnum,
  OCRProcessType,
  UserSettingsCollection,
  WordCollection,
} from '@/type';
import db from '@/lib/db';
import { ObjectId } from 'mongodb';
import {
  getDefiniationFromRecognizedResultAndCardProps,
  transfromToCardPropsFromRecognizedResult,
} from '@/utils/dict/functions';
import { FinishReason } from '@google/generative-ai';

export async function POST(req: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const url = new URL(req.url);
  const params = url.searchParams;

  const deckId = params.get('deckId') as string;

  if (!deckId) {
    return NextResponse.json({ error: 'DeckId is required' }, { status: 400 });
  }

  const deck = await db
    .collection<Deck>('deck')
    .findOne({ _id: new ObjectId(deckId), userId: session.user?.id });

  if (!deck) {
    return NextResponse.json({ error: 'Deck not found' }, { status: 404 });
  }

  if (deck.userId !== session.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  let imageData;

  if (req.headers.get('content-type')?.includes('base64')) {
    const { base64, filename, mimeType } = await req.json();
    if (!base64 || !filename || !mimeType) {
      return NextResponse.json(
        { error: 'Need three arguments' },
        { status: 400 },
      );
    }
    const imageData = Base64ToFile(base64, filename, mimeType);
    if (!imageData) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }
  } else {
    imageData = (await req.blob()) as Blob;
    console.log(imageData);
    if (!imageData) {
      return NextResponse.json({ error: 'Image is required' }, { status: 400 });
    }
  }

  if (!imageData) {
    return NextResponse.json({ error: 'Image is required' }, { status: 400 });
  }

  const imageType =
    (ExtenstionTable.get(imageData.type) as string) ||
    (req.headers.get('content-type') as string);

  console.log(imageType);
  if (!allowedImageExtension.includes(imageType)) {
    return NextResponse.json({ error: 'Invalid image type' }, { status: 400 });
  }

  //if file is larger than 7MB
  if (imageData.size > 7_000_000) {
    return NextResponse.json(
      { error: 'File is too large, max size is 7MB' },
      { status: 400 },
    );
  }

  const settings = await db
    .collection<UserSettingsCollection>('settings')
    .findOne({
      userId: session.user?.id,
    });
  let processType = settings?.ocrProcessType;
  if (processType === undefined || processType === null) {
    processType = OCRProcessType.FromSource;
  }

  const sourceLang = settings?.usingLang || [LangEnum.EN];
  const targetLang = settings?.targetLang || LangEnum.EN;

  console.log('Process type:', processType);

  try {
    const binaryData = new Uint8Array(await imageData.arrayBuffer());
    const fileData = await uploadFile(
      binaryData,
      ExtenstionToMimeType.get(imageType) as string,
    );
    let response = await Models.generateContent({
      model: 'gemini-2.5-flash',
      config: {
        responseMimeType: 'application/json',
        responseSchema: GTextRecognizeSchema,
        systemInstruction: textRecognizeModelInstruction,
      },
      contents: [
        {
          role: 'user',
          parts: [
            {
              fileData: {
                mimeType: fileData.file.mimeType,
                fileUri: fileData.file.uri,
              },
            },
          ],
        },
      ],
    });
    let part = '';
    const processedPart: string[] = [];
    while (true) {
      if (!response.candidates) {
        return NextResponse.json(
          { error: 'Failed to recognize text' },
          { status: 500 },
        );
      }
      if (response.candidates[0].finishReason !== FinishReason.STOP) {
        part += response.text;
        processedPart.push(jsonFix(part));
        response = await Models.generateContent({
          model: 'gemini-2.0-flash',
          config: {
            responseMimeType: 'application/json',
            responseSchema: GTextRecognizeSchema,
            systemInstruction: getTextRecognizeModelInstructionWithLanguage([
              ...sourceLang,
              targetLang,
            ]),
          },
          contents: [
            {
              role: 'user',
              parts: [
                {
                  fileData: {
                    mimeType: fileData.file.mimeType,
                    fileUri: fileData.file.uri,
                  },
                },
              ],
            },
            {
              role: 'assistant',
              parts: [
                {
                  text: part,
                },
              ],
            },
            {
              role: 'user',
              parts: [
                {
                  text: 'Continue from where you left off. Do not repeat any previous content.',
                },
              ],
            },
          ],
        });
        continue;
      }
      part += response.text;
      processedPart.push(jsonFix(part));
      break;
    }

    const test = processedPart
      .map((part) => {
        try {
          return textRecognizeSchema.parse(JSON.parse(part));
        } catch (e) {
          console.error('Error parsing part:', e);
        }
        return null;
      })
      .filter((part) => part !== null)
      .reduce((acc, part) => {
        if (!part) return acc;
        return Object.assign(acc, part);
      }, {});

    let result: textRecognizeSchema;
    try {
      result = textRecognizeSchema.parse(JSON.parse(part));
    } catch (e) {
      console.error('Error parsing text recognition result:', e);
      try {
        if (Object.keys(test).length > 0) {
          result = textRecognizeSchema.parse(test);
        } else {
          return NextResponse.json(
            { error: 'Failed to recognize text' },
            { status: 500 },
          );
        }
      } catch (e) {
        console.error('Error parsing test result:', e);
        return NextResponse.json(
          { error: 'Failed to recognize text' },
          { status: 500 },
        );
      }
    }

    const deckData = await db
      .collection<Deck>('deck')
      .findOne({ _id: new ObjectId(deckId), userId: session.user?.id });
    const deckCards = deckData?.cards || [];

    result = Object.assign(result, {
      words: result.words.filter(
        (word) => !deckCards.find((card) => card.word === word.word),
      ),
    });

    if (processType === OCRProcessType.OnlyFromImage) {
      const words = transfromToCardPropsFromRecognizedResult(result);
      await db.collection<Deck>('deck').findOneAndUpdate(
        { _id: new ObjectId(deckId), userId: session.user?.id },
        {
          $push: {
            cards: {
              $each: words.map((word) => ({
                word: word.word,
                phonetic: word.phonetic,
                blocks: word.blocks,
              })),
            },
          },
        },
        { upsert: true },
      );
      return NextResponse.json(
        {
          message: 'Image uploaded successfully',
        },
        { status: 200 },
      );
    }

    const cachedWords = await db
      .collection<WordCollection>('words')
      .find({
        word: { $in: result.words.map((word) => word.word) },
        sourceLang,
        targetLang,
      })
      .toArray();

    const withoutCachedWords = result.words.filter((word) => {
      return !cachedWords.find((cachedWord) => cachedWord.word === word.word);
    });

    const saveCardToDeck = async (wordData: CardProps) => {
      if (settings?.ocrProcessType === OCRProcessType.FromSource) {
        // Get All Definitions From Processed Result
        await db.collection<Deck>('deck').findOneAndUpdate(
          { _id: new ObjectId(deckId), userId: session.user?.id },
          {
            $push: {
              cards: {
                word: wordData.word,
                phonetic: wordData.phonetic || '',
                blocks: wordData.blocks || [],
              },
            },
          },
        );
      }
      if (
        settings?.ocrProcessType ===
        OCRProcessType.FromSourceButOnlyDefinitionFromImage
      ) {
        const porcessedWordData =
          getDefiniationFromRecognizedResultAndCardProps(
            {
              word: wordData.word,
              phonetic: wordData.phonetic || '',
              blocks: wordData.blocks || [],
              audio: '',
            },
            result,
            targetLang,
          );
        if (!porcessedWordData) return;
        if (
          !Array.isArray(porcessedWordData.blocks) ||
          porcessedWordData.blocks.length <= 0
        )
          return;
        await db.collection<Deck>('deck').findOneAndUpdate(
          { _id: new ObjectId(deckId), userId: session.user?.id },
          {
            $push: {
              cards: {
                word: porcessedWordData.word,
                phonetic: porcessedWordData.phonetic,
                blocks: porcessedWordData.blocks,
              },
            },
          },
        );
      }
    };

    cachedWords.forEach((wordData) => saveCardToDeck(wordData as CardProps));

    withoutCachedWords.forEach((word, index) => {
      setTimeout(async () => {
        await GET(
          new Request(`http://localhost:3000/api/word?word=${word.word}`),
        );
        const wordData = await db
          .collection<WordCollection>('words')
          .findOne({ word: word.word });
        if (
          (wordData?.available !== undefined && wordData.available !== true) ||
          !wordData
        )
          return;
        saveCardToDeck(wordData as CardProps);
      }, index * 1.5 * 1_000);
    });
    return NextResponse.json(
      {
        message: 'Image uploaded successfully',
        time: result.words.length * 2,
      },
      { status: 200 },
    );
  } catch (e) {
    console.log(e);
    return NextResponse.json(
      { error: 'Failed to upload image' },
      { status: 500 },
    );
  }
}

function jsonFix(data: string): string {
  // Count characters in a single pass
  let quoteCount = 0;
  let openBracketCount = 0;
  let closeBracketCount = 0;
  let openBraceCount = 0;
  let closeBraceCount = 0;
  let openParenCount = 0;
  let closeParenCount = 0;
  let lastQuoteIndex = -1;

  for (let i = 0; i < data.length; i++) {
    const char = data[i];
    const prevChar = i > 0 ? data[i - 1] : '';

    switch (char) {
      case '"':
        // Skip escaped quotes
        if (prevChar !== '\\') {
          quoteCount++;
          lastQuoteIndex = i;
        }
        break;
      case '[':
        openBracketCount++;
        break;
      case ']':
        closeBracketCount++;
        break;
      case '{':
        openBraceCount++;
        break;
      case '}':
        closeBraceCount++;
        break;
      case '(':
        openParenCount++;
        break;
      case ')':
        closeParenCount++;
        break;
    }
  }

  let result = data;

  // Fix unmatched quotes
  if (quoteCount % 2 !== 0) {
    if (lastQuoteIndex !== -1) {
      result = data.slice(0, lastQuoteIndex) + '"' + data.slice(lastQuoteIndex);
    } else {
      result += '"';
    }
  }

  // Fix unmatched brackets
  const bracketDiff = openBracketCount - closeBracketCount;
  if (bracketDiff > 0) {
    result += ']'.repeat(bracketDiff);
  } else if (bracketDiff < 0) {
    result = '['.repeat(-bracketDiff) + result;
  }

  // Fix unmatched braces
  const braceDiff = openBraceCount - closeBraceCount;
  if (braceDiff > 0) {
    result += '}'.repeat(braceDiff);
  } else if (braceDiff < 0) {
    result = '{'.repeat(-braceDiff) + result;
  }

  // Fix unmatched parentheses
  const parenDiff = openParenCount - closeParenCount;
  if (parenDiff > 0) {
    result += ')'.repeat(parenDiff);
  } else if (parenDiff < 0) {
    result = '('.repeat(-parenDiff) + result;
  }

  // Fix trailing commas and incomplete values
  result = result
    .replace(/,\s*([}\]])/g, '$1') // Remove trailing commas
    .replace(/:\s*$/, ': null') // Add null for incomplete values
    .replace(/:\s*,/g, ': null,') // Add null for empty values
    .replace(/,\s*$/, ''); // Remove trailing comma at end

  return result;
}
