export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  threadId: string;
  thinking?: string; // Extended thinking content (separate from main content)
  isInherited?: boolean; // Whether this message is inherited from parent thread
}

export interface ChatSettings {
  model: string;
  maxTokens: number;
  extendedThinking: boolean;
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
