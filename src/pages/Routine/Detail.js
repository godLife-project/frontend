// src/pages/RoutineDetailPage.jsx
import React, { useCallback, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock, Edit } from "lucide-react";

// API 및 유틸리티
import axiosInstance from "../../api/axiosInstance";
import { reissueToken } from "../../utils/routineUtils";

// 컴포넌트
import RoutineForm from "../../components/routine/create/RoutineForm";
import RoutineHeader from "../../components/routine/detail/RoutineHeader";
import RoutineStats from "../../components/routine/detail/RoutineStats";
import ReviewSection from "../../components/routine/detail/ReviewSection";
import FloatingActionButton from "../../components/routine/detail/FloatingActionButton";

// 커스텀 훅
import useRoutineDetail from "../../components/routine/detail/hooks/useRoutineDetail";

export default function RoutineDetailPage() {
  const { planIdx } = useParams();
  const navigate = useNavigate();

  // 수정 모드 상태 추가
  const [isEditMode, setIsEditMode] = useState(false);

  // 모든 데이터와 로직을 커스텀 훅으로 이동
  const {
    routineData,
    isLoading,
    error,
    isPrivateMessage,
    certifiedActivities,
    certificationStreak,
    showCompletionMessage,
    // 리뷰 관련 함수들
    setNewReview,
    isSubmittingReview,
    handleSubmitReview,
    formatReviewDate,
    // 다른 함수들
    handleActivityCertification,
    handleRoutineAction,
    handleLike, // 좋아요 추가 함수
    handleUnlike, // 좋아요 취소 함수
    getStatusBadgeStyle,
    getStatusText,
    fetchRoutineData, // 데이터 갱신 함수
  } = useRoutineDetail(planIdx, navigate);

  console.log("루틴 정보 :", routineData);

  // 리뷰 제출 처리 함수 - useCallback으로 메모이제이션
  const handleReviewSubmit = useCallback(
    (reviewText) => {
      // 부모 컴포넌트 상태 업데이트
      setNewReview(reviewText);
      // 제출 처리
      handleSubmitReview();
    },
    [setNewReview, handleSubmitReview]
  );

  // 수정 모드 토글 함수
  const toggleEditMode = () => {
    const newEditMode = !isEditMode;
    console.log("수정 모드 전환:", newEditMode);
    setIsEditMode(newEditMode);
  };

  // 수정된 데이터 저장 처리 함수
  const handleSaveChanges = async (formData) => {
    console.log("수정된 데이터:", formData);

    // requestData 준비
    const requestData = {
      ...formData,
      planIdx: planIdx, // URL 파라미터에서 가져온 planIdx 추가
    };

    // jobIdx가 999가 아니고 jobEtcCateDTO가 설정된 경우 null로 변경 (루틴 생성과 동일한 로직)
    if (requestData.jobIdx !== 999 && requestData.jobEtcCateDTO) {
      requestData.jobEtcCateDTO = null;
    }

    let token = localStorage.getItem("accessToken");

    try {
      // 루틴 수정 API 호출 함수
      const updateRoutine = async (authToken) => {
        try {
          const response = await axiosInstance.patch(
            "/plan/auth/modify",
            requestData,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          return response;
        } catch (error) {
          // 토큰 만료 오류 (401) 처리
          if (error.response && error.response.status === 401) {
            console.log("토큰이 만료되었습니다. 재발급을 시도합니다.");
            // 토큰 재발급 - utils의 함수 사용
            const newToken = await reissueToken(navigate);
            // 새 토큰으로 다시 요청
            return await axiosInstance.post("/plan/auth/modify", requestData, {
              headers: {
                Authorization: `Bearer ${newToken}`,
              },
            });
          }
          // 다른 오류는 그대로 던지기
          throw error;
        }
      };

      // API 호출
      const response = await updateRoutine(token);
      console.log("루틴 수정 성공:", response.data);

      // 성공 메시지
      alert("루틴이 성공적으로 수정되었습니다!");

      // 수정 모드 해제
      setIsEditMode(false);

      // 데이터 리프레시 함수 호출
      fetchRoutineData();
    } catch (error) {
      console.error("루틴 수정 실패:", error);
      if (error.response) {
        console.error("응답 데이터:", error.response.data);
        console.error("응답 상태:", error.response.status);
        alert(
          `루틴 수정 실패: ${
            error.response.data.message || "알 수 없는 오류가 발생했습니다."
          }`
        );
      } else if (error.request) {
        console.error("요청 실패:", error.request);
        alert("서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.");
      } else {
        console.error("오류 메시지:", error.message);
        alert("요청 중 오류가 발생했습니다.");
      }

      // 오류가 발생해도 수정 모드는 유지
      // setIsEditMode(false); // 오류 시에도 수정 모드를 해제하려면 주석 해제
    }
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

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        로딩 중...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex justify-center items-center min-h-screen text-red-500">
        {error}
      </div>
    );
  }

  if (!routineData) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        루틴 정보를 찾을 수 없습니다.
      </div>
    );
  }

  // 사용자가 루틴의 소유자인지 확인
  const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
  const isOwner = parseInt(userInfo.userIdx) === parseInt(routineData.userIdx);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8 relative">
      {/* 모든 활동 완료 축하 메시지 */}
      {showCompletionMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          {/* 축하 메시지 컨텐츠 */}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 relative">
        {/* 루틴 소유자인 경우에만 수정 버튼 표시하고, 수정 모드가 아닌 경우에만 표시 */}
        {isOwner && !routineData.isCompleted && !isEditMode && (
          <div className="flex justify-end mb-4">
            <Button
              onClick={toggleEditMode}
              className="bg-blue-500"
              variant="default"
            >
              <Edit className="w-4 h-4 mr-2" />
              수정하기
            </Button>
          </div>
        )}

        <Card className="overflow-hidden shadow-lg">
          {/* 헤더 부분 */}
          <div className="relative">
            <RoutineHeader
              routineData={routineData}
              getStatusBadgeStyle={getStatusBadgeStyle}
              getStatusText={getStatusText}
            />

            {/* 통계 정보 카드 - 좋아요 함수 추가 */}
            <RoutineStats
              routineData={routineData}
              certificationStreak={certificationStreak}
              handleLike={handleLike}
              handleUnlike={handleUnlike}
            />
          </div>

          {/* 본문 내용 */}
          <CardContent className="p-8 pt-16">
            <div className="space-y-6 mt-4">
              {/* RoutineForm - isReadOnly를 isEditMode 상태에 따라 설정, onSubmit을 수정 모드일 때만 전달 */}
              <RoutineForm
                isReadOnly={!isEditMode} // 수정 모드일 때는 읽기 전용 아님
                routineData={routineData}
                isActive={!!routineData.isActive}
                certifiedActivities={certifiedActivities}
                onCertifyActivity={handleActivityCertification}
                onSubmit={isEditMode ? handleSaveChanges : undefined}
                isEditMode={isEditMode} // 이 prop을 RoutineForm에 전달
              />
            </div>

            {/* 수정 모드가 아닐 때만 리뷰 섹션 표시 */}
            {!isEditMode && (
              <ReviewSection
                reviews={routineData.review}
                handleSubmitReview={(reviewText) => {
                  console.log("부모에서 리뷰 제출 함수 호출됨:", reviewText);
                  // 부모 상태 설정
                  setNewReview(reviewText);
                  // 원래 제출 함수 호출
                  handleSubmitReview(reviewText);
                }}
                isSubmittingReview={isSubmittingReview}
                formatReviewDate={formatReviewDate}
              />
            )}
          </CardContent>
        </Card>

        {/* 플로팅 버튼 - 수정 모드가 아닐 때만 표시 */}
        {!isEditMode && (
          <FloatingActionButton
            routineData={routineData}
            handleRoutineAction={handleRoutineAction}
          />
        )}
      </div>
    </div>
  );
}
