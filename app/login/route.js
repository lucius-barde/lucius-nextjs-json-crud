import { NextResponse } from 'next/server';
import path from 'path';
import { promises as fs } from 'fs';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

async function readUsersFromJson() {
  const dbPath = path.join(process.cwd(), 'app', 'db', 'users.json');
  const file = await fs.readFile(dbPath, 'utf-8');
  const parsed = JSON.parse(file);
  return Array.isArray(parsed?.users) ? parsed.users : [];
}

function normalizeString(value) {
  return (value || '').toString().trim().toLowerCase();
}

function isBcryptHash(hash) {
  return typeof hash === 'string' && hash.startsWith('$2');
}

function looksLikeMd5(hash) {
  return typeof hash === 'string' && /^[a-f0-9]{32}$/i.test(hash);
}

async function verifyPassword(inputPassword, storedPassword) {
  if (!storedPassword) return false;
  // Prefer bcrypt when the stored hash is bcrypt
  if (isBcryptHash(storedPassword)) {
    try {
      return await bcrypt.compare(inputPassword, storedPassword);
    } catch {
      return false;
    }
  }
  // Support md5 legacy hashes
  if (looksLikeMd5(storedPassword)) {
    const md5 = crypto.createHash('md5').update(inputPassword).digest('hex');
    return normalizeString(md5) === normalizeString(storedPassword);
  }
  // Fallback: plain-text match
  return inputPassword === storedPassword;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const login = formData.get('login');
    const password = formData.get('password');

    const loginNorm = normalizeString(login);
    if (!loginNorm || !password) {
      return NextResponse.json({ success: false, error: 'Missing credentials' }, { status: 400 });
    }

    const users = await readUsersFromJson();
    const user = users.find(u => {
      const email = normalizeString(u.email);
      const name = normalizeString(u.name);
      const url = normalizeString(u.url);
      return loginNorm === email || loginNorm === name || loginNorm === url;
    });

    if (!user) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    const ok = await verifyPassword(password, user.password);
    if (!ok) {
      return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }

    // On success, set a secure, HTTP-only session cookie
    const response = NextResponse.json({ success: true });
    response.cookies.set('session', `user-${user.id}`, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24, // 1 day
    });
    return response;
  } catch (error) {
    return NextResponse.json({ success: false, error: error.message || 'Login failed' }, { status: 500 });
  }
}