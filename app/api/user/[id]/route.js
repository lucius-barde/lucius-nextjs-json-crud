import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import bcrypt from 'bcryptjs';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const dbPath = path.join(process.cwd(), 'app', 'db', 'users.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    const user = dbData.users.find(user => user.id === parseInt(id));

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Do not expose password hash in API responses
    const { password, ...safeUser } = user;
    return NextResponse.json(safeUser);
  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request, { params }) {
  try {
    const { id } = params;
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

    const userIndex = dbData.users.findIndex(user => user.id === parseInt(id));
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const existing = dbData.users[userIndex];

    const isBcryptHash = (value) => typeof value === 'string' && value.startsWith('$2');
    let nextPassword = existing.password;
    if (typeof password === 'string') {
      if (password.trim() === '') {
        // keep existing password
        nextPassword = existing.password;
      } else {
        nextPassword = isBcryptHash(password) ? password : bcrypt.hashSync(String(password), 10);
      }
    }

    dbData.users[userIndex] = {
      ...existing,
      url,
      name,
      email,
      description: description ?? existing.description,
      password: nextPassword,
      role: role ?? existing.role,
      status: status ?? existing.status,
      permissions: Array.isArray(permissions) ? permissions : existing.permissions,
      edited: Date.now()
    };

    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 4));
    return NextResponse.json(dbData.users[userIndex], { status: 200 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  try {
    const { id } = params;
    const dbPath = path.join(process.cwd(), 'app', 'db', 'users.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));

    const userIndex = dbData.users.findIndex(user => user.id === parseInt(id));
    if (userIndex === -1) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const deletedUser = dbData.users[userIndex];
    dbData.users.splice(userIndex, 1);
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 4));

    return NextResponse.json({
      message: 'User deleted successfully',
      deletedUser
    }, { status: 200 });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
}


