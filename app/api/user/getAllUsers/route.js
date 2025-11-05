import { NextResponse } from 'next/server';
import { getUsersDb, mapUserRow } from '../../../db/sqlite';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const db = getUsersDb();
    const rows = db.prepare('SELECT * FROM users').all();
    return NextResponse.json(rows.map(mapUserRow));
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}


