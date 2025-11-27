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
    } catch (streamError: any) {
      // Handle errors that occur before streaming starts
      console.error('Failed to create stream:', streamError);
      return new Response(
        JSON.stringify({
          error: streamError.message || 'Failed to start chat stream',
          details: streamError.error?.error?.message || streamError.error?.message || undefined
        }),
        {
          status: streamError.status || 500,
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
            else if (chunk.type === 'content_block_delta' && chunk.delta.type === 'thinking_delta') {
              const thinking = chunk.delta.thinking;
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ thinking })}\n\n`));
            }
            // Handle content block start to differentiate thinking vs text blocks
            else if (chunk.type === 'content_block_start') {
              if (chunk.content_block?.type === 'thinking') {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ thinkingStart: true })}\n\n`));
              } else if (chunk.content_block?.type === 'text') {
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ textStart: true })}\n\n`));
              }
            }
          }
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error: any) {
          console.error('Stream error:', error);
          // Send error as SSE event before closing
          const errorMessage = error.error?.error?.message || error.message || 'Stream error occurred';
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
  } catch (error: any) {
    console.error('Chat API error:', error);
    return new Response(
      JSON.stringify({
        error: error.message || 'Failed to process chat request',
        details: error.error?.message || undefined
      }),
      {
        status: error.status || 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}
