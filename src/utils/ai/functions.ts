import { ExtenstionTable } from '@/type';
import { Content } from '@google/genai';
import {
	GoogleAIFileManager,
	UploadFileResponse,
} from '@google/generative-ai/server';
import {
	ChatCompletionMessageParam,
	ChatCompletionDeveloperMessageParam,
	ChatCompletionSystemMessageParam,
	ChatCompletionUserMessageParam,
	ChatCompletionAssistantMessageParam,
} from 'openai/resources.mjs';

const roleWarpMap = new Map([['model', 'assistant']]);

export const OpenAIHistoryTranscriber = (
	content: Content[],
): ChatCompletionMessageParam[] => {
	const result = content.map((item) => {
		const { role, parts } = item;
		const text = (parts || []).map((part) => part.text).join('\n');
		return { role: roleWarpMap.get(role || '') || role, content: text } as
			| ChatCompletionDeveloperMessageParam
			| ChatCompletionSystemMessageParam
			| ChatCompletionUserMessageParam
			| ChatCompletionAssistantMessageParam;
	});
	return result;
};

const googleAIKey = process.env.GEMINI_API_KEY || '';

const fileManager = new GoogleAIFileManager(googleAIKey);

export async function uploadFile(
	binary: Uint8Array | Blob,
	mimeType: string,
): Promise<UploadFileResponse> {
	const NUM_BYTES = binary instanceof Uint8Array ? binary.length : binary.size;
	const fileName = `image-${Date.now()}.${ExtenstionTable.get(mimeType)}`;
	const startRes = await fetch(
		`https://generativelanguage.googleapis.com/upload/v1beta/files?key=${googleAIKey}`,
		{
			method: 'POST',
			headers: {
				'X-Goog-Upload-Protocol': 'resumable',
				'X-Goog-Upload-Command': 'start',
				'X-Goog-Upload-Header-Content-Length': NUM_BYTES.toString(),
				'X-Goog-Upload-Header-Content-Type': mimeType,
				'Content-Type': 'application/json',
			},
			body: JSON.stringify({ file: { display_name: fileName } }),
		},
	);

	const uploadUrl = startRes.headers.get('X-Goog-Upload-URL');
	if (!uploadUrl) throw new Error('Failed to retrieve upload URL');

	const uploadRes = await fetch(uploadUrl, {
		method: 'POST',
		headers: {
			'Content-Length': NUM_BYTES.toString(),
			'X-Goog-Upload-Offset': '0',
			'X-Goog-Upload-Command': 'upload, finalize',
		},
		body: binary,
	});
	const uploadData = await uploadRes.json();

	return uploadData;
}

export async function uploadToGemini(path: string, mimeType: string) {
	const uploadResult = await fileManager.uploadFile(path, {
		mimeType,
		displayName: path,
	});
	const file = uploadResult.file;
	console.log(`Uploaded file ${file.displayName} as: ${file.name}`);
	return file;
}
