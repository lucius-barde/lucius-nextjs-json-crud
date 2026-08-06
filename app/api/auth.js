import { NextResponse } from 'next/server';
import { getUsersDb, mapUserRow } from '../db/sqlite';

export function getSessionUserId(request) {
  const session = request.cookies.get('session')?.value;
  const match = /^user-(\d+)$/.exec(session || '');
  return match ? Number(match[1]) : null;
}

export function safeUser(user) {
  if (!user) return user;
  const { password, ...withoutPassword } = user;
  return withoutPassword;
}

export function getCurrentUser(request) {
  const userId = getSessionUserId(request);
  if (!userId) return null;

  const db = getUsersDb();
  const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
  return mapUserRow(row) || null;
}

export function isAdmin(user) {
  return user?.role === 'admin';
}

export function unauthorizedResponse() {
  return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
}

export function forbiddenResponse() {
  return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
}
