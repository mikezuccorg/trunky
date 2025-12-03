import { ConversationState, Thread, Message, AIProvider } from '@/types';

const STORAGE_KEY = 'trunky_conversations';
const API_KEY_STORAGE = 'trunky_api_key';
const PARALLEL_API_KEY_STORAGE = 'trunky_parallel_api_key';
const LAST_MODEL_STORAGE = 'trunky_last_model';
const LAST_PROVIDER_STORAGE = 'trunky_last_provider';

export const storage = {
  saveConversations: (state: ConversationState): void => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch (error) {
      console.error('Failed to save conversations:', error);
    }
  },

  loadConversations: (): ConversationState | null => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch (error) {
      console.error('Failed to load conversations:', error);
      return null;
    }
  },

  saveApiKey: (apiKey: string): void => {
    try {
      localStorage.setItem(API_KEY_STORAGE, apiKey);
    } catch (error) {
      console.error('Failed to save API key:', error);
    }
  },

  loadApiKey: (): string | null => {
    try {
      return localStorage.getItem(API_KEY_STORAGE);
    } catch (error) {
      console.error('Failed to load API key:', error);
      return null;
    }
  },

  clearApiKey: (): void => {
    try {
      localStorage.removeItem(API_KEY_STORAGE);
    } catch (error) {
      console.error('Failed to clear API key:', error);
    }
  },

  saveParallelApiKey: (apiKey: string): void => {
    try {
      localStorage.setItem(PARALLEL_API_KEY_STORAGE, apiKey);
    } catch (error) {
      console.error('Failed to save Parallel API key:', error);
    }
  },

  loadParallelApiKey: (): string | null => {
    try {
      return localStorage.getItem(PARALLEL_API_KEY_STORAGE);
    } catch (error) {
      console.error('Failed to load Parallel API key:', error);
      return null;
    }
  },

  clearParallelApiKey: (): void => {
    try {
      localStorage.removeItem(PARALLEL_API_KEY_STORAGE);
    } catch (error) {
      console.error('Failed to clear Parallel API key:', error);
    }
  },

  saveLastProvider: (provider: AIProvider): void => {
    try {
      localStorage.setItem(LAST_PROVIDER_STORAGE, provider);
    } catch (error) {
      console.error('Failed to save last provider:', error);
    }
  },

  loadLastProvider: (): AIProvider => {
    try {
      const provider = localStorage.getItem(LAST_PROVIDER_STORAGE);
      return (provider as AIProvider) || 'anthropic';
    } catch (error) {
      console.error('Failed to load last provider:', error);
      return 'anthropic';
    }
  },

  saveLastModel: (model: string): void => {
    try {
      localStorage.setItem(LAST_MODEL_STORAGE, model);
    } catch (error) {
      console.error('Failed to save last model:', error);
    }
  },

  loadLastModel: (): string => {
    try {
      return localStorage.getItem(LAST_MODEL_STORAGE) || 'claude-haiku-4-5-20251001';
    } catch (error) {
      console.error('Failed to load last model:', error);
      return 'claude-haiku-4-5-20251001';
    }
  },

  clearAll: (): void => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      localStorage.removeItem(API_KEY_STORAGE);
      localStorage.removeItem(PARALLEL_API_KEY_STORAGE);
      localStorage.removeItem(LAST_MODEL_STORAGE);
      localStorage.removeItem(LAST_PROVIDER_STORAGE);
    } catch (error) {
      console.error('Failed to clear storage:', error);
    }
  },
};

export const generateId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};

export const createThread = (
  parentThreadId: string | null = null,
  parentMessageId: string | null = null,
  selectedText?: string,
  inheritedMessages: Message[] = []
): Thread => {
  return {
    id: generateId(),
    parentThreadId,
    parentMessageId,
    selectedText,
    messages: inheritedMessages,
    createdAt: Date.now(),
  };
};

// Get all messages up to a specific message in a thread (for branching)
export const getMessagesUpToPoint = (
  thread: Thread,
  messageId: string
): Message[] => {
  const messageIndex = thread.messages.findIndex(m => m.id === messageId);
  if (messageIndex === -1) {
    return thread.messages.map(m => ({ ...m, isInherited: true }));
  }
  // Include all messages up to and including the branching message
  return thread.messages.slice(0, messageIndex + 1).map(m => ({ ...m, isInherited: true }));
};
