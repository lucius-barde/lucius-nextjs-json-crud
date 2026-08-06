import { NextResponse } from 'next/server';
import { getPostsDb } from '../../db/sqlite';

export const runtime = 'nodejs';

const DEFAULT_POSTS_PER_PAGE = 3;
const DEFAULT_PAGE = 1;

function getPositiveInteger(value, fallback) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const postsPerPage = getPositiveInteger(
      searchParams.get('posts_per_page'),
      DEFAULT_POSTS_PER_PAGE
    );
    const page = getPositiveInteger(searchParams.get('page'), DEFAULT_PAGE);
    const db = getPostsDb();
    const total = db.prepare('SELECT COUNT(*) AS count FROM posts').get().count;
    const totalPages = Math.ceil(total / postsPerPage);
    const offset = (page - 1) * postsPerPage;
    const posts = db.prepare(`
      SELECT * FROM posts
      ORDER BY edited DESC
      LIMIT ? OFFSET ?
    `).all(postsPerPage, offset);

    return NextResponse.json({
      posts,
      pagination: {
        page,
        posts_per_page: postsPerPage,
        total,
        total_pages: totalPages
      }
    });
  } catch (error) {
    console.error('Error fetching paginated posts:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
