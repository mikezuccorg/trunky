import { NextRequest } from 'next/server';
import { getProvider } from '@/lib/providers';
import { AIProvider } from '@/types';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      apiKey,
      parallelApiKey,
      model,
      maxTokens = 4096,
      extendedThinking = false,
      provider = 'anthropic' as AIProvider,
    } = await req.json();

    // Validation
    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Determine which API key to use based on provider
    const selectedApiKey = provider === 'anthropic' ? apiKey : parallelApiKey;
    if (!selectedApiKey) {
      return new Response(
        JSON.stringify({ error: `API key required for ${provider}` }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get appropriate provider instance
    const providerInstance = getProvider(provider);

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          const stream = providerInstance.sendMessage(messages, selectedApiKey, {
            model,
            maxTokens,
            extendedThinking,
          });

          for await (const chunk of stream) {
            switch (chunk.type) {
              case 'text':
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk.data })}\n\n`));
                break;
              case 'thinking':
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ thinking: chunk.data })}\n\n`));
                break;
              case 'citation':
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ citations: chunk.data })}\n\n`));
                break;
              case 'progress':
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ progress: chunk.data })}\n\n`));
                break;
              case 'error':
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: chunk.data })}\n\n`));
                break;
              case 'done':
                controller.enqueue(encoder.encode('data: [DONE]\n\n'));
                break;
            }
          }

          controller.close();
        } catch (error: any) {
          console.error('Stream error:', error);
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: error.message || 'Stream error' })}\n\n`)
          );
          controller.close();
        }
      },
    });

    return new Response(readableStream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });
  } catch (error: any) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to process chat request',
      }),
      {
        status: error.status || 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
