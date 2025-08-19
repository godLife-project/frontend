import axios from "axios";
import { reissueToken } from "./reissueToken";

const axiosInstance = axios.create({
  baseURL: "http://localhost:9090/api", // Spring Boot 백엔드 API 주소
  headers: {
    //"ngrok-skip-browser-warning": "true",
    "Content-Type": "application/json; charset=UTF-8",
    Accept: "application/json; charset=UTF-8",
  },
  withCredentials: true, // 필요한 경우 (JWT, 세션 사용 시)
});

axiosInstance.interceptors.request.use(
  (config) => {
    console.log("++++++++++++++ api 요청 +++++++++++++++++++");
    console.log(config);
    return config;
  },
  (error) => Promise.reject(error)
);

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // 🔹 재발급 요청 자체는 재시도하지 않도록 제외
    if (originalRequest.url === "/reissue") {
      return Promise.reject(error);
    }

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await reissueToken(); // refresh 쿠키 기반 재발급
        originalRequest.headers["Authorization"] = `Bearer ${newToken}`;
        return axiosInstance(originalRequest); // 원래 요청 다시 시도
      } catch (err) {
        console.log(err);
      }
    }

    return Promise.reject(error);
  }
);



export default axiosInstance;
