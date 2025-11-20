'use client';

import { useState } from 'react';
import './styles.css';

interface Message {
  id: string;
  text: string;
  sender: 'user' | 'bot';
  timestamp: Date;
}

export default function AgenteIAPage() {
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      text: '👋 ¡Hola! Soy tu asistente técnico virtual. ¿Qué problema de sistemas o tecnología puedo ayudarte a resolver hoy?',
      sender: 'bot',
      timestamp: new Date()
    }
  ]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leadCreated, setLeadCreated] = useState(false);
  const [showInfoForm, setShowInfoForm] = useState(false);
  
  const [userInfo, setUserInfo] = useState({
    nombre: '',
    email: '',
    telefono: ''
  });

  const handleSendMessage = async () => {
    if (!inputMessage.trim() && !showInfoForm) return;

    const messageText = inputMessage.trim();
    
    if (!leadCreated && !showInfoForm) {
      setShowInfoForm(true);
      return;
    }

    setIsLoading(true);

    try {
      const userMessage: Message = {
        id: Date.now().toString(),
        text: messageText,
        sender: 'user',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, userMessage]);
      setInputMessage('');
      setShowInfoForm(false);

      if (!leadCreated) {
        const response = await fetch('/api/agente-ia/crear-lead', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            nombre: userInfo.nombre || 'Usuario del chat',
            email: userInfo.email,
            telefono: userInfo.telefono,
            mensaje: messageText
          })
        });

        if (!response.ok) {
          throw new Error('Error al crear el lead');
        }

        const data = await response.json();
        console.log('✅ Lead creado:', data);
        setLeadCreated(true);

        const botMessage: Message = {
          id: (Date.now() + 1).toString(),
          text: '✅ ¡Gracias! Tu ticket de soporte ha sido creado. Un técnico especializado te responderá muy pronto por el canal que prefieras.\n\n📱 Para soporte urgente, también puedes contactarnos directamente.',
          sender: 'bot',
          timestamp: new Date()
        };
        setMessages(prev => [...prev, botMessage]);
      }

    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        text: '❌ Lo siento, hubo un error al crear tu ticket de soporte. Por favor intenta de nuevo o contáctanos directamente.',
        sender: 'bot',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="agente-ia-container">
      <div className="agente-ia-content">
        {/* Header */}
        <div className="agente-ia-header">
          <h1 className="agente-ia-title">💻 Sistemas y Soporte Técnico 🛠️</h1>
          <p className="agente-ia-subtitle">Tu asistente de tecnología e infraestructura</p>
        </div>

        {/* Tarjetas de características */}
        <div className="agente-ia-features">
          <div className="agente-ia-feature-card">
            <div className="agente-ia-feature-icon">🔧</div>
            <h3 className="agente-ia-feature-title">Soporte Técnico</h3>
            <p className="agente-ia-feature-text">
              Asistencia inmediata para tus problemas tecnológicos
            </p>
          </div>

          <div className="agente-ia-feature-card">
            <div className="agente-ia-feature-icon">💾</div>
            <h3 className="agente-ia-feature-title">Infraestructura TI</h3>
            <p className="agente-ia-feature-text">
              Soporte en servidores, redes y sistemas empresariales
            </p>
          </div>

          <div className="agente-ia-feature-card">
            <div className="agente-ia-feature-icon">🤖</div>
            <h3 className="agente-ia-feature-title">Asistente IA</h3>
            <p className="agente-ia-feature-text">
              Inteligencia artificial para resolver tus dudas técnicas
            </p>
          </div>
        </div>

        {/* Instrucciones */}
        <div className="agente-ia-instructions">
          <h2 className="agente-ia-instructions-title">💬 ¿Cómo funciona?</h2>
          <ul className="agente-ia-instructions-list">
            <li className="agente-ia-instruction-item">
              <span className="agente-ia-instruction-icon">✅</span>
              <span className="agente-ia-instruction-text">
                Haz clic en el botón de chat del lado derecho
              </span>
            </li>
            <li className="agente-ia-instruction-item">
              <span className="agente-ia-instruction-icon">✅</span>
              <span className="agente-ia-instruction-text">
                Describe tu problema técnico o consulta de sistemas
              </span>
            </li>
            <li className="agente-ia-instruction-item">
              <span className="agente-ia-instruction-icon">✅</span>
              <span className="agente-ia-instruction-text">
                Nuestro agente de IA te ayudará con soluciones inmediatas
              </span>
            </li>
            <li className="agente-ia-instruction-item">
              <span className="agente-ia-instruction-icon">✅</span>
              <span className="agente-ia-instruction-text">
                Abre tickets, solicita soporte especializado y más
              </span>
            </li>
          </ul>
        </div>
      </div>

      {/* Botón flotante de chat */}
      {!isChatOpen && (
        <button
          onClick={() => setIsChatOpen(true)}
          className="agente-ia-chat-button"
          aria-label="Abrir chat"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="agente-ia-chat-icon"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
            />
          </svg>
          <span className="agente-ia-notification-dot"></span>
          <span className="agente-ia-chat-tooltip">💬 Chatea con nosotros</span>
        </button>
      )}

      {/* Widget de chat */}
      {isChatOpen && (
        <div className="agente-ia-chat-widget">
          {/* Header del chat */}
          <div className="agente-ia-chat-header">
            <div className="agente-ia-chat-header-info">
              <div className="agente-ia-chat-avatar">🤖</div>
              <div>
                <div className="agente-ia-chat-title">Soporte Técnico IA</div>
                <div className="agente-ia-chat-status">
                  <span className="agente-ia-status-dot"></span>
                  En línea
                </div>
              </div>
            </div>
            <button
              onClick={() => setIsChatOpen(false)}
              className="agente-ia-chat-close"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="agente-ia-chat-close-icon"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </button>
          </div>

          {/* Área de mensajes */}
          <div className="agente-ia-chat-messages">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`agente-ia-message ${
                  message.sender === 'user' ? 'agente-ia-message-user' : 'agente-ia-message-bot'
                }`}
              >
                <div className="agente-ia-message-bubble">
                  <p className="agente-ia-message-text">{message.text}</p>
                  <p className="agente-ia-message-time">
                    {message.timestamp.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="agente-ia-message agente-ia-message-bot">
                <div className="agente-ia-message-bubble">
                  <div className="agente-ia-typing">
                    <div className="agente-ia-typing-dot"></div>
                    <div className="agente-ia-typing-dot"></div>
                    <div className="agente-ia-typing-dot"></div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input del chat */}
          <div className="agente-ia-chat-input-container">
            {showInfoForm ? (
              <div className="agente-ia-info-form">
                <p className="agente-ia-info-title">
                  Para crear tu ticket de soporte, proporciona tus datos (opcional):
                </p>
                <input
                  type="text"
                  placeholder="Tu nombre"
                  value={userInfo.nombre}
                  onChange={(e) => setUserInfo({ ...userInfo, nombre: e.target.value })}
                  className="agente-ia-info-input"
                />
                <input
                  type="email"
                  placeholder="Tu email"
                  value={userInfo.email}
                  onChange={(e) => setUserInfo({ ...userInfo, email: e.target.value })}
                  className="agente-ia-info-input"
                />
                <input
                  type="tel"
                  placeholder="Tu teléfono"
                  value={userInfo.telefono}
                  onChange={(e) => setUserInfo({ ...userInfo, telefono: e.target.value })}
                  className="agente-ia-info-input"
                />
                <div className="agente-ia-info-buttons">
                  <button
                    onClick={handleSendMessage}
                    disabled={isLoading}
                    className="agente-ia-info-submit"
                  >
                    {isLoading ? 'Creando ticket...' : 'Crear ticket de soporte'}
                  </button>
                  <button
                    onClick={() => setShowInfoForm(false)}
                    className="agente-ia-info-skip"
                  >
                    Omitir
                  </button>
                </div>
              </div>
            ) : (
              <div className="agente-ia-chat-input-wrapper">
                <input
                  type="text"
                  placeholder="Escribe tu mensaje..."
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  disabled={isLoading}
                  className="agente-ia-chat-input"
                />
                <button
                  onClick={handleSendMessage}
                  disabled={isLoading || !inputMessage.trim()}
                  className="agente-ia-chat-send"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="agente-ia-chat-send-icon"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                    />
                  </svg>
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
