import { NextResponse } from 'next/server';
import { getPostsDb } from '../../../db/sqlite';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const requestBody = await request.json();
    const { url, name, content } = requestBody;
    
    // Validate that url is provided
    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }
    
    const db = getPostsDb();
    const maxIdRow = db.prepare('SELECT COALESCE(MAX(id), 0) as maxId FROM posts').get();
    const newId = (maxIdRow?.maxId || 0) + 1;
    
    // Create new post entry
    const newpost = {
      id: newId,
      url: url,
      name: name,
      content: content,
      created: Date.now(),
      edited: Date.now()
    };
    
    db.prepare(`
      INSERT INTO posts (id, url, name, content, created, edited)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(newId, url, name, content, newpost.created, newpost.edited);
    
    // Return the created post
    return NextResponse.json(newpost, { status: 201 });
    
  } catch (error) {
    console.error('Error creating post: ', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
} 