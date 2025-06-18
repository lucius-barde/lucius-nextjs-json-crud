"use client"
import React from 'react'

const Nav = () => {
  return (
    <nav className="p-8">
        <ul className="flex items-left gap-[24px] w-full justify-center">
        <li><a href="/">Home</a></li>
        <li><a href="/admin">Admin</a></li>
        </ul>
    </nav>
  )
}

export default Nav