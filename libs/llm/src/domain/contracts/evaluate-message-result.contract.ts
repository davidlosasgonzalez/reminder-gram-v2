/**
 * @file evaluate-message-result.contract.ts
 * @description Contract that defines the output structure of an LLM message evaluation.
 */

import { LlmEvaluatedIntent } from '@llm/domain/enums/llm-evaluated-intent.enum';

export interface EvaluateMessageResult {
    type: LlmEvaluatedIntent;
    messages?: {
        user: string;
        llm?: string;
    };
}
