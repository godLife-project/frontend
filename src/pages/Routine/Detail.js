import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axiosInstance from "../../api/axiosInstance";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import RoutineForm from "../../components/routine/create/RoutineForm";
import { Textarea } from "@/components/ui/textarea";
import { Avatar } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import {
  Calendar,
  Eye,
  Heart,
  Award,
  Share2,
  Play,
  CheckCircle2,
  MessageSquare,
  Send,
  Lock,
  Flame,
} from "lucide-react";

export default function RoutineDetailPage() {
  const { planIdx } = useParams();
  const navigate = useNavigate();
  const [routineData, setRoutineData] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [newReview, setNewReview] = useState("");
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);
  const [isPrivateMessage, setIsPrivateMessage] = useState(false);

  // 인증 관련 상태 추가
  const [certifiedActivities, setCertifiedActivities] = useState({});
  const [certificationStreak, setCertificationStreak] = useState(0);
  const [showCompletionMessage, setShowCompletionMessage] = useState(false);

  useEffect(() => {
    const fetchRoutineData = async () => {
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

        // 인증 데이터 가져오기 (실제 구현 시 API 호출 필요)
        fetchCertificationData(routineData.planIdx);

        // 리뷰 데이터 가져오기
        fetchReviews();

        setError(null);
      } catch (error) {
        console.error("루틴 데이터 가져오기 실패:", error);
        setError("루틴 정보를 불러오는데 실패했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    if (planIdx) {
      fetchRoutineData();
    }
  }, [planIdx, navigate]);

  // 인증 데이터 가져오기 (예시 구현)
  const fetchCertificationData = async (planIdx) => {
    try {
      // 실제로는 API 호출이 필요합니다
      // const response = await axiosInstance.get(`/plan/certifications/${planIdx}`);
      // setCertifiedActivities(response.data.certifications || {});
      // setCertificationStreak(response.data.streak || 0);

      // 개발용 임시 데이터
      setCertifiedActivities({});
      setCertificationStreak(0);
    } catch (error) {
      console.error("인증 데이터 가져오기 실패:", error);
    }
  };

  // 리뷰 데이터 가져오기
  const fetchReviews = async () => {
    try {
      // 실제 API 엔드포인트로 수정 필요
      const response = await axiosInstance.get(`/plan/reviews/${planIdx}`);
      setReviews(response.data.reviews || []);
    } catch (error) {
      console.error("리뷰 데이터 가져오기 실패:", error);
      // 임시 더미 데이터
      setReviews([
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
      ]);
    }
  };

  // 토큰 재발급 함수
  const reissueToken = async () => {
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

  // 활동 인증 처리 함수
  const handleActivityCertification = async (activityId) => {
    try {
      console.log(`활동 ID ${activityId} 인증 시도 - 시작`); // 디버깅용 로그

      const token = localStorage.getItem("accessToken");
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userIdx = userInfo.userIdx || 1;

      // 인증 데이터 구성
      const certificationData = {
        planIdx: parseInt(planIdx),
        activityId: activityId,
        userIdx: parseInt(userIdx),
        date: new Date().toISOString().split("T")[0], // 오늘 날짜 (YYYY-MM-DD 형식)
      };

      console.log(
        "활동 인증 요청 데이터:",
        JSON.stringify(certificationData, null, 2)
      );

      // 현재 인증 상태 확인
      console.log("현재 인증 상태:", certifiedActivities);

      // 실제 API 호출 (구현 필요)
      // const response = await axiosInstance.post("/plan/certify-activity", certificationData, {
      //   headers: {
      //     Authorization: `Bearer ${token}`,
      //   },
      // });

      // 인증 상태 업데이트 (임시 처리)
      const updatedCertifications = {
        ...certifiedActivities,
        [activityId]: true,
      };

      console.log("업데이트된 인증 상태:", updatedCertifications);
      setCertifiedActivities(updatedCertifications);

      // 모든 활동이 인증되었는지 확인
      const allActivities = routineData.activities || [];

      // 활동이 있고, 모든 활동이 인증되었을 때
      if (allActivities.length > 0) {
        const allCertified = allActivities.every(
          (activity, index) => updatedCertifications[index] === true
        );

        console.log("모든 활동 인증 완료 여부:", allCertified);

        // 모든 활동이 인증되면 축하 메시지 표시 및 스트릭 증가
        if (allCertified) {
          console.log("모든 활동 인증 완료!");

          // 스트릭 증가
          const newStreak = certificationStreak + 1;
          setCertificationStreak(newStreak);

          // 축하 메시지 표시
          setShowCompletionMessage(true);
          setTimeout(() => {
            setShowCompletionMessage(false);
          }, 3000); // 3초 후 사라짐
        }
      }

      // 성공 알림
      alert(`"${activityId + 1}번 활동"이 인증되었습니다!`);
      console.log(`활동 ID ${activityId} 인증 완료`);
    } catch (error) {
      console.error("활동 인증 실패:", error);
      alert("인증에 실패했습니다. 다시 시도해주세요.");
    }
  };

  // 루틴 시작/완료 처리 함수
  const handleRoutineAction = async (action) => {
    try {
      // 요청 데이터 구성
      const requestData = {
        planIdx: parseInt(planIdx),
        userIdx: parseInt(
          JSON.parse(localStorage.getItem("userInfo") || "{}").userIdx || 1
        ),
        isActive: action === "start" ? 1 : 0, // 시작하면 1, 끝내면 0
      };

      // UI 즉시 업데이트 (사용자 피드백을 빠르게 제공)
      setRoutineData((prevData) => ({
        ...prevData,
        isActive: action === "start",
        isCompleted: action === "complete",
      }));

      console.log("API 요청 데이터:", JSON.stringify(requestData, null, 2));

      // API 호출 함수 (토큰 만료 처리 포함)
      const makeRequest = async (authToken) => {
        try {
          return await axiosInstance.patch("/plan/auth/stopNgo", requestData, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
        } catch (error) {
          // 토큰 만료 오류 (401) 처리
          if (error.response && error.response.status === 401) {
            console.log("토큰이 만료되었습니다. 재발급을 시도합니다.");
            // 토큰 재발급
            const newToken = await reissueToken();
            // 새 토큰으로 다시 요청
            return await axiosInstance.patch(
              "/plan/auth/stopNgo",
              requestData,
              {
                headers: {
                  Authorization: `Bearer ${newToken}`,
                },
              }
            );
          }
          // 다른 오류는 그대로 던지기
          throw error;
        }
      };

      // 요청 실행
      const token = localStorage.getItem("accessToken");
      const response = await makeRequest(token);

      // 성공 시 데이터 갱신
      if (response.data.success) {
        // 성공 메시지
        alert(
          action === "start" ? "루틴을 시작했습니다!" : "루틴을 끝냈습니다!"
        );

        // 백그라운드에서 최신 데이터 가져오기
        try {
          const updatedResponse = await axiosInstance.get(
            `/plan/detail/${planIdx}`
          );
          setRoutineData(updatedResponse.data.message);
        } catch (error) {
          console.error("루틴 데이터 갱신 실패:", error);
        }
      }
    } catch (error) {
      console.error(
        `루틴 ${action === "start" ? "시작" : "끝내기"} 실패:`,
        error
      );

      // 오류 시 원래 상태로 되돌리기
      setRoutineData((prevData) => ({
        ...prevData,
        isActive: action !== "start", // 반대로 설정하여 원래 상태로 복원
        isCompleted: action !== "complete",
      }));

      // 더 자세한 에러 정보 표시
      if (error.response) {
        console.error("에러 세부 정보:", error.response.data);
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
        content: newReview,
        rating: 5, // 별점 기능을 추가할 경우 사용
      };

      console.log("리뷰 제출 데이터:", JSON.stringify(reviewData, null, 2));

      // 실제 API 엔드포인트로 수정 필요
      const response = await axiosInstance.post("/plan/review", reviewData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data.success) {
        // 리뷰 목록 갱신
        fetchReviews();
        // 입력 필드 초기화
        setNewReview("");
        alert("리뷰가 성공적으로 등록되었습니다.");
      }
    } catch (error) {
      console.error("리뷰 등록 실패:", error);
      console.error(
        "에러 세부 정보:",
        error.response?.data || "응답 데이터 없음"
      );
      alert("리뷰 등록에 실패했습니다.");

      // 실제 API가 없으므로 임시로 동작을 구현 (개발 중에만 사용)
      const newReviewObj = {
        id: Date.now(),
        userIdx: 1,
        username: "현재사용자",
        profileImage: "https://api.dicebear.com/7.x/avataaars/svg?seed=789",
        content: newReview,
        rating: 5,
        createdAt: new Date().toISOString(),
      };
      setReviews([newReviewObj, ...reviews]);
      setNewReview("");
    } finally {
      setIsSubmittingReview(false);
    }
  };

  // 리뷰 날짜 포맷팅 함수
  const formatReviewDate = (dateString) => {
    const options = { year: "numeric", month: "long", day: "numeric" };
    return new Date(dateString).toLocaleDateString("ko-KR", options);
  };

  // 비공개 루틴 메시지 표시
  if (isPrivateMessage) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8 flex justify-center items-center">
        <Card className="max-w-md w-full p-8 text-center">
          <div className="flex flex-col items-center space-y-4">
            <Lock className="w-16 h-16 text-gray-400" />
            <h1 className="text-2xl font-bold text-gray-800">
              비공개 루틴입니다
            </h1>
            <p className="text-gray-600">
              이 루틴은 작성자만 볼 수 있는 비공개 루틴입니다.
            </p>
            <Button onClick={() => navigate("/")}>홈으로 돌아가기</Button>
          </div>
        </Card>
      </div>
    );
  }

  if (isLoading)
    return (
      <div className="flex justify-center items-center min-h-screen">
        로딩 중...
      </div>
    );
  if (error)
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error}
      </div>
    );
  if (!routineData)
    return (
      <div className="flex justify-center items-center min-h-screen">
        루틴 정보를 찾을 수 없습니다.
      </div>
    );

  // 루틴 상태에 따른 배지 스타일 결정
  const getStatusBadgeStyle = () => {
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
    if (routineData.isCompleted) {
      return "완료된 루틴";
    } else if (routineData.isActive) {
      return "진행 중";
    } else {
      return "준비 상태";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8 relative">
      {/* 모든 활동 완료 축하 메시지 */}
      {showCompletionMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          <div className="bg-gradient-to-r from-green-500 to-blue-500 rounded-lg p-8 text-center text-white animate-pulse shadow-lg">
            <CheckCircle2 className="w-12 h-12 text-white mx-auto mb-2" />
            <h2 className="text-2xl font-bold">오늘의 루틴 완료!</h2>
            <p className="mt-2">
              훌륭해요! 목표를 향해 한 걸음 더 나아갔습니다.
            </p>
            {certificationStreak > 0 && (
              <div className="mt-2 flex items-center justify-center">
                <Flame className="w-5 h-5 text-yellow-300 mr-1" />
                <span className="font-semibold">
                  {certificationStreak}일 연속 달성 중
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 relative">
        <Card className="overflow-hidden shadow-lg">
          {/* 헤더 부분 */}
          <div className="relative">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 pb-16 text-white">
              {/* 루틴 상태 배지 */}
              <div className="absolute top-4 right-4 flex items-center space-x-2">
                {!routineData.isShared && (
                  <span className="px-3 py-1 rounded-full text-sm font-medium bg-gray-700 text-white flex items-center gap-1">
                    <Lock className="w-3 h-3" /> 비공개
                  </span>
                )}
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeStyle()}`}
                >
                  {getStatusText()}
                </span>
              </div>

              {/* 루틴 제목 */}
              <h1 className="text-3xl font-bold mb-2">
                {routineData.planTitle}
              </h1>

              {/* 루틴 생성 날짜 */}
              <div className="flex items-center text-blue-100 mb-6">
                <Calendar className="w-4 h-4 mr-1" />
                <span className="text-sm">
                  {new Date(routineData.planSubDate).toLocaleDateString()}에
                  생성됨
                </span>
              </div>
            </div>

            {/* 통계 정보 카드 */}
            <div className="absolute left-0 right-0 bottom-0 transform translate-y-1/2 px-8">
              <div className="bg-white rounded-lg shadow-md p-4">
                <div className="grid grid-cols-4 divide-x divide-gray-200">
                  <div className="flex flex-col items-center justify-center p-2">
                    <div className="flex items-center text-blue-600 mb-1">
                      <Eye className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">조회</span>
                    </div>
                    <span className="text-lg font-bold">
                      {routineData.viewCount || 0}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-2">
                    <div className="flex items-center text-red-500 mb-1">
                      <Heart className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">좋아요</span>
                    </div>
                    <span className="text-lg font-bold">
                      {routineData.likeCount || 0}
                    </span>
                  </div>

                  <div className="flex flex-col items-center justify-center p-2">
                    <div className="flex items-center text-yellow-500 mb-1">
                      <Award className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">인증</span>
                    </div>
                    <div className="flex items-center">
                      <span className="text-lg font-bold">
                        {routineData.certExp || 0}
                      </span>
                      {certificationStreak > 0 && (
                        <div className="flex items-center ml-2 bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full text-xs">
                          <Flame className="w-3 h-3 mr-1" />
                          {certificationStreak}일째
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col items-center justify-center p-2">
                    <div className="flex items-center text-green-500 mb-1">
                      <Share2 className="w-4 h-4 mr-1" />
                      <span className="text-sm font-medium">공유</span>
                    </div>
                    <span className="text-lg font-bold">
                      {routineData.isShared ? "공개" : "비공개"}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 본문 내용 */}
          <CardContent className="p-8 pt-16">
            <div className="space-y-6 mt-4">
              {/* 수정된 RoutineForm 사용 - 활동별 인증 기능 적용 */}
              <RoutineForm
                isReadOnly={true}
                routineData={routineData}
                isActive={!!routineData.isActive} // 불리언 값으로 확실하게 변환
                certifiedActivities={certifiedActivities}
                onCertifyActivity={handleActivityCertification}
              />
            </div>

            {/* 리뷰 섹션 */}
            <div className="mt-10">
              <div className="flex items-center gap-2 mb-6">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <h2 className="text-xl font-bold">루틴 리뷰</h2>
                <span className="text-sm text-gray-500 ml-2">
                  {reviews.length}개
                </span>
              </div>

              {/* 리뷰 작성 폼 */}
              <Card className="mb-6">
                <CardContent className="p-4">
                  <div className="flex gap-3">
                    <Avatar className="w-10 h-10 bg-blue-100">
                      <img
                        src="https://api.dicebear.com/7.x/avataaars/svg?seed=current"
                        alt="프로필"
                      />
                    </Avatar>
                    <div className="flex-1">
                      <Textarea
                        placeholder="이 루틴에 대한 경험을 공유해보세요..."
                        className="resize-none mb-2"
                        value={newReview}
                        onChange={(e) => setNewReview(e.target.value)}
                      />
                      <div className="flex justify-end">
                        <Button
                          onClick={handleSubmitReview}
                          disabled={isSubmittingReview || !newReview.trim()}
                          className="flex items-center gap-1"
                        >
                          <Send className="w-4 h-4" />
                          리뷰 등록
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* 리뷰 목록 */}
              {reviews.length > 0 ? (
                <div className="space-y-4">
                  {reviews.map((review) => (
                    <div key={review.id} className="p-4 bg-gray-50 rounded-lg">
                      <div className="flex items-start gap-3">
                        <Avatar className="w-10 h-10 bg-blue-100">
                          <img
                            src={review.profileImage}
                            alt={review.username}
                          />
                        </Avatar>
                        <div className="flex-1">
                          <div className="flex justify-between">
                            <div>
                              <span className="font-semibold">
                                {review.username}
                              </span>
                            </div>
                            <span className="text-xs text-gray-500">
                              {formatReviewDate(review.createdAt)}
                            </span>
                          </div>
                          <p className="mt-2 text-gray-700">{review.content}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-10 text-gray-500">
                  아직 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 플로팅 버튼 */}
        {!routineData.isCompleted && (
          <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-50 transition-all duration-300 ease-in-out">
            {!routineData.isActive ? (
              <Button
                onClick={() => handleRoutineAction("start")}
                className="bg-green-500 hover:bg-green-600 text-white shadow-lg px-6 py-3 rounded-full flex items-center gap-2 text-base font-medium"
              >
                <Play className="w-5 h-5" />
                루틴 시작하기
              </Button>
            ) : (
              <Button
                onClick={() => handleRoutineAction("complete")}
                className="bg-blue-500 hover:bg-blue-600 text-white shadow-lg px-6 py-3 rounded-full flex items-center gap-2 text-base font-medium"
              >
                <CheckCircle2 className="w-5 h-5" />
                루틴 끝내기
              </Button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
