import { NextResponse } from 'next/server';
import { getPostsDb } from '../../../db/sqlite';
import { getCurrentUser, isAdmin, unauthorizedResponse } from '../../auth';

export const runtime = 'nodejs';

export async function GET(request) {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) return unauthorizedResponse();

    const db = getPostsDb();
    const rows = isAdmin(currentUser)
      ? db.prepare('SELECT * FROM posts').all()
      : db.prepare('SELECT * FROM posts WHERE user_id = ?').all(currentUser.id);
    return NextResponse.json(rows);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}