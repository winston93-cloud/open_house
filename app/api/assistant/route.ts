import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';
import { ASSISTANT_CONTEXT, ASSISTANT_INSTRUCTIONS } from '../../../lib/assistant-context';

// Inicializar cliente de Anthropic
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY || '',
});

export async function POST(request: NextRequest) {
  try {
    // Verificar que exista la API key
    if (!process.env.ANTHROPIC_API_KEY) {
      return NextResponse.json(
        { error: 'API key de Anthropic no configurada' },
        { status: 500 }
      );
    }

    // Obtener datos del request
    const body = await request.json();
    const { message, conversationHistory = [] } = body;

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'Mensaje inválido' },
        { status: 400 }
      );
    }

    // Construir el historial de mensajes para Claude
    const messages: Array<{ role: 'user' | 'assistant'; content: string }> = [];

    // Añadir historial de conversación previa (si existe)
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      conversationHistory.forEach((msg: any) => {
        if (msg.role === 'user' || msg.role === 'assistant') {
          messages.push({
            role: msg.role,
            content: msg.content
          });
        }
      });
    }

    // Añadir el mensaje actual del usuario
    messages.push({
      role: 'user',
      content: message
    });

    console.log('🤖 Enviando consulta a Claude API...');
    console.log(`📝 Mensaje del usuario: ${message.substring(0, 100)}...`);

    // Llamar a la API de Claude con streaming
    const stream = await anthropic.messages.create({
      model: 'claude-3-5-sonnet-20241022',
      max_tokens: 1024,
      system: `${ASSISTANT_INSTRUCTIONS}\n\n## CONTEXTO DEL PROYECTO:\n${ASSISTANT_CONTEXT}`,
      messages: messages,
      stream: true,
    });

    // Crear un ReadableStream para enviar la respuesta en tiempo real
    const encoder = new TextEncoder();
    const readableStream = new ReadableStream({
      async start(controller) {
        try {
          for await (const event of stream) {
            if (event.type === 'content_block_delta') {
              if (event.delta.type === 'text_delta') {
                const text = event.delta.text;
                controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text })}\n\n`));
              }
            } else if (event.type === 'message_stop') {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
              controller.close();
            }
          }
        } catch (error) {
          console.error('❌ Error en el stream:', error);
          controller.error(error);
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

  } catch (error) {
    console.error('❌ Error en /api/assistant:', error);
    
    return NextResponse.json(
      { 
        error: 'Error al procesar la consulta',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Endpoint GET para verificar el estado del servicio
export async function GET(request: NextRequest) {
  return NextResponse.json({
    status: 'ok',
    service: 'AI Assistant API',
    model: 'claude-3-5-sonnet-20241022',
    ready: !!process.env.ANTHROPIC_API_KEY
  });
}

