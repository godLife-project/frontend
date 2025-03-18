// src/components/routine/detail/RoutineStats.jsx
import React from "react";
import { Eye, Heart, Award, Share2, Flame } from "lucide-react";

const RoutineStats = ({
  routineData,
  certificationStreak,
  handleLike,
  handleUnlike,
}) => {
  // 좋아요 상태 확인
  const isLiked = routineData.isLiked || false;

  // 좋아요 클릭 이벤트 핸들러
  const handleLikeClick = () => {
    if (isLiked) {
      // 이미 좋아요 상태이면 취소
      handleUnlike();
    } else {
      // 좋아요 상태가 아니면 추가
      handleLike();
    }
  };

  return (
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

          <div
            className="flex flex-col items-center justify-center p-2 cursor-pointer"
            onClick={handleLikeClick}
          >
            <div
              className="flex items-center mb-1"
              style={{ color: isLiked ? "#FF4136" : "#FF6B6B" }}
            >
              <Heart
                className="w-4 h-4 mr-1"
                fill={isLiked ? "#FF4136" : "none"}
              />
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
  );
};

export default RoutineStats;
