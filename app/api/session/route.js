import { NextResponse } from 'next/server';
import { getCurrentUser, safeUser } from '../auth';

export async function GET(request) {
  const user = getCurrentUser(request);
  return NextResponse.json({ loggedIn: !!user, user: safeUser(user) });
} 