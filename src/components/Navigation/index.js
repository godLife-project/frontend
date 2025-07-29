import React from 'react'
import TopNav from './TopNav'
import SideNav from './SideNav'

const Navigation = () => {
  return (
    <>
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="container mx-auto">
          <TopNav />
        </div>
      </header>
      <SideNav />
    </>
  )
}

export default Navigation