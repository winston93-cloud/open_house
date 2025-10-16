import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 TEST ULTRA SIMPLE: Solo name...');
    
    const accessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjE1YThkY2UyZmU2MTZhNDIxNWM5YzFlM2RiNWY2ZTUxN2JlM2VmODMwZjA1OTA2NDgyNTkxM2Q0ZjRmMDdmZjRkNWNmNWE0ODUyMjZmZWQyIn0.eyJhdWQiOiIwYzgyY2Q1My1lMDU5LTQ4YjctOTQ3OC1lM2ZkNzFmNTFmMWYiLCJqdGkiOiIxNWE4ZGNlMmZlNjE2YTQyMTVjOWMxZTNkYjVmNmU1MTdiZTNlZjgzMGYwNTkwNjQ4MjU5MTNkNGY0ZjA3ZmY0ZDVjZjVhNDg1MjI2ZmVkMiIsImlhdCI6MTc2MDU1Njc2MSwibmJmIjoxNzYwNTU2NzYxLCJleHAiOjE3NjE4Njg4MDAsInN1YiI6Ijc4ODIzMDEiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6Mjk5MzI2MDcsImJhc2VfZG9tYWluIjoia29tbW8uY29tIiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJ1c2VyX2ZsYWdzIjowLCJoYXNoX3V1aWQiOiIzZWE0ZTUyOS0yYWQ4LTQyMGUtYWQzYy05NmUzOTAwODJhMzAiLCJhcGlfZG9tYWluIjoiYXBpLWcua29tbW8uY29tIn0.bfiUhdxV_EaAHB7B5WYM49LjkXcNStSZr48Jx3wZFFq00GYYmRUPFab0Ae5SX71v0pdgMgnqiKVfHZhDKfW3ykXJbmSAxcCTi2snoD4sBlvBur8G1pDKZ6YGuqqKboCAER2HbCcZFA5aFrgVHf5L1hl6o_YKCO4VkIFR8MwLv753b3jtdgOvHGc_scXT3JRHCtu4WAXWVw8w7Obo2wBtiefxx_zL4ZGRRSWj8WoIr9LYRc_yfEVm1HgGAJkyrkvWiFKZggRvyZkx1VB6_cKxu_A5751MscI8UlnpJvyzAbJ7HRsrAuRxnFDBjKo2cVrHo8TQ2hwVwSYTQtviSF9aYA';
    
    // Payload ULTRA simple - solo name
    const payload = {
      name: ["ULTRA SIMPLE TEST"]
    };
    
    console.log('📤 Payload ULTRA simple:', JSON.stringify(payload, null, 2));
    console.log('🕐 Timestamp:', new Date().toISOString());
    
    const response = await fetch('https://winstonchurchill.kommo.com/api/v4/leads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });
    
    console.log('📥 Status:', response.status);
    
    if (response.ok) {
      const data = await response.json();
      console.log('📥 Respuesta completa:', JSON.stringify(data, null, 2));
      
      if (data._embedded && data._embedded.leads) {
        console.log(`📊 RESULTADO: Se crearon ${data._embedded.leads.length} leads`);
        data._embedded.leads.forEach((lead: any, index: number) => {
          console.log(`📋 Lead ${index + 1}: ID=${lead.id}, Name="${lead.name}"`);
        });
        
        return NextResponse.json({ 
          success: true, 
          leadsCreated: data._embedded.leads.length,
          leadIds: data._embedded.leads.map((lead: any) => lead.id),
          leadNames: data._embedded.leads.map((lead: any) => lead.name)
        });
      }
    } else {
      const errorText = await response.text();
      console.log('❌ Error:', errorText);
      return NextResponse.json({ error: errorText }, { status: response.status });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: 'Error creating lead' }, { status: 500 });
  }
}
