// src/components/routine/detail/RoutineHeader.jsx
import React from "react";
import { Calendar, Lock } from "lucide-react";
import FlameIndicator from "../FlameIndicator";

const RoutineHeader = ({ routineData, getStatusBadgeStyle, getStatusText }) => {
  return (
    <div className="relative">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 pb-16 text-white">
        {/* 루틴 상태 배지 및 불꽃 표시 */}
        <div className="absolute top-4 right-4 flex items-center space-x-2">
          {/* 불꽃 인디케이터 추가 */}
          <FlameIndicator certExp={routineData.certExp || 0} />

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
        <h1 className="text-3xl font-bold mb-2">{routineData.planTitle}</h1>

        {/* 루틴 생성 날짜 */}
        <div className="flex items-center text-blue-100 mb-6">
          <Calendar className="w-4 h-4 mr-1" />
          <span className="text-sm">
            {new Date(routineData.planSubDate).toLocaleDateString()}에 생성됨
          </span>
        </div>
      </div>
    </div>
  );
};

export default RoutineHeader;
