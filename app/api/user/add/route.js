import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUsersDb, mapUserRow } from '../../../db/sqlite';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const requestBody = await request.json();
    const { url, name, email, description, password, role, status, permissions } = requestBody;

    if (!url || !name || !email) {
      return NextResponse.json(
        { error: 'URL, name, and email are required' },
        { status: 400 }
      );
    }

    const db = getUsersDb();
    const maxIdRow = db.prepare('SELECT COALESCE(MAX(id), 0) as maxId FROM users').get();
    const newId = (maxIdRow?.maxId || 0) + 1;

    const now = Date.now();

    const isBcryptHash = (value) => typeof value === 'string' && value.startsWith('$2');
    const hashedPassword = password
      ? (isBcryptHash(password) ? password : bcrypt.hashSync(String(password), 10))
      : '';
    db.prepare(`
      INSERT INTO users (id, url, name, description, email, password, role, status, permissions, created, edited)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      newId,
      url,
      name,
      description || '',
      email,
      hashedPassword,
      role || 'user',
      status || 'active',
      JSON.stringify(Array.isArray(permissions) ? permissions : ['read']),
      now,
      now
    );

    const inserted = db.prepare('SELECT * FROM users WHERE id = ?').get(newId);
    return NextResponse.json(mapUserRow(inserted), { status: 201 });
  } catch (error) {
    console.error('Error creating user: ', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}


