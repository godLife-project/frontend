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

  // 루틴 시작/완료 처리 함수
  const handleRoutineAction = async (action) => {
    try {
      const token = localStorage.getItem("accessToken");
      // 유저 정보에서 userIdx 가져오기
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      const userIdx = userInfo.userIdx || 1;

      // stopNgo API 엔드포인트 사용
      const isActive = action === "start" ? 1 : 0; // 시작하면 1, 끝내면 0

      // 요청 데이터 구성
      const requestData = {
        planIdx: parseInt(planIdx),
        userIdx: parseInt(userIdx),
        isActive: isActive,
      };

      // 콘솔에 요청 데이터 로깅
      console.log("API 요청 데이터:", JSON.stringify(requestData, null, 2));

      const response = await axiosInstance.patch("/plan/stopNgo", requestData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      // 성공 시 데이터 갱신
      if (response.data.success) {
        // 데이터 다시 불러오기
        const updatedResponse = await axiosInstance.get(
          `/plan/detail/${planIdx}`
        );
        setRoutineData(updatedResponse.data.message);

        // 성공 메시지
        alert(
          action === "start" ? "루틴을 시작했습니다!" : "루틴을 끝냈습니다!"
        );
      }
    } catch (error) {
      console.error(
        `루틴 ${action === "start" ? "시작" : "끝내기"} 실패:`,
        error
      );
      console.error(
        "에러 세부 정보:",
        error.response?.data || "응답 데이터 없음"
      );
      alert(
        `루틴을 ${action === "start" ? "시작" : "끝내기"}하는데 실패했습니다.`
      );
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
                    <span className="text-lg font-bold">
                      {routineData.certExp || 0}
                    </span>
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
              <RoutineForm isReadOnly={true} routineData={routineData} />
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
                              {/* <div className="text-yellow-500 text-sm mt-1">
                                {"★".repeat(review.rating)}
                                {"☆".repeat(5 - review.rating)}
                              </div> */}
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

        {/* 개선된 플로팅 액션 버튼 - 메인 컨텐츠 가까이 배치 */}
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
