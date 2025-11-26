export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
  threadId: string;
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
}

export interface ConversationState {
  threads: Record<string, Thread>;
  activeThreadIds: string[];
  mainThreadId: string;
  apiKey: string | null;
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
}
