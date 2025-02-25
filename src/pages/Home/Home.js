import React, { useEffect } from 'react';
import axiosInstance from '../../api/axiosInstance';  // 파일 경로에 맞게 수정

function Home() {
    useEffect(() => {
        const fetchData = async () => {
            try {
                // baseURL이 이미 설정되어 있으므로 나머지 경로만 추가
                const response = await axiosInstance.get('/categories/topMenu');
                console.log('받은 데이터:', response.data);
                
            } catch (error) {
                console.error('API 호출 에러:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div>
            홈
        </div>
    );
}

export default Home;