import { useState, useEffect, useCallback } from "react";
import axiosInstance from "../../../../api/axiosInstance";
import {
  reissueToken,
  fetchCertificationData,
} from "../../../../utils/routineUtils";

export default function useRoutineDetail(planIdx, navigate) {
  const [routineData, setRoutineData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isPrivateMessage, setIsPrivateMessage] = useState(false);

  // 인증 관련 상태
  const [certifiedActivities, setCertifiedActivities] = useState({});
  const [certificationStreak, setCertificationStreak] = useState(0);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);

  // fetchRoutineData 함수를 useCallback으로 컴포넌트 레벨에서 정의
  const fetchRoutineData = useCallback(async () => {
    setIsLoading(true);
    try {
      // 로그인 여부 확인
      const userInfoString = localStorage.getItem("userInfo");
      const token = localStorage.getItem("accessToken");

      if (!userInfoString && !token) {
        // 로그인하지 않은 상태에서 비공개 루틴에 접근 시도
        navigate("/user/login");
        return;
      }

      // 루틴 데이터 가져오기
      const response = await axiosInstance.get(`/plan/detail/${planIdx}`);
      const routineData = response.data.message;

      // 비공개 루틴인 경우 권한 체크
      if (!routineData.isShared) {
        // 사용자 정보 가져오기
        const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
        const currentUserIdx = userInfo ? userInfo.userIdx : null;

        if (!currentUserIdx) {
          // 로그인은 되어 있지만 userInfo가 없는 경우
          navigate("/login");
          return;
        }

        // 루틴 작성자와 현재 사용자가 다른 경우
        if (parseInt(currentUserIdx) !== routineData.userIdx) {
          setIsPrivateMessage(true);
          setIsLoading(false);
          return;
        }
      }

      setRoutineData(routineData);

      // 인증 데이터 가져오기
      fetchCertificationData(routineData.planIdx);

      console.log("루틴 데이터:", routineData);

      setError(null);
    } catch (error) {
      console.error("루틴 데이터 가져오기 실패:", error);
      setError("루틴 정보를 불러오는데 실패했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [planIdx, navigate]);

  // 초기 데이터 로드
  useEffect(() => {
    if (planIdx) {
      fetchRoutineData();
    }
  }, [planIdx, fetchRoutineData]);

  // 활동 인증 처리 함수
  const handleActivityCertification = async (activityId) => {
    try {
      console.log(`활동 ID ${activityId} 인증 시도 - 시작`);

      const token = localStorage.getItem("accessToken");
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userIdx = userInfo.userIdx || 1;

      // 인증 데이터 구성
      const certificationData = {
        planIdx: parseInt(planIdx),
        activityId: activityId,
        userIdx: parseInt(userIdx),
        date: new Date().toISOString().split("T")[0],
      };

      console.log(
        "활동 인증 요청 데이터:",
        JSON.stringify(certificationData, null, 2)
      );
      console.log("현재 인증 상태:", certifiedActivities);

      // 인증 상태 업데이트 (실제로는 API 호출 필요)
      const updatedCertifications = {
        ...certifiedActivities,
        [activityId]: true,
      };

      setCertifiedActivities(updatedCertifications);

      // 모든 활동이 인증되었는지 확인
      const allActivities = routineData.activities || [];

      if (allActivities.length > 0) {
        const allCertified = allActivities.every(
          (activity, index) => updatedCertifications[index] === true
        );

        if (allCertified) {
          // 스트릭 증가
          const newStreak = certificationStreak + 1;
          setCertificationStreak(newStreak);

          // 축하 메시지 표시
          setShowCompletionMessage(true);
          setTimeout(() => {
            setShowCompletionMessage(false);
          }, 3000);
        }
      }

      alert(`"${activityId + 1}번 활동"이 인증되었습니다!`);
    } catch (error) {
      console.error("활동 인증 실패:", error);
      alert("인증에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 루틴 시작/완료 처리 함수
  const handleRoutineAction = async (action) => {
    try {
      // 기본 정보 구성
      const userIdx = parseInt(
        JSON.parse(localStorage.getItem("userInfo") || "{}").userIdx || 1
      );

      // 액션에 따른 요청 데이터와 엔드포인트 구성
      let requestData, endpoint;

      if (action === "start") {
        // 루틴 시작하기: stopNgo 엔드포인트 사용, isActive를 1로 설정
        endpoint = "/plan/auth/stopNgo";
        requestData = {
          planIdx: parseInt(planIdx),
          userIdx,
          isActive: 1,
        };
      } else {
        // 루틴 끝내기: earlyComplete 엔드포인트 사용, isCompleted를 1로 설정
        endpoint = "/plan/auth/earlyComplete";
        requestData = {
          planIdx: parseInt(planIdx),
          userIdx,
          isDeleted: 0,
          isCompleted: 1,
        };
      }

      // UI 즉시 업데이트
      setRoutineData((prevData) => ({
        ...prevData,
        isActive: action === "start",
        isCompleted: action === "complete",
      }));

      // API 호출 함수 (토큰 만료 처리 포함)
      const makeRequest = async (authToken) => {
        try {
          return await axiosInstance.patch(endpoint, requestData, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
        } catch (error) {
          if (error.response && error.response.status === 401) {
            // 토큰 재발급
            const newToken = await reissueToken();
            return await axiosInstance.patch(endpoint, requestData, {
              headers: {
                Authorization: `Bearer ${newToken}`,
              },
            });
          }
          throw error;
        }
      };

      // 요청 실행
      const token = localStorage.getItem("accessToken");
      const response = await makeRequest(token);

      // 성공 시 데이터 갱신
      if (response.data.success) {
        alert(
          action === "start" ? "루틴을 시작했습니다!" : "루틴을 끝냈습니다!"
        );

        // 백그라운드에서 최신 데이터 가져오기
        await fetchRoutineData();
      }
    } catch (error) {
      console.error(
        `루틴 ${action === "start" ? "시작" : "끝내기"} 실패:`,
        error
      );

      // 오류 시 원래 상태로 되돌리기
      setRoutineData((prevData) => ({
        ...prevData,
        isActive: action !== "start",
        isCompleted: action !== "complete",
      }));

      // 에러 메시지 표시
      if (error.response) {
        alert(
          `루틴을 ${
            action === "start" ? "시작" : "끝내기"
          }하는데 실패했습니다.\n사유: ${
            error.response.data.message || "알 수 없는 오류"
          }`
        );
      } else {
        alert(
          `루틴을 ${action === "start" ? "시작" : "끝내기"}하는데 실패했습니다.`
        );
      }
    }
  };

  // 리뷰 제출 함수
  const handleSubmitReview = async () => {
    if (!newReview.trim()) return;

    setIsSubmittingReview(true);
    try {
      const token = localStorage.getItem("accessToken");
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userIdx = userInfo.userIdx || 1;

      // 리뷰 데이터 구성
      const reviewData = {
        planIdx: parseInt(planIdx),
        userIdx: parseInt(userIdx),
        review: newReview,
        isCompleted: 1, // 고정 값 (완료된 루틴에만 적용함)
        isDeleted: 0, // 고정 값 (삭제되지 않은 루틴에만 적용함)
      };

      console.log("리뷰 작성 json : ", reviewData);

      // API 요청
      const response = await axiosInstance.patch(
        "/plan/auth/addReview",
        reviewData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // 리뷰 입력창 초기화
        setNewReview("");

        // 성공 메시지 표시
        alert("리뷰가 성공적으로 등록되었습니다.");

        // 데이터 다시 가져오기
        await fetchRoutineData();
      }
    } catch (error) {
      console.error("리뷰 등록 실패:", error);
      alert("리뷰 등록에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // 리뷰 날짜 포맷팅 함수
  const formatReviewDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("ko-KR", options);
  };

  // 루틴 상태에 따른 배지 스타일 결정
  const getStatusBadgeStyle = () => {
    if (!routineData) return "bg-gray-200 text-gray-700";

    if (routineData.isCompleted) {
      return "bg-green-500 text-white";
    } else if (routineData.isActive) {
      return "bg-blue-500 text-white";
    } else {
      return "bg-gray-200 text-gray-700";
    }
  };

  // 루틴 상태에 따른 텍스트 결정
  const getStatusText = () => {
    if (!routineData) return "준비 상태";

    if (routineData.isCompleted) {
      return "완료된 루틴";
    } else if (routineData.isActive) {
      return "진행 중";
    } else {
      return "준비 상태";
    }
  };

  return {
    routineData,
    isLoading,
    error,
    isPrivateMessage,
    certifiedActivities,
    certificationStreak,
    showCompletionMessage,
    reviews,
    newReview,
    setNewReview,
    isSubmittingReview,
    handleSubmitReview,
    formatReviewDate,
    handleActivityCertification,
    handleRoutineAction,
    getStatusBadgeStyle,
    getStatusText,
    fetchRoutineData, // 함수를 외부로 노출
  };
}
