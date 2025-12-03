import { ChatMessage, Citation } from '@/types';

export interface ProgressData {
  taskId: string;
  progress: number;
  status: string;
}

export interface StreamChunk {
  type: 'text' | 'thinking' | 'citation' | 'progress' | 'error' | 'done';
  data: string | Citation[] | ProgressData | null;
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
  [key: string]: unknown;
}
