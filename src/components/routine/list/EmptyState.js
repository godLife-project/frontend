import React from "react";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";

const EmptyState = ({
  icon: Icon = Search,
  title = "결과가 없습니다",
  message = "검색 조건을 변경해 보세요",
  actionText = "필터 초기화",
  onAction,
  iconSize = 64,
  iconColor = "text-gray-300",
}) => {
  return (
    <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
      <Icon
        className={`w-${iconSize / 4} h-${
          iconSize / 4
        } ${iconColor} mx-auto mb-4`}
        size={iconSize}
      />
      <h3 className="text-xl font-medium text-gray-700 mb-2">{title}</h3>
      <p className="text-gray-500 mb-4">{message}</p>
      {onAction && (
        <Button onClick={onAction} variant="outline" className="mt-2">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
