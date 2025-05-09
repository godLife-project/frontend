// Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axiosInstance from '../api/axiosInstance';


const Login = () => {
    const [userId, setUserId] = useState('');
    const [userPw, setUserPw] = useState('');
    const [error, setError] = useState('');  // 오류 메시지 상태 추가
    const navigate = useNavigate(); // 페이지 이동을 위한 Hook

    const handleSubmit = async (e) => {
      e.preventDefault();
      setError('');

      try {
        const response = await axiosInstance.post(
          '/user/login',
          { userId, userPw }, // ← 이게 body입니다
          {
            headers: {
              'Content-Type': 'application/json',
            },
            withCredentials: true // ← 쿠키 포함 시 필요 (Refresh Token 등)
          }
        );

        // ✅ accessToken은 응답 헤더에서 추출
        const accessTokenHeader = response.headers['authorization'];
        if (accessTokenHeader) {
          const token = accessTokenHeader.replace(/^Bearer\s+/i, '');
          localStorage.setItem('accessToken', token);
          console.log('✅ AccessToken 저장 완료:', token);
        } else {
          console.warn('⚠️ 응답에 Authorization 헤더가 없습니다.');
        }

        const data = response.data;
        console.log('로그인 성공:', data);

        if (data.userNick) {
          localStorage.setItem('userNick', data.userNick);
          localStorage.setItem('userName', data.userName);
        }

        navigate('/');
      } catch (error) {
        console.error(error);
        setError('로그인 실패: 아이디 또는 비밀번호가 잘못되었습니다.');
      }
    };



    return (
        <div>
            <h2>Login Page</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>User ID: </label>
                    <input
                        type="text"
                        value={userId}
                        onChange={(e) => setUserId(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password: </label>
                    <input
                        type="password"
                        value={userPw}
                        onChange={(e) => setUserPw(e.target.value)}
                        required
                    />
                </div>
                <button type="submit">Login</button>
            </form>

            {/* 로그인 실패 시 오류 메시지 출력 */}
            {error && <p style={{ color: 'red' }}>{error}</p>}
        </div>
    );
};

export default Login;