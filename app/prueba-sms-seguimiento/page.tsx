'use client';

import { useState } from 'react';

export default function PruebaSMSSeguimiento() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const handleEnviar = async () => {
    if (!confirm('¿Estás seguro de enviar los 9 SMS de seguimiento (3 a cada número)?')) {
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/enviar-sms-seguimiento-prueba', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        setResult(data);
      } else {
        setError(data.error || 'Error al enviar SMS');
      }
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      maxWidth: '800px', 
      margin: '50px auto', 
      padding: '30px',
      fontFamily: 'Arial, sans-serif'
    }}>
      <h1 style={{ color: '#0088CC', marginBottom: '20px' }}>
        🧪 Prueba de SMS de Seguimiento
      </h1>

      <div style={{ 
        backgroundColor: '#f5f5f5', 
        padding: '20px', 
        borderRadius: '8px',
        marginBottom: '20px'
      }}>
        <h3>📱 Números que recibirán SMS:</h3>
        <ul>
          <li><strong>8333246904</strong> - Mario Escobedo</li>
          <li><strong>8331491483</strong> - Sistemas</li>
          <li><strong>8331078297</strong> - Test User</li>
        </ul>

        <h3>📨 SMS que se enviarán a cada uno:</h3>
        <ol>
          <li>SMS Seguimiento 24h</li>
          <li>SMS Seguimiento 72h (2 segundos después)</li>
          <li>SMS Seguimiento 5 días (2 segundos después)</li>
        </ol>

        <p style={{ 
          backgroundColor: '#fff3cd', 
          padding: '10px', 
          borderRadius: '5px',
          border: '1px solid #ffc107'
        }}>
          ⏱️ <strong>Tiempo estimado:</strong> ~6-7 minutos<br/>
          (3 minutos de espera entre cada destinatario)
        </p>
      </div>

      <button
        onClick={handleEnviar}
        disabled={loading}
        style={{
          backgroundColor: loading ? '#cccccc' : '#0088CC',
          color: 'white',
          padding: '15px 30px',
          fontSize: '18px',
          border: 'none',
          borderRadius: '8px',
          cursor: loading ? 'not-allowed' : 'pointer',
          width: '100%',
          fontWeight: 'bold'
        }}
      >
        {loading ? '⏳ Enviando SMS... (No cierres esta ventana)' : '📤 Enviar SMS de Seguimiento'}
      </button>

      {loading && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#e3f2fd',
          borderRadius: '8px',
          textAlign: 'center'
        }}>
          <p style={{ margin: 0, color: '#1976d2' }}>
            ⏳ <strong>Proceso en curso...</strong><br/>
            Esto puede tomar varios minutos. Por favor, no cierres esta ventana.
          </p>
        </div>
      )}

      {error && (
        <div style={{ 
          marginTop: '20px', 
          padding: '15px', 
          backgroundColor: '#ffebee',
          borderRadius: '8px',
          color: '#c62828'
        }}>
          <h3>❌ Error:</h3>
          <p>{error}</p>
        </div>
      )}

      {result && (
        <div style={{ 
          marginTop: '20px', 
          padding: '20px', 
          backgroundColor: result.success ? '#e8f5e9' : '#ffebee',
          borderRadius: '8px'
        }}>
          <h3 style={{ color: result.success ? '#2e7d32' : '#c62828' }}>
            {result.success ? '✅ SMS Enviados' : '❌ Error'}
          </h3>
          
          {result.detalles && result.detalles.map((dest: any, index: number) => (
            <div key={index} style={{ 
              marginBottom: '15px', 
              padding: '10px',
              backgroundColor: 'white',
              borderRadius: '5px'
            }}>
              <strong>📱 {dest.telefono} - {dest.nombre}</strong>
              <ul style={{ margin: '5px 0', paddingLeft: '20px' }}>
                <li>SMS 24h: {dest.sms24h ? '✅ Enviado' : '❌ Falló'}</li>
                <li>SMS 72h: {dest.sms72h ? '✅ Enviado' : '❌ Falló'}</li>
                <li>SMS 5 días: {dest.sms5d ? '✅ Enviado' : '❌ Falló'}</li>
              </ul>
            </div>
          ))}

          <p style={{ marginTop: '15px', fontSize: '14px', color: '#666' }}>
            📅 Enviado: {new Date().toLocaleString('es-MX')}
          </p>
        </div>
      )}
    </div>
  );
}

