import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { createKommoLead, determinePlantel } from '../../../lib/kommo';

// Configuración de Supabase
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);


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
    const plantel = determinePlantel(inscripcion);
    console.log('🏫 Plantel determinado:', plantel);

    // 3. Crear lead usando la misma función del sistema actual
    console.log('📋 Creando lead en Kommo...');
    const leadId = await createKommoLead({
      name: inscripcion.nombre_padre || inscripcion.nombre_madre || inscripcion.nombre_aspirante,
      phone: inscripcion.telefono || '',
      email: inscripcion.email,
      plantel: plantel,
      nivelAcademico: inscripcion.nivel_academico,
      gradoEscolar: inscripcion.grado_escolar,
      nombreAspirante: inscripcion.nombre_aspirante
    });
    
    console.log('✅ Lead creado exitosamente en Kommo');
    console.log('🆔 ID del nuevo lead:', leadId);

    return NextResponse.json({
      success: true,
      message: 'Lead restaurado exitosamente',
      data: {
        leadId,
        nombre: inscripcion.nombre_aspirante,
        nivel: inscripcion.nivel_academico,
        grado: inscripcion.grado_escolar,
        email: inscripcion.email,
        telefono: inscripcion.telefono,
        plantel: plantel
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
