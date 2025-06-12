/**
 * @file llm-evaluated-intent.enum.ts
 * @description Enum that defines the possible intents evaluated from a user's message.
 */

export const LLM_EVALUATED_INTENT = {
    LIST_EVENTS: 'LIST_EVENTS',
    UNKNOWN: 'UNKNOWN',
    NEEDS_CLARIFICATION: 'NEEDS_CLARIFICATION',
} as const;

export type LlmEvaluatedIntent =
    (typeof LLM_EVALUATED_INTENT)[keyof typeof LLM_EVALUATED_INTENT];
