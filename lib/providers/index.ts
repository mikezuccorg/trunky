import { BaseProvider } from './base';
import { AnthropicProvider } from './anthropic';
import { ParallelChatProvider } from './parallel-chat';
import { ParallelResearchProvider } from './parallel-research';
import { AIProvider } from '@/types';

const providers: Record<AIProvider, BaseProvider> = {
  'anthropic': new AnthropicProvider(),
  'parallel-chat': new ParallelChatProvider(),
  'parallel-research': new ParallelResearchProvider(),
};

export function getProvider(provider: AIProvider): BaseProvider {
  return providers[provider];
}

export * from './base';
