import { NextRequest, NextResponse } from 'next/server';

// =============================================================================
// ENDPOINT: Crear lead en Kommo desde el chat del agente IA
// =============================================================================
// Crea un lead cuando el usuario envía su primer mensaje
// El agente de IA de Kommo responderá automáticamente al lead
// =============================================================================

export async function POST(request: NextRequest) {
  try {
    const { nombre, email, telefono, mensaje } = await request.json();

    console.log('🤖 [AGENTE-IA] Creando lead en Kommo...');
    console.log('   Datos:', { nombre, email, telefono, mensaje });

    // Validar datos mínimos
    if (!mensaje || mensaje.trim() === '') {
      return NextResponse.json(
        { error: 'El mensaje es obligatorio' },
        { status: 400 }
      );
    }

    // Importar funciones de Kommo
    const { getKommoAccessToken } = await import('../../../../lib/kommo');
    const accessToken = await getKommoAccessToken('open-house');

    if (!accessToken) {
      console.error('❌ [AGENTE-IA] No se pudo obtener token de Kommo');
      return NextResponse.json(
        { error: 'Error de autenticación con Kommo' },
        { status: 500 }
      );
    }

    // Crear contacto en Kommo
    const contactPayload: any = {
      name: nombre || 'Usuario del chat',
      custom_fields_values: []
    };

    // Agregar email si está disponible
    if (email && email.trim() !== '') {
      contactPayload.custom_fields_values.push({
        field_id: 557100, // Email
        values: [{ value: email, enum_id: 360080, enum_code: 'WORK' }]
      });
    }

    // Agregar teléfono si está disponible
    if (telefono && telefono.trim() !== '') {
      contactPayload.custom_fields_values.push({
        field_id: 557098, // Teléfono
        values: [{ value: telefono, enum_id: 360068, enum_code: 'WORK' }]
      });
    }

    console.log('📞 [AGENTE-IA] Creando contacto en Kommo...');
    const contactResponse = await fetch('https://winstonchurchill.kommo.com/api/v4/contacts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify([contactPayload]),
    });

    if (!contactResponse.ok) {
      const errorText = await contactResponse.text();
      console.error('❌ [AGENTE-IA] Error al crear contacto:', errorText);
      return NextResponse.json(
        { error: 'Error al crear contacto en Kommo' },
        { status: 500 }
      );
    }

    const contactData = await contactResponse.json();
    const contactId = contactData._embedded?.contacts?.[0]?.id;

    if (!contactId) {
      console.error('❌ [AGENTE-IA] No se obtuvo ID del contacto');
      return NextResponse.json(
        { error: 'Error al obtener ID del contacto' },
        { status: 500 }
      );
    }

    console.log('✅ [AGENTE-IA] Contacto creado:', contactId);

    // Crear lead en Kommo
    // Pipeline: EMBUDO DE VENTAS (5030645)
    // Status: PRUEBAS AGENTE IA (96751748)
    const leadPayload = {
      name: `Chat IA: ${nombre || 'Usuario'}`,
      price: 0,
      pipeline_id: 5030645,
      status_id: 96751748,
      _embedded: {
        contacts: [{ id: contactId }]
      }
    };

    console.log('📝 [AGENTE-IA] Creando lead en Kommo...');
    const leadResponse = await fetch('https://winstonchurchill.kommo.com/api/v4/leads', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify([leadPayload]),
    });

    if (!leadResponse.ok) {
      const errorText = await leadResponse.text();
      console.error('❌ [AGENTE-IA] Error al crear lead:', errorText);
      return NextResponse.json(
        { error: 'Error al crear lead en Kommo' },
        { status: 500 }
      );
    }

    const leadData = await leadResponse.json();
    const leadId = leadData._embedded?.leads?.[0]?.id;

    if (!leadId) {
      console.error('❌ [AGENTE-IA] No se obtuvo ID del lead');
      return NextResponse.json(
        { error: 'Error al obtener ID del lead' },
        { status: 500 }
      );
    }

    console.log('✅ [AGENTE-IA] Lead creado:', leadId);

    // Agregar nota con el mensaje inicial y datos del usuario
    let noteText = `💬 Mensaje inicial del chat:\n\n"${mensaje}"\n\n📱 Fuente: Chat Agente IA`;
    
    if (email || telefono) {
      noteText += '\n\n📋 Datos de contacto:';
      if (email) noteText += `\n• Email: ${email}`;
      if (telefono) noteText += `\n• Teléfono: ${telefono}`;
    }
    
    const notePayload = {
      entity_id: leadId,
      note_type: 'common',
      params: {
        text: noteText
      }
    };

    console.log('📋 [AGENTE-IA] Agregando nota al lead...');
    await fetch(`https://winstonchurchill.kommo.com/api/v4/leads/${leadId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify([notePayload]),
    });

    // Enviar mensaje al chat de Kommo para activar el agente de IA
    console.log('💬 [AGENTE-IA] Enviando mensaje al chat de Kommo...');
    const chatMessagePayload = {
      entity_id: leadId,
      note_type: 'common_message_from',
      params: {
        text: mensaje
      }
    };

    await fetch(`https://winstonchurchill.kommo.com/api/v4/leads/${leadId}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify([chatMessagePayload]),
    });

    // Agregar etiqueta "Prueba Agente de IA"
    console.log('🏷️ [AGENTE-IA] Agregando etiqueta al lead...');
    const tagPayload = {
      _embedded: {
        tags: [
          { name: 'Prueba Agente de IA' }
        ]
      }
    };

    await fetch(`https://winstonchurchill.kommo.com/api/v4/leads/${leadId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
      body: JSON.stringify(tagPayload),
    });

    console.log('✅ [AGENTE-IA] Lead creado exitosamente con etiqueta');

    return NextResponse.json({
      success: true,
      leadId,
      contactId,
      message: 'Lead creado exitosamente. El agente de IA responderá pronto.'
    });

  } catch (error) {
    console.error('❌ [AGENTE-IA] Error:', error);
    return NextResponse.json(
      {
        error: 'Error al procesar la solicitud',
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}

