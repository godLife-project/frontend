import axiosInstance from "./axiosInstance";

// 토큰 재발급 요청 상태 관리
let isRefreshing = false;
let refreshSubscribers = [];

// 새로운 토큰이 발급되면 대기 중인 요청들 다시 실행
const onRefreshed = (newToken) => {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
};

// 재발급 함수
export const reissueToken = async () => {
  if (isRefreshing) {
    // 이미 재발급 진행 중이면, Promise를 반환해서 완료 후 이어받게 함
    return new Promise((resolve) => {
      refreshSubscribers.push((newToken) => {
        resolve(newToken);
      });
    });
  }

  isRefreshing = true;

  try {
    const response = await axiosInstance.post("/reissue", {}, { withCredentials: true });
    if (response.data && response.data.status === 200) {
      const authHeader = response.headers.authorization; // "Bearer eyJhbGciOi..."
      const newAccessToken = authHeader.split(" ")[1];

      // localStorage 에 저장
      localStorage.setItem("accessToken", newAccessToken);

      // 대기 중이던 요청들 처리
      onRefreshed(newAccessToken);

      // console.log("✅ 토큰 재발급 성공");
      return newAccessToken;
    } else {
      throw new Error("토큰 재발급 실패");
    }
  } catch (error) {
    console.error("❌ 토큰 재발급 오류:", error);
    localStorage.removeItem("accessToken"); // 혹시 모를 이전 토큰 제거
    localStorage.removeItem("userInfo"); // 혹시 모를 이전 토큰 제거
    localStorage.removeItem("currentUser"); // 혹시 모를 이전 토큰 제거
    window.location.href = "/user/login"; // 로그인 페이지 이동
    throw error;
  } finally {
    isRefreshing = false;
  }
};
