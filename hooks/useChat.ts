'use client';

import { useState, useCallback } from 'react';
import { Message, ChatMessage } from '@/types';
import { generateId } from '@/lib/storage';

interface UseChatOptions {
  threadId: string;
  apiKey: string;
  onMessage?: (message: Message) => void;
}

export function useChat({ threadId, apiKey, onMessage }: UseChatOptions) {
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
                if (parsed.text) {
                  assistantContent += parsed.text;
                  assistantMessage.content = assistantContent;
                  // Trigger re-render by calling onMessage with updated message
                  onMessage?.({ ...assistantMessage });
                }
              } catch (e) {
                // Ignore parse errors for incomplete chunks
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
    [apiKey, threadId, onMessage]
  );

  return {
    sendMessage,
    isLoading,
    error,
  };
}
