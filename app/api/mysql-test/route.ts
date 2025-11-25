import { NextResponse } from 'next/server';
import pool from '@/lib/mysql';

export async function GET() {
  try {
    // Probar conexión
    const connection = await pool.getConnection();
    
    // Ver todas las tablas
    const [tables] = await connection.query('SHOW TABLES');
    
    // Ver estructura de cada tabla
    const tableStructures: any = {};
    
    for (const tableRow of tables as any[]) {
      const tableName = Object.values(tableRow)[0] as string;
      const [columns] = await connection.query(`DESCRIBE ${tableName}`);
      
      // Contar registros
      const [countResult] = await connection.query(`SELECT COUNT(*) as count FROM ${tableName}`) as any;
      const count = countResult[0].count;
      
      tableStructures[tableName] = {
        columns,
        count
      };
    }
    
    connection.release();
    
    return NextResponse.json({
      success: true,
      database: 'winston_general',
      tables: tableStructures
    });
    
  } catch (error: any) {
    console.error('Error conectando a MySQL:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}

