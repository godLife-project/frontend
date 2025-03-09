// src/components/routine/detail/ReviewSection.jsx
import React from "react";
import { MessageSquare, Send } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/ui/avatar";

const ReviewSection = ({
  reviews,
  newReview,
  setNewReview,
  isSubmittingReview,
  handleSubmitReview,
  formatReviewDate,
}) => {
  return (
    <div className="mt-10">
      <div className="flex items-center gap-2 mb-6">
        <MessageSquare className="w-5 h-5 text-blue-600" />
        <h2 className="text-xl font-bold">루틴 리뷰</h2>
        <span className="text-sm text-gray-500 ml-2">{reviews.length}개</span>
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
                  <img src={review.profileImage} alt={review.username} />
                </Avatar>
                <div className="flex-1">
                  <div className="flex justify-between">
                    <div>
                      <span className="font-semibold">{review.username}</span>
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
  );
};

export default ReviewSection;
