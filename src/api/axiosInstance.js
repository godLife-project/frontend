import axios from "axios";

axios.defaults.withCredentials = true;

const axiosInstance = axios.create({
  baseURL: "https://0ef8-182-229-89-82.ngrok-free.app/api", // Spring Boot 백엔드 API 주소
  headers: {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json; charset=UTF-8",
    Accept: "application/json; charset=UTF-8",
  },
  withCredentials: true, // 필요한 경우 (JWT, 세션 사용 시)
});

export default axiosInstance;
