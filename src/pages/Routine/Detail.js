// src/pages/RoutineDetailPage.jsx
import React from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Lock } from "lucide-react";

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

  // 모든 데이터와 로직을 커스텀 훅으로 이동
  const {
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
  } = useRoutineDetail(planIdx, navigate);

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

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8 relative">
      {/* 모든 활동 완료 축하 메시지 */}
      {showCompletionMessage && (
        <div className="fixed inset-0 flex items-center justify-center z-50 pointer-events-none">
          {/* 축하 메시지 컨텐츠 */}
        </div>
      )}

      <div className="max-w-3xl mx-auto px-4 relative">
        <Card className="overflow-hidden shadow-lg">
          {/* 헤더 부분 */}
          <div className="relative">
            <RoutineHeader
              routineData={routineData}
              getStatusBadgeStyle={getStatusBadgeStyle}
              getStatusText={getStatusText}
            />

            {/* 통계 정보 카드 */}
            <RoutineStats
              routineData={routineData}
              certificationStreak={certificationStreak}
            />
          </div>

          {/* 본문 내용 */}
          <CardContent className="p-8 pt-16">
            <div className="space-y-6 mt-4">
              {/* 수정된 RoutineForm 사용 - 활동별 인증 기능 적용 */}
              <RoutineForm
                isReadOnly={true}
                routineData={routineData}
                isActive={!!routineData.isActive}
                certifiedActivities={certifiedActivities}
                onCertifyActivity={handleActivityCertification}
              />
            </div>

            {/* 리뷰 섹션 */}
            <ReviewSection
              reviews={reviews}
              newReview={newReview}
              setNewReview={setNewReview}
              isSubmittingReview={isSubmittingReview}
              handleSubmitReview={handleSubmitReview}
              formatReviewDate={formatReviewDate}
            />
          </CardContent>
        </Card>

        {/* 플로팅 버튼 */}
        <FloatingActionButton
          routineData={routineData}
          handleRoutineAction={handleRoutineAction}
        />
      </div>
    </div>
  );
}
