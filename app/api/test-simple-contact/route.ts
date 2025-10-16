import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log('🧪 TEST CONTACTO SIMPLE: Solo ID del contacto...');
    
    const accessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6IjE1YThkY2UyZmU2MTZhNDIxNWM5YzFlM2RiNWY2ZTUxN2JlM2VmODMwZjA1OTA2NDgyNTkxM2Q0ZjRmMDdmZjRkNWNmNWE0ODUyMjZmZWQyIn0.eyJhdWQiOiIwYzgyY2Q1My1lMDU5LTQ4YjctOTQ3OC1lM2ZkNzFmNTFmMWYiLCJqdGkiOiIxNWE4ZGNlMmZlNjE2YTQyMTVjOWMxZTNkYjVmNmU1MTdiZTNlZjgzMGYwNTkwNjQ4MjU5MTNkNGY0ZjA3ZmY0ZDVjZjVhNDg1MjI2ZmVkMiIsImlhdCI6MTc2MDU1Njc2MSwibmJmIjoxNzYwNTU2NzYxLCJleHAiOjE3NjE4Njg4MDAsInN1YiI6Ijc4ODIzMDEiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6Mjk5MzI2MDcsImJhc2VfZG9tYWluIjoia29tbW8uY29tIiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJ1c2VyX2ZsYWdzIjowLCJoYXNoX3V1aWQiOiIzZWE0ZTUyOS0yYWQ4LTQyMGUtYWQzYy05NmUzOTAwODJhMzAiLCJhcGlfZG9tYWluIjoiYXBpLWcua29tbW8uY29tIn0.bfiUhdxV_EaAHB7B5WYM49LjkXcNStSZr48Jx3wZFFq00GYYmRUPFab0Ae5SX71v0pdgMgnqiKVfHZhDKfW3ykXJbmSAxcCTi2snoD4sBlvBur8G1pDKZ6YGuqqKboCAER2HbCcZFA5aFrgVHf5L1hl6o_YKCO4VkIFR8MwLv753b3jtdgOvHGc_scXT3JRHCtu4WAXWVw8w7Obo2wBtiefxx_zL4ZGRRSWj8WoIr9LYRc_yfEVm1HgGAJkyrkvWiFKZggRvyZkx1VB6_cKxu_A5751MscI8UlnpJvyzAbJ7HRsrAuRxnFDBjKo2cVrHo8TQ2hwVwSYTQtviSF9aYA';
    
    // Paso 1: Crear contacto primero
    console.log('👤 Paso 1: Creando contacto...');
    const contactPayload = [
      {
        name: "TEST CONTACTO SIMPLE",
        custom_fields_values: [
          {
            field_id: 557100, // Email
            values: [{ value: "test@test.com", enum_code: "WORK" }]
          },
          {
            field_id: 557098, // Teléfono
            values: [{ value: "1234567890", enum_code: "MOB" }]
          }
        ]
      }
    ];
    
    const contactResponse = await fetch('https://winstonchurchill.kommo.com/api/v4/contacts', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactPayload),
    });
    
    if (!contactResponse.ok) {
      const errorText = await contactResponse.text();
      console.log('❌ Error creando contacto:', errorText);
      return NextResponse.json({ error: errorText }, { status: contactResponse.status });
    }
    
    const contactData = await contactResponse.json();
    console.log('✅ Contacto creado:', JSON.stringify(contactData, null, 2));
    
    const contactId = contactData._embedded.contacts[0].id;
    console.log('👤 ID del contacto:', contactId);
    
    // Paso 2: Crear lead con el contacto
    console.log('📋 Paso 2: Creando lead con contacto...');
    const leadPayload = [
      {
        name: "TEST LEAD CON CONTACTO",
        price: 0,
        pipeline_id: 10453492,
        _embedded: {
          contacts: [{ id: contactId }]
        }
      }
    ];
    
    console.log('📤 Payload del lead:', JSON.stringify(leadPayload, null, 2));
    
    const leadResponse = await fetch('https://winstonchurchill.kommo.com/api/v4/leads', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadPayload),
    });
    
    console.log('📥 Status del lead:', leadResponse.status);
    
    if (leadResponse.ok) {
      const leadData = await leadResponse.json();
      console.log('📥 Respuesta del lead:', JSON.stringify(leadData, null, 2));
      
      if (leadData._embedded && leadData._embedded.leads) {
        console.log(`📊 RESULTADO: Se crearon ${leadData._embedded.leads.length} leads`);
        
        return NextResponse.json({ 
          success: true, 
          leadsCreated: leadData._embedded.leads.length,
          leadIds: leadData._embedded.leads.map((lead: any) => lead.id),
          leadNames: leadData._embedded.leads.map((lead: any) => lead.name),
          contactId: contactId
        });
      }
    } else {
      const errorText = await leadResponse.text();
      console.log('❌ Error creando lead:', errorText);
      return NextResponse.json({ error: errorText }, { status: leadResponse.status });
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
    return NextResponse.json({ error: 'Error creating lead' }, { status: 500 });
  }
}
