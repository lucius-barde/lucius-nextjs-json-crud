import { NextResponse } from 'next/server';

export async function GET(request) {
  const session = request.cookies.get('session');
  return NextResponse.json({ loggedIn: !!session });
} 