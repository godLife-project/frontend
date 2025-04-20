import React, { useState, useEffect } from "react";
import { Search, Filter, ChevronDown, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import SearchBar from "@/components/common/SearchBar/SearchBar";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuCheckboxItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

const SearchWrapper = ({
  searchTerm,
  filters,
  onFilterChange,
  totalResults,
  placeholder = "검색...",
  onSearch,
}) => {
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [targetCategories, setTargetCategories] = useState([]);
  const [jobCategories, setJobCategories] = useState([]);

  // 로컬 스토리지에서 카테고리 데이터 가져오기
  useEffect(() => {
    try {
      // 목표 카테고리 가져오기
      const targetCategoriesFromStorage =
        localStorage.getItem("targetCategories");
      if (targetCategoriesFromStorage) {
        try {
          const parsedTargets = JSON.parse(targetCategoriesFromStorage);
          console.log("로컬 스토리지에서 로드한 목표 카테고리:", parsedTargets);

          // 각 항목에 targetIdx가 있는지 확인
          const hasCorrectFormat = parsedTargets.every(
            (item) => item.targetIdx !== undefined
          );
          if (!hasCorrectFormat) {
            console.error(
              "일부 목표 카테고리에 targetIdx가 없습니다:",
              parsedTargets.filter((item) => item.targetIdx === undefined)
            );
          }

          setTargetCategories(parsedTargets);
        } catch (parseError) {
          console.error("목표 카테고리 파싱 오류:", parseError);
        }
      } else {
        console.warn("로컬 스토리지에 목표 카테고리 데이터가 없습니다.");
      }

      // 직업 카테고리 가져오기
      const jobCategoriesFromStorage = localStorage.getItem("jobCategories");
      if (jobCategoriesFromStorage) {
        try {
          const parsedJobs = JSON.parse(jobCategoriesFromStorage);
          console.log("로컬 스토리지에서 로드한 직업 카테고리:", parsedJobs);
          setJobCategories(parsedJobs);
        } catch (parseError) {
          console.error("직업 카테고리 파싱 오류:", parseError);
        }
      } else {
        console.warn("로컬 스토리지에 직업 카테고리 데이터가 없습니다.");
      }
    } catch (error) {
      console.error("로컬 스토리지에서 카테고리 데이터 가져오기 실패:", error);
    }
  }, []);

  // 필터 상태 변경 핸들러
  const handleFilterChange = (key, value) => {
    console.log(`SearchWrapper 필터 변경: ${key} = ${value}`);
    onFilterChange(key, value);
  };

  // 체크박스 다중 선택 핸들러 (목표, 직업 카테고리)
  const handleMultipleSelect = (key, id) => {
    console.log(`다중 선택 처리: ${key}, ID ${id}, 타입: ${typeof id}`);

    // ID가 유효한지 확인 (undefined나 null이 아닌지)
    if (id === undefined || id === null) {
      console.error(`유효하지 않은 ID: ${id}`);
      return; // 유효하지 않은 ID는 처리하지 않음
    }

    // 숫자로 변환 (안전하게)
    const numId = parseInt(id, 10);

    if (isNaN(numId)) {
      console.error(`숫자로 변환할 수 없는 ID: ${id}`);
      return;
    }

    console.log(`변환된 ID: ${numId}`);

    const currentValues = filters[key]
      ? filters[key]
          .split(",")
          .filter(Boolean)
          .map((val) => parseInt(val, 10))
          .filter((val) => !isNaN(val))
      : [];

    console.log(`현재 선택된 값들:`, currentValues);

    let newValue = "";

    if (currentValues.includes(numId)) {
      // 이미 선택된 항목이면 제거
      const newValues = currentValues.filter((val) => val !== numId);
      newValue = newValues.length > 0 ? newValues.join(",") : "";
      console.log(`ID ${numId} 제거, 새 값:`, newValue);
    } else {
      // 선택되지 않은 항목이면 추가
      const newValues = [...currentValues, numId];
      newValue = newValues.join(",");
      console.log(`ID ${numId} 추가, 새 값:`, newValue);
    }

    // 변경된 필터 값을 상위 컴포넌트에 전달
    handleFilterChange(key, newValue);
  };

  // 필터 초기화
  const resetFilters = () => {
    const defaultFilters = {
      status: "all",
      target: "",
      job: "",
      sort: "latest",
      order: "desc",
    };

    // 각 필터 속성을 개별적으로 업데이트
    Object.entries(defaultFilters).forEach(([key, value]) => {
      onFilterChange(key, value);
    });

    // 검색어 초기화
    onSearch("");
  };

  // 선택된 필터 카운트
  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.status && filters.status !== "all") count++;
    if (filters.target) count++;
    if (filters.job) count++;
    if (filters.sort && filters.sort !== "latest") count++;
    if (filters.order && filters.order !== "desc") count++;
    return count;
  };

  const statusOptions = [
    { value: "1", label: "진행중인 루틴" },
    { value: "2", label: "대기중인 루틴" },
    { value: "3", label: "완료된 루틴" },
    { value: "all", label: "진행+대기 루틴" },
  ];

  const sortOptions = [
    { value: "latest", label: "등록일순" },
    { value: "view", label: "조회수순" },
    { value: "like", label: "추천수순" },
    { value: "fork", label: "포크수순" },
    { value: "fire", label: "경험치순" },
  ];

  const orderOptions = [
    { value: "desc", label: "내림차순" },
    { value: "asc", label: "오름차순" },
  ];

  // 선택된 카테고리 이름 표시
  const getSelectedCategoryNames = (key, categories) => {
    if (!filters[key]) return "전체";
    if (!categories || categories.length === 0) return "전체";

    try {
      const selectedIds = filters[key]
        .split(",")
        .filter(Boolean)
        .map((id) => Number(id))
        .filter((id) => !isNaN(id));

      if (selectedIds.length === 0) return "전체";

      const names = selectedIds
        .map((id) => {
          // idx 필드를 기준으로 카테고리 찾기
          const category = categories.find((cat) => cat.idx === id);
          return category?.name || "";
        })
        .filter(Boolean);

      return names.length > 0 ? names.join(", ") : "전체";
    } catch (error) {
      console.error(`${key} 카테고리 이름 가져오기 오류:`, error);
      return "전체";
    }
  };

  return (
    <Card className="mb-6">
      <CardContent className="p-4">
        <div className="flex flex-col space-y-4">
          {/* 검색바 */}
          <SearchBar
            initialSearchTerm={searchTerm}
            onSearch={onSearch}
            placeholder={placeholder}
          />

          {/* 필터 토글 버튼 */}
          <Collapsible
            open={isFilterOpen}
            onOpenChange={setIsFilterOpen}
            className="w-full"
          >
            <div className="flex items-center justify-between">
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="flex items-center gap-1"
                >
                  <Filter className="h-4 w-4" />
                  <span>고급 필터</span>
                  {getActiveFilterCount() > 0 && (
                    <Badge
                      variant="secondary"
                      className="ml-1 h-5 w-5 p-0 flex items-center justify-center"
                    >
                      {getActiveFilterCount()}
                    </Badge>
                  )}
                  <ChevronDown
                    className={`h-4 w-4 transition-transform ${
                      isFilterOpen ? "rotate-180" : ""
                    }`}
                  />
                </Button>
              </CollapsibleTrigger>

              {getActiveFilterCount() > 0 && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-xs text-muted-foreground"
                >
                  <X className="h-3 w-3 mr-1" />
                  필터 초기화
                </Button>
              )}
            </div>

            <CollapsibleContent className="mt-4 space-y-4">
              {/* 루틴 상태 필터 */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">루틴 상태</label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      handleFilterChange("status", value)
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="루틴 상태 선택" />
                    </SelectTrigger>
                    <SelectContent className="bg-white">
                      {statusOptions.map((option) => (
                        <SelectItem
                          key={option.value}
                          value={option.value}
                          className="hover:bg-gray-100"
                        >
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* 정렬 기준 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">정렬 기준</label>
                  <div className="flex space-x-2">
                    <Select
                      value={filters.sort}
                      onValueChange={(value) =>
                        handleFilterChange("sort", value)
                      }
                      className="flex-1"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="정렬 기준" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {sortOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="hover:bg-gray-100"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select
                      value={filters.order}
                      onValueChange={(value) =>
                        handleFilterChange("order", value)
                      }
                      className="w-28"
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="순서" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        {orderOptions.map((option) => (
                          <SelectItem
                            key={option.value}
                            value={option.value}
                            className="hover:bg-gray-100"
                          >
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* 목표 & 직업 카테고리 */}
              <div className="grid grid-cols-2 gap-4">
                {/* 목표 카테고리 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">목표 카테고리</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {getSelectedCategoryNames("target", targetCategories)}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-white shadow-md border border-gray-200">
                      <DropdownMenuCheckboxItem
                        checked={!filters.target}
                        onCheckedChange={() => handleFilterChange("target", "")}
                        className="hover:bg-gray-100"
                      >
                        전체
                      </DropdownMenuCheckboxItem>
                      <Separator className="my-1" />
                      {targetCategories.map((category) => (
                        <DropdownMenuCheckboxItem
                          key={category.idx}
                          checked={filters.target
                            ?.split(",")
                            .filter(Boolean)
                            .map(Number)
                            .includes(category.idx)}
                          onCheckedChange={() => {
                            console.log(
                              "목표 카테고리 선택:",
                              category.name,
                              "idx:",
                              category.idx
                            );
                            handleMultipleSelect("target", category.idx);
                          }}
                          className="hover:bg-gray-100"
                        >
                          {category.name}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                {/* 직업 카테고리 */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">직업 카테고리</label>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-between"
                      >
                        <span className="truncate">
                          {getSelectedCategoryNames("job", jobCategories)}
                        </span>
                        <ChevronDown className="h-4 w-4 opacity-50" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-white shadow-md border border-gray-200">
                      <DropdownMenuCheckboxItem
                        checked={!filters.job}
                        onCheckedChange={() => handleFilterChange("job", "")}
                        className="hover:bg-gray-100"
                      >
                        전체
                      </DropdownMenuCheckboxItem>
                      <Separator className="my-1" />
                      {jobCategories.map((category) => (
                        <DropdownMenuCheckboxItem
                          key={category.idx}
                          checked={filters.job
                            ?.split(",")
                            .filter(Boolean)
                            .map(Number)
                            .includes(category.idx)}
                          onCheckedChange={() => {
                            console.log(
                              "직업 카테고리 선택:",
                              category.name,
                              "idx:",
                              category.idx
                            );
                            handleMultipleSelect("job", category.idx);
                          }}
                          className="hover:bg-gray-100"
                        >
                          {category.name}
                        </DropdownMenuCheckboxItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CollapsibleContent>
          </Collapsible>

          {/* 검색 결과 카운트 */}
          {(searchTerm || getActiveFilterCount() > 0) && (
            <div className="text-sm text-muted-foreground mt-2">
              <span className="font-medium text-foreground">
                {totalResults}
              </span>
              개의 결과 찾음
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SearchWrapper;
