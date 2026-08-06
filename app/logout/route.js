import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const origin = request.nextUrl.origin;
    const response = NextResponse.redirect(origin + '/');
    response.cookies.set('session', '', {
      httpOnly: true,
      expires: new Date(0),
      path: '/',
    });
    return response;
  } catch (error) {
    return NextResponse.json({ error: error.message || 'Unknown error' }, { status: 500 });
  }
} 