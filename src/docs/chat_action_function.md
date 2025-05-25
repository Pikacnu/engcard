# AI Chat: Actions and Function Calling Documentation

This document explains how the AI chat system uses schema-based actions and direct function calling to interact with backend services and perform tasks.

## Configuration (`src/config.ts`)

The primary configuration for AI chat behavior is located in `src/config.ts`:

```typescript
// src/config.ts
export const aiFeatures = {
  useFunctionCalling: false, // Set to true to enable function calling, false for schema-based output
};
```

-   **`useFunctionCalling`**:
    -   If `true`, the system will pass defined function declarations (from `src/utils/ai/prompt.ts`) to the AI model (currently Gemini). The AI can then request to call these functions, and the system will handle the execution and response loop.
    -   If `false`, function declarations are not sent to the AI. The AI is expected to rely solely on outputting structured JSON that conforms to `ChatModelSchema` (defined in `src/utils/ai/schema.ts`) to trigger predefined actions.

## AI Interaction Flow

The main interaction logic resides in `src/actions/chat.ts` within the `sendMessage` function.

1.  User sends a message.
2.  The message is passed to an AI model via `GenerateTextResponse` (a wrapper around `getParseResponse` from `src/utils/ai/generate.ts`).
3.  **If `useFunctionCalling` is `true`**:
    *   Function declarations (like `checkGrammar`) are sent to the AI.
    *   The AI can respond in two ways:
        *   **Function Call:** If the AI decides to call a function, it returns a `functionCall` object.
            *   The system executes the named function (e.g., `checkGrammar` handler in `chatActionFunctions`, which might call a service in `src/lib/grammar.ts`).
            *   The function's result is sent back to the AI.
            *   The AI processes this result and generates a final textual response for the user. This final response can also include structured data like `grammarCheckResults`.
        *   **Direct Data Response:** The AI might still choose to respond directly with data conforming to `ChatModelSchema` (see below), or just plain text.
4.  **If `useFunctionCalling` is `false` (or AI chooses not to call a function):**
    *   The AI is expected to generate a JSON object matching `ChatModelSchema`. This schema includes:
        *   `action`: An enum value from `ChatAction` (e.g., `AddDeck`, `ShowOuput`, `GrammarCheck`).
        *   `message`: A textual message for the user.
        *   Other fields specific to the action (e.g., `targetDeckName`, `words`, `grammarCheckResults`).
    *   The `sendMessage` function then uses the `action` field to call a corresponding handler in the `chatActionFunctions` object (defined in `src/actions/chat.ts`).

## Schema-Based Actions

When not using (or as a fallback to) function calling, the AI uses a predefined JSON schema (`ChatModelSchema`) to indicate desired actions.

-   **Definition:** `ChatModelSchema` is defined in `src/utils/ai/schema.ts` using Zod. It includes fields like `action` (from `ChatAction` enum in `src/type.ts`), `message`, and other optional fields for specific tasks (e.g., `targetDeckName`, `words`, `changeChatName`, `grammarCheckResults`).
-   **AI Prompting:** The `chatModelInstruction` in `src/utils/ai/prompt.ts` provides examples to the AI on how to structure this JSON for various actions (e.g., `AddDeck`, `RemoveDeck`, `ChangeChatName`, `GrammarCheck`).
-   **Handling:** The `sendMessage` function in `src/actions/chat.ts` takes the `action` field from the AI's JSON output and calls the relevant handler in the `chatActionFunctions` map.
    ```typescript
    // Example: chatActionFunctions in src/actions/chat.ts
    const chatActionFunctions: Record<ChatAction, (data: ChatModelSchema, userData?: Session) => Promise<void | { error: string }> | void> = {
        [ChatAction.AddDeck]: async (data, userData) => { /* ... */ },
        [ChatAction.GrammarCheck]: async (data, userData) => { /* ... */ },
        // ... other handlers
    };
    ```

## Function Calling

When `useFunctionCalling` is `true`, the system enables a more flexible interaction where the AI can request specific functions to be called.

