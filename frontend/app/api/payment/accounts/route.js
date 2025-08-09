import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get the Django API base URL
    const DJANGO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    
    console.log('🔄 Forwarding payment accounts request to Django:', `${DJANGO_API_URL}/api/payment/accounts/`);
    
    // Forward the request to Django backend
    const response = await fetch(`${DJANGO_API_URL}/api/payment/accounts/`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        // Forward the Authorization header if it exists
        ...(request.headers.get('authorization') && {
          'Authorization': request.headers.get('authorization')
        }),
      },
    });

    console.log('📥 Django payment accounts response status:', response.status);
    
    if (!response.ok) {
      console.error('❌ Django payment accounts API error:', response.status, response.statusText);
      const errorText = await response.text();
      console.error('❌ Error response:', errorText);
      
      return NextResponse.json(
        { error: `Django API error: ${response.status} ${response.statusText}`, details: errorText },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log('✅ Django payment accounts response data:', data);

    // Return the response with the same status code
    return NextResponse.json(data, { status: response.status });

  } catch (error) {
    console.error('Error in payment/accounts API route:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
