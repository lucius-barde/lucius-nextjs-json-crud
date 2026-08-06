"use client"
import React, { useEffect, useState } from 'react'
import Link from 'next/link';
import AdminPostList from './AdminPostList';
import AdminUserList from './AdminUserList';

const AdminPageMain = () => {
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    async function fetchSession() {
      const res = await fetch('/api/session');
      if (!res.ok) return;
      const data = await res.json();
      setCurrentUser(data.user || null);
    }
    fetchSession();
  }, []);

  const isAdmin = currentUser?.role === 'admin';
 
  return (
    <main className="lucius-site-width-wrapper flex flex-col gap-[32px] p-8 items-center sm:items-start flex-1">
      <h1 className="text-4xl font-bold">Dashboard</h1>
      {isAdmin && (
        <ul>
          <li>
            <Link className="bg-blue-500 text-white rounded-md p-2" href="/admin/post/create">Create Post</Link>
            &nbsp;
            <Link className="bg-blue-500 text-white rounded-md p-2" href="/admin/user/create">Create User</Link>
          </li>
        </ul>
      )}

      <AdminPostList currentUser={currentUser} />

      <AdminUserList currentUser={currentUser} />
     
    </main>
  );
}

export default AdminPageMain