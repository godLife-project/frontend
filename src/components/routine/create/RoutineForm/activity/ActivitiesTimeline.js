// src/components/routine/create/RoutineForm/ActivitiesTimeline.js
import React, { useEffect, useState } from "react";
import { useWatch } from "react-hook-form";
import { Clock, AlertCircle, FileText, Star } from "lucide-react";

function ActivitiesTimeline({ control }) {
  const activities = useWatch({
    control,
    name: "activities",
    defaultValue: [],
  });

  const [sortedActivities, setSortedActivities] = useState([]);

  // 활동을 시간순으로 정렬
  useEffect(() => {
    if (!activities.length) {
      setSortedActivities([]);
      return;
    }

    // 모든 시작 시간을 분으로 변환하여 정렬
    const processedActivities = activities.map((activity, index) => {
      const [hours, minutes] = activity.startTime.split(":").map(Number);
      const startMinutes = hours * 60 + minutes;

      return {
        ...activity,
        id: index,
        startMinutes,
        formattedStart: formatTime(startMinutes),
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
    const hasMemo = activity.memo && activity.memo.trim() !== "";
    const importance = activity.importance;

    // 중요도에 따른 배경색 (더 연한 색상으로 변경)
    const getColor = (importance) => {
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

    const colorClass = getColor(importance);

    return (
      <div className="flex items-start mb-2">
        {/* 시간선 */}
        <div className="flex flex-col items-center mr-4">
          <div className="rounded-full w-6 h-6 bg-blue-500 text-white flex items-center justify-center text-xs">
            {index + 1}
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
            <h4 className="font-medium text-slate-700">
              {activity.activityName || "무제 활동"}
            </h4>
            <div className="flex flex-col items-end">
              <ImportanceStars importance={importance} />
            </div>
          </div>

          {hasMemo && (
            <div className="mt-2 text-xs text-slate-600 flex items-center">
              <FileText className="h-3 w-3 mr-1 text-blue-400 flex-shrink-0" />
              <span className="line-clamp-1">{activity.memo}</span>
            </div>
          )}
        </div>
      </div>
    );
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
            </div>
          </div>
        </div>

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
