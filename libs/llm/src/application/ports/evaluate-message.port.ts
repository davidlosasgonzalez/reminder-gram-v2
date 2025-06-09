/**
 * @file evaluate-message.port.ts
 * @description Port interface for evaluating message relevance and intent using an LLM.
 */

export type EvaluateMessageResult =
    | {
          relevant: true;
          type: 'LIST_EVENTS';
      }
    | {
          relevant: false;
          messages: {
              user: string | null;
              llm: string;
          };
      };

export interface EvaluateMessagePort {
    /**
     * Evaluates the user's message to determine relevance and intent.
     * @param message - The user message to analyze.
     * @returns Promise resolving to the LLM evaluation result.
     */
    evaluateMessage(message: string): Promise<EvaluateMessageResult>;
}
