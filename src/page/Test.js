import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axiosInstance';

const Test = () => {
  // 상태 변수 선언
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  // 컴포넌트가 마운트될 때 API 호출
  useEffect(() => {
    axiosInstance.get('/test1')  // 실제 API 주소로 수정
      .then((response) => {
        // 성공적으로 데이터를 받으면 상태 업데이트
        setData(response.data);
      })
      .catch((err) => {
        // 에러 처리
        setError('Failed to fetch data');
      });
  }, []);  // 빈 배열을 넣으면 컴포넌트가 처음 렌더링될 때 한 번만 호출됨

  // 로딩 중이거나 에러 발생 시 처리
  if (error) {
    return <h1>{error}</h1>;
  }

  if (!data) {
    return <h1>Loading...</h1>;  // 데이터가 로딩 중이면 'Loading...' 표시
  }

  // API 호출이 완료되면 결과를 h1 태그로 출력
  return <h1>{data.message}</h1>;
};

export default Test;
