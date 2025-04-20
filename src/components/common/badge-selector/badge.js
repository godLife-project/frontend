// Badge 컴포넌트 수정 (./badge.jsx 파일)
import React from "react";
import { cn } from "@/lib/utils";

export const Badge = ({
  option,
  selected = false,
  onSelect,
  renderIcon,
  readOnly = false, // 읽기 전용 모드
}) => {
  return (
    <div
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
        "border text-sm font-medium",
        selected
          ? "bg-blue-500 text-white border-transparent"
          : "bg-white text-gray-800 border-gray-200",
        // 읽기 모드가 아닐 때만 호버 효과와 커서 포인터 적용
        !readOnly && !selected ? "hover:bg-gray-50 cursor-pointer" : "",
        readOnly ? "cursor-default" : "cursor-pointer" // 읽기 모드일 때는 커서 기본값으로
      )}
      style={
        selected && option.color
          ? {
              backgroundColor: option.color,
              color: "white",
              borderColor: "transparent",
            }
          : {}
      }
      onClick={() => {
        // 읽기 모드일 때는 클릭 이벤트 무시
        if (!readOnly) {
          onSelect(option);
        }
      }}
    >
      {renderIcon(option.iconKey, 18, "", selected, option.color)}
      <span>{option.name}</span>
    </div>
  );
};
