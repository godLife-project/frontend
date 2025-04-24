// Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
    const [userId, setUserId] = useState('');
    const [userPw, setUserPw] = useState('');
    const [error, setError] = useState('');  // 오류 메시지 상태 추가
    const navigate = useNavigate(); // 페이지 이동을 위한 Hook

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch('http://localhost:9090/api/user/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ userId, userPw }),
            });

            if (!response.ok) {
                throw new Error('로그인 실패: 아이디 또는 비밀번호가 잘못되었습니다.');
            }

            // ✅ accessToken은 응답 헤더의 Authorization에 있음
            const accessTokenHeader = response.headers.get('Authorization');
            if (accessTokenHeader) {
                // "Bearer " 접두어 제거
                const token = accessTokenHeader.replace(/^Bearer\s+/i, '');
                localStorage.setItem('accessToken', token);
                console.log('✅ AccessToken 저장 완료:', token);
            } else {
                console.warn('⚠️ 응답에 Authorization 헤더가 없습니다.');
            }


            const data = await response.json();
            console.log('로그인 성공:', data);

            // 🎯 닉네임을 로컬스토리지에 저장
            if (data.userNick) {
                localStorage.setItem('userNick', data.userNick);
                localStorage.setItem('userName', data.userName);
                console.log('✅ 닉네임 저장 완료:', data.userNick, data.userName);
            }

            navigate('/'); // 로그인 성공 시 메인으로 이동
        } catch (error) {
            setError(error.message);
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