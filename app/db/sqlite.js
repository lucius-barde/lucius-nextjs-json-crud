import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

let usersDbSingleton = null;
let postsDbSingleton = null;

function ensureDirectoryExists(targetPath) {
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function openDatabase(dbFilePath) {
  ensureDirectoryExists(dbFilePath);
  const db = new Database(dbFilePath, { fileMustExist: false });
  // Ensure foreign keys enforcement is enabled
  try {
    db.pragma('foreign_keys = ON');
  } catch {}
  return db;
}

function initializeUsersSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY,
      url TEXT NOT NULL,
      name TEXT NOT NULL,
      description TEXT DEFAULT '',
      email TEXT NOT NULL,
      password TEXT DEFAULT '',
      role TEXT DEFAULT 'user',
      status TEXT DEFAULT 'active',
      permissions TEXT DEFAULT '[]',
      created INTEGER NOT NULL,
      edited INTEGER NOT NULL
    );
  `);
}

function initializePostsSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS posts (
      id INTEGER PRIMARY KEY,
      url TEXT NOT NULL,
      name TEXT NOT NULL,
      content TEXT NOT NULL,
      user_id INTEGER NULL,
      created INTEGER NOT NULL,
      edited INTEGER NOT NULL
    );
  `);
}

function migratePostsAddUserId(db) {
  // Check if user_id already exists
  try {
    const columns = db.prepare(`PRAGMA table_info(posts);`).all();
    const hasUserId = columns.some(c => String(c.name) === 'user_id');
    if (hasUserId) return;
  } catch {
    return;
  }

  // Recreate posts table with user_id and FK, preserving data
  const inTxn = db.transaction(() => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS posts_new (
        id INTEGER PRIMARY KEY,
        url TEXT NOT NULL,
        name TEXT NOT NULL,
        content TEXT NOT NULL,
        user_id INTEGER NULL,
        created INTEGER NOT NULL,
        edited INTEGER NOT NULL
      );
    `);

    // Copy data from old posts; user_id defaults to NULL
    db.exec(`
      INSERT INTO posts_new (id, url, name, content, user_id, created, edited)
      SELECT id, url, name, content, NULL as user_id, created, edited FROM posts;
    `);

    db.exec(`DROP TABLE posts;`);
    db.exec(`ALTER TABLE posts_new RENAME TO posts;`);
  });

  try {
    inTxn();
  } catch {}
}

function seedUsersIfEmpty(db) {
  const count = db.prepare('SELECT COUNT(1) as c FROM users').get().c;
  if (count > 0) return;
  const jsonPath = path.join(process.cwd(), 'app', 'db', 'users.json');
  if (!fs.existsSync(jsonPath)) return;
  try {
    const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const users = Array.isArray(parsed?.users) ? parsed.users : [];
    const insert = db.prepare(`
      INSERT INTO users (id, url, name, description, email, password, role, status, permissions, created, edited)
      VALUES (@id, @url, @name, @description, @email, @password, @role, @status, @permissions, @created, @edited)
    `);
    const tx = db.transaction((rows) => {
      for (const u of rows) {
        insert.run({
          id: u.id,
          url: u.url || '',
          name: u.name || '',
          description: u.description || '',
          email: u.email || '',
          password: u.password || '',
          role: u.role || 'user',
          status: u.status || 'active',
          permissions: JSON.stringify(Array.isArray(u.permissions) ? u.permissions : []),
          created: Number(u.created) || Date.now(),
          edited: Number(u.edited) || Number(u.created) || Date.now()
        });
      }
    });
    tx(users);
  } catch {}
}

function seedPostsIfEmpty(db) {
  const count = db.prepare('SELECT COUNT(1) as c FROM posts').get().c;
  if (count > 0) return;
  const jsonPath = path.join(process.cwd(), 'app', 'db', 'posts.json');
  if (!fs.existsSync(jsonPath)) return;
  try {
    const parsed = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
    const posts = Array.isArray(parsed?.posts) ? parsed.posts : [];
    const insert = db.prepare(`
      INSERT INTO posts (id, url, name, content, user_id, created, edited)
      VALUES (@id, @url, @name, @content, @user_id, @created, @edited)
    `);
    const tx = db.transaction((rows) => {
      for (const p of rows) {
        insert.run({
          id: p.id,
          url: p.url || '',
          name: p.name || '',
          content: p.content || '',
          user_id: typeof p.user_id === 'number' ? p.user_id : null,
          created: Number(p.created) || Date.now(),
          edited: Number(p.edited) || Number(p.created) || Date.now()
        });
      }
    });
    tx(posts);
  } catch {}
}

export function getUsersDb() {
  if (!usersDbSingleton) {
    const dbPath = path.join(process.cwd(), 'app', 'db', 'users.db');
    const db = openDatabase(dbPath);
    initializeUsersSchema(db);
    seedUsersIfEmpty(db);
    usersDbSingleton = db;
  }
  return usersDbSingleton;
}

export function getPostsDb() {
  if (!postsDbSingleton) {
    const dbPath = path.join(process.cwd(), 'app', 'db', 'posts.db');
    const db = openDatabase(dbPath);
    initializePostsSchema(db);
    migratePostsAddUserId(db);
    seedPostsIfEmpty(db);
    postsDbSingleton = db;
  }
  return postsDbSingleton;
}

export function mapUserRow(row) {
  if (!row) return row;
  let permissions = [];
  try {
    permissions = JSON.parse(row.permissions || '[]');
  } catch {
    permissions = [];
  }
  return {
    id: row.id,
    url: row.url,
    name: row.name,
    description: row.description,
    email: row.email,
    password: row.password,
    role: row.role,
    status: row.status,
    permissions,
    created: row.created,
    edited: row.edited
  };
}


