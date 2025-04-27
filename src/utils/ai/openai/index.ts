import OpenAI from 'openai';

export enum Model {
	Gemini,
	OpenAI,
}

const modelOptions: Record<Model, { key: string; baseURL: string }> = {
	[Model.Gemini]: {
		key: process.env.GEMINI_API_KEY || '',
		baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai',
	},
	[Model.OpenAI]: {
		key: process.env.OPENAI_API || '',
		baseURL: 'https://api.openai.com/v1/',
	},
};

export const model = Model.OpenAI;

export const OpenAIClient = new OpenAI(modelOptions[model]);
