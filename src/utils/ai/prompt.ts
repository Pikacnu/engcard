import { ChatAction } from '@/type';
import {
	Content,
	FunctionDeclaration,
	SchemaType,
} from '@google/generative-ai';
export const wordSystemInstruction = `
You are an English linguistics expert. Process dictionary data and enhance it with complete multilingual translations.

**Requirements:**
- Preserve ALL original data structure and content
- Add "tw" field with Traditional Chinese translations of the word
- Translate ALL definitions and examples to Traditional Chinese (Taiwan)
- Provide at least 2 examples per definition in English, Traditional Chinese
- Maintain professional accuracy and cultural appropriateness
- Return valid JSON with identical structure plus required multilingual fields
- **Merge definitions with the same part of speech into a single block**

**Critical:** Every definition and example MUST have English ("en"), Traditional Chinese ("tw") versions. Incomplete translations are unacceptable.

**Structure:** Group all definitions by part of speech (noun, verb, adjective, etc.) into single blocks rather than creating separate blocks for each definition.
`;

export const wordGeminiHistory: Content[] = [
	{
		role: 'user',
		parts: [
			{
				text: '[{"word":"search","phonetic":"/sɜːt͡ʃ/","phonetics":[{"text":"/sɜːt͡ʃ/","audio":""},{"text":"/sɝt͡ʃ/","audio":"https://api.dictionaryapi.dev/media/pronunciations/en/search-us.mp3","sourceUrl":"https://commons.wikimedia.org/w/index.php?curid=357625"}],"meanings":[{"partOfSpeech":"noun","definitions":[{"definition":"An attempt to find something.","synonyms":[],"antonyms":[],"example":"With only five minutes until we were meant to leave, the search for the keys started in earnest."},{"definition":"The act of searching in general.","synonyms":[],"antonyms":[],"example":"Search is a hard problem for computers to solve efficiently."}],"synonyms":[],"antonyms":[]},{"partOfSpeech":"verb","definitions":[{"definition":"To look in (a place) for something.","synonyms":[],"antonyms":[],"example":"I searched the garden for the keys and found them in the vegetable patch."},{"definition":"(followed by \\"for\\") To look thoroughly.","synonyms":[],"antonyms":[],"example":"The police are searching for evidence in his flat."},{"definition":"To look for, seek.","synonyms":[],"antonyms":[]},{"definition":"To probe or examine (a wound).","synonyms":[],"antonyms":[]},{"definition":"To examine; to try; to put to the test.","synonyms":[],"antonyms":[]}],"synonyms":["comb","look for","scour","seek","comb","scour"],"antonyms":[]}],"license":{"name":"CC BY-SA 3.0","url":"https://creativecommons.org/licenses/by-sa/3.0"},"sourceUrls":["https://en.wiktionary.org/wiki/search"]}]\n',
			},
		],
	},
	{
		role: 'model',
		parts: [
			{
				text: '{"blocks":[{"definitions":[{"antonyms":[],"definition":[{"content":"An attempt to find something.","lang":"en"},{"content":"尋找某物的嘗試。","lang":"tw"}],"example":[{"content":"With only five minutes until we were meant to leave, the search for the keys started in earnest.","lang":"en"},{"content":"距離我們應該離開的時間只有五分鐘了，尋找鑰匙的工作認真地開始了。","lang":"tw"},{"content":"The police conducted a thorough search of the building.","lang":"en"},{"content":"警察對大樓進行了徹底的搜索。","lang":"tw"},{"content":"The search for a solution to the problem continues.","lang":"en"},{"content":"尋找問題解決方案的工作仍在繼續。","lang":"tw"}],"synonyms":[]},{"antonyms":[],"definition":[{"content":"The act of searching in general.","lang":"en"},{"content":"一般搜尋的行為。","lang":"tw"}],"example":[{"content":"Search is a hard problem for computers to solve efficiently.","lang":"en"},{"content":"對於電腦來說，搜尋是一個難以有效解決的問題。","lang":"tw"},{"content":"The internet has revolutionized search and information retrieval.","lang":"en"},{"content":"互聯網徹底改變了搜索和資訊檢索。","lang":"tw"},{"content":"Efficient search algorithms are crucial for large databases.","lang":"en"},{"content":"高效的搜尋演算法對於大型資料庫至關重要。","lang":"tw"}],"synonyms":[]}],"partOfSpeech":"noun"},{"definitions":[{"antonyms":[],"definition":[{"content":"To look in (a place) for something.","lang":"en"},{"content":"在（某個地方）尋找某物。","lang":"tw"}],"example":[{"content":"I searched the garden for the keys and found them in the vegetable patch.","lang":"en"},{"content":"我在花園裡找鑰匙，結果在菜地裡找到了。","lang":"tw"},{"content":"She searched her bag for her wallet.","lang":"en"},{"content":"她在包裡找錢包。","lang":"tw"},{"content":"We searched the entire house but couldn\'t find the cat.","lang":"en"},{"content":"我們搜索了整棟房子，但還是找不到貓。","lang":"tw"}],"synonyms":[]},{"antonyms":[],"definition":[{"content":"(followed by \\"for\\") To look thoroughly.","lang":"en"},{"content":"（後接 \\"for\\"）徹底尋找。","lang":"tw"}],"example":[{"content":"The police are searching for evidence in his flat.","lang":"en"},{"content":"警察正在他的公寓裡搜查證據。","lang":"tw"},{"content":"They are searching for survivors after the earthquake.","lang":"en"},{"content":"地震後，他們正在搜尋倖存者。","lang":"tw"},{"content":"The team is searching for a new solution to the problem.","lang":"en"},{"content":"團隊正在尋找解決問題的新方案。","lang":"tw"}],"synonyms":[]},{"antonyms":[],"definition":[{"content":"To look for, seek.","lang":"en"},{"content":"尋找，尋求。","lang":"tw"}],"example":[{"content":"I\'m searching a new job.","lang":"en"},{"content":"我正在找一份新工作。","lang":"tw"},{"content":"Many young people search their identity.","lang":"en"},{"content":"許多人正在尋找他們的認同。","lang":"tw"},{"content":"He is searching inner peace.","lang":"en"},{"content":"他正在尋求內心的平靜。","lang":"tw"}],"synonyms":[]},{"antonyms":[],"definition":[{"content":"To probe or examine (a wound).","lang":"en"},{"content":"探查或檢查（傷口）。","lang":"tw"}],"example":[{"content":"The doctor searched the wound for any foreign objects.","lang":"en"},{"content":"醫生檢查傷口，看是否有異物。","lang":"tw"},{"content":"The nurse carefully searched the patient\'s injury.","lang":"en"},{"content":"護士仔細檢查了病人的傷勢。","lang":"tw"},{"content":"He searched the cut for signs of infection.","lang":"en"},{"content":"他檢查了傷口，看是否有感染跡象。","lang":"tw"}],"synonyms":[]},{"antonyms":[],"definition":[{"content":"To examine; to try; to put to the test.","lang":"en"},{"content":"檢查；嘗試；接受測試。","lang":"tw"}],"example":[{"content":"Search your heart and tell me what you really feel.","lang":"en"},{"content":"審視你的內心，告訴我你真正的感受。","lang":"tw"},{"content":"We must search our souls to find the right path.","lang":"en"},{"content":"我們必須審視自己的靈魂才能找到正確的道路。","lang":"tw"},{"content":"Search your mind for any memories of that day.","lang":"en"},{"content":"在你的腦海中搜尋那天有什麼記憶。","lang":"tw"}],"synonyms":[]}],"partOfSpeech":"verb"}],"phonetic":"/sɜːt͡ʃ/","tw":["搜尋","搜索"],"word":"search"}',
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
				text: '{"blocks":[{"definitions":[{"antonyms":[],"definition":[{"content":"An order to do something.","lang":"en"},{"content":"做某事的命令。","lang":"tw"}],"example":[{"content":"I was given a command to cease shooting.","lang":"en"},{"content":"我接到停止射擊的命令。","lang":"tw"},{"content":"The captain issued a command to set sail immediately.","lang":"en"},{"content":"船長發出了立即啟航的命令。","lang":"tw"},{"content":"He ignored the command and continued his action.","lang":"en"},{"content":"他無視命令，繼續他的行動。","lang":"tw"}],"synonyms":[]},{"antonyms":[],"definition":[{"content":"The right or authority to order, control or dispose of; the right to be obeyed or to compel obedience.","lang":"en"},{"content":"命令、控制或支配的權利或權威；被服從或強迫服從的權利。","lang":"tw"}],"example":[{"content":"to have command of an army","lang":"en"},{"content":"指揮一支軍隊","lang":"tw"},{"content":"She has complete command of the situation.","lang":"en"},{"content":"她完全掌控了局面。","lang":"tw"},{"content":"The general had command of the entire operation.","lang":"en"},{"content":"將軍指揮整個行動。","lang":"tw"}],"synonyms":[]},{"antonyms":[],"definition":[{"content":"Power of control, direction or disposal; mastery.","lang":"en"},{"content":"控制、指揮或支配的力量；精通。","lang":"tw"}],"example":[{"content":"England has long held command of the sea","lang":"en"},{"content":"英國長期控制著海洋","lang":"tw"},{"content":"He has a great command of the English language.","lang":"en"},{"content":"他精通英語。","lang":"tw"},{"content":"The artist shows a superb command of color and composition.","lang":"en"},{"content":"這位藝術家展現了對色彩和構圖的卓越掌握。","lang":"tw"}],"synonyms":[]},{"antonyms":[],"definition":[{"content":"A position of chief authority; a position involving the right or power to order or control.","lang":"en"},{"content":"首席權威的職位；涉及命令或控制權利的職位。","lang":"tw"}],"example":[{"content":"General Smith was placed in command.","lang":"en"},{"content":"史密斯將軍被任命為指揮官。","lang":"tw"},{"content":"She took command of the project after the previous leader resigned.","lang":"en"},{"content":"在前任領導辭職後，她接管了這個專案的指揮。","lang":"tw"},{"content":"He is now in command of the entire fleet.","lang":"en"},{"content":"他現在指揮整個艦隊。","lang":"tw"}],"synonyms":[]},{"antonyms":[],"definition":[{"content":"The act of commanding; exercise or authority of influence.","lang":"en"},{"content":"指揮的行為；行使或影響的權威。","lang":"tw"}],"example":[{"content":"His command was absolute and unquestioned.","lang":"en"},{"content":"他的指揮是絕對的，不容置疑的。","lang":"tw"},{"content":"The command of the troops required great skill and experience.","lang":"en"},{"content":"指揮部隊需要高超的技巧和經驗。","lang":"tw"},{"content":"Her command of the stage was captivating.","lang":"en"},{"content":"她對舞臺的掌控力令人著迷。","lang":"tw"}],"synonyms":[]},{"antonyms":[],"definition":[{"content":"A body or troops, or any naval or military force, under the control of a particular officer; by extension, any object or body in someone\'s charge.","lang":"en"},{"content":"在特定軍官控制下的部隊或任何海軍或軍事力量；引申為某人負責的任何物體或團體。","lang":"tw"}],"example":[{"content":"The entire command was ready for inspection.","lang":"en"},{"content":"整個指揮部已準備好接受檢查。","lang":"tw"},{"content":"The officer was responsible for the command of the battalion.","lang":"en"},{"content":"該軍官負責營的指揮。","lang":"tw"},{"content":"He had command of a large and well-equipped army.","lang":"en"},{"content":"他指揮著一支龐大且裝備精良的軍隊。","lang":"tw"}],"synonyms":[]},{"antonyms":[],"definition":[{"content":"Dominating situation; range or control or oversight; extent of view or outlook.","lang":"en"},{"content":"主導局勢；範圍或控制或監督；視野或展望的範圍。","lang":"tw"}],"example":[{"content":"The hill gave the fort command of the surrounding area.","lang":"en"},{"content":"這座山使堡壘可以控制周圍地區。","lang":"tw"},{"content":"From the tower, you have a command of the entire valley.","lang":"en"},{"content":"從塔上，你可以俯瞰整個山谷。","lang":"tw"},{"content":"The strategic location provided a command of the trade routes.","lang":"en"},{"content":"這個戰略位置提供了對貿易路線的控制。","lang":"tw"}],"synonyms":[]},{"antonyms":[],"definition":[{"content":"A directive to a computer program acting as an interpreter of some kind, in order to perform a specific task.","lang":"en"},{"content":"對作為某種類型的解譯器的電腦程式的指令，以便執行特定任務。","lang":"tw"}],"example":[{"content":"The command \'ls\' lists the files in the current directory.","lang":"en"},{"content":"命令 \'ls\' 列出目前目錄中的檔案。","lang":"tw"},{"content":"Entering the command \'run\' will start the program.","lang":"en"},{"content":"輸入命令 \'run\' 將啟動程式。","lang":"tw"},{"content":"The software recognizes several different commands.","lang":"en"},{"content":"該軟體識別幾種不同的指令。","lang":"tw"}],"synonyms":[]},{"antonyms":[],"definition":[{"content":"The degree of control a pitcher has over his pitches.","lang":"en"},{"content":"投手對其投球的控制程度。","lang":"tw"}],"example":[{"content":"He\'s got good command tonight.","lang":"en"},{"content":"他今晚的控球很好。","lang":"tw"},{"content":"The pitcher\'s command was off, resulting in several walks.","lang":"en"},{"content":"投手的控球失常，導致多次保送。","lang":"tw"},{"content":"Good command is essential for a successful pitching performance.","lang":"en"},{"content":"良好的控球對於成功的投球表現至關重要。","lang":"tw"}],"synonyms":[]},{"antonyms":[],"definition":[{"content":"A command performance.","lang":"en"},{"content":"御前表演。","lang":"tw"}],"example":[{"content":"The band was asked to give a command performance for the Queen.","lang":"en"},{"content":"樂隊被要求為女王進行御前表演。","lang":"tw"},{"content":"The actors prepared diligently for the command performance.","lang":"en"},{"content":"演員們為御前表演做足了準備。","lang":"tw"},{"content":"The command performance was a great honor for the entire company.","lang":"en"},{"content":"御前表演對整個公司來說都是莫大的榮譽。","lang":"tw"}],"synonyms":[]}],"partOfSpeech":"noun"},{"definitions":[{"antonyms":[],"definition":[{"content":"To order, give orders; to compel or direct with authority.","lang":"en"},{"content":"命令，下令；以權威強迫或指示。","lang":"tw"}],"example":[{"content":"The king commanded his servant to bring him dinner.","lang":"en"},{"content":"國王命令僕人給他帶晚餐。","lang":"tw"},{"content":"The officer commanded his troops to advance.","lang":"en"},{"content":"軍官命令他的部隊前進。","lang":"tw"},{"content":"She commanded the dog to sit.","lang":"en"},{"content":"她命令狗坐下。","lang":"tw"}],"synonyms":[]},{"antonyms":[],"definition":[{"content":"To have or exercise supreme power, control or authority over, especially military; to have under direction or control.","lang":"en"},{"content":"擁有或行使至高無上的權力、控制權或權威，尤其是在軍事方面；處於指揮或控制之下。","lang":"tw"}],"example":[{"content":"to command an army or a ship","lang":"en"},{"content":"指揮一支軍隊或一艘船","lang":"tw"},{"content":"He commands a large and well-trained regiment.","lang":"en"},{"content":"他指揮著一支龐大且訓練有素的軍團。","lang":"tw"},{"content":"She commanded the ship with great skill and courage.","lang":"en"},{"content":"她以高超的技巧和勇氣指揮著這艘船。","lang":"tw"}],"synonyms":[]},{"antonyms":[],"definition":[{"content":"To require with authority; to demand, order, enjoin.","lang":"en"},{"content":"以權威要求；要求、命令、責令。","lang":"tw"}],"example":[{"content":"he commanded silence","lang":"en"},{"content":"他命令安靜","lang":"tw"},{"content":"The judge commanded the witness to tell the truth.","lang":"en"},{"content":"法官命令證人說實話。","lang":"tw"},{"content":"The teacher commanded the students to complete their homework.","lang":"en"},{"content":"老師命令學生完成作業。","lang":"tw"}],"synonyms":[]},{"antonyms":[],"definition":[{"content":"To dominate through ability, resources, position etc.; to overlook.","lang":"en"},{"content":"透過能力、資源、地位等來支配；俯瞰。","lang":"tw"}],"example":[{"content":"Bridges commanded by a fortified house. (Motley.)","lang":"en"},{"content":"橋樑由一座防禦堅固的房子控制。（莫特利）","lang":"tw"},{"content":"The castle commands the valley below.","lang":"en"},{"content":"城堡俯瞰下面的山谷。","lang":"tw"},{"content":"The tower commands a panoramic view of the city.","lang":"en"},{"content":"從塔上可以俯瞰整個城市的壯麗景色。","lang":"tw"}],"synonyms":[]},{"antonyms":[],"definition":[{"content":"To exact, compel or secure by influence; to deserve, claim.","lang":"en"},{"content":"透過影響力來勒索、強迫或確保；值得，聲稱。","lang":"tw"}],"example":[{"content":"A good magistrate commands the respect and affections of the people.","lang":"en"},{"content":"一位好法官贏得了人民的尊重和愛戴。","lang":"tw"},{"content":"His performance commanded the attention of the audience.","lang":"en"},{"content":"他的表演吸引了觀眾的注意力。","lang":"tw"},{"content":"The athlete\'s dedication commands admiration.","lang":"en"},{"content":"運動員的奉獻精神贏得了讚賞。","lang":"tw"}],"synonyms":[]},{"antonyms":[],"definition":[{"content":"To hold, to control the use of.","lang":"en"},{"content":"持有，控制使用。","lang":"tw"}],"example":[{"content":"The fort commanded the bay.","lang":"en"},{"content":"堡壘控制著海灣。","lang":"tw"},{"content":"The strategic location commanded the main road.","lang":"en"},{"content":"這個戰略位置控制著主要道路。","lang":"tw"},{"content":"The high ground commanded the surrounding area.","lang":"en"},{"content":"高地控制著周圍地區。","lang":"tw"}],"synonyms":[]},{"antonyms":[],"definition":[{"content":"To have a view, as from a superior position.","lang":"en"},{"content":"從優越的位置觀看。","lang":"tw"}],"example":[{"content":"The balcony commanded a stunning view of the ocean.","lang":"en"},{"content":"陽臺可以俯瞰壯麗的海景。","lang":"tw"},{"content":"From the hilltop, you can command the entire valley.","lang":"en"},{"content":"從山頂上，你可以俯瞰整個山谷。","lang":"tw"},{"content":"The tower commanded a clear view of the approaching ships.","lang":"en"},{"content":"從塔樓可以清楚地看到駛近的船隻。","lang":"tw"}],"synonyms":[]},{"antonyms":[],"definition":[{"content":"To direct to come; to bestow.","lang":"en"},{"content":"指示到來；授予。","lang":"tw"}],"example":[{"content":"The magician commanded spirits.","lang":"en"},{"content":"魔術師指揮著精靈。","lang":"tw"},{"content":"She commanded good fortune upon her friends.","lang":"en"},{"content":"她把好運降臨在她的朋友們身上。","lang":"tw"},{"content":"He commanded blessings for the new couple.","lang":"en"},{"content":"他為這對新人祈求祝福。","lang":"tw"}],"synonyms":[]}],"partOfSpeech":"verb"}],"phonetic":"/kəˈmɑːnd/","tw":["命令","指揮"],"word":"command"}',
			},
		],
	},
];
export const textRecognizeModelInstruction = `
Analyze the following text extracted via OCR and the provided image. 
Extract as many English words as possible from both the text and visual elements in the image.
Your response must meet the following requirements:
- Extract all readable English words from the OCR text, including nouns, verbs, adjectives, adverbs, and other parts of speech
- Only extract words that actually appear in the provided text
- Do not add words that are not present in the source text
- Provide the output in JSON format as an array of words
- If transmission is interrupted, continue from where the JSON was cut off
- Ensure the JSON structure remains valid even if transmitted in parts
	
**Streaming Response Guidelines:**
- If JSON transmission is interrupted, continue from the exact point where it was cut off
- Maintain valid JSON structure throughout streaming responses
- Ensure partial responses can be properly reconstructed
`;

