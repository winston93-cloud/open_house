import { NextRequest, NextResponse } from 'next/server';
import { getInsforgeAdmin } from '../../../lib/insforge-admin';

export async function GET(request: NextRequest) {
  const db = getInsforgeAdmin().database;
  try {
    // Obtener los últimos 5 registros de sesiones ordenados por fecha de creación
    const { data: sesiones, error } = await db
      .from('sesiones')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(5);

    if (error) {
      console.error('Error al obtener sesiones:', error);
      return NextResponse.json(
        { error: 'Error al obtener registros de sesiones', details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      count: sesiones?.length || 0,
      sesiones: sesiones || [],
      message: sesiones && sesiones.length > 0 
        ? `Se encontraron ${sesiones.length} registro(s) reciente(s)` 
        : 'No hay registros recientes de sesiones'
    });

  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        error: 'Error interno del servidor', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}
