import React from 'react'
import Nav from './Nav'

const Header = () => {
  return (
    <header className="lucius-site-width-wrapper flex gap-[24px] flex-wrap justify-center w-full">
		<div className="flex lg:flex-1">
		  <a href="#" className="-m-1.5 p-1.5">
			<img src="#" alt="Logo" id="lucius-logo" className="h-8 w-auto m-3" />
		  </a>
		</div>
		<Nav />
    </header>
  )
}

export default Header