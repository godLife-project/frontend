import React, { memo, useState, useEffect } from "react";
import { MessageSquare, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

/**
 * 로컬 상태를 사용하는 최적화된 ReviewSection
 */
const ReviewSection = memo(
  ({
    reviews = [], // 리뷰 데이터 배열 또는 문자열
    handleSubmitReview, // 부모 컴포넌트의 리뷰 제출 함수
    isSubmittingReview = false, // 제출 중 상태
    formatReviewDate, // 날짜 포맷팅 함수
  }) => {
    // 컴포넌트 내부에서 로컬 상태로 관리
    const [localReview, setLocalReview] = useState("");

    // 리뷰 데이터 처리 - 배열, 문자열 등 다양한 형식 지원
    const reviewsArray = Array.isArray(reviews)
      ? reviews
      : typeof reviews === "string" && reviews.trim() !== ""
      ? [reviews]
      : [];
    const hasReviews = reviewsArray.length > 0;

    // 로컬에서 입력값 변경 처리
    const handleReviewChange = (e) => {
      setLocalReview(e.target.value);
    };

    // 제출 처리 - 리뷰 텍스트를 직접 부모 함수에 전달
    const handleSubmit = () => {
      if (localReview.trim() && handleSubmitReview) {
        console.log("리뷰 제출 시도:", localReview);

        // 리뷰 텍스트를 직접 부모 함수에 전달
        handleSubmitReview(localReview);

        // 제출 후 로컬 입력창 초기화
        setLocalReview("");
      }
    };

    // 디버깅용 리뷰 배열 로그
    console.log("현재 리뷰 배열:", reviewsArray, "리뷰 있음:", hasReviews);

    return (
      <div className="mt-10">
        <div className="flex items-center gap-2 mb-6">
          <MessageSquare className="w-5 h-5 text-blue-600" />
          <h2 className="text-xl font-bold">루틴 리뷰</h2>
          <span className="text-sm text-gray-500 ml-2">
            {reviewsArray.length}개
          </span>
        </div>

        {/* 리뷰 작성 폼 - 리뷰가 없을 때만 표시 */}
        {!hasReviews && (
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
                    value={localReview}
                    onChange={handleReviewChange}
                  />
                  <div className="flex justify-end">
                    <Button
                      onClick={handleSubmit}
                      disabled={isSubmittingReview || !localReview?.trim()}
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
        )}

        {/* 기존 리뷰 목록 */}
        {hasReviews ? (
          <div className="space-y-4">
            {reviewsArray.map((review, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-start gap-3">
                  <Avatar className="w-10 h-10 bg-blue-100">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${index}`}
                      alt="사용자"
                    />
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <div>
                        <span className="font-semibold">사용자</span>
                      </div>
                      <span className="text-xs text-gray-500">
                        {formatReviewDate(
                          review.createdAt || new Date().toISOString()
                        )}
                      </span>
                    </div>
                    <p className="mt-2 text-gray-700">
                      {typeof review === "string"
                        ? review
                        : review.content || review.review || ""}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 text-gray-500">
            아직 리뷰가 없습니다. 리뷰를 작성해보세요!
          </div>
        )}
      </div>
    );
  }
);

export default ReviewSection;
