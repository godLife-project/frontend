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
import { iconMap } from "./icon-utils";

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
  const customIdxValue = 19; // 직접 입력 옵션의 idx 값
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
  const [customOptions, setCustomOptions] = useState([]);

  // 최대 표시 개수만큼 옵션 자르기
  const visibleOptions = useMemo(() => {
    return options.slice(0, maxVisible);
  }, [options, maxVisible]);

  // 드롭다운에 표시할 나머지 옵션 (기존 옵션 + 커스텀 옵션)
  const dropdownOptions = useMemo(() => {
    // 기존 옵션 중 maxVisible 이후의 항목들
    const remainingOptions = options.slice(maxVisible);

    // 커스텀 옵션과 합쳐서 반환
    return [...remainingOptions, ...customOptions];
  }, [options, maxVisible, customOptions]);

  // 값이 객체인 경우 idx 추출
  const getCurrentValue = () => {
    if (typeof field.value === "object" && field.value !== null) {
      return field.value.value !== undefined ? field.value.value : field.value;
    }
    return field.value;
  };

  // 아이콘 키로 실제 아이콘 컴포넌트 찾기 (예: 'code' -> Code 컴포넌트)
  const getIconComponent = (iconKey) => {
    // 1. 먼저 availableIcons에서 해당 iconKey와 일치하는 항목 찾기
    const foundIcon = availableIcons.find(
      (icon) => icon.key === iconKey || icon.iconKey === iconKey
    );

    // 2. iconMap에서 컴포넌트 찾기
    if (foundIcon) {
      // icon 값이 대소문자 변환이 필요할 수 있음 (예: "Briefcase" -> "briefcase")
      const normalizedIconName = (
        foundIcon.key || foundIcon.iconKey
      ).toLowerCase();
      if (iconMap[normalizedIconName]) {
        return iconMap[normalizedIconName];
      }
    }

    // 3. 직접 iconKey로 iconMap에서 찾기
    if (iconMap[iconKey]) {
      return iconMap[iconKey];
    }

    // 4. 모두 실패하면 기본 아이콘 반환
    return Code; // 기본값으로 Code 아이콘 사용
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
        color={inverted ? "white" : color || "currentColor"}
      />
    );
  };

  // 커스텀 입력 처리 함수
  const handleCustomSubmit = (e) => {
    // 폼 기본 제출 동작 방지
    e.preventDefault();

    if (!customName.trim()) return;

    const customData = {
      idx: customIdxValue,
      name: customName,
      iconKey: customIconKey || "code", // 기본 아이콘 키 설정
    };

    // 커스텀 옵션 목록에 추가
    setCustomOptions((prev) => [...prev, customData]);

    // 직접 입력한 데이터를 선택한 상태로 설정
    field.onChange(customIdxValue);

    // 커스텀 옵션 선택 콜백 호출
    if (onCustomJobSelected) {
      onCustomJobSelected(customData);
    }

    // 입력 폼 초기화 및 닫기
    setCustomName("");
    setCustomIconKey("");
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
            <DropdownMenuContent className="bg-white border border-gray-200 shadow-lg rounded-md p-1">
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
                  className="flex items-center py-2 px-3 hover:bg-gray-100 rounded-sm"
                >
                  <div className="flex items-center gap-2 w-full">
                    {renderIcon(option.iconKey, 18, "", false, option.color)}
                    <span>{option.name}</span>
                  </div>
                </DropdownMenuItem>
              ))}

              {/* 직접 입력 옵션 */}
              {allowCustomInput && (
                <DropdownMenuItem
                  onSelect={() => setShowCustomInput(true)}
                  className="text-blue-500 font-medium border-t mt-1 pt-1"
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
          <form onSubmit={(e) => e.preventDefault()}>
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
                      key={icon.key || icon.iconKey}
                      type="button"
                      className={cn(
                        "p-2 rounded-full transition-all",
                        customIconKey === (icon.key || icon.iconKey)
                          ? "bg-blue-100 text-blue-600"
                          : "hover:bg-gray-100"
                      )}
                      onClick={() => setCustomIconKey(icon.key || icon.iconKey)}
                    >
                      {/* React.createElement 대신 renderIcon 함수 사용 */}
                      {renderIcon(
                        icon.key || icon.iconKey,
                        20,
                        "",
                        false,
                        icon.color
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 색상 선택 부분 제거 */}

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
                  type="button" // type="submit" 대신 type="button"으로 변경
                  onClick={handleCustomSubmit} // onClick 이벤트에 핸들러 연결
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
