import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

export async function GET(request, { params }) {
  try {
    const { id } = params;
    
    // Read the database file
    const dbPath = path.join(process.cwd(), 'app', 'db', 'blobs.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    // Find the blob with the matching ID
    const blob = dbData.blobs.find(blob => blob.id === parseInt(id));
    
    if (!blob) {
      return NextResponse.json(
        { error: 'Element not found' },
        { status: 404 }
      );
    }
    
    // Return the blob data as JSON
    return NextResponse.json(blob);
    
  } catch (error) {
    console.error('Error fetching blob:', error);
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
    
    // Find the blob with the matching ID
    const blobIndex = dbData.blobs.findIndex(blob => blob.id === parseInt(id));
    
    if (blobIndex === -1) {
      return NextResponse.json(
        { error: 'Blob not found' },
        { status: 404 }
      );
    }
    
    // Update the blob's URL
    dbData.blobs[blobIndex].url = url;
    
    // Write back to database file
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 4));
    
    // Return the updated blob
    return NextResponse.json(dbData.blobs[blobIndex], { status: 200 });
    
  } catch (error) {
    console.error('Error updating blob:', error);
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
    const dbPath = path.join(process.cwd(), 'app', 'db', 'blobs.json');
    const dbData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
    
    // Find the blob with the matching ID
    const blobIndex = dbData.blobs.findIndex(blob => blob.id === parseInt(id));
    
    if (blobIndex === -1) {
      return NextResponse.json(
        { error: 'Blob not found' },
        { status: 404 }
      );
    }
    
    // Remove the blob from the array
    const deletedBlob = dbData.blobs[blobIndex];
    dbData.blobs.splice(blobIndex, 1);
    
    // Write back to database file
    fs.writeFileSync(dbPath, JSON.stringify(dbData, null, 4));
    
    // Return success message
    return NextResponse.json({ 
      message: 'Blob deleted successfully',
      deletedBlob: deletedBlob 
    }, { status: 200 });
    
  } catch (error) {
    console.error('Error deleting blob:', error);
    return NextResponse.json(
      { error: 'Internal server error: ' + error },
      { status: 500 }
    );
  }
} 