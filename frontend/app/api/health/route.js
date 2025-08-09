import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    // Get the Django API base URL
    const DJANGO_API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000';
    
    console.log('🔄 Testing Django connection:', `${DJANGO_API_URL}/admin/`);
    
    // Test connection to Django backend
    const response = await fetch(`${DJANGO_API_URL}/admin/`, {
      method: 'GET',
    });

    console.log('📥 Django health check status:', response.status);
    
    if (response.status === 200 || response.status === 302) {
      return NextResponse.json({ 
        status: 'Django backend is running',
        django_url: DJANGO_API_URL,
        response_status: response.status
      });
    } else {
      return NextResponse.json({ 
        error: 'Django backend not responding correctly',
        django_url: DJANGO_API_URL,
        response_status: response.status
      }, { status: 503 });
    }

  } catch (error) {
    console.error('❌ Django connection error:', error);
    return NextResponse.json(
      { 
        error: 'Cannot connect to Django backend',
        details: error.message,
        django_url: process.env.NEXT_PUBLIC_API_URL || 'http://127.0.0.1:8000'
      },
      { status: 503 }
    );
  }
}