**1. Defining a Function for the AI:**
   - **Function Declaration (`src/utils/ai/prompt.ts`):**
     - Add a `FunctionDeclaration` object to the `functions` array. This object describes the function's name, purpose, and parameters to the AI.
     - Example for `checkGrammar`:
       ```typescript
       import { FunctionDeclaration, SchemaType } from '@google/generative-ai';
       // ...
       export const aiDefinedFunctions: FunctionDeclaration[] = [
           {
               name: 'checkGrammar',
               description: 'Checks text for grammatical errors. Use when user asks for a grammar check or errors are identified.',
               parameters: {
                   type: SchemaType.OBJECT,
                   properties: {
                       text: { type: SchemaType.STRING, description: 'The text to check.' },
                   },
                   required: ['text'],
               },
           },
           // ... other functions
       ];
       ```

**2. Implementing the Backend Logic for the Function:**
   - **Handler in `chatActionFunctions` (Optional but good for consistency):** While not strictly necessary for pure function calls that don't map to an "action" schema, you can have a conceptual link or use `chatActionFunctions` to house the execution logic if it helps organize code. However, the primary execution for function calls is handled within the `sendMessage` loop.
   - **Core Logic Implementation (e.g., `src/lib/grammar.ts`):**
     - Create the actual TypeScript function that performs the work.
       ```typescript
       // src/lib/grammar.ts
       import { GrammarError } from '@/type';
       export async function checkTextGrammar(text: string): Promise<GrammarError[]> {
           // ... actual grammar checking logic ...
           return errors;
       }
       ```
   - **Handling in `sendMessage` (`src/actions/chat.ts`):**
     - The `sendMessage` function is updated to:
       - Pass the `aiDefinedFunctions` to `GenerateTextResponse`.
       - Check if the AI's response is a `functionCall`.
       - If `functionCall.name` matches a defined function (e.g., `checkGrammar`):
         1.  Extract arguments (e.g., `textToParse = functionCall.args.text`).
         2.  Execute your implemented function (e.g., `actualGrammarResults = await checkTextGrammar(textToParse)`).
         3.  Save the AI's function call request and your tool's execution response to the chat history.
         4.  Call `GenerateTextResponse` *again*, providing the original user message, the AI's function call request, and your tool's response in the history. This second call should *not* pass function declarations to avoid loops.
         5.  The AI's response from this second call is its final textual message to the user. This message, along with any structured data like `actualGrammarResults`, is saved to history and sent to the client.

**Example: Adding a New Function `getWordDefinition`**

1.  **Declare in `src/utils/ai/prompt.ts` (`aiDefinedFunctions`):**
    ```typescript
    {
        name: 'getWordDefinition',
        description: 'Fetches the definition of a word.',
        parameters: {
            type: SchemaType.OBJECT,
            properties: {
                word: { type: SchemaType.STRING, description: 'The word to define.' },
            },
            required: ['word'],
        },
    }
    ```
2.  **Implement logic (e.g., in `src/lib/dictionary.ts`):**
    ```typescript
    // src/lib/dictionary.ts
    export async function fetchWordDefinition(word: string): Promise<{ definition: string, example?: string }> {
        // ... logic to fetch definition (e.g., from an API or database) ...
        return { definition: "Some definition for " + word };
    }
    ```
3.  **Update `sendMessage` in `src/actions/chat.ts`:**
    -   Inside the `if (aiResponse1.type === 'functionCall')` block, add a new `else if` for `functionCall.name === 'getWordDefinition'`:
        ```typescript
        else if (functionCall.name === 'getWordDefinition') {
            const word = (functionCall.args as any)?.word;
            if (word) {
                const definitionResult = await fetchWordDefinition(word); // From src/lib/dictionary.ts
                
                // Save AI func call to history
                // Construct tool response content with definitionResult
                // Call GenerateTextResponse again with this tool response
                // Process final AI message, save it with definitionResult (if appropriate), return to client
            } else {
                // Handle missing arguments
            }
        }
        ```

This provides a comprehensive overview of how to manage and extend the AI chat's capabilities.
