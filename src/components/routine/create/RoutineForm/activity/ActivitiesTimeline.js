import React, { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import { Clock, AlertCircle, FileText, Star, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

function ActivitiesTimeline({
  control,
  certifiedActivities = {},
  isActive = false,
  onCertifyActivity = null, // 인증 기능 추가
}) {
  const activities = useWatch({
    control,
    name: "activities",
    defaultValue: [],
  });

  const [sortedActivities, setSortedActivities] = useState([]);

  // 루틴 상태 디버깅
  useEffect(() => {
    console.log("ActivitiesTimeline Props:", {
      isActive,
      certifiedActivities,
      hasActivities: activities && activities.length > 0,
      hasCallback: !!onCertifyActivity,
    });
  }, [isActive, certifiedActivities, activities, onCertifyActivity]);

  // 활동을 시간순으로 정렬
  useEffect(() => {
    if (!activities.length) {
      setSortedActivities([]);
      return;
    }

    console.log("원본 활동 데이터:", activities);

    // 모든 시작 시간을 분으로 변환하여 정렬
    const processedActivities = activities.map((activity) => {
      let startMinutes = null;
      let formattedStart = null;

      if (activity.setTime) { // null 체크
        const [hours, minutes] = activity.setTime.split(":").map(Number);
        startMinutes = hours * 60 + minutes;
        formattedStart = formatTime(startMinutes);
      }

      return {
        ...activity,
        startMinutes,
        formattedStart,
      };
    });

    // 시작 시간순으로 정렬
    const sorted = [...processedActivities].sort(
      (a, b) => a.startMinutes - b.startMinutes
    );
    setSortedActivities(sorted);
  }, [activities]);

  // 분 단위를 HH:MM 형식으로 변환
  function formatTime(totalMinutes) {
    // totalMinutes가 undefined, null, NaN 등인 경우 기본값 제공
    if (
      totalMinutes === undefined ||
      totalMinutes === null ||
      isNaN(totalMinutes)
    ) {
      return "00:00"; // 또는 다른 기본값
    }

    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}`;
  }

  // 중요도 별 표시 컴포넌트
  const ImportanceStars = ({ importance }) => {
    return (
      <div className="flex">
        {[...Array(5)].map((_, i) => (
          <Star
            key={i}
            className={`h-3 w-3 ${
              i < importance
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            }`}
          />
        ))}
      </div>
    );
  };

  // 수직 타임라인 항목 컴포넌트
  const TimelineItem = ({ activity, isLast, index }) => {
    const hasMemo = activity.description && activity.description.trim() !== "";
    const importance = activity.activityImp;

    // 인증 상태 확인 - activityIdx 기반으로 수정
    const isCertified = certifiedActivities[activity.activityIdx] === true;

    // 중요도에 따른 배경색 (더 연한 색상으로 변경)
    const getColor = (importance, isCertified) => {
      // 인증 완료된 활동은 연한 녹색 배경으로 표시
      if (isCertified && isActive) {
        return "bg-green-50 border-l-4 border-green-500";
      }

      // 인증되지 않은 경우 기존 중요도별 색상 적용
      switch (importance) {
        case 5:
          return "bg-red-50 border-l-4 border-red-400";
        case 4:
          return "bg-orange-50 border-l-4 border-orange-400";
        case 3:
          return "bg-yellow-50 border-l-4 border-yellow-400";
        case 2:
          return "bg-blue-50 border-l-4 border-blue-400";
        case 1:
        default:
          return "bg-slate-50 border-l-4 border-slate-400";
      }
    };

    const colorClass = getColor(importance, isCertified);

    // 인증 버튼 클릭 핸들러
    const handleCertify = () => {
      if (onCertifyActivity) {
        console.log(`인증 버튼 클릭: 활동 서버 ID ${activity.activityIdx}`);
        onCertifyActivity(activity.activityIdx);
      }
    };

    return (
      <div className="flex items-start mb-2">
        {/* 시간선 */}
        <div className="flex flex-col items-center mr-4">
          <div
            className={`rounded-full w-6 h-6 ${
              isCertified && isActive ? "bg-green-500" : "bg-blue-500"
            } text-white flex items-center justify-center text-xs`}
          >
            {isCertified && isActive ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              index + 1
            )}
          </div>
          <div className="text-xs font-medium text-blue-600">
            {activity.formattedStart}
          </div>
          {!isLast && (
            <div className="w-0.5 bg-blue-200 h-12 my-1 ml-0.5"></div>
          )}
        </div>

        {/* 활동 내용 */}
        <div
          className={`${colorClass} rounded-lg p-3 shadow-sm flex-1 hover:shadow-md transition-shadow`}
        >
          <div className="flex justify-between items-start">
            <div className="flex items-center gap-2">
              <h4 className="font-medium text-slate-700">
                {activity.activityName || "무제 활동"}
              </h4>
              {/* 인증 완료 배지 */}
              {isCertified && isActive && (
                <span className="px-1.5 py-0.5 bg-green-100 text-green-700 rounded-full text-xs flex items-center">
                  <CheckCircle2 className="h-3 w-3 mr-0.5" />
                  완료
                </span>
              )}
            </div>
            <div className="flex flex-col items-end">
              <ImportanceStars importance={importance} />
            </div>
          </div>

          {hasMemo && (
            <div className="mt-2 text-xs text-slate-600 flex items-center">
              <FileText className="h-3 w-3 mr-1 text-blue-400 flex-shrink-0" />
              <span className="line-clamp-1">{activity.description}</span>
            </div>
          )}

          {/* 인증 버튼 추가 - 디버깅 정보 포함 */}
          {isActive && !isCertified && onCertifyActivity && (
            <div className="mt-2 flex justify-end">
              <Button
                size="sm"
                variant="outline"
                className="text-green-600 border-green-200 hover:bg-green-50 flex items-center gap-1 text-xs py-1 h-7"
                onClick={handleCertify}
              >
                <CheckCircle2 className="h-3 w-3" />
                인증하기
              </Button>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 디버깅을 위한 출력
  const renderActiveStatus = () => {
    if (!isActive) {
      return (
        <div className="p-2 mb-4 bg-yellow-50 border border-yellow-200 rounded text-yellow-700 text-sm">
          <AlertCircle className="inline-block h-4 w-4 mr-1" />이 루틴이
          활성화되지 않았습니다. 루틴을 시작하면 인증 버튼이 표시됩니다.
        </div>
      );
    }
    return null;
  };

  // 메인 렌더링
  return (
    <div className="mt-4">
      <div className="border rounded-lg p-4 bg-white shadow-inner">
        {/* 타이틀과 색상 가이드 영역 */}
        <div className="mb-4 flex justify-between items-start">
          {/* 타이틀 */}
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-blue-600" />
            <h4 className="text-sm font-semibold text-blue-700">
              하루 일정 타임라인
            </h4>
          </div>

          {/* 중요도 색상 가이드 */}
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-1 text-xs text-slate-600 mb-1">
              <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
              <span>중요도에 따른 테두리 색상:</span>
            </div>
            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-red-400 rounded-sm"></div>
                <span>매우 높음</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-orange-400 rounded-sm"></div>
                <span>높음</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-yellow-400 rounded-sm"></div>
                <span>보통</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-blue-400 rounded-sm"></div>
                <span>낮음</span>
              </div>
              <div className="flex items-center gap-1">
                <div className="w-3 h-3 bg-slate-400 rounded-sm"></div>
                <span>매우 낮음</span>
              </div>
              {/* 인증 완료 색상 가이드 추가 */}
              {isActive && (
                <div className="flex items-center gap-1">
                  <div className="w-3 h-3 bg-green-500 rounded-sm"></div>
                  <span>인증 완료</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 활성화 상태 안내 메시지 */}
        {renderActiveStatus()}

        {/* 수직 타임라인 */}
        <div className="py-2">
          {sortedActivities.map((activity, index) => (
            <TimelineItem
              key={activity.id}
              activity={activity}
              isLast={index === sortedActivities.length - 1}
              index={index}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export default ActivitiesTimeline;
