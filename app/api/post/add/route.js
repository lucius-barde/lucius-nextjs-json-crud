import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

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
    
    // Read the database file
    const dbPath = path.join(process.cwd(), 'app', 'db', 'posts.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    // Find the highest ID to increment
    const maxId = Math.max(...dbData.posts.map(post => post.id), 0);
    const newId = maxId + 1;
    
    // Create new post entry
    const newpost = {
      id: newId,
      url: url,
      name: name,
      content: content,
      created: Date.now(),
      edited: Date.now()
    };
    
    // Add to posts array
    dbData.posts.push(newpost);
    
    // Write back to database file
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 4));
    
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