import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const body = await request.json();
    
    // Get the Django API base URL
    const DJANGO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    
    console.log('🔄 Forwarding request to Django:', `${DJANGO_API_URL}/api/orders/submit/`);
    console.log('📤 Request body:', body);
    
    // Get authorization header
    const authHeader = request.headers.get('authorization');
    console.log('🔐 Authorization header:', authHeader ? 'Present' : 'Missing');
    
    // Forward the request to Django backend
    const response = await fetch(`${DJANGO_API_URL}/api/orders/submit/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // Forward the Authorization header if it exists
        ...(authHeader && {
          'Authorization': authHeader
        }),
      },
      body: JSON.stringify(body),
    });

    console.log('📥 Django response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ Django API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      
      return NextResponse.json(
        { error: `Django API error: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Django response data:', data);

    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Error in orders/submit API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
