// src/lib/grammar.ts
import { GrammarError } from '@/type'; // Assuming GrammarError is in src/type.ts

/**
 * Checks a given text for basic grammatical errors.
 * This is a placeholder implementation and should be expanded for real checks.
 * @param text The text to check.
 * @returns A promise that resolves to an array of GrammarError objects.
 */
export async function checkTextGrammar(text: string): Promise<GrammarError[]> {
    const errors: GrammarError[] = [];

    // Example Placeholder Check 1: Look for "teh" (common typo for "the")
    const tehRegex = /\b(teh)\b/gi;
    let match;
    while ((match = tehRegex.exec(text)) !== null) {
        errors.push({
            message: "Misspelling: Found 'teh', did you mean 'the'?",
            shortMessage: "Misspelling: 'teh'",
            correction: "the",
            offset: match.index,
            length: match[0].length,
            ruleId: "TEH_TYPO_RULE",
            ruleDescription: "Detects common typo 'teh' for 'the'."
        });
    }

    // Example Placeholder Check 2: Very simple check for "your" vs "you're"
    // This is highly context-dependent and error-prone as a simple regex.
    // For demonstration purposes only.
    const yourYoureRegex = /\b(your)\b\s+(is|are|going|not)\b/gi; // e.g., "your is", "your are"
    while ((match = yourYoureRegex.exec(text)) !== null) {
        errors.push({
            message: "Grammar: Found 'your' followed by a verb like 'is' or 'are'. Did you mean 'you\\'re'?",
            shortMessage: "your/you're",
            correction: "you're " + match[2], // match[2] is the verb
            offset: match.index,
            length: match[1].length, // length of "your"
            ruleId: "YOUR_VS_YOURE_RULE",
            ruleDescription: "Suggests 'you\\'re' when 'your' is followed by common verbs."
        });
    }
    
    // Example Placeholder Check 3: Presence of "alot"
    const alotRegex = /\b(alot)\b/gi;
    while ((match = alotRegex.exec(text)) !== null) {
        errors.push({
            message: "Style: 'alot' should usually be written as 'a lot'.",
            shortMessage: "alot -> a lot",
            correction: "a lot",
            offset: match.index,
            length: match[0].length,
            ruleId: "ALOT_RULE",
            ruleDescription: "Detects use of 'alot' instead of 'a lot'."
        });
    }

    // Simulate some async work if this were a real API call
    await new Promise(resolve => setTimeout(resolve, 100));

    return errors;
}
