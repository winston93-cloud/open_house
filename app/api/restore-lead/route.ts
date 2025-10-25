import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Configuración de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

// Configuración de Kommo
const KOMMO_CONFIG = {
  subdomain: 'winstonchurchill',
  accessToken: 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImQ2OWZhMDA2OWIwOTNjMGFhNmZmMjQ2MTJkZjQ3MjI3Y2ViNTM3MGUyODAxODg1MzBmZDM1MDE1MDU0NDA2ZGE2OTdlNDIxMDJhODZkZDI0In0.eyJhdWQiOiJmZDM3OGNiZi1lN2EwLTQ5NGEtYmI5OC0zMDNlMTVjNjIxYWEiLCJqdGkiOiJkNjlmYTAwNjliMDkzYzBhYTZmZjI0NjEyZGY0NzIyN2NlYjUzNzBlMjgwMTg4NTMwZmQzNTAxNTA1NDQwNmRhNjk3ZTQyMTAyYTg2ZGQyNCIsImlhdCI6MTc2MTA1NTQzOCwibmJmIjoxNzYxMDU1NDM4LCJleHAiOjE3NjcxMzkyMDAsInN1YiI6Ijc4ODIzMDEiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6Mjk5MzI2MDcsImJhc2VfZG9tYWluIjoia29tbW8uY29tIiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJoYXNoX3V1aWQiOiJlNmQxYmViMy0yMGNlLTQ0YWQtODQ0MC1lYTlhZDhlYjhhYWUiLCJ1c2VyX2ZsYWdzIjowLCJhcGlfZG9tYWluIjoiYXBpLWcua29tbW8uY29tIn0.ccmhIk5mzRS0KyWhoagHROXdXX0fJHXTMKa43JNh9d-S0-snBpMae6WJz2IvX2k1j1tk0oKYIqjus2UviPRsHunuFO1SDmO6h1T1m3bTeNEXcNytreytSYlXgYws4rYxLYUGF5k9DMeFyoN92lXc_r6H97GDa5hvpmG1MCi8cVTMiumRkHtzmzgvqD9OAmUxLAzE3UQy846kwCn6ctJ_nSGSIfr_IKR4fRK1DBPkDVUhpTK5Mr1Hl6LAYj3dMotcjOl13ZfS7G3XsDfLFVW29zJm_SsYg_kTwYBuVxO2lyyFKG6ePZdxrVFGlcH_ppGwpulGOSj6Ua-AH8NQ-kIlBA',
  pipelineId: '5030645',
  statusId: '56296556',
  responsibleUserId: '7882301'
};

export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json();

    if (!id) {
      return NextResponse.json(
        { error: 'ID es requerido' },
        { status: 400 }
      );
    }

    console.log('🔍 Buscando inscripción con ID:', id);
    
    // 1. Obtener datos de la inscripción
    const { data: inscripcion, error: dbError } = await supabase
      .from('inscripciones')
      .select('*')
      .eq('id', id)
      .single();

    if (dbError || !inscripcion) {
      console.error('❌ Error al obtener inscripción:', dbError);
      return NextResponse.json(
        { error: 'Inscripción no encontrada' },
        { status: 404 }
      );
    }

    console.log('✅ Inscripción encontrada:', inscripcion.nombre_aspirante);

    // 2. Determinar plantel basado en nivel académico
    const plantel = (inscripcion.nivel_academico === 'maternal' || inscripcion.nivel_academico === 'kinder') 
      ? 'educativo' 
      : 'winston';

    console.log('🏫 Plantel determinado:', plantel);

    // 3. Crear contacto primero
    console.log('👤 Paso 1: Creando contacto...');
    const contactUrl = `https://${KOMMO_CONFIG.subdomain}.kommo.com/api/v4/contacts`;
    
    const contactPayload = [
      {
        name: inscripcion.nombre_aspirante,
        custom_fields_values: [
          {
            field_id: 557100, // Email
            values: [{ value: inscripcion.correo, enum_code: "WORK" }]
          },
          {
            field_id: 557098, // Teléfono
            values: [
              { value: inscripcion.telefono, enum_id: 360072 } // Solo celular del papá (MOB)
            ]
          }
        ]
      }
    ];
    
    const contactResponse = await fetch(contactUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KOMMO_CONFIG.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactPayload)
    });
    
    if (!contactResponse.ok) {
      const errorText = await contactResponse.text();
      console.error('Error creating contact:', errorText);
      throw new Error(`Error creating contact: ${contactResponse.status}`);
    }
    
    const contactData = await contactResponse.json();
    console.log('📥 Respuesta del contacto:', JSON.stringify(contactData, null, 2));
    
    const contactId = contactData._embedded.contacts[0].id;
    console.log('✅ Contacto creado con ID:', contactId);

    // 4. Crear lead con contacto
    console.log('📋 Paso 2: Creando lead con contacto...');
    const leadUrl = `https://${KOMMO_CONFIG.subdomain}.kommo.com/api/v4/leads`;
    
    // Determinar etiqueta basada en plantel
    const tagName = plantel === 'winston' ? 'Open House Winston' : 'Open House Educativo';
    console.log(`🏷️ Etiqueta a incluir: ${tagName}`);

    const leadPayload = [
      {
        name: inscripcion.nombre_aspirante,
        price: 0,
        pipeline_id: parseInt(KOMMO_CONFIG.pipelineId),
        status_id: parseInt(KOMMO_CONFIG.statusId),
        responsible_user_id: parseInt(KOMMO_CONFIG.responsibleUserId),
        _embedded: {
          contacts: [{ id: contactId }],
          tags: [{ name: tagName }]
        }
      }
    ];

    const leadResponse = await fetch(leadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${KOMMO_CONFIG.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadPayload)
    });

    if (!leadResponse.ok) {
      const errorText = await leadResponse.text();
      console.error('Error creating lead:', errorText);
      throw new Error(`Error creating lead: ${leadResponse.status}`);
    }

    const leadData = await leadResponse.json();
    console.log('📥 Respuesta del lead:', JSON.stringify(leadData, null, 2));
    
    const leadId = leadData._embedded.leads[0].id;
    
    console.log('✅ Lead creado exitosamente en Kommo');
    console.log('🆔 ID del nuevo lead:', leadId);

    return NextResponse.json({
      success: true,
      message: 'Lead restaurado exitosamente',
      data: {
        leadId,
        contactId,
        nombre: inscripcion.nombre_aspirante,
        nivel: inscripcion.nivel_academico,
        grado: inscripcion.grado_escolar,
        email: inscripcion.correo,
        telefono: inscripcion.telefono,
        plantel: plantel,
        etiqueta: tagName
      }
    });

  } catch (error) {
    console.error('❌ Error al restaurar lead:', error);
    return NextResponse.json(
      { 
        error: 'Error al restaurar lead', 
        details: error instanceof Error ? error.message : 'Error desconocido'
      },
      { status: 500 }
    );
  }
}
