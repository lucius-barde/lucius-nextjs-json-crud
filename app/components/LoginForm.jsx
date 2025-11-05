"use client"
import React, { useState } from 'react'
import { useRouter } from 'next/navigation';

const LoginForm = () => {
  const [error, setError] = useState(null);
  const router = useRouter();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.target);
    const res = await fetch('/login', {
      method: 'POST',
      body: formData,
    });
    const data = await res.json();
    if (data.success) {
      window.location.reload();
    } else {
      setError(data.error || 'Login failed');
    }
  }

  return (
    <main className="flex flex-col gap-[32px] p-8 items-center sm:items-start flex-1">
      <h1 className="text-4xl font-bold">Login</h1>
      <form onSubmit={handleSubmit} className='flex flex-col gap-[16px]'>
        <input className='border-2 border-gray-300 rounded-md p-2' type="text" id="login" name="login" placeholder='Email or Username' />
        <input className='border-2 border-gray-300 rounded-md p-2' type="password" id="password" name="password" placeholder='Password' />
        <button className='cursor-pointer bg-blue-500 text-white rounded-md p-2' type='submit'>Login</button>
      </form>
      {error && <div className="text-red-500 mt-2">{error}</div>}
    </main>
  )
}

export default LoginForm
