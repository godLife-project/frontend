import { useState, useRef, useEffect } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus, Check } from "lucide-react";
import { Badge } from "./badge";
import { renderIcon } from "./icon-utils";

export default function BadgeSelector({
  control,
  name,
  label,
  options: initialOptions,
  availableIcons = [], // 카테고리별 사용 가능한 아이콘 리스트
  maxVisible = 10,
  required = false,
  allowCustomInput = true, // 직접 입력 기능 활성화 여부 (기본값: true)
  onCustomJobSelected = () => {}, // 직접 입력된 직업 정보를 부모 컴포넌트에 전달하기 위한 콜백 함수
  onChange,
  readOnly = false,
  customIdxValue = 19, // 직접 입력 시 사용할 인덱스 값 (기본값: 999)
}) {
  // 커스텀 옵션을 포함한 전체 옵션 상태
  const [options, setOptions] = useState(initialOptions);
  // 직접 입력 상태 관리
  const [isCustomInputActive, setIsCustomInputActive] = useState(false);
  const [customInputError, setCustomInputError] = useState(null); // 에러 메시지 상태 추가
  const [customValue, setCustomValue] = useState("");
  const [selectedIconKey, setSelectedIconKey] = useState(
    availableIcons.length > 0 ? availableIcons[0].iconKey : "briefcase"
  );
  const customInputRef = useRef(null);

  // jobEtcCateDTO 데이터를 저장할 상태 추가
  const [etcCateData, setEtcCateData] = useState(null);

  // 초기 렌더링 시 form 데이터에서 jobEtcCateDTO 확인
  useEffect(() => {
    if (name === "jobIdx") {
      const formValues = control._formValues || {};
      const currentValue = formValues[name];

      if (currentValue === customIdxValue && formValues.jobEtcCateDTO) {
        const etcData = formValues.jobEtcCateDTO;

        // etcCateData 설정
        setEtcCateData(etcData);

        // 해당 데이터로 커스텀 옵션 추가 (없는 경우)
        if (!options.some((opt) => opt.idx === customIdxValue)) {
          const newOption = {
            idx: customIdxValue,
            name: etcData.name || "직접 입력",
            iconKey: etcData.iconKey || "briefcase",
            color: getColorForIcon(etcData.iconKey || "briefcase"),
            isCustom: true,
          };

          setOptions((prev) => [...prev, newOption]);
        }
      }
    }
  }, [control._formValues, name, customIdxValue, options]);

  // 보여줄 옵션과 드롭다운에 넣을 옵션 분리
  const visibleOptions = options.slice(0, maxVisible);
  const dropdownOptions =
    options.length > maxVisible ? options.slice(maxVisible) : [];

  // 이미 사용 중인 아이콘 키 목록 계산
  const usedIconKeys = options.map((option) => option.iconKey);

  // 사용 가능한 아이콘 (이미 사용 중인 아이콘 제외)
  const filteredAvailableIcons = availableIcons.filter(
    (icon) => !usedIconKeys.includes(icon.iconKey) && icon.visible === 1
  );

  // 사용 가능한 아이콘 키 목록
  const availableIconKeys = filteredAvailableIcons.map((icon) => icon.iconKey);

  // 사용 가능한 아이콘이 없을 경우를 대비해 기본 아이콘 키 설정
  useEffect(() => {
    if (
      availableIconKeys.length > 0 &&
      !availableIconKeys.includes(selectedIconKey)
    ) {
      setSelectedIconKey(availableIconKeys[0]);
    }
  }, [availableIconKeys, selectedIconKey]);

  // 커스텀 입력 활성화 시 자동으로 입력 필드에 포커스
  useEffect(() => {
    if (isCustomInputActive && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [isCustomInputActive]);

  // 선택된 아이콘에 맞는 색상 가져오기
  const getColorForIcon = (iconKey) => {
    const icon = availableIcons.find((item) => item.iconKey === iconKey);
    return icon ? icon.color : "#3B82F6"; // 기본 색상
  };

  // 커스텀 옵션 추가 함수
  const addCustomOption = (field) => {
    // 입력값이 비어있는 경우
    if (!customValue.trim()) {
      // 입력 필드로 포커스
      if (customInputRef.current) {
        customInputRef.current.focus();
      }

      // 입력 필드에 에러 메시지 표시 (optional)
      setCustomInputError("직업명을 입력해주세요");
      return;
    }

    // 에러 메시지 초기화
    setCustomInputError(null);

    // 선택된 아이콘에 맞는 색상 가져오기
    const iconColor = getColorForIcon(selectedIconKey);

    // jobEtcCateDTO 데이터 생성
    const jobEtcData = {
      name: customValue,
      iconKey: selectedIconKey,
    };

    // etcCateData 상태 업데이트
    setEtcCateData(jobEtcData);

    // 새로운 옵션 생성 (idx는 항상 customIdxValue 값으로 설정: 기본값 999)
    const newOption = {
      idx: customIdxValue, // 직접 입력시 customIdxValue 값(기본값 999) 사용
      name: customValue,
      iconKey: selectedIconKey,
      color: iconColor,
      isCustom: true,
    };

    // 기존에 customIdxValue와 같은 idx를 가진 옵션이 있으면 교체, 없으면 추가
    setOptions((prev) => {
      const filtered = prev.filter((opt) => opt.idx !== customIdxValue);
      return [...filtered, newOption];
    });

    // 추가된 옵션 선택
    field.onChange(customIdxValue);

    // 부모 컴포넌트로 jobEtcCateDTO 데이터 전달
    onCustomJobSelected(jobEtcData);

    // onChange 콜백이 있으면 호출
    if (onChange) {
      onChange(customIdxValue);
    }

    // 상태 초기화
    setCustomValue("");
    setIsCustomInputActive(false);
  };

  console.log("BadgeSelector props:", {
    name,
    allowCustomInput,
    readOnly,
  });

  // allowCustomInput이 false이고 드롭다운 옵션이 없는 경우 드롭다운 버튼 숨기기
  const shouldShowDropdown = dropdownOptions.length > 0 || allowCustomInput;

  return (
    <div className="space-y-4">
      <FormField
        control={control}
        name={name}
        render={({ field }) => (
          <FormItem className="space-y-3">
            {label && (
              <FormLabel>
                {label}
                {required && <span className="text-red-500 ml-1">*</span>}
              </FormLabel>
            )}
            <FormControl>
              <div className="flex flex-wrap gap-2">
                {/* 상위 X개 옵션을 배지로 표시 */}
                {visibleOptions.map((option) => (
                  <Badge
                    key={option.idx}
                    option={option}
                    selected={
                      field.value &&
                      typeof field.value === "object" &&
                      field.value.value !== undefined
                        ? field.value.value === option.idx
                        : field.value === option.idx
                    }
                    onSelect={() => {
                      // 읽기 모드일 때는 이 콜백이 실행되지 않지만, 안전을 위해 여기서도 확인
                      if (readOnly) return;

                      // 일반 옵션 선택 시에는 단순히 idx 값만 전달
                      field.onChange(option.idx);

                      // 일반 옵션 선택 시 jobEtcCateDTO null로 설정 (customIdxValue가 아닌 경우)
                      if (option.idx !== customIdxValue && name === "jobIdx") {
                        onCustomJobSelected(null);
                        setEtcCateData(null);
                      }

                      if (onChange) {
                        onChange(option.idx);
                      }
                    }}
                    renderIcon={renderIcon}
                    readOnly={readOnly} // 읽기 모드 전달
                  />
                ))}

                {/* 드롭다운 메뉴 - allowCustomInput이 false이고 드롭다운 옵션이 없는 경우 숨김 */}
                {shouldShowDropdown && (
                  <DropdownMenu>
                    <DropdownMenuTrigger
                      disabled={readOnly} // 읽기 모드일 때 비활성화
                      className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                        "border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                        field.value &&
                          options.find(
                            (opt) =>
                              opt.idx ===
                              (field.value &&
                              typeof field.value === "object" &&
                              field.value.value !== undefined
                                ? field.value.value
                                : field.value)
                          ) &&
                          !visibleOptions.find(
                            (opt) =>
                              opt.idx ===
                              (field.value &&
                              typeof field.value === "object" &&
                              field.value.value !== undefined
                                ? field.value.value
                                : field.value)
                          )
                          ? "bg-blue-500 text-white border-transparent"
                          : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
                      )}
                      style={
                        field.value &&
                        options.find(
                          (opt) =>
                            opt.idx ===
                            (field.value &&
                            typeof field.value === "object" &&
                            field.value.value !== undefined
                              ? field.value.value
                              : field.value)
                        ) &&
                        !visibleOptions.find(
                          (opt) =>
                            opt.idx ===
                            (field.value &&
                            typeof field.value === "object" &&
                            field.value.value !== undefined
                              ? field.value.value
                              : field.value)
                        )
                          ? {
                              backgroundColor:
                                options.find(
                                  (opt) =>
                                    opt.idx ===
                                    (field.value &&
                                    typeof field.value === "object" &&
                                    field.value.value !== undefined
                                      ? field.value.value
                                      : field.value)
                                ).color || "#3B82F6",
                              color: "white",
                              borderColor: "transparent",
                            }
                          : {}
                      }
                    >
                      {field.value &&
                      options.find(
                        (opt) =>
                          opt.idx ===
                          (field.value &&
                          typeof field.value === "object" &&
                          field.value.value !== undefined
                            ? field.value.value
                            : field.value)
                      ) &&
                      !visibleOptions.find(
                        (opt) =>
                          opt.idx ===
                          (field.value &&
                          typeof field.value === "object" &&
                          field.value.value !== undefined
                            ? field.value.value
                            : field.value)
                      ) ? (
                        <>
                          {renderIcon(
                            options.find(
                              (opt) =>
                                opt.idx ===
                                (field.value &&
                                typeof field.value === "object" &&
                                field.value.value !== undefined
                                  ? field.value.value
                                  : field.value)
                            ).iconKey,
                            18,
                            "",
                            true,
                            options.find(
                              (opt) =>
                                opt.idx ===
                                (field.value &&
                                typeof field.value === "object" &&
                                field.value.value !== undefined
                                  ? field.value.value
                                  : field.value)
                            ).color
                          )}
                          <span>
                            {
                              options.find(
                                (opt) =>
                                  opt.idx ===
                                  (field.value &&
                                  typeof field.value === "object" &&
                                  field.value.value !== undefined
                                    ? field.value.value
                                    : field.value)
                              ).name
                            }
                          </span>
                        </>
                      ) : (
                        <span>
                          {dropdownOptions.length > 0
                            ? "기타 옵션"
                            : allowCustomInput
                            ? "직접 입력"
                            : ""}
                        </span>
                      )}
                      <ChevronDown className="h-4 w-4 ml-1" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      align="end"
                      className="bg-white border shadow-md rounded-md p-1"
                    >
                      {/* 추가 옵션 목록 */}
                      {dropdownOptions.map((option) => (
                        <DropdownMenuItem
                          key={option.idx}
                          onClick={() => {
                            field.onChange(option.idx);

                            // 일반 옵션 선택 시 jobEtcCateDTO null로 설정 (customIdxValue가 아닌 경우)
                            if (
                              option.idx !== customIdxValue &&
                              name === "jobIdx"
                            ) {
                              onCustomJobSelected(null);
                              setEtcCateData(null);
                            }

                            // onChange 콜백이 있으면 호출
                            if (onChange) {
                              onChange(option.idx);
                            }
                          }}
                          className={cn(
                            "cursor-pointer flex items-center px-2 py-1.5 rounded hover:bg-blue-100 transition-colors"
                          )}
                          style={
                            (
                              field.value &&
                              typeof field.value === "object" &&
                              field.value.value !== undefined
                                ? field.value.value === option.idx
                                : field.value === option.idx
                            )
                              ? {
                                  backgroundColor: `${option.color}20`,
                                  color: option.color,
                                }
                              : {}
                          }
                        >
                          {renderIcon(
                            option.iconKey,
                            18,
                            "mr-2",
                            field.value &&
                              typeof field.value === "object" &&
                              field.value.value !== undefined
                              ? field.value.value === option.idx
                              : field.value === option.idx,
                            option.color
                          )}
                          <span>{option.name}</span>
                          {(field.value &&
                          typeof field.value === "object" &&
                          field.value.value !== undefined
                            ? field.value.value === option.idx
                            : field.value === option.idx) && (
                            <Check
                              className="ml-auto h-4 w-4"
                              style={{ color: option.color }}
                            />
                          )}
                        </DropdownMenuItem>
                      ))}

                      {/* 구분선 */}
                      {dropdownOptions.length > 0 && allowCustomInput && (
                        <DropdownMenuSeparator className="my-1 border-t border-gray-300" />
                      )}

                      {/* 직접 입력 옵션 - allowCustomInput이 true일 때만 표시 */}
                      {allowCustomInput && !readOnly && (
                        <DropdownMenuItem
                          onClick={() => setIsCustomInputActive(true)}
                          className="cursor-pointer flex items-center px-2 py-1.5 rounded hover:bg-blue-50 transition-colors"
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          <span>직접 입력</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {/* 직접 입력 필드 */}
                {isCustomInputActive && !readOnly && (
                  <div className="flex flex-col w-full mt-2 gap-3">
                    <div className="flex items-center gap-2">
                      {/* 아이콘 선택기 */}
                      <div className="relative flex-shrink-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-300 hover:bg-gray-50">
                            {renderIcon(
                              selectedIconKey,
                              20,
                              "",
                              false,
                              getColorForIcon(selectedIconKey)
                            )}
                          </DropdownMenuTrigger>
                          <DropdownMenuContent
                            align="start"
                            className="bg-white border shadow-md rounded-md p-1"
                          >
                            <div className="grid grid-cols-5 gap-1 p-2 max-h-64 overflow-y-auto">
                              {/* 사용 가능한 아이콘만 표시 */}
                              {filteredAvailableIcons.length > 0 ? (
                                filteredAvailableIcons.map((icon) => (
                                  <button
                                    key={icon.iconKey}
                                    type="button"
                                    className={cn(
                                      "flex items-center justify-center w-8 h-8 rounded hover:bg-blue-50 transition-colors",
                                      selectedIconKey === icon.iconKey
                                        ? "bg-blue-100"
                                        : ""
                                    )}
                                    onClick={() =>
                                      setSelectedIconKey(icon.iconKey)
                                    }
                                  >
                                    {renderIcon(
                                      icon.iconKey,
                                      20,
                                      "",
                                      false,
                                      icon.color
                                    )}
                                  </button>
                                ))
                              ) : (
                                <div className="col-span-5 p-2 text-sm text-gray-500 text-center">
                                  사용 가능한 아이콘이 없습니다
                                </div>
                              )}
                            </div>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      {/* 텍스트 입력 필드 */}
                      <Input
                        ref={customInputRef}
                        value={customValue}
                        onChange={(e) => {
                          setCustomValue(e.target.value);
                          if (customInputError) setCustomInputError(null); // 입력 시 에러 메시지 제거
                        }}
                        placeholder="직업명을 입력하세요"
                        className={`flex-grow ${
                          customInputError ? "border-red-500" : ""
                        }`} // 에러가 있을 때 테두리 색 변경
                        onKeyDown={(e) => {
                          if (e.key === "Enter") {
                            e.preventDefault();
                            addCustomOption(field);
                          } else if (e.key === "Escape") {
                            setIsCustomInputActive(false);
                            setCustomValue("");
                            setCustomInputError(null); // 에러 메시지 초기화
                          }
                        }}
                      />

                      {/* 에러 메시지 표시 */}
                      {customInputError && (
                        <div className="text-red-500 text-sm mt-1 ml-1">
                          {customInputError}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => addCustomOption(field)}
                          disabled={filteredAvailableIcons.length === 0}
                          title={
                            filteredAvailableIcons.length === 0
                              ? "사용 가능한 아이콘이 없습니다"
                              : ""
                          }
                        >
                          추가
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setIsCustomInputActive(false);
                            setCustomValue("");
                          }}
                        >
                          취소
                        </Button>
                      </div>

                      {filteredAvailableIcons.length === 0 && (
                        <div className="text-sm text-red-500 mt-1">
                          사용 가능한 아이콘이 없습니다. 관리자에게 문의하세요.
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* 읽기 전용 모드에서 직접 입력 데이터 처리 */}
                {readOnly &&
                  name === "jobIdx" &&
                  field.value === customIdxValue &&
                  etcCateData &&
                  !options.find((opt) => opt.idx === customIdxValue) && (
                    <Badge
                      option={{
                        idx: customIdxValue,
                        name: etcCateData.name || "직접 입력",
                        iconKey: etcCateData.iconKey || "briefcase",
                        color: getColorForIcon(
                          etcCateData.iconKey || "briefcase"
                        ),
                        isCustom: true,
                      }}
                      selected={true}
                      onSelect={() => {}}
                      renderIcon={renderIcon}
                      readOnly={true}
                    />
                  )}

                {/* 읽기 전용 모드에서 선택된 값이 visibleOptions에 없는 경우 (드롭다운에 있거나 직접 입력한 경우) */}
                {readOnly &&
                  field.value &&
                  !visibleOptions.find(
                    (opt) =>
                      opt.idx ===
                      (field.value &&
                      typeof field.value === "object" &&
                      field.value.value !== undefined
                        ? field.value.value
                        : field.value)
                  ) &&
                  !(
                    name === "jobIdx" &&
                    field.value === customIdxValue &&
                    etcCateData
                  ) && (
                    <Badge
                      option={
                        options.find(
                          (opt) =>
                            opt.idx ===
                            (field.value &&
                            typeof field.value === "object" &&
                            field.value.value !== undefined
                              ? field.value.value
                              : field.value)
                        ) || {
                          name: "선택 없음",
                          iconKey: "help-circle",
                          color: "#9CA3AF",
                        }
                      }
                      selected={true}
                      onSelect={() => {}}
                      renderIcon={renderIcon}
                      readOnly={true}
                    />
                  )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}
