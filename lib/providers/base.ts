import { ChatMessage } from '@/types';

export interface StreamChunk {
  type: 'text' | 'thinking' | 'citation' | 'progress' | 'error' | 'done';
  data: any;
}

export interface BaseProvider {
  name: string;
  sendMessage(
    messages: ChatMessage[],
    apiKey: string,
    options: ProviderOptions
  ): AsyncGenerator<StreamChunk>;
}

export interface ProviderOptions {
  model?: string;
  maxTokens?: number;
  extendedThinking?: boolean;
  [key: string]: any;
}
