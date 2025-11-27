import Anthropic from '@anthropic-ai/sdk';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function POST(req: NextRequest) {
  try {
    const {
      messages,
      apiKey,
      model = 'claude-3-5-sonnet-20241022',
      maxTokens = 4096,
      extendedThinking = false
    } = await req.json();

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Messages array is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const anthropic = new Anthropic({
      apiKey: apiKey,
    });

    let stream;
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const streamOptions: any = {
        model: model,
        max_tokens: maxTokens,
        messages: messages,
      };

      // Add extended thinking (thinking block) if enabled
      // Only available for Claude 4 and 3.7+ models
      if (extendedThinking && (
        model.includes('claude-opus-4') ||
        model.includes('claude-sonnet-4') ||
        model.includes('claude-3-7')
      )) {
        streamOptions.thinking = {
          type: 'enabled',
          budget_tokens: 10000, // Allow up to 10k tokens for thinking
        };
      }

      stream = await anthropic.messages.stream(streamOptions);
    } catch (streamError: unknown) {
      // Handle errors that occur before streaming starts
      const error = streamError as { message?: string; status?: number; error?: { error?: { message?: string }; message?: string } };
      console.error('Failed to create stream:', streamError);
      return new Response(
        JSON.stringify({
          error: error.message || 'Failed to start chat stream',
          details: error.error?.error?.message || error.error?.message || undefined
        }),
        {
          status: error.status || 500,
          headers: { 'Content-Type': 'application/json' }
        }
      );
    }

    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const chunk of stream) {
            // Handle text deltas (regular content)
            if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
              const text = chunk.delta.text;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
            }
            // Handle thinking deltas (extended thinking)
            // Note: thinking_delta is not in SDK types but is part of the API
            else if (chunk.type === 'content_block_delta' && (chunk.delta as { type: string; thinking?: string }).type === 'thinking_delta') {
              const thinking = (chunk.delta as { thinking?: string }).thinking;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ thinking })}\n\n`));
            }
            // Handle content block start to differentiate thinking vs text blocks
            else if (chunk.type === 'content_block_start') {
              const contentBlock = chunk.content_block as { type?: string };
              if (contentBlock?.type === 'thinking') {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ thinkingStart: true })}\n\n`));
              } else if (contentBlock?.type === 'text') {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ textStart: true })}\n\n`));
              }
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error: unknown) {
          const streamError = error as { message?: string; error?: { error?: { message?: string } } };
          console.error('Stream error:', error);
          // Send error as SSE event before closing
          const errorMessage = streamError.error?.error?.message || streamError.message || 'Stream error occurred';
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`)
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
  } catch (error: unknown) {
    const apiError = error as { message?: string; status?: number; error?: { message?: string } };
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: apiError.message || 'Failed to process chat request',
        details: apiError.error?.message || undefined
      }),
      {
        status: apiError.status || 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
