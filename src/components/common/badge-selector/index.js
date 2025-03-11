// src/components/common/badge-selector/index.jsx

import React, { useMemo, useState } from "react";
import { useController } from "react-hook-form";
import { ChevronDown, Code, Palette } from "lucide-react"; // 실제 사용할 아이콘들 import
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function BadgeSelector({
  control,
  name,
  options,
  availableIcons = [],
  maxVisible = 5,
  required = false,
  readOnly = false, // 읽기 전용 모드
  allowCustomInput = true, // 직접 입력 옵션 활성화 여부
  onCustomJobSelected = null,
  onChange = null,
}) {
  const customIdxValue = 999; // 직접 입력 옵션의 idx 값
  const {
    field,
    fieldState: { error },
  } = useController({
    name,
    control,
    rules: { required: required ? "필수 항목입니다" : false },
  });

  const [showCustomInput, setShowCustomInput] = useState(false);
  const [customName, setCustomName] = useState("");
  const [customIconKey, setCustomIconKey] = useState("");
  const [customColor, setCustomColor] = useState("#64748b");

  // 최대 표시 개수만큼 옵션 자르기
  const visibleOptions = useMemo(() => {
    return options.slice(0, maxVisible);
  }, [options, maxVisible]);

  // 드롭다운에 표시할 나머지 옵션
  const dropdownOptions = useMemo(() => {
    return options.slice(maxVisible);
  }, [options, maxVisible]);

  // 값이 객체인 경우 idx 추출
  const getCurrentValue = () => {
    if (typeof field.value === "object" && field.value !== null) {
      return field.value.value !== undefined ? field.value.value : field.value;
    }
    return field.value;
  };

  // 아이콘 키로 실제 아이콘 컴포넌트 찾기 (예: 'code' -> Code 컴포넌트)
  const getIconComponent = (iconKey) => {
    // availableIcons에서 먼저 찾기
    const foundIcon = availableIcons.find((icon) => icon.key === iconKey);
    if (foundIcon && foundIcon.component) {
      return foundIcon.component;
    }

    // 아이콘 키에 따라 직접 컴포넌트 반환
    // 여기에 필요한 아이콘 케이스 추가
    switch (iconKey) {
      case "code":
        return Code;
      case "palette":
        return Palette;
      // 필요한 다른 아이콘들 추가
      default:
        // 기본값 혹은 fallback 아이콘
        return ChevronDown;
    }
  };

  // 렌더링할 아이콘 결정 함수
  const renderIcon = (
    iconKey,
    size = 16,
    className = "",
    inverted = false,
    color = ""
  ) => {
    const IconComponent = getIconComponent(iconKey);

    return (
      <IconComponent
        size={size}
        className={cn("flex-shrink-0", className)}
        color={color || (inverted ? "white" : "currentColor")}
      />
    );
  };

  // 커스텀 입력 처리 함수
  const handleCustomSubmit = (e) => {
    e.preventDefault();

    if (!customName.trim()) return;

    const customData = {
      idx: customIdxValue,
      name: customName,
      iconKey: customIconKey || "default-icon",
      color: customColor,
    };

    // 직접 입력한 데이터를 선택한 상태로 설정
    field.onChange(customIdxValue);

    // 커스텀 옵션 선택 콜백 호출
    if (onCustomJobSelected) {
      onCustomJobSelected(customData);
    }

    setShowCustomInput(false);
  };

  // readOnly 모드에서는 선택된 뱃지들을 스타일링만 다르게 표시
  if (readOnly) {
    const currentValue = getCurrentValue();

    // 선택된 옵션 찾기
    const selectedOption = options.find((opt) => opt.idx === currentValue);

    if (!selectedOption) {
      return <div className="text-gray-500 italic">선택된 항목이 없습니다</div>;
    }

    // 선택된 배지 색상 및 스타일 적용
    return (
      <div className="flex flex-wrap gap-2">
        <div
          className={cn(
            "flex items-center gap-2 px-4 py-2 rounded-full",
            "text-sm font-medium",
            selectedOption.color ? "text-white" : "bg-blue-500 text-white"
          )}
          style={{
            backgroundColor: selectedOption.color || "#3B82F6",
            border: "1px solid transparent",
          }}
        >
          {renderIcon(
            selectedOption.iconKey,
            18,
            "",
            true,
            "white" // 항상 아이콘은 흰색으로
          )}
          <span>{selectedOption.name}</span>
        </div>
      </div>
    );
  }

  // 일반 모드 (읽기 전용이 아닌 경우)
  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {/* 보이는 옵션들 */}
        {visibleOptions.map((option) => (
          <button
            key={option.idx}
            type="button"
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
              "border text-sm font-medium focus:outline-none",
              getCurrentValue() === option.idx
                ? "bg-blue-500 text-white border-transparent"
                : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
            )}
            style={
              getCurrentValue() === option.idx && option.color
                ? {
                    backgroundColor: option.color,
                    color: "white",
                    borderColor: "transparent",
                  }
                : {}
            }
            onClick={() => {
              field.onChange(option.idx);

              // 일반 옵션 선택 시 커스텀 데이터 초기화
              if (option.idx !== customIdxValue && onCustomJobSelected) {
                onCustomJobSelected(null);
              }

              // onChange 콜백 호출
              if (onChange) {
                onChange(option.idx);
              }
            }}
          >
            {renderIcon(
              option.iconKey,
              18,
              "",
              getCurrentValue() === option.idx,
              option.color
            )}
            <span>{option.name}</span>
          </button>
        ))}

        {/* 드롭다운 메뉴 (추가 옵션이 있는 경우) */}
        {dropdownOptions.length > 0 && (
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 px-4 py-2 rounded-full transition-all border text-sm font-medium focus:outline-none bg-white text-gray-800 border-gray-200 hover:bg-gray-50">
              <span>기타 옵션</span>
              <ChevronDown className="h-4 w-4 ml-1" />
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {dropdownOptions.map((option) => (
                <DropdownMenuItem
                  key={option.idx}
                  onSelect={() => {
                    field.onChange(option.idx);

                    // 일반 옵션 선택 시 커스텀 데이터 초기화
                    if (option.idx !== customIdxValue && onCustomJobSelected) {
                      onCustomJobSelected(null);
                    }

                    if (onChange) {
                      onChange(option.idx);
                    }
                  }}
                >
                  <div className="flex items-center gap-2">
                    {renderIcon(option.iconKey, 18)}
                    <span>{option.name}</span>
                  </div>
                </DropdownMenuItem>
              ))}

              {/* 직접 입력 옵션 */}
              {allowCustomInput && (
                <DropdownMenuItem
                  onSelect={() => setShowCustomInput(true)}
                  className="text-blue-500 font-medium"
                >
                  직접 입력하기
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        {/* 직접 입력 버튼 */}
        {dropdownOptions.length === 0 && allowCustomInput && (
          <button
            type="button"
            className="flex items-center gap-2 px-4 py-2 rounded-full border border-dashed border-gray-300 text-gray-600 hover:border-blue-500 hover:text-blue-500 transition-all"
            onClick={() => setShowCustomInput(true)}
          >
            직접 입력하기
          </button>
        )}
      </div>

      {/* 직접 입력 폼 */}
      {showCustomInput && (
        <div className="mt-4 p-4 border border-gray-200 rounded-lg">
          <form onSubmit={handleCustomSubmit}>
            <div className="space-y-4">
              {/* 이름 입력 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  이름
                </label>
                <input
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="직접 입력할 이름"
                  required
                />
              </div>

              {/* 아이콘 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  아이콘
                </label>
                <div className="flex flex-wrap gap-2">
                  {availableIcons.map((icon) => (
                    <button
                      key={icon.key}
                      type="button"
                      className={cn(
                        "p-2 rounded-full transition-all",
                        customIconKey === icon.key
                          ? "bg-blue-100 text-blue-600"
                          : "hover:bg-gray-100"
                      )}
                      onClick={() => setCustomIconKey(icon.key)}
                    >
                      {React.createElement(icon.component, {
                        size: 20,
                      })}
                    </button>
                  ))}
                </div>
              </div>

              {/* 색상 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  색상
                </label>
                <input
                  type="color"
                  value={customColor}
                  onChange={(e) => setCustomColor(e.target.value)}
                  className="w-full h-10 px-2 py-1 rounded cursor-pointer"
                />
              </div>

              {/* 버튼 */}
              <div className="flex justify-end space-x-2">
                <button
                  type="button"
                  className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  onClick={() => setShowCustomInput(false)}
                >
                  취소
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                >
                  확인
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && <p className="mt-2 text-sm text-red-500">{error.message}</p>}
    </div>
  );
}
