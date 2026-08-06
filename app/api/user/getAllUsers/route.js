import { NextResponse } from 'next/server';
import { getUsersDb, mapUserRow } from '../../../db/sqlite';
import { getCurrentUser, isAdmin, safeUser, unauthorizedResponse } from '../../auth';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) return unauthorizedResponse();

    const db = getUsersDb();
    const rows = isAdmin(currentUser)
      ? db.prepare('SELECT * FROM users').all()
      : db.prepare('SELECT * FROM users WHERE id = ?').all(currentUser.id);
    return NextResponse.json(rows.map(mapUserRow).map(safeUser));
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


