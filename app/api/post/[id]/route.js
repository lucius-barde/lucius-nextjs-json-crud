import { NextResponse } from 'next/server';
import { getPostsDb } from '../../../db/sqlite';
import { forbiddenResponse, getCurrentUser, isAdmin, unauthorizedResponse } from '../../auth';

export const runtime = 'nodejs';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    const db = getPostsDb();
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(parseInt(id));
    
    if (!post) {
      return NextResponse.json(
        { error: 'Element not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(post);
    
  } catch (error) {
    console.error('Error fetching post:', error);
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
    const requestBody = await request.json();
    const { name, url, content } = requestBody;
    
    // Validate that all required fields are provided
    if (!name || !url || !content) {
      return NextResponse.json(
        { error: 'Name, URL, and content are required' },
        { status: 400 }
      );
    }
    
    const db = getPostsDb();
    const existing = db.prepare('SELECT * FROM posts WHERE id = ?').get(parseInt(id));
    if (!existing) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    if (!isAdmin(currentUser) && existing.user_id !== currentUser.id) {
      return forbiddenResponse();
    }
    const edited = Date.now();
    db.prepare(`
      UPDATE posts
      SET name = ?, url = ?, content = ?, edited = ?
      WHERE id = ?
    `).run(name, url, content, edited, parseInt(id));
    const after = db.prepare('SELECT * FROM posts WHERE id = ?').get(parseInt(id));
    return NextResponse.json(after, { status: 200 });
    
  } catch (error) {
    console.error('Error updating post:', error);
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

    const { id } = params;
    const db = getPostsDb();
    const existing = db.prepare('SELECT * FROM posts WHERE id = ?').get(parseInt(id));
    if (!existing) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    if (!isAdmin(currentUser) && existing.user_id !== currentUser.id) {
      return forbiddenResponse();
    }
    
    const deletedpost = existing;
    db.prepare('DELETE FROM posts WHERE id = ?').run(parseInt(id));
    
    return NextResponse.json({ 
      message: 'Post deleted successfully',
      deletedpost: deletedpost 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error deleting post:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
} 