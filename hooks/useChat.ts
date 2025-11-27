'use client';

import { useState, useCallback } from 'react';
import { Message, ChatMessage, ChatSettings } from '@/types';
import { generateId } from '@/lib/storage';

interface UseChatOptions {
  threadId: string;
  apiKey: string;
  settings: ChatSettings;
  onMessage?: (message: Message) => void;
}

export function useChat({ threadId, apiKey, settings, onMessage }: UseChatOptions) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = useCallback(
    async (content: string, messages: Message[]): Promise<Message | null> => {
      if (!content.trim() || !apiKey) {
        return null;
      }

      setIsLoading(true);
      setError(null);

      // Create user message
      const userMessage: Message = {
        id: generateId(),
        role: 'user',
        content: content.trim(),
        timestamp: Date.now(),
        threadId,
      };

      onMessage?.(userMessage);

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
            model: settings.model,
            maxTokens: settings.maxTokens,
            extendedThinking: settings.extendedThinking,
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
        let isInThinkingBlock = false;

        const assistantMessage: Message = {
          id: generateId(),
          role: 'assistant',
          content: '',
          timestamp: Date.now(),
          threadId,
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
                  // Handle error from stream
                  throw new Error(parsed.error);
                }
                // Handle thinking block start/end markers
                if (parsed.thinkingStart) {
                  isInThinkingBlock = true;
                } else if (parsed.textStart) {
                  isInThinkingBlock = false;
                }
                // Handle thinking content
                else if (parsed.thinking) {
                  thinkingContent += parsed.thinking;
                  assistantMessage.thinking = thinkingContent;
                  onMessage?.({ ...assistantMessage });
                }
                // Handle regular text content
                else if (parsed.text) {
                  assistantContent += parsed.text;
                  assistantMessage.content = assistantContent;
                  // Trigger re-render by calling onMessage with updated message
                  onMessage?.({ ...assistantMessage });
                }
              } catch (e: any) {
                // If it's a structured error, throw it
                if (e.message && !e.message.includes('JSON')) {
                  throw e;
                }
                // Otherwise ignore parse errors for incomplete chunks
              }
            }
          }
        }

        setIsLoading(false);
        return assistantMessage;
      } catch (err: any) {
        console.error('Chat error:', err);
        setError(err.message || 'Failed to send message');
        setIsLoading(false);
        return null;
      }
    },
    [apiKey, threadId, settings, onMessage]
  );

  return {
    sendMessage,
    isLoading,
    error,
  };
}
