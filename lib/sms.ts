// =============================================================================
// UTILIDAD: Función para enviar SMS via SMS Mobile API
// =============================================================================

/** SMS de confirmación al registrarse (Open House / Sesiones). Hoy solo se envía correo. */
export const SMS_CONFIRMACION_ACTIVO = false;

export async function sendSMS(phone: string, message: string) {
  const SMS_GATEWAY_URL = process.env.SMS_GATEWAY_URL;
  const SMS_GATEWAY_TOKEN = process.env.SMS_GATEWAY_TOKEN;

  if (!SMS_GATEWAY_URL || !SMS_GATEWAY_TOKEN) {
    console.error('❌ SMS Mobile API no configurado');
    return { success: false, error: 'SMS Mobile API no configurado' };
  }

  try {
    // Formatear número - SMS Mobile API necesita formato: 528331234567 (52 + 10 dígitos)
    let formattedPhone = phone.toString().trim();
    
    // Remover espacios, guiones, paréntesis
    formattedPhone = formattedPhone.replace(/[\s\-\(\)]/g, '');
    
    // Remover el + si existe
    if (formattedPhone.startsWith('+')) {
      formattedPhone = formattedPhone.substring(1);
    }
    
    // Si NO empieza con 52, agregarlo
    if (!formattedPhone.startsWith('52')) {
      formattedPhone = '52' + formattedPhone;
    }

    console.log('📤 Enviando SMS via Mobile API a:', formattedPhone);

    // Construir URL con query parameters para SMS Mobile API (método GET)
    const smsUrl = `${SMS_GATEWAY_URL}?recipients=${encodeURIComponent(formattedPhone)}&message=${encodeURIComponent(message)}&apikey=${SMS_GATEWAY_TOKEN}`;
    
    console.log('🔗 URL construida:', smsUrl.replace(SMS_GATEWAY_TOKEN, '***TOKEN***'));

    // Enviar SMS usando SMS Mobile API (método GET)
    const smsResponse = await fetch(smsUrl, {
      method: 'GET',
    });

    const responseData = await smsResponse.json();

    console.log('📥 Respuesta de SMS Mobile API:', responseData);

    // SMS Mobile API devuelve { result: { error, sent, id } }
    if (responseData.result && responseData.result.error !== 0) {
      console.error('❌ Error de SMS Mobile API:', responseData);
      return { 
        success: false, 
        error: 'SMS Mobile API respondió con error',
        details: responseData 
      };
    }

    console.log('✅ SMS enviado exitosamente via Mobile API:', {
      to: formattedPhone,
      id: responseData.result?.id,
    });

    return { 
      success: true, 
      messageId: responseData.result?.id,
      to: formattedPhone 
    };
  } catch (error) {
    console.error('❌ Error enviando SMS:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Error desconocido' 
    };
  }
}

