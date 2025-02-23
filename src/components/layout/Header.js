import React from 'react';
import TopNav from '../Navigation/TopNav'
import SideNav from '../Navigation/SideNav'

const Header = () => {
  return (
    <>
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="container mx-auto">
          <TopNav />
        </div>
      </header>
      <SideNav />
    </>
  );
};

export default Header;