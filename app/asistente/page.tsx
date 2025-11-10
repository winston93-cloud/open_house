'use client';

import { useState, useRef, useEffect } from 'react';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AsistenteIA() {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: '¡Hola! 👋 Soy el asistente virtual del Instituto Tampico. Estoy aquí para ayudarte con cualquier duda sobre nuestros Open House, Sesiones Informativas, o el proceso de inscripción. ¿En qué puedo ayudarte hoy?',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [password, setPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-scroll al último mensaje
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Ajustar altura del textarea automáticamente
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [inputMessage]);

  // Verificar autenticación
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (password === 'winston2025') {
      setAuthenticated(true);
    } else {
      alert('Contraseña incorrecta');
    }
  };

  // Enviar mensaje
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputMessage.trim() || isLoading) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');

    // Agregar mensaje del usuario
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Preparar historial de conversación para enviar a la API
      const conversationHistory = messages.map(msg => ({
        role: msg.role,
        content: msg.content
      }));

      // Llamar a la API con streaming
      const response = await fetch('/api/assistant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationHistory
        })
      });

      if (!response.ok) {
        throw new Error('Error en la respuesta del servidor');
      }

      // Crear mensaje del asistente (se irá actualizando con el stream)
      const assistantMessage: Message = {
        role: 'assistant',
        content: '',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Leer el stream
      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let fullText = '';
        
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

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
                  fullText += parsed.text;
                  
                  // Actualizar el mensaje del asistente en tiempo real
                  setMessages(prev => {
                    const updated = [...prev];
                    updated[updated.length - 1] = {
                      ...updated[updated.length - 1],
                      content: fullText
                    };
                    return updated;
                  });
                }
              } catch (e) {
                // Ignorar errores de parsing de chunks individuales
              }
            }
          }
        }
      }

    } catch (error) {
      console.error('Error:', error);
      
      // Agregar mensaje de error
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Lo siento, ocurrió un error al procesar tu mensaje. Por favor, intenta de nuevo o contacta al equipo por WhatsApp al 833-437-8743. 😊',
        timestamp: new Date()
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // Manejar Enter para enviar (Shift+Enter para nueva línea)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e as any);
    }
  };

  // Pantalla de login
  if (!authenticated) {
    return (
      <div style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
      }}>
        <div style={{
          background: 'white',
          borderRadius: '20px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
          padding: '3rem',
          maxWidth: '420px',
          width: '100%'
        }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '80px',
              height: '80px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem',
              fontSize: '2.5rem'
            }}>
              🤖
            </div>
            <h1 style={{
              fontSize: '1.875rem',
              fontWeight: 'bold',
              color: '#1a202c',
              marginBottom: '0.5rem'
            }}>
              Asistente Virtual
            </h1>
            <p style={{ color: '#718096', fontSize: '1rem' }}>
              Instituto Tampico
            </p>
          </div>
          
          <form onSubmit={handleLogin}>
            <div style={{ marginBottom: '1.5rem' }}>
              <label style={{
                display: 'block',
                fontSize: '0.875rem',
                fontWeight: '500',
                color: '#4a5568',
                marginBottom: '0.5rem'
              }}>
                Contraseña de acceso
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '0.75rem 1rem',
                  border: '2px solid #e2e8f0',
                  borderRadius: '10px',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'all 0.2s',
                  boxSizing: 'border-box'
                }}
                onFocus={(e) => e.target.style.borderColor = '#667eea'}
                onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
                placeholder="Ingresa la contraseña"
                required
              />
            </div>
            
            <button
              type="submit"
              style={{
                width: '100%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                padding: '0.875rem',
                borderRadius: '10px',
                fontSize: '1rem',
                fontWeight: '600',
                border: 'none',
                cursor: 'pointer',
                transition: 'transform 0.2s',
                boxShadow: '0 4px 12px rgba(102, 126, 234, 0.4)'
              }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              Ingresar
            </button>
          </form>

          <p style={{
            fontSize: '0.875rem',
            color: '#a0aec0',
            textAlign: 'center',
            marginTop: '1.5rem'
          }}>
            Solo personal autorizado puede acceder
          </p>
        </div>
      </div>
    );
  }

  // Pantalla principal del chat
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif'
    }}>
      {/* Header */}
      <div style={{
        background: 'rgba(255, 255, 255, 0.98)',
        borderBottom: '1px solid rgba(0,0,0,0.1)',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
      }}>
        <div style={{
          maxWidth: '1000px',
          margin: '0 auto',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{
              width: '48px',
              height: '48px',
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem'
            }}>
              🤖
            </div>
            <div>
              <h1 style={{
                fontSize: '1.25rem',
                fontWeight: 'bold',
                color: '#1a202c',
                margin: 0
              }}>
                Asistente Virtual
              </h1>
              <p style={{
                fontSize: '0.875rem',
                color: '#718096',
                margin: 0
              }}>
                Instituto Tampico
              </p>
            </div>
          </div>
          
          <a
            href="/"
            style={{
              color: '#718096',
              textDecoration: 'none',
              fontSize: '1.5rem',
              padding: '0.5rem',
              borderRadius: '8px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#f7fafc';
              e.currentTarget.style.color = '#1a202c';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'transparent';
              e.currentTarget.style.color = '#718096';
            }}
          >
            ✕
          </a>
        </div>
      </div>

      {/* Chat Container */}
      <div style={{
        maxWidth: '1000px',
        margin: '0 auto',
        padding: '1.5rem',
        height: 'calc(100vh - 88px)',
        display: 'flex',
        flexDirection: 'column'
      }}>
        
        {/* Messages Area */}
        <div style={{
          flex: 1,
          overflowY: 'auto',
          marginBottom: '1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1rem'
        }}>
          {messages.map((message, index) => (
            <div
              key={index}
              style={{
                display: 'flex',
                justifyContent: message.role === 'user' ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                maxWidth: '75%',
                borderRadius: '18px',
                padding: '0.875rem 1.125rem',
                background: message.role === 'user' 
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : 'rgba(255, 255, 255, 0.98)',
                color: message.role === 'user' ? 'white' : '#1a202c',
                boxShadow: message.role === 'user'
                  ? '0 4px 12px rgba(102, 126, 234, 0.4)'
                  : '0 2px 8px rgba(0,0,0,0.1)',
                border: message.role === 'user' ? 'none' : '1px solid rgba(0,0,0,0.05)'
              }}>
                <p style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  margin: 0,
                  lineHeight: '1.5'
                }}>
                  {message.content}
                </p>
                <p style={{
                  fontSize: '0.75rem',
                  marginTop: '0.5rem',
                  marginBottom: 0,
                  opacity: 0.7
                }}>
                  {message.timestamp.toLocaleTimeString('es-MX', { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </p>
              </div>
            </div>
          ))}
          
          {isLoading && (
            <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
              <div style={{
                background: 'rgba(255, 255, 255, 0.98)',
                borderRadius: '18px',
                padding: '0.875rem 1.125rem',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
                border: '1px solid rgba(0,0,0,0.05)'
              }}>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#a0aec0',
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite ease-in-out'
                  }}></div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#a0aec0',
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite ease-in-out 0.2s'
                  }}></div>
                  <div style={{
                    width: '8px',
                    height: '8px',
                    background: '#a0aec0',
                    borderRadius: '50%',
                    animation: 'bounce 1.4s infinite ease-in-out 0.4s'
                  }}></div>
                </div>
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.98)',
          borderRadius: '20px',
          boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
          border: '1px solid rgba(0,0,0,0.05)',
          padding: '1rem'
        }}>
          <form onSubmit={handleSubmit} style={{
            display: 'flex',
            alignItems: 'flex-end',
            gap: '0.75rem'
          }}>
            <textarea
              ref={textareaRef}
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Escribe tu pregunta aquí..."
              disabled={isLoading}
              style={{
                flex: 1,
                resize: 'none',
                maxHeight: '120px',
                padding: '0.75rem 1rem',
                border: '2px solid #e2e8f0',
                borderRadius: '12px',
                fontSize: '1rem',
                outline: 'none',
                transition: 'all 0.2s',
                fontFamily: 'inherit',
                boxSizing: 'border-box'
              }}
              onFocus={(e) => e.target.style.borderColor = '#667eea'}
              onBlur={(e) => e.target.style.borderColor = '#e2e8f0'}
              rows={1}
            />
            
            <button
              type="submit"
              disabled={!inputMessage.trim() || isLoading}
              style={{
                padding: '0.75rem 1.5rem',
                borderRadius: '12px',
                fontWeight: '600',
                border: 'none',
                cursor: inputMessage.trim() && !isLoading ? 'pointer' : 'not-allowed',
                background: inputMessage.trim() && !isLoading
                  ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
                  : '#e2e8f0',
                color: inputMessage.trim() && !isLoading ? 'white' : '#a0aec0',
                boxShadow: inputMessage.trim() && !isLoading
                  ? '0 4px 12px rgba(102, 126, 234, 0.4)'
                  : 'none',
                transition: 'all 0.2s',
                fontSize: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
              onMouseEnter={(e) => {
                if (inputMessage.trim() && !isLoading) {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = '0 6px 16px rgba(102, 126, 234, 0.5)';
                }
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = inputMessage.trim() && !isLoading
                  ? '0 4px 12px rgba(102, 126, 234, 0.4)'
                  : 'none';
              }}
            >
              {isLoading ? '⏳' : '🚀'}
            </button>
          </form>
          
          <p style={{
            fontSize: '0.75rem',
            color: '#a0aec0',
            textAlign: 'center',
            marginTop: '0.75rem',
            marginBottom: 0
          }}>
            Presiona Enter para enviar • Shift + Enter para nueva línea
          </p>
        </div>

      </div>

      <style jsx>{`
        @keyframes bounce {
          0%, 80%, 100% {
            transform: scale(0);
          }
          40% {
            transform: scale(1);
          }
        }
      `}</style>
    </div>
  );
}

