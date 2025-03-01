import React from 'react';
import TopNav from '../Navigation/TopNav'
import SideNav from '../Navigation/SideNav'

const Header = ({ categories }) => {
  return (
    <>
      <header className="border-b sticky top-0 bg-background z-50">
        <div className="container mx-auto">
          <TopNav categories={categories} />
        </div>
      </header>
      <SideNav categories={categories} />
    </>
  );
};

export default Header;