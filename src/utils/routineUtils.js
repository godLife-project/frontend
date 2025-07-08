// src/utils/routineUtils.js
import axiosInstance from "../api/axiosInstance";

// 토큰 재발급 함수
export const reissueToken = async (navigate) => {
  try {
    // 토큰 재발급 요청
    const response = await axiosInstance.post("/reissue", {});

    if (response.data && response.data.success) {
      // 새 토큰 저장
      const newAccessToken = response.data.accessToken;
      localStorage.setItem("accessToken", newAccessToken);

      console.log("토큰이 성공적으로 재발급되었습니다.");
      return newAccessToken;
    } else {
      throw new Error("토큰 재발급에 실패했습니다.");
    }
  } catch (error) {
    console.error("토큰 재발급 오류:", error);
    alert("세션이 만료되었습니다. 다시 로그인해주세요.");
    navigate("/user/login");
    throw error;
  }
};

// 인증 데이터 가져오기
export const fetchCertificationData = async (planIdx) => {
  try {
    // 실제로는 API 호출이 필요합니다
    // const response = await axiosInstance.get(`/plan/certifications/${planIdx}`);
    // return {
    //   certifications: response.data.certifications || {},
    //   streak: response.data.streak || 0
    // };
    
    // 개발용 임시 데이터
    return {
      certifications: {},
      streak: 0
    };
  } catch (error) {
    console.error("인증 데이터 가져오기 실패:", error);
    return { certifications: {}, streak: 0 };
  }
};

// 리뷰 데이터 가져오기
export const fetchReviews = async (planIdx) => {
  try {
    // 실제 API 엔드포인트로 수정 필요
    const response = await axiosInstance.get(`/plan/reviews/${planIdx}`);
    return response.data.reviews || [];
  } catch (error) {
    console.error("리뷰 데이터 가져오기 실패:", error);
    // 임시 더미 데이터
    return [
      {
        id: 1,
        userIdx: 42,
        username: "헬스왕123",
        profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=123",
        content: "매일 실천하기 좋은 루틴이에요! 아침에 하기 딱 좋습니다.",
        rating: 5,
        createdAt: "2023-10-15T09:23:45",
      },
      {
        id: 2,
        userIdx: 56,
        username: "운동초보",
        profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=456",
        content: "처음에는 힘들었지만 2주차부터는 적응이 되네요. 굿!",
        rating: 4,
        createdAt: "2023-10-10T18:11:22",
      },
    ];
  }
};