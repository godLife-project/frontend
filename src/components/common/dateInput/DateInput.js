import React from "react";
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Calendar } from "lucide-react";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const DateInput = ({
  control,             // React Hook Form의 control 객체
  name,                // 필드 이름
  label = "",          // 기본 레이블 (변경 가능)
  placeholder = "",    // 입력 필드 플레이스홀더
  min = 1,             // 최소값
  max = 365,           // 최대값
  helperText = "",     // 추가 도움말 텍스트
  className = "",      // 추가 클래스 이름
  required = false,    // 필수 필드 여부
  iconPosition = "left", // 아이콘 위치 (left 또는 right)
  allowIndefinite = true, // 기한없음 옵션 허용 여부
  indefiniteLabel = "기한없음", // 기한없음 체크박스 레이블
}) => {
  // indefinite 값을 위한 이름 생성
  const indefiniteName = `${name}Indefinite`;

  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem className={className}>
          {label && (
            <FormLabel className={required ? "after:content-['*'] after:ml-0.5 after:text-red-500" : ""}>
              {label}
            </FormLabel>
          )}
          <FormControl>
            <div className="space-y-2">
              <div className="relative">
                {iconPosition === "left" && (
                  <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                )}
                <Input
                  type="number"
                  placeholder={placeholder}
                  className={`w-full ${iconPosition === "left" ? "pl-10" : iconPosition === "right" ? "pr-10" : ""}`}
                  min={min}
                  max={max}
                  {...field}
                  disabled={control._formValues[indefiniteName]}
                  // 문자열을 숫자로 변환
                  onChange={(e) => {
                    const value = e.target.value === "" ? "" : Number(e.target.value);
                    field.onChange(value);
                  }}
                />
                {iconPosition === "right" && (
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Calendar className="h-4 w-4 text-gray-400" />
                  </div>
                )}
              </div>
              
              {allowIndefinite && (
                <FormField
                  control={control}
                  name={indefiniteName}
                  render={({ field: indefiniteField }) => (
                    <div className="flex items-center ml-1">
                      <Checkbox
                        id={indefiniteName}
                        checked={indefiniteField.value}
                        onCheckedChange={(checked) => {
                          indefiniteField.onChange(checked);
                          // 체크되면 필드 값을 99999로 설정하고 비활성화
                          if (checked) {
                            field.onChange(99999); // 기한없음을 나타내는 값으로 설정
                          } else {
                            // 체크가 해제되면 기본값으로 복원
                            field.onChange(min); // 최소값으로 설정
                          }
                        }}
                        className="h-4 w-4"
                      />
                      <Label 
                        htmlFor={indefiniteName}
                        className="ml-2 text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {indefiniteLabel}
                      </Label>
                    </div>
                  )}
                />
              )}
            </div>
          </FormControl>
          {helperText && <p className="text-sm text-gray-500 mt-1">{helperText}</p>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
};

export default DateInput;