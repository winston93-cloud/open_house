import { NextRequest, NextResponse } from 'next/server';

// Test endpoint to verify Kommo tags API
export async function POST(request: NextRequest) {
  try {
    const { leadId, tagName } = await request.json();
    
    console.log('🧪 Testing tags API for lead:', leadId);
    console.log('🏷️ Tag to add:', tagName);
    
    // Get access token
    const accessToken = 'eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImQ2OWZhMDA2OWIwOTNjMGFhNmZmMjQ2MTJkZjQ3MjI3Y2ViNTM3MGUyODAxODg1MzBmZDM1MDE1MDU0NDA2ZGE2OTdlNDIxMDJhODZkZDI0In0.eyJhdWQiOiJmZDM3OGNiZi1lN2EwLTQ5NGEtYmI5OC0zMDNlMTVjNjIxYWEiLCJqdGkiOiJkNjlmYTAwNjliMDkzYzBhYTZmZjI0NjEyZGY0NzIyN2NlYjUzNzBlMjgwMTg4NTMwZmQzNTAxNTA1NDQwNmRhNjk3ZTQyMTAyYTg2ZGQyNCIsImlhdCI6MTc2MTA1NTQzOCwibmJmIjoxNzYxMDU1NDM4LCJleHAiOjE3NjcxMzkyMDAsInN1YiI6Ijc4ODIzMDEiLCJncmFudF90eXBlIjoiIiwiYWNjb3VudF9pZCI6Mjk5MzI2MDcsImJhc2VfZG9tYWluIjoia29tbW8uY29tIiwidmVyc2lvbiI6Miwic2NvcGVzIjpbImNybSIsImZpbGVzIiwiZmlsZXNfZGVsZXRlIiwibm90aWZpY2F0aW9ucyIsInB1c2hfbm90aWZpY2F0aW9ucyJdLCJoYXNoX3V1aWQiOiJlNmQxYmViMy0yMGNlLTQ0YWQtODQ0MC1lYTlhZDhlYjhhYWUiLCJ1c2VyX2ZsYWdzIjowLCJhcGlfZG9tYWluIjoiYXBpLWcua29tbW8uY29tIn0.ccmhIk5mzRS0KyWhoagHROXdXX0fJHXTMKa43JNh9d-S0-snBpMae6WJz2IvX2k1j1tk0oKYIqjus2UviPRsHunuFO1SDmO6h1T1m3bTeNEXcNytreytSYlXgYws4rYxLYUGF5k9DMeFyoN92lXc_r6H97GDa5hvpmG1MCi8cVTMiumRkHtzmzgvqD9OAmUxLAzE3UQy846kwCn6ctJ_nSGSIfr_IKR4fRK1DBPkDVUhpTK5Mr1Hl6LAYj3dMotcjOl13ZfS7G3XsDfLFVW29zJm_SsYg_kTwYBuVxO2lyyFKG6ePZdxrVFGlcH_ppGwpulGOSj6Ua-AH8NQ-kIlBA';
    
    // Test different tag endpoints
    const endpoints = [
      `https://winstonchurchill.kommo.com/api/v4/leads/${leadId}/tags`,
      `https://winstonchurchill.kommo.com/api/v4/leads/${leadId}/tag`,
      `https://winstonchurchill.kommo.com/api/v4/tags`,
      `https://winstonchurchill.kommo.com/api/v4/leads/${leadId}`
    ];
    
    const results = [];
    
    for (const endpoint of endpoints) {
      console.log(`🔍 Testing endpoint: ${endpoint}`);
      
      try {
        // Test 1: POST with tag name
        const tagPayload = [{ name: tagName }];
        
        const response = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(tagPayload),
        });
        
        const responseText = await response.text();
        
        results.push({
          endpoint,
          method: 'POST',
          status: response.status,
          ok: response.ok,
          response: responseText
        });
        
        console.log(`📊 Response for ${endpoint}:`, response.status, responseText);
        
      } catch (error) {
        results.push({
          endpoint,
          method: 'POST',
          error: error.message
        });
        console.error(`❌ Error for ${endpoint}:`, error);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Tag API test completed',
      results
    });
    
  } catch (error) {
    console.error('Error testing tags API:', error);
    return NextResponse.json(
      { error: 'Error testing tags API' },
      { status: 500 }
    );
  }
}
