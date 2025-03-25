import { Content, GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';
import z from 'zod';
import { GObject, GString, GArray, GEnum } from './gemini-type';
import {
	ChatCompletionAssistantMessageParam,
	ChatCompletionDeveloperMessageParam,
	ChatCompletionMessageParam,
	ChatCompletionSystemMessageParam,
	ChatCompletionUserMessageParam,
} from 'openai/resources.mjs';

const apikey = process.env.GEMINI_API_KEY || '';
export const aiClient = new OpenAI({
	baseURL: 'https://generativelanguage.googleapis.com/v1beta/openai/',
	apiKey: apikey,
});

export const wordSchema = z.object({
	word: z.string(),
	phonetic: z.string(),
	zh: z.array(z.string()),
	blocks: z.array(
		z.object({
			partOfSpeech: z.enum([
				'noun',
				'verb',
				'adjective',
				'adverb',
				'pronoun',
				'preposition',
				'conjunction',
				'interjection',
				'exclamation',
				'abbreviation',
				'phrase',
			]),
			definitions: z.array(
				z.object({
					definition: z.array(
						z.object({
							lang: z.string(),
							content: z.string(),
						}),
					),
					synonyms: z.array(z.string()),
					antonyms: z.array(z.string()),
					example: z.array(
						z.array(
							z.object({
								lang: z.enum(['en', 'tw']),
								content: z.string(),
							}),
						),
					),
				}),
			),
		}),
	),
});

export const GwordSchema = new GObject('wordSchema', false, {
	properties: [
		new GString('word', true),
		new GString('phonetic', true),
		new GArray('zh', true, new GString('zhItem', true)),
		new GArray(
			'blocks',
			true,
			new GObject('block', true, {
				properties: [
					new GEnum(
						'partOfSpeech',
						[
							'noun',
							'verb',
							'adjective',
							'adverb',
							'pronoun',
							'preposition',
							'conjunction',
							'interjection',
							'exclamation',
							'abbreviation',
							'phrase',
						],
						true,
					),
					new GArray(
						'definitions',
						true,
						new GObject('definition', true, {
							properties: [
								new GArray(
									'definition',
									true,
									new GObject('definitionItem', true, {
										properties: [
											new GString('lang', true),
											new GString('content', true),
										],
									}),
								),
								new GArray('synonyms', true, new GString('synonym', true)),
								new GArray('antonyms', true, new GString('antonym', true)),
								new GArray(
									'example',
									true,
									new GArray(
										'exampleItem',
										true,
										new GObject('exampleObject', true, {
											properties: [
												new GEnum('lang', ['en', 'tw'], true),
												new GString('content', true),
											],
										}),
									),
								),
							],
						}),
					),
				],
			}),
		),
	],
	showName: false,
});

export const systemInstruction = `
You are an expert in the field of English linguistics. Your task is to explain the given word while ensuring professionalism and completeness. Based on the provided data, refine and enhance the explanations while preserving all original information.
Your response must meet the following requirements:
Maintain the original order and count of all input data.
Provide translations of the word in both English and 臺灣正體.
Retain all definitions and parts of speech as given in the input data.
Process the data in JSON format and return the output in the same JSON structure.
Ensure that no information is lost or omitted during processing.
Make sure that the output is grammatically correct and professional.`;

export const GeminiHistory: Content[] = [
	{
		role: 'user',
		parts: [
			{
				text: '{\n  "word": "search",\n  "phonetic": "/sɜːt͡ʃ/",\n  "blocks": [\n    {\n      "partOfSpeech": "noun",\n      "definitions": [\n        {\n          "definition": [\n            {\n              "lang": "en",\n              "content": "An attempt to find something."\n            }\n          ],\n          "synonyms": [],\n          "antonyms": [],\n          "example": [\n            [\n              {\n                "lang": "en",\n                "content": "With only five minutes until we were meant to leave, the search for the keys started in earnest."\n              }\n            ]\n          ]\n        },\n        {\n          "definition": [\n            {\n              "lang": "en",\n              "content": "The act of searching in general."\n            }\n          ],\n          "synonyms": [],\n          "antonyms": [],\n          "example": [\n            [\n              {\n                "lang": "en",\n                "content": "Search is a hard problem for computers to solve efficiently."\n              }\n            ]\n          ]\n        }\n      ]\n    },\n    {\n      "partOfSpeech": "verb",\n      "definitions": [\n        {\n          "definition": [\n            {\n              "lang": "en",\n              "content": "To look in (a place) for something."\n            }\n          ],\n          "synonyms": [],\n          "antonyms": [],\n          "example": [\n            [\n              {\n                "lang": "en",\n                "content": "I searched the garden for the keys and found them in the vegetable patch."\n              }\n            ]\n          ]\n        },\n        {\n          "definition": [\n            {\n              "lang": "en",\n              "content": "(followed by \\"for\\") To look thoroughly."\n            }\n          ],\n          "synonyms": [],\n          "antonyms": [],\n          "example": [\n            [\n              {\n                "lang": "en",\n                "content": "The police are searching for evidence in his flat."\n              }\n            ]\n          ]\n        },\n        {\n          "definition": [\n            {\n              "lang": "en",\n              "content": "To look for, seek."\n            }\n          ],\n          "synonyms": [],\n          "antonyms": []\n        },\n        {\n          "definition": [\n            {\n              "lang": "en",\n              "content": "To probe or examine (a wound)."\n            }\n          ],\n          "synonyms": [],\n          "antonyms": []\n        },\n        {\n          "definition": [\n            {\n              "lang": "en",\n              "content": "To examine; to try; to put to the test."\n            }\n          ],\n          "synonyms": [],\n          "antonyms": []\n        }\n      ]\n    }\n  ]\n}',
			},
		],
	},
	{
		role: 'model',
		parts: [
			{
				text: '{\n  "blocks": [\n    {\n      "definitions": [\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "An attempt to find something.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "With only five minutes until we were meant to leave, the search for the keys started in earnest.",\n              "lang": "en"\n            },\n            {\n              "content": "離我們應該出發的時間只有五分鐘了，大家開始認真地尋找鑰匙。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "The act of searching in general.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "Search is a hard problem for computers to solve efficiently.",\n              "lang": "en"\n            },\n            {\n              "content": "搜尋是電腦難以有效率地解決的問題。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        }\n      ],\n      "partOfSpeech": "noun"\n    },\n    {\n      "definitions": [\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "To look in (a place) for something.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "I searched the garden for the keys and found them in the vegetable patch.",\n              "lang": "en"\n            },\n            {\n              "content": "我在花園裡搜尋鑰匙，結果在菜園裡找到了。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "(followed by \\"for\\") To look thoroughly.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "The police are searching for evidence in his flat.",\n              "lang": "en"\n            },\n            {\n              "content": "警察正在他的公寓裡搜尋證據。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "To look for, seek.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "They searched for a peaceful solution to the conflict.",\n              "lang": "en"\n            },\n            {\n              "content": "他們尋求和平解決衝突的方案。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "To probe or examine (a wound).",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "The doctor searched the wound for any signs of infection.",\n              "lang": "en"\n            },\n            {\n              "content": "醫生檢查傷口，看是否有感染的跡象。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "To examine; to try; to put to the test.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "The customs officers searched the luggage thoroughly.",\n              "lang": "en"\n            },\n            {\n              "content": "海關人員徹底檢查了行李。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        }\n      ],\n      "partOfSpeech": "verb"\n    }\n  ],\n  "phonetic": "/sɜːt͡ʃ/",\n  "tw": [\n    "搜尋",\n    "尋找",\n    "搜索",\n    "探查",\n    "搜查"\n  ],\n  "word": "search"\n}',
			},
		],
	},
	{
		role: 'user',
		parts: [
			{
				text: '[{"word":"abandon","phonetic":"/əˈbæn.dən/","phonetics":[{"text":"/əˈbæn.dən/","audio":""},{"text":"/əˈbæn.dn̩/","audio":""},{"text":"/əˈbæn.dn̩/","audio":"https://api.dictionaryapi.dev/media/pronunciations/en/abandon-us.mp3","sourceUrl":"https://commons.wikimedia.org/w/index.php?curid=1755007","license":{"name":"BY-SA 3.0","url":"https://creativecommons.org/licenses/by-sa/3.0"}}],"meanings":[{"partOfSpeech":"verb","definitions":[{"definition":"To give up or relinquish control of, to surrender or to give oneself over, or to yield to one\'s emotions.","synonyms":[],"antonyms":[]},{"definition":"To desist in doing, practicing, following, holding, or adhering to; to turn away from; to permit to lapse; to renounce; to discontinue.","synonyms":[],"antonyms":[]},{"definition":"To leave behind; to desert as in a ship or a position, typically in response to overwhelming odds or impending dangers; to forsake, in spite of a duty or responsibility.","synonyms":[],"antonyms":[],"example":"Many baby girls have been abandoned on the streets of Beijing."},{"definition":"To subdue; to take control of.","synonyms":[],"antonyms":[]},{"definition":"To cast out; to banish; to expel; to reject.","synonyms":[],"antonyms":[]},{"definition":"To no longer exercise a right, title, or interest, especially with no interest of reclaiming it again; to yield; to relinquish.","synonyms":[],"antonyms":[]},{"definition":"To surrender to the insurer (an insured item), so as to claim a total loss.","synonyms":[],"antonyms":[]}],"synonyms":[],"antonyms":[]}],"license":{"name":"CC BY-SA 3.0","url":"https://creativecommons.org/licenses/by-sa/3.0"},"sourceUrls":["https://en.wiktionary.org/wiki/abandon"]},{"word":"abandon","phonetic":"/əˈbæn.dən/","phonetics":[{"text":"/əˈbæn.dən/","audio":""},{"text":"/əˈbæn.dn̩/","audio":""},{"text":"/əˈbæn.dn̩/","audio":"https://api.dictionaryapi.dev/media/pronunciations/en/abandon-us.mp3","sourceUrl":"https://commons.wikimedia.org/w/index.php?curid=1755007","license":{"name":"BY-SA 3.0","url":"https://creativecommons.org/licenses/by-sa/3.0"}}],"meanings":[{"partOfSpeech":"noun","definitions":[{"definition":"A yielding to natural impulses or inhibitions; freedom from artificial constraint, with loss of appreciation of consequences.","synonyms":[],"antonyms":[]},{"definition":"Abandonment; relinquishment.","synonyms":[],"antonyms":[]}],"synonyms":["abandonment","libertinism","profligacy","unconstraint","unrestraint","wantonness"],"antonyms":[]}],"license":{"name":"CC BY-SA 3.0","url":"https://creativecommons.org/licenses/by-sa/3.0"},"sourceUrls":["https://en.wiktionary.org/wiki/abandon"]}]',
			},
		],
	},
	{
		role: 'model',
		parts: [
			{
				text: '{\n  "blocks": [\n    {\n      "definitions": [\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "To give up or relinquish control of, to surrender or to give oneself over, or to yield to one\'s emotions.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "He abandoned himself to despair.",\n              "lang": "en"\n            },\n            {\n              "content": "他陷入絕望之中。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "To desist in doing, practicing, following, holding, or adhering to; to turn away from; to permit to lapse; to renounce; to discontinue.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "They abandoned their old customs.",\n              "lang": "en"\n            },\n            {\n              "content": "他們放棄了舊習俗。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "To leave behind; to desert as in a ship or a position, typically in response to overwhelming odds or impending dangers; to forsake, in spite of a duty or responsibility.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "Many baby girls have been abandoned on the streets of Beijing.",\n              "lang": "en"\n            },\n            {\n              "content": "許多女嬰被遺棄在北京的街頭。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "To subdue; to take control of.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "The pirates abandoned the captured ship.",\n              "lang": "en"\n            },\n            {\n              "content": "海盜們控制了捕獲的船隻。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "To cast out; to banish; to expel; to reject.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "The country abandoned the refugees.",\n              "lang": "en"\n            },\n            {\n              "content": "這個國家驅逐了難民。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "To no longer exercise a right, title, or interest, especially with no interest of reclaiming it again; to yield; to relinquish.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "They abandoned their claim to the property.",\n              "lang": "en"\n            },\n            {\n              "content": "他們放棄了對該財產的所有權要求。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "To surrender to the insurer (an insured item), so as to claim a total loss.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "The ship was abandoned to the insurers after the storm.",\n              "lang": "en"\n            },\n            {\n              "content": "暴風雨後，這艘船被放棄給保險公司，以索取全額損失。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        }\n      ],\n      "partOfSpeech": "verb"\n    },\n    {\n      "definitions": [\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "A yielding to natural impulses or inhibitions; freedom from artificial constraint, with loss of appreciation of consequences.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "She danced with abandon.",\n              "lang": "en"\n            },\n            {\n              "content": "她跳舞時毫無拘束。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": [\n            "abandonment",\n            "libertinism",\n            "profligacy",\n            "unconstraint",\n            "unrestraint",\n            "wantonness"\n          ]\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "Abandonment; relinquishment.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "The abandon of the city\'s project left many homeless.",\n              "lang": "en"\n            },\n            {\n              "content": "城市專案的放棄導致許多人無家可歸。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": [\n            "abandonment",\n            "libertinism",\n            "profligacy",\n            "unconstraint",\n            "unrestraint",\n            "wantonness"\n          ]\n        }\n      ],\n      "partOfSpeech": "noun"\n    }\n  ],\n  "phonetic": "/əˈbæn.dən/",\n  "tw": [\n    "放棄",\n    "遺棄",\n    "拋棄",\n    "放縱"\n  ],\n  "word": "abandon"\n}',
			},
		],
	},
	{
		role: 'user',
		parts: [
			{
				text: '[{"word":"command","phonetic":"/kəˈmɑːnd/","phonetics":[{"text":"/kəˈmɑːnd/","audio":""},{"text":"/kəˈmænd/","audio":"https://api.dictionaryapi.dev/media/pronunciations/en/command-us.mp3","sourceUrl":"https://commons.wikimedia.org/w/index.php?curid=1239707","license":{"name":"BY-SA 3.0","url":"https://creativecommons.org/licenses/by-sa/3.0"}}],"meanings":[{"partOfSpeech":"noun","definitions":[{"definition":"An order to do something.","synonyms":[],"antonyms":[],"example":"I was given a command to cease shooting."},{"definition":"The right or authority to order, control or dispose of; the right to be obeyed or to compel obedience.","synonyms":[],"antonyms":[],"example":"to have command of an army"},{"definition":"Power of control, direction or disposal; mastery.","synonyms":[],"antonyms":[],"example":"England has long held command of the sea"},{"definition":"A position of chief authority; a position involving the right or power to order or control.","synonyms":[],"antonyms":[],"example":"General Smith was placed in command."},{"definition":"The act of commanding; exercise or authority of influence.","synonyms":[],"antonyms":[]},{"definition":"A body or troops, or any naval or military force, under the control of a particular officer; by extension, any object or body in someone\'s charge.","synonyms":[],"antonyms":[]},{"definition":"Dominating situation; range or control or oversight; extent of view or outlook.","synonyms":[],"antonyms":[]},{"definition":"A directive to a computer program acting as an interpreter of some kind, in order to perform a specific task.","synonyms":[],"antonyms":[]},{"definition":"The degree of control a pitcher has over his pitches.","synonyms":[],"antonyms":[],"example":"He\'s got good command tonight."},{"definition":"A command performance.","synonyms":[],"antonyms":[]}],"synonyms":[],"antonyms":[]},{"partOfSpeech":"verb","definitions":[{"definition":"To order, give orders; to compel or direct with authority.","synonyms":[],"antonyms":[],"example":"The king commanded his servant to bring him dinner."},{"definition":"To have or exercise supreme power, control or authority over, especially military; to have under direction or control.","synonyms":[],"antonyms":[],"example":"to command an army or a ship"},{"definition":"To require with authority; to demand, order, enjoin.","synonyms":[],"antonyms":[],"example":"he commanded silence"},{"definition":"To dominate through ability, resources, position etc.; to overlook.","synonyms":[],"antonyms":[],"example":"Bridges commanded by a fortified house. (Motley.)"},{"definition":"To exact, compel or secure by influence; to deserve, claim.","synonyms":[],"antonyms":[],"example":"A good magistrate commands the respect and affections of the people."},{"definition":"To hold, to control the use of.","synonyms":[],"antonyms":[],"example":"The fort commanded the bay."},{"definition":"To have a view, as from a superior position.","synonyms":[],"antonyms":[]},{"definition":"To direct to come; to bestow.","synonyms":[],"antonyms":[]}],"synonyms":["decree","order"],"antonyms":[]}],"license":{"name":"CC BY-SA 3.0","url":"https://creativecommons.org/licenses/by-sa/3.0"},"sourceUrls":["https://en.wiktionary.org/wiki/command"]}]',
			},
		],
	},
	{
		role: 'model',
		parts: [
			{
				text: '{\n  "blocks": [\n    {\n      "definitions": [\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "An order to do something.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "I was given a command to cease shooting.",\n              "lang": "en"\n            },\n            {\n              "content": "我接到停止射擊的命令。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "The right or authority to order, control or dispose of; the right to be obeyed or to compel obedience.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "to have command of an army",\n              "lang": "en"\n            },\n            {\n              "content": "擁有軍隊的指揮權",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "Power of control, direction or disposal; mastery.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "England has long held command of the sea",\n              "lang": "en"\n            },\n            {\n              "content": "英國長期掌握著海上霸權。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "A position of chief authority; a position involving the right or power to order or control.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "General Smith was placed in command.",\n              "lang": "en"\n            },\n            {\n              "content": "史密斯將軍被任命為指揮官。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "The act of commanding; exercise or authority of influence.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "His command was absolute.",\n              "lang": "en"\n            },\n            {\n              "content": "他的指揮是絕對的。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "A body or troops, or any naval or military force, under the control of a particular officer; by extension, any object or body in someone\'s charge.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "The entire battalion was under his command.",\n              "lang": "en"\n            },\n            {\n              "content": "整個營都在他的指揮之下。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "Dominating situation; range or control or oversight; extent of view or outlook.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "The hill gave them command of the valley.",\n              "lang": "en"\n            },\n            {\n              "content": "這座山讓他們可以控制整個山谷。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "A directive to a computer program acting as an interpreter of some kind, in order to perform a specific task.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "The command \'ls\' lists the files in the current directory.",\n              "lang": "en"\n            },\n            {\n              "content": "“ls”命令列出目前目錄中的檔案。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "The degree of control a pitcher has over his pitches.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "He\'s got good command tonight.",\n              "lang": "en"\n            },\n            {\n              "content": "他今晚的投球控制得很好。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "A command performance.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "The band played a command performance for the Queen.",\n              "lang": "en"\n            },\n            {\n              "content": "樂隊為女王進行了御前演奏。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        }\n      ],\n      "partOfSpeech": "noun"\n    },\n    {\n      "definitions": [\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "To order, give orders; to compel or direct with authority.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "The king commanded his servant to bring him dinner.",\n              "lang": "en"\n            },\n            {\n              "content": "國王命令僕人給他拿晚餐。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "To have or exercise supreme power, control or authority over, especially military; to have under direction or control.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "to command an army or a ship",\n              "lang": "en"\n            },\n            {\n              "content": "指揮軍隊或船隻",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "To require with authority; to demand, order, enjoin.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "he commanded silence",\n              "lang": "en"\n            },\n            {\n              "content": "他命令保持安靜",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "To dominate through ability, resources, position etc.; to overlook.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "Bridges commanded by a fortified house. (Motley.)",\n              "lang": "en"\n            },\n            {\n              "content": "橋樑由一棟設防的房屋控制。（莫特利）",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "To exact, compel or secure by influence; to deserve, claim.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "A good magistrate commands the respect and affections of the people.",\n              "lang": "en"\n            },\n            {\n              "content": "一位好法官贏得了人民的尊重和愛戴。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "To hold, to control the use of.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "The fort commanded the bay.",\n              "lang": "en"\n            },\n            {\n              "content": "堡壘控制著海灣。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "To have a view, as from a superior position.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "The balcony commanded a fine view of the city.",\n              "lang": "en"\n            },\n            {\n              "content": "陽台可以欣賞到城市的美景。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        },\n        {\n          "antonyms": [],\n          "definition": [\n            {\n              "content": "To direct to come; to bestow.",\n              "lang": "en"\n            }\n          ],\n          "example": [\n            {\n              "content": "Command blessings upon us.",\n              "lang": "en"\n            },\n            {\n              "content": "將祝福降臨在我們身上。",\n              "lang": "tw"\n            }\n          ],\n          "synonyms": []\n        }\n      ],\n      "partOfSpeech": "verb"\n    }\n  ],\n  "phonetic": "/kəˈmɑːnd/",\n  "tw": [\n    "命令",\n    "指揮",\n    "控制",\n    "掌握"\n  ],\n  "word": "command"\n}',
			},
		],
	},
];

const roleWarpMap = new Map([['model', 'assistant']]);

export const OpenAIHistoryTranscriber = (
	content: Content[],
): ChatCompletionMessageParam[] => {
	const result = content.map((item) => {
		const { role, parts } = item;
		const text = parts.map((part) => part.text).join('\n');
		return { role: roleWarpMap.get(role) || role, content: text, name: '' } as
			| ChatCompletionDeveloperMessageParam
			| ChatCompletionSystemMessageParam
			| ChatCompletionUserMessageParam
			| ChatCompletionAssistantMessageParam;
	});
	return result;
};

export const OpenAIHistory = OpenAIHistoryTranscriber(GeminiHistory);

const GenerativeAI = new GoogleGenerativeAI(apikey);
export const TextModel = GenerativeAI.getGenerativeModel({
	model: 'gemini-2.0-flash',
});

export const WordModel = GenerativeAI.getGenerativeModel({
	model: 'gemini-2.0-flash',
	generationConfig: {
		responseMimeType: 'application/json',
		responseSchema: GwordSchema.toSchema(),
	},
	systemInstruction: systemInstruction,
});
