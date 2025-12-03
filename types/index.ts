// Provider types
export type AIProvider = 'anthropic' | 'parallel-chat' | 'parallel-research';

export interface Citation {
  title: string;
  url: string;
  snippet?: string;
  timestamp?: number;
}

export interface ProviderMetadata {
  provider: AIProvider;
  citations?: Citation[];
  taskId?: string; // For Deep Research async tracking
  progress?: number; // 0-100 for Deep Research progress
  status?: 'pending' | 'running' | 'completed' | 'failed';
}

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  threadId: string;
  thinking?: string; // Extended thinking content (separate from main content)
  isInherited?: boolean; // Whether this message is inherited from parent thread
  provider?: AIProvider; // AI provider used for this message
  metadata?: ProviderMetadata; // Provider-specific metadata
}

export interface ChatSettings {
  model: string;
  maxTokens: number;
  extendedThinking: boolean;
  provider: AIProvider; // AI provider to use
}

export interface Thread {
  id: string;
  parentThreadId: string | null;
  parentMessageId: string | null;
  selectedText?: string;
  messages: Message[];
  createdAt: number;
  title?: string;
  highlightMessageId?: string; // Message to highlight in parent thread
  settings?: ChatSettings; // Per-thread settings
}

export interface ConversationState {
  threads: Record<string, Thread>;
  activeThreadIds: string[];
  mainThreadId: string;
  apiKey: string | null;
  currentThreadId: string; // The thread currently being viewed (rightmost pane)
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface ApiChatRequest {
  messages: ChatMessage[];
  apiKey: string;
  model?: string;
  maxTokens?: number;
  extendedThinking?: boolean;
  provider: AIProvider; // AI provider to use
  parallelApiKey?: string; // Parallel.ai API key
}

export const CLAUDE_MODELS = {
  'claude-opus-4-5-20251101': 'Claude Opus 4.5',
  'claude-opus-4-1-20250805': 'Claude Opus 4.1',
  'claude-opus-4-20250514': 'Claude Opus 4',
  'claude-sonnet-4-5-20250929': 'Claude Sonnet 4.5',
  'claude-sonnet-4-20250514': 'Claude Sonnet 4',
  'claude-haiku-4-5-20251001': 'Claude Haiku 4.5',
  'claude-3-7-sonnet-20250219': 'Claude 3.7 Sonnet',
} as const;

export type ClaudeModel = keyof typeof CLAUDE_MODELS;

export const PARALLEL_CHAT_MODELS = {
  'speed': 'Speed',
} as const;

export type ParallelChatModel = keyof typeof PARALLEL_CHAT_MODELS;

export const PARALLEL_RESEARCH_CONFIG = {
  name: 'Parallel Deep Research',
  description: 'Comprehensive research with citations (5s-30min)',
} as const;
