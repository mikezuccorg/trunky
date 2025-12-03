'use client';

import { useState, useCallback } from 'react';
import { Message, ChatMessage, ChatSettings, Citation } from '@/types';
import { generateId } from '@/lib/storage';

interface UseChatOptions {
  threadId: string;
  apiKey: string;
  parallelApiKey?: string;
  settings: ChatSettings;
  onMessage?: (message: Message, streaming?: boolean) => void;
}

export function useChat({ threadId, apiKey, parallelApiKey, settings, onMessage }: UseChatOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [isResearching, setIsResearching] = useState(false);
  const [researchProgress, setResearchProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string, messages: Message[]): Promise<Message | null> => {
      if (!content.trim()) {
        return null;
      }

      // Check if we have the required API key for the selected provider
      const requiresKey = settings.provider === 'anthropic' ? apiKey : parallelApiKey;
      if (!requiresKey) {
        setError(`API key required for ${settings.provider}`);
        return null;
      }

      setIsLoading(true);
      setError(null);

      // Track if this is deep research
      const isDeepResearch = settings.provider === 'parallel-research';
      if (isDeepResearch) {
        setIsResearching(true);
        setResearchProgress(0);
      }

      // Create user message
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
        timestamp: Date.now(),
        threadId,
        provider: settings.provider,
      };

      onMessage?.(userMessage, false);

      try {
        // Prepare messages for API (only role and content)
        const apiMessages: ChatMessage[] = [
          ...messages.map((m) => ({
            role: m.role,
            content: m.content,
          })),
          {
            role: 'user' as const,
            content: content.trim(),
          },
        ];

        const response = await fetch('/api/chat', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            messages: apiMessages,
            apiKey,
            parallelApiKey,
            model: settings.model,
            maxTokens: settings.maxTokens,
            extendedThinking: settings.extendedThinking,
            provider: settings.provider,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to get response');
        }

        if (!response.body) {
          throw new Error('No response body');
        }

        // Handle streaming response
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = '';
        let thinkingContent = '';
        let citations: Citation[] = [];
        let taskId: string | undefined;

        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          threadId,
          provider: settings.provider,
          metadata: {
            provider: settings.provider,
            citations: [],
          },
        };

        while (true) {
          const { done, value } = await reader.read();

          if (done) {
            break;
          }

          const chunk = decoder.decode(value);
          const lines = chunk.split('\n');

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              const data = line.slice(6);

              if (data === '[DONE]') {
                break;
              }

              try {
                const parsed = JSON.parse(data);

                if (parsed.error) {
                  throw new Error(parsed.error);
                }

                // Handle thinking content
                if (parsed.thinking) {
                  thinkingContent += parsed.thinking;
                  assistantMessage.thinking = thinkingContent;
                  onMessage?.({ ...assistantMessage }, true);
                }

                // Handle regular text content
                if (parsed.text) {
                  assistantContent += parsed.text;
                  assistantMessage.content = assistantContent;
                  onMessage?.({ ...assistantMessage }, true);
                }

                // Handle citations
                if (parsed.citations) {
                  citations = [...citations, ...parsed.citations];
                  if (assistantMessage.metadata) {
                    assistantMessage.metadata.citations = citations;
                  }
                  onMessage?.({ ...assistantMessage }, true);
                }

                // Handle Deep Research progress
                if (parsed.progress) {
                  setResearchProgress(parsed.progress.progress || 0);
                  taskId = parsed.progress.taskId;
                  if (assistantMessage.metadata) {
                    assistantMessage.metadata.taskId = taskId;
                    assistantMessage.metadata.progress = parsed.progress.progress;
                    assistantMessage.metadata.status = parsed.progress.status;
                  }
                  onMessage?.({ ...assistantMessage }, true);
                }
              } catch (e: any) {
                if (e.message && !e.message.includes('JSON')) {
                  throw e;
                }
              }
            }
          }
        }

        // Streaming complete - persist the final message
        onMessage?.({ ...assistantMessage }, false);

        setIsLoading(false);
        setIsResearching(false);
        return assistantMessage;
      } catch (err: any) {
        console.error('Chat error:', err);
        setError(err.message || 'Failed to send message');
        setIsLoading(false);
        setIsResearching(false);
        return null;
      }
    },
    [apiKey, parallelApiKey, threadId, settings, onMessage]
  );

  return {
    sendMessage,
    isLoading,
    isResearching,
    researchProgress,
    error,
  };
}
