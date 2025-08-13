import { NextResponse } from 'next/server';

// Import the config file if it exists, otherwise display an error
let ADMIN_USERNAME, ADMIN_PASSWORD;

try {
  const config = await import('/app/login/config');
  ADMIN_USERNAME = config.ADMIN_USERNAME;
  ADMIN_PASSWORD = config.ADMIN_PASSWORD;
} catch (error) {
  // Set default values or leave undefined to handle in the function
  console.error('Config file not found:', error.message);
}

export async function POST(request) {
  // Check if config was loaded successfully
  if (!ADMIN_USERNAME || !ADMIN_PASSWORD) {
    return NextResponse.json({ 
      success: false, 
      error: 'Error: cannot login because config.js doesn\'t exist. Please contact your website administrator.' 
    }, { status: 500 });
  }

  const formData = await request.formData();
  const username = formData.get('login');
  const password = formData.get('password');

  if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
    // Set a secure, HTTP-only cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('session', 'demo-session-token', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });
    return response;
  } else {
    return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
  }
} 