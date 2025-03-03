import { useState, useRef, useEffect } from "react";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { ChevronDown, Plus, Check } from "lucide-react";
import { Badge } from "./badge";
import { renderIcon, iconMap } from "./icon-utils";

export default function BadgeSelector({
  control,
  name,
  label,
  options: initialOptions,
  maxVisible = 10
}) {

  // 커스텀 옵션을 포함한 전체 옵션 상태
  const [options, setOptions] = useState(initialOptions);
  // 직접 입력 상태 관리
  const [isCustomInputActive, setIsCustomInputActive] = useState(false);
  const [customValue, setCustomValue] = useState("");
  const [selectedIconKey, setSelectedIconKey] = useState("briefcase");
  const customInputRef = useRef(null);

  // 보여줄 옵션과 드롭다운에 넣을 옵션 분리
  const visibleOptions = options.slice(0, maxVisible);
  const dropdownOptions = options.length > maxVisible ? options.slice(maxVisible) : [];

  // 이미 사용 중인 아이콘 키 목록 계산
  const usedIconKeys = options.map(option => option.iconKey);

  // 사용 가능한 아이콘 키 필터링 (이미 사용 중인 아이콘 제외)
  const availableIconKeys = Object.keys(iconMap).filter(
    iconKey => !usedIconKeys.includes(iconKey)
  );
  // const availableIconKeys = [] // 아이콘을 다썼을때를 테스트하기 위함.

  // 사용 가능한 아이콘이 없을 경우를 대비해 기본 아이콘 키 설정
  useEffect(() => {
    if (availableIconKeys.length > 0 && !availableIconKeys.includes(selectedIconKey)) {
      setSelectedIconKey(availableIconKeys[0]);
    }
  }, [availableIconKeys, selectedIconKey]);

  // 커스텀 입력 활성화 시 자동으로 입력 필드에 포커스
  useEffect(() => {
    if (isCustomInputActive && customInputRef.current) {
      customInputRef.current.focus();
    }
  }, [isCustomInputActive]);

  // 커스텀 옵션 추가 함수
  const addCustomOption = (field) => {
    if (!customValue.trim()) return;

    // 새로운 옵션 생성 (value는 현재 시간을 이용해 고유값 생성)
    const newOption = {
      idx: `custom_${Date.now()}`,
      name: customValue,
      iconKey: selectedIconKey,
      isCustom: true
    };

    // 옵션 목록에 추가
    setOptions(prev => [...prev, newOption]);

    // 추가된 옵션 선택
    field.onChange(newOption.idx);

    // 상태 초기화
    setCustomValue("");
    setIsCustomInputActive(false);
  };

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
                {/* 상위 X개 옵션을 배지로 표시 */}
                {visibleOptions.map((option) => (
                  <Badge
                    key={option.idx}
                    option={option}
                    selected={field.value === option.idx}
                    onSelect={() => field.onChange(option.idx)}
                    renderIcon={renderIcon}
                  />
                ))}

                {/* 드롭다운 메뉴 */}
                <DropdownMenu>
                  <DropdownMenuTrigger className={cn(
                    "flex items-center gap-2 px-4 py-2 rounded-full transition-all",
                    "border text-sm font-medium focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500",
                    field.value && options.find(opt => opt.idx === field.value) && !visibleOptions.find(opt => opt.idx === field.value)
                      ? "bg-blue-500 text-white border-transparent"
                      : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
                  )}>
                    {field.value && options.find(opt => opt.idx === field.value) && !visibleOptions.find(opt => opt.idx === field.value) ? (
                      <>
                        {renderIcon(options.find(opt => opt.idx === field.value).iconKey, 18, "", true)}
                        <span>{options.find(opt => opt.idx === field.value).name}</span>
                      </>
                    ) : (
                      <span>{dropdownOptions.length > 0 ? "기타 옵션" : "직접 입력"}</span>
                    )}
                    <ChevronDown className="h-4 w-4 ml-1" />
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white border shadow-md rounded-md p-1">
                    {/* 추가 옵션 목록 */}
                    {dropdownOptions.map((option) => (
                      <DropdownMenuItem
                        key={option.idx}
                        onClick={() => field.onChange(option.idx)}
                        className={cn(
                          "cursor-pointer flex items-center px-2 py-1.5 rounded hover:bg-blue-100 transition-colors",
                          field.value === option.idx ? "bg-blue-100 text-blue-600" : "text-gray-800"
                        )}
                      >
                        {renderIcon(option.iconKey, 18, "mr-2", field.value === option.idx)}
                        <span>{option.name}</span>
                        {field.value === option.idx && <Check className="ml-auto h-4 w-4" />}
                      </DropdownMenuItem>
                    ))}

                    {/* 구분선 */}
                    {dropdownOptions.length > 0 && <DropdownMenuSeparator className="my-1 border-t border-gray-300" />}

                    {/* 직접 입력 옵션 */}
                    <DropdownMenuItem
                      onClick={() => setIsCustomInputActive(true)}
                      className="cursor-pointer flex items-center px-2 py-1.5 rounded hover:bg-blue-50 transition-colors"
                    >
                      <Plus className="h-4 w-4 mr-2" />
                      <span>직접 입력</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* 직접 입력 필드 */}
                {isCustomInputActive && (
                  <div className="flex flex-col w-full mt-2 gap-3">
                    <div className="flex items-center gap-2">
                      <div className="relative flex-shrink-0">
                        <DropdownMenu>
                          <DropdownMenuTrigger className="flex items-center justify-center w-10 h-10 rounded-md border border-gray-300 hover:bg-gray-50">
                            {renderIcon(selectedIconKey, 20)}
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="start" className="bg-white border shadow-md rounded-md p-1">
                            <div className="grid grid-cols-5 gap-1 p-2">
                              {/* 사용 가능한 아이콘만 표시 */}
                              {availableIconKeys.length > 0 ? (
                                availableIconKeys.map((iconKey) => (
                                  <button
                                    key={iconKey}
                                    type="button"
                                    className={cn(
                                      "flex items-center justify-center w-8 h-8 rounded hover:bg-blue-50 transition-colors",
                                      selectedIconKey === iconKey ? "bg-blue-100" : ""
                                    )}
                                    onClick={() => setSelectedIconKey(iconKey)}
                                  >
                                    {renderIcon(iconKey, 20)}
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
                      <Input
                        ref={customInputRef}
                        value={customValue}
                        onChange={(e) => setCustomValue(e.target.value)}
                        placeholder="직접 입력하세요"
                        className="flex-grow"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            e.preventDefault();
                            addCustomOption(field);
                          } else if (e.key === 'Escape') {
                            setIsCustomInputActive(false);
                            setCustomValue("");
                          }
                        }}
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <div className="flex gap-2 justify-end">
                        <Button
                          type="button"
                          size="sm"
                          onClick={() => addCustomOption(field)}
                          disabled={availableIconKeys.length === 0}
                          title={availableIconKeys.length === 0 ? "사용 가능한 아이콘이 없습니다" : ""}
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

                      {availableIconKeys.length === 0 && (
                        <div className="text-sm text-red-500 mt-1">
                          사용 가능한 아이콘이 없습니다. 관리자에게 문의하세요.
                        </div>
                      )}
                    </div>
                  </div>
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