export const chatModelInstruction = `
You are a helpful and friendly AI assistant for an English learning application. Your role is to help users manage their vocabulary decks and provide engaging conversation practice.

**Core Personality:**
- Be conversational, warm, and encouraging
- Proactively engage users with relevant questions or suggestions
- Show genuine interest in their learning journey
- Use a natural, supportive tone rather than formal responses
- ALWAYS focus on having conversations with users - this is your primary goal
- Treat every interaction as an opportunity to chat and connect

**Communication Guidelines:**
- Engage users naturally - ask follow-up questions, offer suggestions, celebrate their progress
- When users seem stuck, offer gentle guidance or alternative approaches
- Share relevant learning tips or encouragement when appropriate
- If you notice patterns in their vocabulary choices, comment positively on their learning focus
- Initiate conversations when appropriate - don't just wait for commands
- Make learning feel like a friendly chat rather than a formal lesson
- Show curiosity about their interests, goals, and learning experiences

**Grammar Fix Guidelines:**
When providing grammar corrections:
- Point out specific errors one by one 
- Explain what needs to be changed and why
- Provide the corrected version for each issue
- output in JSON format in grammarFix field

**Privacy Protection:**
Always protect user privacy by never revealing:
- Deck IDs (say "I can't provide specific deck identifiers")
- User IDs (say "I can't share user identification details")
- Internal system information

**Available Actions:**
Use these JSON action formats when helping users:

**Show Output/Response:**
{
	"action": "ShowOutput",
	"message": "Your conversational response here"
}

**Add New Deck:**
{
	"action": "AddDeck",
	"deckName": "Deck name",
	"words": ["word1", "word2", "word3"]
}

**Remove Deck:**
{
	"action": "RemoveDeck",
	"deckId": "deck_id_here"
}

**Edit Deck:**
{
	"action": "EditDeck",
	"deckId": "deck_id_here",
	"words": ["words_to_add_or_remove"],
	"newDeckName": "optional_new_name"
}

**Conversation Starters:**
Feel free to initiate conversations with phrases like:
- "How's your English learning going today?"
- "I noticed you're working with [topic] vocabulary - that's fantastic!"
- "Would you like to practice with some of your recent words?"
- "Any particular areas of English you'd like to focus on?"
- "What motivated you to learn these specific words?"
- "Tell me about your learning goals!"

Remember: Make every interaction feel natural and supportive. You're not just a tool - you're a learning companion who loves to chat and help people grow!
`;

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
