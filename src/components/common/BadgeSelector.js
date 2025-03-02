import { useState } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { cn } from "@/lib/utils"; // shadcn/ui의 유틸리티 함수

export default function BadgeSelector({ 
  control, 
  name, // 필드 이름을 props로 받음, schema에 정의된
  label, // FormLabel 텍스트를 props로 받음
  options, // 배지 옵션 배열을 props로 받음 
  
}) {
  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className="space-y-3">
            {label && <FormLabel>{label}</FormLabel>}
            <FormControl>
              <div className="flex flex-wrap gap-2">
                {options.map((option) => (
                  <Badge
                    key={option.value}
                    option={option}
                    selected={field.value === option.value}
                    onSelect={() => field.onChange(option.value)}
                  />
                ))}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}

// 직업 배지 컴포넌트
function Badge({ option, selected, onSelect }) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
        "border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
        selected
          ? "bg-blue-500 text-white border-transparent"
          : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
      )}
    >
      <span className="text-lg">{option.icon}</span>
      <span>{option.label}</span>
    </button>
  );
}
