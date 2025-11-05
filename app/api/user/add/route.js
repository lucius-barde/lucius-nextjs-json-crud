import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

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

    const dbPath = path.join(process.cwd(), 'app', 'db', 'users.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    const maxId = Math.max(...dbData.users.map(user => user.id), 0);
    const newId = maxId + 1;

    const now = Date.now();

    const isBcryptHash = (value) => typeof value === 'string' && value.startsWith('$2');
    const hashedPassword = password
      ? (isBcryptHash(password) ? password : bcrypt.hashSync(String(password), 10))
      : '';
    const newUser = {
      id: newId,
      url,
      name,
      description: description || '',
      email,
      password: hashedPassword,
      role: role || 'user',
      status: status || 'active',
      permissions: Array.isArray(permissions) ? permissions : ['read'],
      created: now,
      edited: now
    };

    dbData.users.push(newUser);
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 4));

    return NextResponse.json(newUser, { status: 201 });
  } catch (error) {
    console.error('Error creating user: ', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}


