import React from "react";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const StarRating = ({
  control,                // React Hook Form의 control 객체
  name,                   // 필드 이름
  label = "",             // 라벨 텍스트
  maxRating = 10,         // 최대 별점 (기본값 10)
  defaultValue = 0,       // 기본 값
  color = "#FFB800",      // 선택된 별 색상 (기본값 노란색)
  size = "md",            // 별 크기 (sm, md, lg)
  showValue = true,       // 숫자 값 표시 여부
  readOnly = false,       // 읽기 전용 모드
  className = "",         // 추가 클래스명
  required = false,       // 필수 필드 여부
}) => {
  // 별 크기에 따른 클래스
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };
  
  // 컨테이너 크기에 따른 간격
  const containerClasses = {
    sm: "gap-1",
    md: "gap-1.5",
    lg: "gap-2",
  };

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={cn("space-y-2", className)}>
          {label && (
            <FormLabel className={cn(
              "flex items-center text-base",
              required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""
            )}>
              {label}
            </FormLabel>
          )}
          <FormControl>
            <div className="space-y-2">
              <div className={cn("flex items-center", containerClasses[size])}>
                {Array.from({ length: maxRating }).map((_, index) => (
                  <Star
                    key={index}
                    className={cn(
                      sizeClasses[size],
                      "cursor-pointer transition-all",
                      field.value > index
                        ? "fill-current text-current stroke-current"
                        : "fill-transparent stroke-gray-300",
                      !readOnly && "hover:stroke-gray-400"
                    )}
                    style={{ color: field.value > index ? color : undefined }}
                    onClick={() => {
                      if (!readOnly) {
                        const newValue = index + 1;
                        field.onChange(newValue);
                      }
                    }}
                  />
                ))}
                {showValue && (
                  <span className="ml-2 text-sm font-medium">
                    {field.value}/{maxRating}
                  </span>
                )}
              </div>
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default StarRating;