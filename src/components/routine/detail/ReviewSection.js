import React from "react";
import { MessageSquare, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

const ReviewSection = ({
  reviews = "", // 기본값으로 빈 문자열 설정
  newReview = "",
  setNewReview,
  isSubmittingReview = false,
  handleSubmitReview,
  formatReviewDate,
}) => {
  // 리뷰가 있는지 확인 (문자열이 빈 값이 아닌지)
  const hasReview =
    reviews && typeof reviews === "string" && reviews.trim() !== "";

  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold">루틴 리뷰</h2>
        <span className="text-sm text-gray-500 ml-2">
          {hasReview ? "1개" : "0개"}
        </span>
      </div>

      {/* 리뷰 작성 폼 - 리뷰가 없을 때만 표시 */}
      {!hasReview && (
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
                  onChange={(e) => setNewReview?.(e.target.value)}
                />
                <div className="flex justify-end">
                  <Button
                    onClick={handleSubmitReview}
                    disabled={isSubmittingReview || !newReview?.trim()}
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

      {/* 리뷰 표시 영역 */}
      {hasReview ? (
        <div className="space-y-4">
          <div className="p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start gap-3">
              <Avatar className="w-10 h-10 bg-blue-100">
                <img
                  src="https://api.dicebear.com/7.x/avataaars/svg?seed=fallback"
                  alt="사용자"
                />
              </Avatar>
              <div className="flex-1">
                <div className="flex justify-between">
                  <div>
                    <span className="font-semibold">사용자</span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {formatReviewDate(new Date().toISOString())}
                  </span>
                </div>
                <p className="mt-2 text-gray-700">{reviews}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center py-10 text-gray-500">
          아직 리뷰가 없습니다. 첫 번째 리뷰를 작성해보세요!
        </div>
      )}
    </div>
  );
};

export default ReviewSection;
