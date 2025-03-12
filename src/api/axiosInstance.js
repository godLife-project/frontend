import axios from "axios";

const axiosInstance = axios.create({
  baseURL: "https://3a4f-175-117-30-43.ngrok-free.app/api", // Spring Boot 백엔드 API 주소
  headers: {
    "ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json; charset=UTF-8",
    Accept: "application/json; charset=UTF-8",
  },
  withCredentials: true, // 필요한 경우 (JWT, 세션 사용 시)
});
export default axiosInstance;
