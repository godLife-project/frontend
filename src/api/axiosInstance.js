import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: 'http://localhost:9090/api', // Spring Boot 백엔드 API 주소
    headers: {
        'Content-Type': 'application/json',
    },
    withCredentials: true, // 필요한 경우 (JWT, 세션 사용 시)
});

export default axiosInstance;