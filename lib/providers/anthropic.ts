import Anthropic from '@anthropic-ai/sdk';
import { BaseProvider, StreamChunk, ProviderOptions } from './base';
import { ChatMessage } from '@/types';

export class AnthropicProvider implements BaseProvider {
  name = 'anthropic';

  async *sendMessage(
    messages: ChatMessage[],
    apiKey: string,
    options: ProviderOptions
  ): AsyncGenerator<StreamChunk> {
    const anthropic = new Anthropic({ apiKey });

    // Build stream options with proper typing
    const streamOptions: Anthropic.MessageStreamParams & {
      thinking?: { type: 'enabled'; budget_tokens: number };
    } = {
      model: options.model || 'claude-haiku-4-5-20251001',
      max_tokens: options.maxTokens || 4096,
      messages,
    };

    // Add extended thinking (thinking block) if enabled
    // Only available for Claude 4 and 3.7+ models
    if (options.extendedThinking && options.model && (
      options.model.includes('claude-opus-4') ||
      options.model.includes('claude-sonnet-4') ||
      options.model.includes('claude-3-7')
    )) {
      streamOptions.thinking = {
        type: 'enabled',
        budget_tokens: 10000,
      };
    }

    let stream;
    try {
      stream = await anthropic.messages.stream(streamOptions);
    } catch (error) {
      yield {
        type: 'error',
        data: error instanceof Error ? error.message : 'Failed to start chat stream',
      };
      return;
    }

    try {
      for await (const chunk of stream) {
        // Handle text deltas (regular content)
        if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
          yield {
            type: 'text',
            data: chunk.delta.text,
          };
        }
        // Handle thinking deltas (extended thinking)
        // Note: thinking_delta is not in official SDK types but is supported by the API
        else if (chunk.type === 'content_block_delta') {
          const delta = chunk.delta as { type: string; thinking?: string };
          if (delta.type === 'thinking_delta' && delta.thinking) {
            yield {
              type: 'thinking',
              data: delta.thinking,
            };
          }
        }
        // Handle content block start markers
        else if (chunk.type === 'content_block_start') {
          const contentBlock = chunk.content_block as { type?: string };
          if (contentBlock?.type === 'thinking') {
            yield {
              type: 'thinking',
              data: '', // Empty thinking marker
            };
          }
        }
      }

      yield { type: 'done', data: null };
    } catch (error) {
      yield {
        type: 'error',
        data: error instanceof Error ? error.message : 'Stream error occurred',
      };
    }
  }
}
