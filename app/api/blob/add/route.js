import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function POST(request) {
  try {
    const requestBody = await request.json();
    const { url } = requestBody;
    
    // Validate that url is provided
    if (!url) {
      return NextResponse.json(
        { error: 'URL parameter is required' },
        { status: 400 }
      );
    }
    
    // Read the database file
    const dbPath = path.join(process.cwd(), 'app', 'db', 'blobs.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    // Find the highest ID to increment
    const maxId = Math.max(...dbData.blobs.map(blob => blob.id), 0);
    const newId = maxId + 1;
    
    // Create new blob entry
    const newBlob = {
      id: newId,
      url: url
    };
    
    // Add to blobs array
    dbData.blobs.push(newBlob);
    
    // Write back to database file
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 4));
    
    // Return the created blob
    return NextResponse.json(newBlob, { status: 201 });
    
  } catch (error) {
    console.error('Error creating blob: ', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
} 