import { NextResponse } from 'next/server';
import { getPostsDb } from '../../../db/sqlite';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const db = getPostsDb();
    const rows = db.prepare('SELECT * FROM posts ORDER BY edited DESC').all();
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}