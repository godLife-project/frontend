import React from "react";
import { cn } from "@/lib/utils";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const DaySelector = ({
  control,                // React Hook Form의 control 객체
  name,                   // 필드 이름
  label = "",     // 라벨 텍스트
  description = "루틴을 반복할 요일을 선택하세요. 기본적으로 모든 요일이 선택되어 있습니다.(매일 반복)",  // 설명 텍스트
  className = "",         // 추가 클래스명
  required = false,       // 필수 필드 여부
  readOnly = false,       // 읽기 전용 모드
}) => {
  // 요일 데이터
  const days = [
    { value: "mon", label: "월", color: "bg-blue-500 hover:bg-blue-600" },
    { value: "tue", label: "화", color: "bg-orange-500 hover:bg-orange-600" },
    { value: "wed", label: "수", color: "bg-green-500 hover:bg-green-600" },
    { value: "thu", label: "목", color: "bg-purple-500 hover:bg-purple-600" },
    { value: "fri", label: "금", color: "bg-pink-500 hover:bg-pink-600" },
    { value: "sat", label: "토", color: "bg-gray-200 hover:bg-gray-300 text-gray-800" },
    { value: "sun", label: "일", color: "bg-red-100 hover:bg-red-200 text-red-500" },
  ];

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => {
        // 현재 선택된 요일 배열 (기본값이 없으면 빈 배열)
        const selectedDays = field.value || [];
        
        // 요일 토글 함수
        const toggleDay = (dayValue) => {
          if (readOnly) return;
          
          const newSelectedDays = selectedDays.includes(dayValue)
            ? selectedDays.filter(day => day !== dayValue)
            : [...selectedDays, dayValue];
            
          field.onChange(newSelectedDays);
        };

        return (
          <FormItem className={cn("space-y-3", className)}>
            {label && (
              <FormLabel className={cn(
                "flex items-center text-base",
                required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""
              )}>
                {label}
              </FormLabel>
            )}
            <FormControl>
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {days.map((day) => (
                    <button
                      key={day.value}
                      type="button"
                      className={cn(
                        "w-12 h-12 rounded-full flex items-center justify-center text-white font-medium transition-all",
                        day.color,
                        selectedDays.includes(day.value) 
                          ? "ring-2 ring-offset-2 ring-blue-600" 
                          : "opacity-80",
                        readOnly && "cursor-not-allowed opacity-60"
                      )}
                      onClick={() => toggleDay(day.value)}
                      disabled={readOnly}
                    >
                      {day.label}
                    </button>
                  ))}
                </div>
                {description && (
                  <p className="text-sm text-gray-500">
                    {description}
                  </p>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        );
      }}
    />
  );
};

export default DaySelector;