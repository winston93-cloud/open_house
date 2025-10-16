import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🔍 Obteniendo campos personalizados de Kommo...');
    
    const accessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjE1YThkY2UyZmU2MTZhNDIxNWM5YzFlM2RiNWY2ZTUxN2JlM2VmODMwZjA1OTA2NDgyNTkxM2Q0ZjRmMDdmZjRkNWNmNWE0ODUyMjZmZWQyIn0.eyJhdWQiOiIwYzgyY2Q1My1lMDU5LTQ4YjctOTQ3OC1lM2ZkNzFmNTFmMWYiLCJqdGkiOiIxNWE4ZGNlMmZlNjE2YTQyMTVjOWMxZTNkYjVmNmU1MTdiZTNlZjgzMGYwNTkwNjQ4MjU5MTNkNGY0ZjA3ZmY0ZDVjZjVhNDg1MjI2ZmVkMiIsImlhdCI6MTc2MDU1Njc2MSwibmJmIjoxNzYwNTU2NzYxLCJleHAiOjE3NjE4Njg4MDAsInN1YiI6Ijc4ODIzMDEiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6Mjk5MzI2MDcsImJhc2VfZG9tYWluIjoia29tbW8uY29tIiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJ1c2VyX2ZsYWdzIjowLCJoYXNoX3V1aWQiOiIzZWE0ZTUyOS0yYWQ4LTQyMGUtYWQzYy05NmUzOTAwODJhMzAiLCJhcGlfZG9tYWluIjoiYXBpLWcua29tbW8uY29tIn0.bfiUhdxV_EaAHB7B5WYM49LjkXcNStSZr48Jx3wZFFq00GYYmRUPFab0Ae5SX71v0pdgMgnqiKVfHZhDKfW3ykXJbmSAxcCTi2snoD4sBlvBur8G1pDKZ6YGuqqKboCAER2HbCcZFA5aFrgVHf5L1hl6o_YKCO4VkIFR8MwLv753b3jtdgOvHGc_scXT3JRHCtu4WAXWVw8w7Obo2wBtiefxx_zL4ZGRRSWj8WoIr9LYRc_yfEVm1HgGAJkyrkvWiFKZggRvyZkx1VB6_cKxu_A5751MscI8UlnpJvyzAbJ7HRsrAuRxnFDBjKo2cVrHo8TQ2hwVwSYTQtviSF9aYA';
    
    // Obtener campos personalizados de leads
    console.log('📋 Obteniendo campos de leads...');
    const leadsFieldsResponse = await fetch('https://winstonchurchill.kommo.com/api/v4/leads/custom_fields', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });
    
    if (leadsFieldsResponse.ok) {
      const leadsFieldsData = await leadsFieldsResponse.json();
      console.log('📋 Campos de leads:', JSON.stringify(leadsFieldsData, null, 2));
      
      // Obtener campos personalizados de contactos
      console.log('👤 Obteniendo campos de contactos...');
      const contactsFieldsResponse = await fetch('https://winstonchurchill.kommo.com/api/v4/contacts/custom_fields', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      });
      
      if (contactsFieldsResponse.ok) {
        const contactsFieldsData = await contactsFieldsResponse.json();
        console.log('👤 Campos de contactos:', JSON.stringify(contactsFieldsData, null, 2));
        
        return NextResponse.json({ 
          success: true,
          leadsFields: leadsFieldsData,
          contactsFields: contactsFieldsData
        });
      } else {
        const errorText = await contactsFieldsResponse.text();
        console.log('❌ Error en contactos:', errorText);
        return NextResponse.json({ error: errorText }, { status: contactsFieldsResponse.status });
      }
    } else {
      const errorText = await leadsFieldsResponse.text();
      console.log('❌ Error en leads:', errorText);
      return NextResponse.json({ error: errorText }, { status: leadsFieldsResponse.status });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: 'Error getting fields' }, { status: 500 });
  }
}
