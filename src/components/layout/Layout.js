import React, { useState, useEffect } from 'react';
import Header from './Header';
import Footer from './Footer';
import MainContainer from './MainContainer';
import axiosInstance from '../../api/axiosInstance';

// Layout.js
function Layout({ children }) {
    const [categories, setCategories] = useState([]);

    useEffect(() => {
        // 테스트 환경에서는 API 호출 생략
        if (process.env.NODE_ENV === 'test') {
            return;
        }

        // 캐시된 데이터 먼저 확인
        const cachedData = localStorage.getItem('menuCategories');
        if (cachedData) {
            setCategories(JSON.parse(cachedData));
        }

        // 새로운 데이터 로드 (백그라운드)
        axiosInstance.get("/categories/topMenu")
            .then((response) => {
                // 데이터가 변경되었을 때만 상태 업데이트
                const newData = response.data;
                const cachedDataStr = JSON.stringify(newData);

                if (cachedDataStr !== cachedData) {
                    setCategories(newData);
                    localStorage.setItem('menuCategories', cachedDataStr);
                }
            })
            .catch((error) => console.error("카테고리 불러오기 실패:", error));
    }, []);

    return (
        <div className="flex flex-col min-h-screen">
            <Header categories={categories} />
            <MainContainer>{children}</MainContainer>
            <Footer />
        </div>
    );
}

export default Layout;