// src/app/api/questions/fill-in-the-blank/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/utils/auth';
import db from '@/lib/db';
import { FillInTheBlankQuestion } from '@/type';
import { ObjectId } from 'mongodb';
import { fillInTheBlankSystemInstruction } from '@/utils/ai/prompt';
import { getParseResponse, ModelLevel } from '@/utils/ai/generate'; // Updated import
import {
    FillInTheBlankQuestionsAiResponseSchema,
    GFillInTheBlankQuestionsAiResponseSchema,
    FillInTheBlankQuestionAiSchemaType, // For typing individual AI question
} from '@/utils/ai/schema';
import { z } from 'zod';

export async function POST(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const body = await request.json();
        const sourceWords = body.words as string[];

        if (!sourceWords || !Array.isArray(sourceWords) || sourceWords.length === 0) {
            return NextResponse.json({ error: 'No source words provided' }, { status: 400 });
        }

        const allGeneratedQuestions: FillInTheBlankQuestion[] = [];

        for (const word of sourceWords) {
            // Call AI to generate question(s)
            const aiResponse = await getParseResponse<z.infer<typeof FillInTheBlankQuestionsAiResponseSchema>>(
                word, // Prompt is the source word
                [],   // No chat history for this
                fillInTheBlankSystemInstruction,
                ModelLevel.Simple, // Or ModelLevel.Complex if higher quality is needed
                [[FillInTheBlankQuestionsAiResponseSchema, FillInTheBlankQuestionsAiResponseSchema], GFillInTheBlankQuestionsAiResponseSchema]
            );

            if (aiResponse && Array.isArray(aiResponse)) {
                const questionsFromAI: FillInTheBlankQuestionAiSchemaType[] = aiResponse;
                const processedQuestionsForWord: FillInTheBlankQuestion[] = questionsFromAI.map(q => ({
                    ...q,
                    _id: new ObjectId().toString(), // Generate client-side ID, DB will override if necessary or use its own
                    userId: session.user.id!,
                    sourceWord: word, // Ensure sourceWord from loop is used, even if AI includes it
                    createdAt: new Date(),
                }));
                allGeneratedQuestions.push(...processedQuestionsForWord);
            } else {
                console.warn(`AI did not return a valid array of questions for word: ${word}`);
                // Optionally, you could return an error here or just skip this word
            }
        }

        if (allGeneratedQuestions.length > 0) {
            const collection = db.collection<FillInTheBlankQuestion>('fillInTheBlankQuestions');
            const insertResult = await collection.insertMany(allGeneratedQuestions);
            
            // Fetch the inserted documents to return them with their database _id's
            // This step is optional if client-side generated _id is acceptable or if insertMany result is sufficient
            // However, insertMany result in Node.js MongoDB driver typically returns insertedIds
            // For simplicity, we'll assume the client-side generated _id or the result of insertMany is handled by the client if needed
            // Or, more robustly, query them back, though this adds latency.
            // Given the structure of FillInTheBlankQuestion, _id is optional, so we can let MongoDB handle it.
            // The objects in allGeneratedQuestions will be mutated by insertMany to include _id if they didn't have one or if it was a new ObjectId.
            // For this example, we'll return the objects as they are after potential mutation by insertMany (if it does that).

            // A more robust way to return the inserted documents with their DB IDs:
            const insertedIds = Object.values(insertResult.insertedIds).map(id => id.toString());
            const createdQuestions = await db.collection<FillInTheBlankQuestion>('fillInTheBlankQuestions')
                .find({ _id: { $in: insertedIds.map(id => new ObjectId(id)) } })
                .toArray();

            return NextResponse.json({ questions: createdQuestions }, { status: 201 });
        } else {
            return NextResponse.json({ error: 'No questions were generated successfully.' }, { status: 400 });
        }

    } catch (error) {
        console.error('Error generating fill-in-the-blank questions:', error);
        if (error instanceof z.ZodError) {
            return NextResponse.json({ error: 'AI response validation error', details: error.errors }, { status: 400 });
        }
        return NextResponse.json({ error: 'Failed to generate questions' }, { status: 500 });
    }
}

export async function GET(request: NextRequest) {
    const session = await auth();
    if (!session?.user?.id) {
        return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    try {
        const collection = db.collection<FillInTheBlankQuestion>('fillInTheBlankQuestions');
        // Fetch questions for the authenticated user, sorted by creation date descending
        const userQuestions = await collection.find({ userId: session.user.id })
                                              .sort({ createdAt: -1 })
                                              .toArray();
        
        return NextResponse.json({ questions: userQuestions }, { status: 200 });

    } catch (error) {
        console.error('Error fetching fill-in-the-blank questions:', error);
        return NextResponse.json({ error: 'Failed to fetch questions' }, { status: 500 });
    }
}
