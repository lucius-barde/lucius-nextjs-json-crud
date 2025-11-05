"use client"
import React from 'react'
import Link from 'next/link';
import AdminPostList from './AdminPostList';
import AdminUserList from './AdminUserList';

const AdminPageMain = () => {
 
  return (
    <main className="flex flex-col gap-[32px] p-8 items-center sm:items-start flex-1">
      <h1 className="text-4xl font-bold">Dashboard</h1>
      <ul>
        <li>
          <Link className="bg-blue-500 text-white rounded-md p-2" href="/admin/post/create">Create Post</Link>
          &nbsp;
          <Link className="bg-blue-500 text-white rounded-md p-2" href="/admin/user/create">Create User</Link>
        </li>
      </ul>

      <AdminPostList />

      <AdminUserList />
     
    </main>
  );
}

export default AdminPageMain