"use client"
import React from 'react'

const HomePageMain = () => {
  return (
    <main className="flex flex-col gap-[32px] p-8 items-center sm:items-start flex-1">
        <h1 className="text-4xl font-bold">Next.js CRUD</h1>
        <p className="text-xl">crud available at /api/blob</p>
    </main>
  )
}

export default HomePageMain