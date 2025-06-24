import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET() {
  try {
    // Read the database file
    const dbPath = path.join(process.cwd(), 'app', 'db', 'posts.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    // Sort posts by 'edited' date descending
    const sortedPosts = dbData.posts.sort((a, b) => b.edited - a.edited);
    // Return all posts as JSON
    return NextResponse.json(sortedPosts);
  } catch (error) {
    console.error('Error fetching posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 