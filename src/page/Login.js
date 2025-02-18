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
        setError(''); // 초기화
        // 로그인 처리 로직 추가 (API 호출 등)
        try {
            const response = await fetch('http://localhost:9090/api/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({userId, userPw}),
            });

            if (!response.ok) {
                throw new Error('로그인 실패: 아이디 또는 비밀번호가 잘못되었다고요.');
            }

            const data = await response.json();
            console.log('로그인 성공:', data);

            // ✅ 로그인 성공 시, 메인 페이지(app.js)로 이동
            navigate('/');

        } catch (error) {
            setError(error.message);  // 오류 메시지 상태 업데이트
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