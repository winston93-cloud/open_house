import { NextRequest, NextResponse } from 'next/server';

// Debug endpoint to test Kommo API with detailed logging
export async function POST(request: NextRequest) {
  try {
    console.log('🔍 DEBUG: Iniciando prueba de Kommo API...');
    
    const accessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImQ2OWZhMDA2OWIwOTNjMGFhNmZmMjQ2MTJkZjQ3MjI3Y2ViNTM3MGUyODAxODg1MzBmZDM1MDE1MDU0NDA2ZGE2OTdlNDIxMDJhODZkZDI0In0.eyJhdWQiOiJmZDM3OGNiZi1lN2EwLTQ5NGEtYmI5OC0zMDNlMTVjNjIxYWEiLCJqdGkiOiJkNjlmYTAwNjliMDkzYzBhYTZmZjI0NjEyZGY0NzIyN2NlYjUzNzBlMjgwMTg4NTMwZmQzNTAxNTA1NDQwNmRhNjk3ZTQyMTAyYTg2ZGQyNCIsImlhdCI6MTc2MTA1NTQzOCwibmJmIjoxNzYxMDU1NDM4LCJleHAiOjE3NjcxMzkyMDAsInN1YiI6Ijc4ODIzMDEiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6Mjk5MzI2MDcsImJhc2VfZG9tYWluIjoia29tbW8uY29tIiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJoYXNoX3V1aWQiOiJlNmQxYmViMy0yMGNlLTQ0YWQtODQ0MC1lYTlhZDhlYjhhYWUiLCJ1c2VyX2ZsYWdzIjowLCJhcGlfZG9tYWluIjoiYXBpLWcua29tbW8uY29tIn0.ccmhIk5mzRS0KyWhoagHROXdXX0fJHXTMKa43JNh9d-S0-snBpMae6WJz2IvX2k1j1tk0oKYIqjus2UviPRsHunuFO1SDmO6h1T1m3bTeNEXcNytreytSYlXgYws4rYxLYUGF5k9DMeFyoN92lXc_r6H97GDa5hvpmG1MCi8cVTMiumRkHtzmzgvqD9OAmUxLAzE3UQy846kwCn6ctJ_nSGSIfr_IKR4fRK1DBPkDVUhpTK5Mr1Hl6LAYj3dMotcjOl13ZfS7G3XsDfLFVW29zJm_SsYg_kTwYBuVxO2lyyFKG6ePZdxrVFGlcH_ppGwpulGOSj6Ua-AH8NQ-kIlBA';
    
    // Test 1: Create contact
    console.log('👤 DEBUG: Creando contacto de prueba...');
    const contactUrl = 'https://winstonchurchill.kommo.com/api/v4/contacts';
    
    const contactPayload = [
      {
        name: 'DEBUG TEST CONTACT',
        custom_fields_values: [
          {
            field_id: 557100, // Email
            values: [{ value: 'debug@test.com', enum_code: "WORK" }]
          },
          {
            field_id: 557098, // Teléfono
            values: [{ value: '1234567890', enum_id: 360072 }]
          }
        ]
      }
    ];
    
    console.log('📤 DEBUG Contact payload:', JSON.stringify(contactPayload, null, 2));
    
    const contactResponse = await fetch(contactUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(contactPayload),
    });
    
    const contactData = await contactResponse.json();
    console.log('📥 DEBUG Contact response:', JSON.stringify(contactData, null, 2));
    
    if (!contactResponse.ok) {
      return NextResponse.json({
        success: false,
        error: 'Contact creation failed',
        contactResponse: contactData
      });
    }
    
    const contactId = contactData._embedded.contacts[0].id;
    console.log('✅ DEBUG Contact created with ID:', contactId);
    
    // Test 2: Create lead with tags
    console.log('📋 DEBUG: Creando lead con etiquetas...');
    const leadUrl = 'https://winstonchurchill.kommo.com/api/v4/leads';
    
    const leadPayload = [
      {
        name: 'DEBUG TEST LEAD',
        price: 0,
        pipeline_id: 5030645,
        status_id: 56296556,
        responsible_user_id: 7882301,
        tags: [{ name: 'Open House Winston' }], // Test tag format
        _embedded: {
          contacts: [{ id: contactId }]
        }
      }
    ];
    
    console.log('📤 DEBUG Lead payload:', JSON.stringify(leadPayload, null, 2));
    
    const leadResponse = await fetch(leadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(leadPayload),
    });
    
    const leadData = await leadResponse.json();
    console.log('📥 DEBUG Lead response:', JSON.stringify(leadData, null, 2));
    
    if (!leadResponse.ok) {
      return NextResponse.json({
        success: false,
        error: 'Lead creation failed',
        leadResponse: leadData
      });
    }
    
    const leadId = leadData._embedded.leads[0].id;
    console.log('✅ DEBUG Lead created with ID:', leadId);
    
    return NextResponse.json({
      success: true,
      message: 'Debug test completed',
      contactId,
      leadId,
      contactPayload,
      leadPayload,
      contactResponse: contactData,
      leadResponse: leadData
    });
    
  } catch (error) {
    console.error('❌ DEBUG Error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Debug test failed',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
