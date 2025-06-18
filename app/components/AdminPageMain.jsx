"use client"
import React from 'react'

const AdminPageMain = () => {
  async function handleLogout() {
    await fetch('/api/logout', { method: 'POST' });
    window.location.reload();
  }

  return (
    <main className="flex flex-col gap-[32px] p-8 items-center sm:items-start flex-1">
      <h1 className="text-4xl font-bold">Dashboard</h1>
      <p className="text-2xl">dashboard stuff to do here</p>
      <button
        className="bg-red-500 text-white rounded-md p-2 mt-4"
        onClick={handleLogout}
      >
        Logout
      </button>
    </main>
  );
}

export default AdminPageMain