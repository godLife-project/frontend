import React from "react";
import { Eye, Heart, Share2, GitFork } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RoutineStats = ({
  routineData,
  certificationStreak,
  handleLike,
  handleUnlike,
}) => {
  const navigate = useNavigate();

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

  // Fork 클릭 이벤트 핸들러 추가
  const handleForkClick = () => {
    // repeatDays 데이터 처리 - 서로 다른 형식을 올바르게 처리
    let repeatDays = ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]; // 기본값

    if (routineData.repeatDays) {
      // repeatDays가 배열이면 그대로 사용
      if (Array.isArray(routineData.repeatDays)) {
        repeatDays = routineData.repeatDays;
      }
      // repeatDays가 문자열이면 배열로 변환 (쉼표로 구분된 경우)
      else if (
        typeof routineData.repeatDays === "string" &&
        routineData.repeatDays.includes(",")
      ) {
        repeatDays = routineData.repeatDays.split(",");
      }
      // 다른 형식이면 기본값 유지
    }

    // 현재 루틴 데이터를 세션 스토리지에 저장
    sessionStorage.setItem(
      "forkRoutineData",
      JSON.stringify({
        planTitle: `${routineData.planTitle} (복사본)`,
        endTo: routineData.endTo,
        targetIdx: routineData.targetIdx,
        isShared: routineData.isShared,
        planImp: routineData.planImp,
        jobIdx: routineData.jobIdx,
        jobEtcCateDTO: routineData.jobEtcCateDTO,
        activities: routineData.activities.map((activity) => ({
          activityTitle: activity.activityTitle,
          description: activity.description || "",
        })),
        // 반드시 배열 형태로 저장
        repeatDays: repeatDays,
      })
    );

    // 루틴 생성 페이지로 이동
    navigate("/routine/create");
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

          {/* Fork 클릭 이벤트 추가 */}
          <div
            className="flex flex-col items-center justify-center p-2 cursor-pointer hover:bg-purple-50 transition-colors rounded"
            onClick={handleForkClick}
          >
            <div className="flex items-center text-purple-500 mb-1">
              <GitFork className="w-4 h-4 mr-1" />
              <span className="text-sm font-medium">포크</span>
            </div>
            <span className="text-lg font-bold">
              {routineData.forkCount || 0}
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
  );
};

export default RoutineStats;
