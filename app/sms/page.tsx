'use client';

import { useState } from 'react';

const ACCESS_PASSWORD = process.env.NEXT_PUBLIC_SMS_MODULE_PASSWORD ?? 'winston2025';

type Status =
  | { state: 'idle' }
  | { state: 'loading' }
  | { state: 'success'; message: string }
  | { state: 'error'; message: string };

export default function SmsSenderPage() {
  const [authPassword, setAuthPassword] = useState('');
  const [authenticated, setAuthenticated] = useState(false);
  const [phone, setPhone] = useState('');
  const [message, setMessage] = useState('');
  const [status, setStatus] = useState<Status>({ state: 'idle' });

  const handleLogin = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (authPassword.trim() === ACCESS_PASSWORD) {
      setAuthenticated(true);
      setAuthPassword('');
      return;
    }

    setStatus({ state: 'error', message: 'Contraseña incorrecta' });
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!phone.trim() || !message.trim()) {
      setStatus({ state: 'error', message: 'Ingresa número y mensaje' });
      return;
    }

    setStatus({ state: 'loading' });

    try {
      const response = await fetch('/api/sms/send', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          phone: phone.trim(),
          message: message.trim(),
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        setStatus({
          state: 'error',
          message:
            result.error ||
            'Error al enviar. Revisa la conexión con el teléfono gateway.',
        });
        return;
      }

      setStatus({
        state: 'success',
        message: 'SMS enviado correctamente desde el gateway 🎉',
      });
      setPhone('');
      setMessage('');
    } catch (error) {
      console.error('Error enviando SMS:', error);
      setStatus({
        state: 'error',
        message: 'Error inesperado al enviar el SMS',
      });
    }
  };

  if (!authenticated) {
    return (
      <div className="sms-container">
        <div className="card">
          <h1>Acceso al módulo SMS</h1>
          <p>Ingresa la contraseña para continuar.</p>
          <form onSubmit={handleLogin} className="form">
            <label>
              Contraseña
              <input
                type="password"
                value={authPassword}
                onChange={(event) => setAuthPassword(event.target.value)}
                placeholder="••••••••"
                autoFocus
                required
              />
            </label>
            <button type="submit">Ingresar</button>
          </form>
          {status.state === 'error' && (
            <div className="alert error">{status.message}</div>
          )}
        </div>
        <style jsx>{`
          .sms-container {
            min-height: 100vh;
            display: flex;
            align-items: center;
            justify-content: center;
            background: linear-gradient(135deg, #102544, #1d3f72);
            padding: 2rem;
          }
          .card {
            background: #ffffff;
            padding: 2.5rem;
            border-radius: 18px;
            max-width: 420px;
            width: 100%;
            box-shadow: 0 15px 45px rgba(16, 37, 68, 0.25);
            text-align: center;
          }
          h1 {
            margin: 0 0 0.75rem;
            font-size: 1.8rem;
            color: #102544;
          }
          p {
            margin: 0 0 1.5rem;
            color: #4b5a75;
          }
          .form {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          label {
            text-align: left;
            font-weight: 600;
            color: #273758;
          }
          input {
            width: 100%;
            margin-top: 0.4rem;
            padding: 0.85rem 1rem;
            border-radius: 12px;
            border: 1px solid #c8d5f1;
            font-size: 1rem;
            transition: border 0.2s, box-shadow 0.2s;
          }
          input:focus {
            outline: none;
            border-color: #2f6fe4;
            box-shadow: 0 0 0 4px rgba(47, 111, 228, 0.15);
          }
          button {
            margin-top: 0.5rem;
            padding: 0.9rem 1rem;
            background: #2f6fe4;
            color: #ffffff;
            font-weight: 600;
            border: none;
            border-radius: 12px;
            cursor: pointer;
            transition: background 0.2s, transform 0.2s;
          }
          button:hover {
            background: #255cd3;
            transform: translateY(-1px);
          }
          .alert {
            margin-top: 1rem;
            border-radius: 10px;
            padding: 0.85rem 1rem;
            font-weight: 600;
          }
          .alert.error {
            background: #ffe5e5;
            color: #a51919;
            border: 1px solid rgba(165, 25, 25, 0.3);
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="sms-container">
      <div className="card">
        <header>
          <h1>Enviar SMS</h1>
          <p>
            Los mensajes se envían desde tu teléfono Android configurado como
            gateway.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="form">
          <label>
            Número destino
            <input
              type="tel"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
              placeholder="+52 55 1234 5678"
              inputMode="tel"
              required
            />
          </label>

          <label>
            Mensaje
            <textarea
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Escribe el contenido del SMS..."
              rows={5}
              required
            />
          </label>

          <button type="submit" disabled={status.state === 'loading'}>
            {status.state === 'loading' ? 'Enviando…' : 'Enviar SMS'}
          </button>
        </form>

        {status.state === 'success' && (
          <div className="alert success">{status.message}</div>
        )}
        {status.state === 'error' && (
          <div className="alert error">{status.message}</div>
        )}

        <footer>
          <p>
            Asegúrate de que el teléfono esté en la misma red y con la app
            `SMS Mobile API` en modo <strong>ON</strong>.
          </p>
        </footer>
      </div>

      <style jsx>{`
        .sms-container {
          min-height: 100vh;
          background: linear-gradient(135deg, #102544, #1d3f72);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 2.5rem;
        }
        .card {
          background: #ffffff;
          padding: 2.8rem;
          border-radius: 24px;
          max-width: 640px;
          width: 100%;
          box-shadow: 0 18px 55px rgba(16, 37, 68, 0.35);
        }
        header h1 {
          margin: 0;
          font-size: 2rem;
          color: #0f2241;
        }
        header p {
          margin: 0.4rem 0 2rem;
          color: #506080;
        }
        .form {
          display: flex;
          flex-direction: column;
          gap: 1.4rem;
        }
        label {
          display: flex;
          flex-direction: column;
          font-weight: 600;
          color: #213358;
        }
        input,
        textarea {
          margin-top: 0.6rem;
          padding: 0.95rem 1rem;
          border-radius: 14px;
          border: 1px solid #c8d5f1;
          background: #f7f9fe;
          font-size: 1rem;
          resize: vertical;
          transition: border 0.2s, box-shadow 0.2s;
        }
        input:focus,
        textarea:focus {
          outline: none;
          border-color: #2f6fe4;
          box-shadow: 0 0 0 4px rgba(47, 111, 228, 0.15);
          background: #ffffff;
        }
        textarea {
          min-height: 140px;
        }
        button {
          align-self: flex-start;
          padding: 0.95rem 1.8rem;
          background: #2f6fe4;
          color: #ffffff;
          font-weight: 700;
          border: none;
          border-radius: 14px;
          cursor: pointer;
          transition: background 0.2s, transform 0.2s;
        }
        button:hover {
          background: #255cd3;
          transform: translateY(-1px);
        }
        button:disabled {
          background: #a5b7e0;
          cursor: wait;
          transform: none;
        }
        .alert {
          margin-top: 1.5rem;
          border-radius: 14px;
          padding: 1rem 1.2rem;
          font-weight: 600;
        }
        .alert.success {
          background: #e5f5ff;
          color: #1366b3;
          border: 1px solid rgba(19, 102, 179, 0.25);
        }
        .alert.error {
          background: #ffe5e5;
          color: #a51919;
          border: 1px solid rgba(165, 25, 25, 0.3);
        }
        footer {
          margin-top: 2rem;
          padding-top: 1.5rem;
          border-top: 1px solid #e4ecfb;
        }
        footer p {
          margin: 0;
          color: #6a7aa2;
          font-size: 0.95rem;
        }
        strong {
          color: #2f6fe4;
        }
        @media (max-width: 640px) {
          .card {
            padding: 2rem;
            border-radius: 18px;
          }
          header h1 {
            font-size: 1.7rem;
          }
        }
      `}</style>
    </div>
  );
}


