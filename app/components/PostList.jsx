"use client"
import React, { useEffect, useState } from 'react';

const PostList = () => {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Copy-pasted from AdminPostList.jsx
  useEffect(() => {
    async function fetchPosts() {
      try {
        const res = await fetch('/api/post/getAllPostsDateDesc');
        if (!res.ok) throw new Error('Failed to fetch posts');
        const data = await res.json();
        setPosts(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchPosts();
  }, []);


  // Copy-pasted from AdminPostList.jsx
  // Helper to format timestamp
  function formatDate(ts) {
    if (!ts) return '';
    const date = new Date(Number(ts));
    const pad = n => n.toString().padStart(2, '0');
    return `${date.getFullYear()}-${pad(date.getMonth()+1)}-${pad(date.getDate())} ${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}`;
  }


  if (loading) return <section id="blog"><div>Loading posts...</div></section>;
  if (error) return <section id="blog"><div className="text-red-500">Error: {error}</div></section>;

  return (
   <section id="blog">
      <div className="w-full overflow-x-auto">
        <h2 className="text-2xl font-bold">Latest posts</h2>
    {posts.map(post => (
         <article key={post.id} className='mt-8 mb-8'>
         <h3 className='text-xl font-semibold mb-2'><a href={`/post/${post.id}`}>{post.name}</a></h3>
         <p className='text-sm text-gray-600'>{formatDate(post.created)}</p> 
 
         <div>
             <p>{post.content.length > 300 ? post.content.slice(0, 300) + '…' : post.content}</p>
             <a href={`/post/${post.id}`} className='text-blue-500'>Read more</a>
         </div>
       </article>
    ))}
    

     
    </div>
   </section>
   
  );
}

export default PostList;