import { BaseProvider, StreamChunk, ProviderOptions } from './base';
import { ChatMessage } from '@/types';

export class ParallelChatProvider implements BaseProvider {
  name = 'parallel-chat';

  async *sendMessage(
    messages: ChatMessage[],
    apiKey: string,
    options: ProviderOptions
  ): AsyncGenerator<StreamChunk> {
    let response;
    try {
      response = await fetch('https://api.parallel.ai/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
        },
        body: JSON.stringify({
          model: options.model || 'speed',
          messages,
          max_tokens: options.maxTokens || 4096,
          stream: true,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        yield {
          type: 'error',
          data: `Parallel API error: ${response.statusText} - ${errorText}`,
        };
        return;
      }
    } catch (error: any) {
      yield {
        type: 'error',
        data: error.message || 'Failed to connect to Parallel API',
      };
      return;
    }

    if (!response.body) {
      yield {
        type: 'error',
        data: 'No response body from Parallel API',
      };
      return;
    }

    const reader = response.body.getReader();
    const decoder = new TextDecoder();
    let buffer = '';

    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() || '';

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              yield { type: 'done', data: null };
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const delta = parsed.choices?.[0]?.delta;

              if (delta?.content) {
                yield { type: 'text', data: delta.content };
              }

              // Handle citations from Parallel
              if (parsed.citations && Array.isArray(parsed.citations)) {
                yield { type: 'citation', data: parsed.citations };
              }
            } catch (e) {
              // Skip malformed JSON
            }
          }
        }
      }

      yield { type: 'done', data: null };
    } catch (error: any) {
      yield {
        type: 'error',
        data: error.message || 'Stream reading error',
      };
    }
  }
}
