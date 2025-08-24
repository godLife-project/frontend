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

  // fetchLikeStatus 함수 - 루틴의 추천 상태를 가져오는 함수
  const fetchLikeStatus = useCallback(async (planId) => {
    try {
      const token = localStorage.getItem("accessToken");
      if (!token) return null;

      // 추천 상태 확인 API 호출
      const response = await axiosInstance.get(`/plan/checkLike/${planId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // response.data.message가 true/false인 경우 처리
      if (typeof response.data.message === "boolean") {
        // API 응답이 단순 불리언인 경우 포스트맨에서 본 데이터를 유지 (또는 별도 API 호출)
        return {
          isLiked: response.data.message,
          // 여기서는 원래 루틴 데이터의 likeCount 유지
        };
      }

      // 기존 처리 유지 (객체 형태로 오는 경우)
      return response.data.message;
    } catch (error) {
      console.error("루틴 추천 상태 가져오기 실패:", error);
      return null;
    }
  }, []);

  // fetchRoutineData 함수를 useCallback으로 컴포넌트 레벨에서 정의
  const fetchRoutineData = useCallback(async () => {
    setIsLoading(true);
    // 데이터 로드 후 활동 데이터에 activityIdx가 있는지 확인
    if (routineData && routineData.activities) {
      console.log("서버에서 받은 활동 데이터:", routineData.activities);

      // 활동 데이터에 activityIdx가 없으면 경고 로그 출력
      const missingIds = routineData.activities.filter(
        (a) => a.activityIdx === undefined
      );
      if (missingIds.length > 0) {
        console.warn("activityIdx가 없는 활동이 있습니다:", missingIds);
      }
    }

    try {
      // 로그인 여부 확인
      const userInfoString = localStorage.getItem("userInfo");
      const token = localStorage.getItem("accessToken");

      // 루틴 데이터 가져오기
      const response = await axiosInstance.get(`/plan/detail/${planIdx}`);
      const routineData = response.data.message;

      // 비공개 루틴인 경우 권한 체크
      if (!routineData.isShared) {
        // 사용자 정보 가져오기
        const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
        const currentUserIdx = userInfo ? userInfo.userIdx : null;

        // 루틴 작성자와 현재 사용자가 다른 경우
        if (parseInt(currentUserIdx) !== routineData.userIdx) {
          setIsPrivateMessage(true);
          setIsLoading(false);
          return;
        }
      }

      // 추천 상태 가져오기
      if (token) {
        const likeStatus = await fetchLikeStatus(planIdx);
        console.log("좋아요 상태 API 응답:", likeStatus);

        if (likeStatus !== null) {
          // isLiked 값은 항상 설정
          routineData.isLiked = likeStatus.isLiked || false;

          // likeCount는 API에서 제공하는 경우에만 덮어쓰기
          if (likeStatus.likeCount !== undefined) {
            routineData.likeCount = likeStatus.likeCount;
          }
          // likeCount가 없을 경우 원래 값 유지 (API에서 받은 초기값)

          console.log("좋아요 정보 업데이트 후:", routineData);
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
  }, [planIdx, navigate, fetchLikeStatus]);

  // 초기 데이터 로드
  useEffect(() => {
    if (planIdx) {
      fetchRoutineData();
    }
  }, [planIdx, fetchRoutineData]);

  // 활동 인증 처리 함수
  const handleActivityCertification = async (activityIdx) => {
    try {
      console.log(`활동 ID ${activityIdx} 인증 시도 - 시작`);

      const token = localStorage.getItem("accessToken");
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userIdx = userInfo.userIdx || 1;

      // 인증 데이터 구성
      const certificationData = {
        planIdx: parseInt(planIdx),
        activityIdx: activityIdx,
        userIdx: parseInt(userIdx),
      };

      console.log(
        "활동 인증 요청 데이터:",
        JSON.stringify(certificationData, null, 2)
      );

      // API 호출 함수 (토큰 만료 처리 포함)
      const makeRequest = async (authToken) => {
        console.log("인증 json : ", certificationData);
        try {
          return await axiosInstance.post(
            "/verify/auth/routine",
            certificationData,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
        } catch (error) {
          if (error.response && error.response.status === 401) {
            // 토큰 재발급
            const newToken = await reissueToken();
            return await axiosInstance.post(
              "/verify/auth/routine",
              certificationData,
              {
                headers: {
                  Authorization: `Bearer ${newToken}`,
                },
              }
            );
          }
          throw error;
        }
      };

      // API 요청 실행
      const response = await makeRequest(token);

      // 요청이 성공한 경우
      if (
        response.data.success ||
        response.data.status === "success" ||
        response.data.code === 200
      ) {
        // 인증 상태 업데이트
        const updatedCertifications = {
          ...certifiedActivities,
          [activityIdx]: true,
        };

        setCertifiedActivities(updatedCertifications);

        // 모든 활동이 인증되었는지 확인
        const allActivities = routineData.activities || [];

        if (allActivities.length > 0) {
          const allCertified = allActivities.every(
            (activity) => updatedCertifications[activity.activityIdx] === true
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

        alert(`"${activityIdx + 1}번 활동"이 인증되었습니다!`);

        // 최신 데이터로 갱신
        await fetchRoutineData();
      } else {
        console.error("활동 인증 실패:", response.data);
        alert(
          response.data.message || "인증에 실패했습니다. 다시 시도해주세요."
        );
      }
    } catch (error) {
      console.error("활동 인증 실패:", error);

      if (error.response && error.response.data) {
        alert(
          `인증에 실패했습니다: ${
            error.response.data.message || "알 수 없는 오류"
          }`
        );
      } else {
        alert("인증에 실패했습니다. 다시 시도해주세요.");
      }
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

  // 직접 리뷰 텍스트를 받는 handleSubmitReview 함수
  const handleSubmitReview = async (reviewText) => {
    // reviewText가 있으면 사용하고, 없으면 상태의 newReview 사용 (호환성 유지)
    const reviewContent = reviewText || newReview;

    if (!reviewContent.trim()) return;

    setIsSubmittingReview(true);
    try {
      const token = localStorage.getItem("accessToken");
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userIdx = userInfo.userIdx || 1;

      // 리뷰 데이터 구성
      const reviewData = {
        planIdx: parseInt(planIdx),
        userIdx: parseInt(userIdx),
        review: reviewContent,
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

      console.log("리뷰 작성 api :", response);

      if (response.data.status === "success" || response.data.code === 200) {
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

  // 루틴 추천 함수
  const handleLike = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userIdx = userInfo.userIdx || 1;

      if (!token) {
        alert("로그인이 필요한 기능입니다.");
        navigate("/user/login");
        return;
      }

      // 요청 데이터 구성
      const likeData = {
        userIdx: parseInt(userIdx),
      };

      console.log("루틴 추천하기 데이터", likeData);
      // API 요청
      const response = await axiosInstance.post(
        `/plan/auth/likePlan/${planIdx}`,
        likeData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success || response.data.code === 200) {
        // 최신 데이터로 갱신
        await fetchRoutineData();
      } else {
        console.error("추천 실패:", response.data);
        alert(response.data.message || "추천 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("추천 실패:", error);
      if (error.response && error.response.status === 401) {
        // 토큰 만료 시 재발급 처리
        try {
          const newToken = await reissueToken();
          if (newToken) {
            // 토큰 재발급 성공 시 다시 시도
            await handleLike();
          }
        } catch (tokenError) {
          console.error("토큰 재발급 실패:", tokenError);
          alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
          navigate("/user/login");
        }
      } else {
        alert("추천 처리에 실패했습니다. 다시 시도해주세요.");
      }
    }
  };

  // 루틴 추천 취소 함수
  const handleUnlike = async () => {
    try {
      const token = localStorage.getItem("accessToken");
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userIdx = userInfo.userIdx || 1;

      if (!token) {
        alert("로그인이 필요한 기능입니다.");
        navigate("/user/login");
        return;
      }

      // API 요청 (URL 파라미터 방식)
      const response = await axiosInstance.delete(
        `/plan/auth/unLikePlan/${planIdx}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success || response.data.code === 200) {
        // 최신 데이터로 갱신
        await fetchRoutineData();
      } else {
        console.error("추천 취소 실패:", response.data);
        alert(response.data.message || "추천 취소 처리에 실패했습니다.");
      }
    } catch (error) {
      console.error("추천 취소 실패:", error);
      if (error.response && error.response.status === 401) {
        // 토큰 만료 시 재발급 처리
        try {
          const newToken = await reissueToken();
          if (newToken) {
            // 토큰 재발급 성공 시 다시 시도
            await handleUnlike();
          }
        } catch (tokenError) {
          console.error("토큰 재발급 실패:", tokenError);
          alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
          navigate("/user/login");
        }
      } else {
        alert("추천 취소 처리에 실패했습니다. 다시 시도해주세요.");
      }
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
    handleLike, // 추천 함수 추가
    handleUnlike, // 추천 취소 함수 추가
    getStatusBadgeStyle,
    getStatusText,
    fetchRoutineData, // 함수를 외부로 노출
  };
}
