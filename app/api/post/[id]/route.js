import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Read the database file
    const dbPath = path.join(process.cwd(), 'app', 'db', 'posts.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    // Find the post with the matching ID
    const post = dbData.posts.find(post => post.id === parseInt(id));
    
    if (!post) {
      return NextResponse.json(
        { error: 'Element not found' },
        { status: 404 }
      );
    }
    
    // Return the post data as JSON
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
    
    // Read the database file
    const dbPath = path.join(process.cwd(), 'app', 'db', 'posts.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    // Find the post with the matching ID
    const postIndex = dbData.posts.findIndex(post => post.id === parseInt(id));
    
    if (postIndex === -1) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Update the post
    dbData.posts[postIndex].name = name;
    dbData.posts[postIndex].url = url;
    dbData.posts[postIndex].content = content;
    dbData.posts[postIndex].edited = Date.now();
    
    // Write back to database file
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 4));
    
    // Return the updated post
    return NextResponse.json(dbData.posts[postIndex], { status: 200 });
    
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
    const { id } = params;
    
    // Read the database file
    const dbPath = path.join(process.cwd(), 'app', 'db', 'posts.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    // Find the post with the matching ID
    const postIndex = dbData.posts.findIndex(post => post.id === parseInt(id));
    
    if (postIndex === -1) {
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }
    
    // Remove the post from the array
    const deletedpost = dbData.posts[postIndex];
    dbData.posts.splice(postIndex, 1);
    
    // Write back to database file
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 4));
    
    // Return success message
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