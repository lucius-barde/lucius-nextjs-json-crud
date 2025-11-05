import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { getUsersDb, mapUserRow } from '../../../db/sqlite';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const db = getUsersDb();
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(parseInt(id));
    const user = mapUserRow(row);

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

	const db = getUsersDb();
	const existingRow = db.prepare('SELECT * FROM users WHERE id = ?').get(parseInt(id));
	if (!existingRow) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

	const existing = mapUserRow(existingRow);

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
      role: role ?? existing.role,
      status: status ?? existing.status,
      permissions: JSON.stringify(Array.isArray(permissions) ? permissions : existing.permissions),
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
    `).run({ ...updated, id: parseInt(id) });

    const after = db.prepare('SELECT * FROM users WHERE id = ?').get(parseInt(id));
    return NextResponse.json(mapUserRow(after), { status: 200 });
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
    const db = getUsersDb();
    const row = db.prepare('SELECT * FROM users WHERE id = ?').get(parseInt(id));
    if (!row) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    const deletedUser = mapUserRow(row);
    db.prepare('DELETE FROM users WHERE id = ?').run(parseInt(id));

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


