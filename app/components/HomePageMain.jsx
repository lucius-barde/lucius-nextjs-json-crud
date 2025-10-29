
import React from 'react'
import PostList from './PostList'
import Header from './Header'
import Footer from './Footer'


const HomePageMain = () => {
  return (
    <main id="HomePageMain" className="flex flex-col gap-[32px] p-8 items-center sm:items-start flex-1">

        <h1 className="text-4xl font-bold">My super Next.js CRUD</h1>
        <PostList />
    </main>
  )
}

export default HomePageMain