import { BaseProvider, StreamChunk, ProviderOptions } from './base';
import { ChatMessage } from '@/types';

export class ParallelResearchProvider implements BaseProvider {
  name = 'parallel-research';

  async *sendMessage(
    messages: ChatMessage[],
    apiKey: string,
    _options: ProviderOptions
  ): AsyncGenerator<StreamChunk> {
    // Step 1: Submit research task
    let submitResponse;
    try {
      // Combine all messages into a single research query
      const query = messages.map(m => `${m.role}: ${m.content}`).join('\n\n');

      submitResponse = await fetch('https://api.parallel.ai/v1/tasks/runs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          input: query,
          processor: 'ultra', // Use ultra for deep research
        }),
      });

      if (!submitResponse.ok) {
        const errorText = await submitResponse.text();
        yield {
          type: 'error',
          data: `Failed to submit research task: ${submitResponse.statusText} - ${errorText}`,
        };
        return;
      }
    } catch (error) {
      yield {
        type: 'error',
        data: error instanceof Error ? error.message : 'Failed to connect to Parallel Deep Research API',
      };
      return;
    }

    let taskData;
    try {
      taskData = await submitResponse.json();
    } catch {
      yield {
        type: 'error',
        data: 'Failed to parse task submission response',
      };
      return;
    }

    const taskId = taskData.id || taskData.task_id;
    if (!taskId) {
      yield {
        type: 'error',
        data: 'No task ID returned from API',
      };
      return;
    }

    // Initial progress update
    yield {
      type: 'progress',
      data: { taskId, progress: 0, status: 'pending' },
    };

    // Step 2: Poll for completion with progress updates
    const pollInterval = 2000; // 2 seconds
    let attempts = 0;
    const maxAttempts = 900; // 30 minutes max (900 * 2s = 1800s)

    while (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, pollInterval));
      attempts++;

      let statusResponse;
      try {
        statusResponse = await fetch(`https://api.parallel.ai/v1/tasks/runs/${taskId}`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
          },
        });

        if (!statusResponse.ok) {
          yield {
            type: 'error',
            data: `Failed to check task status: ${statusResponse.statusText}`,
          };
          return;
        }
      } catch {
        // Retry on network errors
        continue;
      }

      let status;
      try {
        status = await statusResponse.json();
      } catch {
        // Retry on parse errors
        continue;
      }

      // Emit progress updates
      const progress = status.progress !== undefined ? status.progress : Math.min((attempts / maxAttempts) * 100, 99);
      yield {
        type: 'progress',
        data: {
          taskId,
          progress: Math.round(progress),
          status: status.status || 'running',
        },
      };

      // Check if completed
      if (status.status === 'completed') {
        // Extract content and citations
        const content = status.result?.output || status.output || status.result || 'Research completed but no content returned';

        yield { type: 'text', data: content };

        // Handle citations if present
        if (status.result?.citations && Array.isArray(status.result.citations)) {
          yield { type: 'citation', data: status.result.citations };
        } else if (status.citations && Array.isArray(status.citations)) {
          yield { type: 'citation', data: status.citations };
        }

        yield { type: 'done', data: null };
        return;
      }

      // Check if failed
      if (status.status === 'failed' || status.status === 'error') {
        yield {
          type: 'error',
          data: `Research task failed: ${status.error || status.message || 'Unknown error'}`,
        };
        return;
      }
    }

    // Timeout
    yield {
      type: 'error',
      data: 'Research task timed out after 30 minutes',
    };
  }
}
