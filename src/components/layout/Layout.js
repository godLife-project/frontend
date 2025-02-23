import React from 'react';
import Header from './Header';
import Footer from './Footer';
import MainContainer from './MainContainer';

function Layout({ children }) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <MainContainer>{children}</MainContainer>
            <Footer />
        </div>
    );
}

export default Layout;