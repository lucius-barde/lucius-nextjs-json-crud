import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUsersDb, mapUserRow } from '../../../db/sqlite';
import { forbiddenResponse, getCurrentUser, isAdmin, safeUser, unauthorizedResponse } from '../../auth';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  try {
    const currentUser = getCurrentUser(request);
    if (!currentUser) return unauthorizedResponse();

    const { id } = params;
    const userId = parseInt(id);
    const db = getUsersDb();
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    const user = mapUserRow(row);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    if (!isAdmin(currentUser) && user.id !== currentUser.id) {
      return forbiddenResponse();
    }

    // Do not expose password hash in API responses
    return NextResponse.json(safeUser(user));
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
    const currentUser = getCurrentUser(request);
    if (!currentUser) return unauthorizedResponse();

    const { id } = params;
    const userId = parseInt(id);
    const requestBody = await request.json();
    const { url, name, email, description, password, role, status, permissions } = requestBody;

    if (!url || !name || !email) {
      return NextResponse.json(
        { error: 'URL, name, and email are required' },
        { status: 400 }
      );
    }

	const db = getUsersDb();
	const existingRow = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
	if (!existingRow) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

	const existing = mapUserRow(existingRow);
    if (!isAdmin(currentUser) && existing.id !== currentUser.id) {
      return forbiddenResponse();
    }

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

    const updated = {
      url,
      name,
      email,
      description: description ?? existing.description,
      password: nextPassword,
      role: isAdmin(currentUser) ? (role ?? existing.role) : existing.role,
      status: isAdmin(currentUser) ? (status ?? existing.status) : existing.status,
      permissions: JSON.stringify(isAdmin(currentUser) && Array.isArray(permissions) ? permissions : existing.permissions),
      edited: Date.now()
    };
    db.prepare(`
      UPDATE users
      SET url = @url,
          name = @name,
          email = @email,
          description = @description,
          password = @password,
          role = @role,
          status = @status,
          permissions = @permissions,
          edited = @edited
      WHERE id = @id
    `).run({ ...updated, id: userId });

    const after = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    return NextResponse.json(safeUser(mapUserRow(after)), { status: 200 });
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
    const currentUser = getCurrentUser(request);
    if (!currentUser) return unauthorizedResponse();
    if (!isAdmin(currentUser)) return forbiddenResponse();

    const { id } = params;
    const userId = parseInt(id);
    if (userId === currentUser.id) return forbiddenResponse();

    const db = getUsersDb();
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(userId);
    if (!row) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const deletedUser = safeUser(mapUserRow(row));
    db.prepare('DELETE FROM users WHERE id = ?').run(userId);

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


