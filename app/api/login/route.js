import { NextResponse } from 'next/server';
import { ADMIN_USERNAME, ADMIN_PASSWORD } from './config';


export async function POST(request) {
    // Parse form data
    const formData = await request.formData();
    const username = formData.get('login');
    const password = formData.get('password');

    // Check credentials
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
        // Set a secure, HTTP-only cookie
        const response = NextResponse.json({ success: true });
        response.cookies.set('session', 'demo-session-token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            path: '/',
            maxAge: 60 * 60 * 24, // 1 day
        });
        return response;
    } else {
        // Failure: return JSON indicating failure
        return NextResponse.json({ success: false, error: 'Invalid credentials' }, { status: 401 });
    }
}