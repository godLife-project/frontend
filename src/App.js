
import './App.css';

import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import TopNavbar from './topNav/TopNavbar';  // TopNav 컴포넌트 임포트
import MainPage from './page/MainPage';  // 메인 페이지 컴포넌트 임포트
import New from './page/New';
import Rank from './page/Rank';
import Challenge from './page/Challenge';
import Contact from './page/Contact';
import Test from './page/Test';

const App = () => {
    return (
        <Router>
            <div>
                <TopNavbar />  {/* 탑 메뉴 네비게이션을 모든 페이지에 포함 */}
                <Routes>
                    <Route path="/" element={<MainPage />} />
                    <Route path="/new" element={<New />} />
                    <Route path="/rank" element={<Rank />} />
                    <Route path="/challenge" element={<Challenge />} />
                    <Route path="/contact" element={<Contact />} />
                    <Route path="/test" element={<Test />} />
                    {/* 다른 페이지들을 추가 */}
                </Routes>
            </div>
        </Router>
    );
};

export default App;