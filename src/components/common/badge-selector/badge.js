// badge.jsx
import { cn } from "@/lib/utils";

export function Badge({ option, selected, onSelect, renderIcon }) {
  // 옵션에서 color 값이 있으면 사용, 없으면 기본 색상 사용
  const bgColor = option.color ? option.color : "#3B82F6"; // 기본값은 blue-500
  
  // 선택 여부에 따른 스타일 적용
  const badgeStyle = selected
    ? {
        backgroundColor: bgColor,
        color: "white",
        borderColor: "transparent"
      }
    : {
        backgroundColor: "transparent",
        color: bgColor,
        borderColor: bgColor,
        // 호버 효과를 inline style로 구현할 수 없으므로 className으로 처리
      };

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full transition-all border text-sm font-medium",
        "focus:outline-none focus:ring-2 focus:ring-offset-2",
        selected
          ? "hover:bg-opacity-90 focus:ring-blue-500"
          : "hover:bg-gray-50 focus:ring-blue-500"
      )}
      style={badgeStyle}
    >
      {/* 아이콘 렌더링 - 색상 전달 */}
      {renderIcon(option.iconKey, 18, "", selected, option.color)}
      <span>{option.name}</span>
    </button>
  );
}