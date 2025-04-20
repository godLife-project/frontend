import React from "react";
import { Button } from "@/components/ui/button";
import { renderIcon } from "@/components/common/badge-selector/icon-utils";

const FilterPanel = ({
  filters,
  onFilterChange,
  onApplyFilters,
  onCancel,
  targetCategories = [], // 기본값 빈 배열 추가
  jobCategories = [], // 기본값 빈 배열 추가
}) => {
  // 필터 변경 핸들러
  const handleFilterChange = (key, value) => {
    onFilterChange(key, value);
  };

  // 안전하게 카테고리 ID 추출 (API 응답 구조에 따라 idx 또는 id 사용)
  const getCategoryId = (category) => {
    // idx가, 그다음 id가 있으면 사용, 없으면 빈 문자열 반환
    if (category.idx !== undefined) return category.idx.toString();
    if (category.id !== undefined) return category.id.toString();
    return "";
  };

  return (
    <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        {/* 상태 필터 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            루틴 상태
          </label>
          <select
            value={filters.status}
            onChange={(e) => handleFilterChange("status", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="">전체</option>
            <option value="1">진행중인 루틴</option>
            <option value="2">대기중인 루틴</option>
            <option value="3">완료된 루틴</option>
          </select>
        </div>

        {/* 정렬 순서 선택 */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            정렬 순서
          </label>
          <select
            value={filters.order}
            onChange={(e) => handleFilterChange("order", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="desc">내림차순 (높은순)</option>
            <option value="asc">오름차순 (낮은순)</option>
          </select>
        </div>
      </div>

      {/* 관심사 카테고리 필터 - 배지 스타일 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          관심사 카테고리
        </label>
        <div className="flex flex-wrap gap-2">
          <div
            key="target-all"
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border text-sm font-medium ${
              !filters.target
                ? "bg-blue-500 text-white border-transparent"
                : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50 cursor-pointer"
            }`}
            onClick={() => handleFilterChange("target", "")}
          >
            <span>전체</span>
          </div>

          {targetCategories.map((category) => {
            const categoryId = getCategoryId(category);
            const isSelected = filters.target === categoryId;

            return (
              <div
                key={`target-${categoryId || Math.random()}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border text-sm font-medium cursor-pointer ${
                  isSelected
                    ? "text-white border-transparent"
                    : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: category.color || "#1E90FF",
                        color: "white",
                        borderColor: "transparent",
                      }
                    : {}
                }
                onClick={() =>
                  handleFilterChange("target", isSelected ? "" : categoryId)
                }
              >
                {renderIcon(
                  category.iconKey || "circle",
                  18,
                  "",
                  isSelected,
                  category.color || "#1E90FF"
                )}
                <span>{category.name || "카테고리"}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* 직업 카테고리 필터 - 배지 스타일 */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          직업 카테고리
        </label>
        <div className="flex flex-wrap gap-2">
          <div
            key="job-all"
            className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border text-sm font-medium ${
              !filters.job
                ? "bg-blue-500 text-white border-transparent"
                : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50 cursor-pointer"
            }`}
            onClick={() => handleFilterChange("job", "")}
          >
            <span>전체</span>
          </div>

          {jobCategories.map((category) => {
            const categoryId = getCategoryId(category);
            const isSelected = filters.job === categoryId;

            return (
              <div
                key={`job-${categoryId || Math.random()}`}
                className={`flex items-center gap-2 px-4 py-2 rounded-full transition-all border text-sm font-medium cursor-pointer ${
                  isSelected
                    ? "text-white border-transparent"
                    : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
                }`}
                style={
                  isSelected
                    ? {
                        backgroundColor: category.color || "#1E90FF",
                        color: "white",
                        borderColor: "transparent",
                      }
                    : {}
                }
                onClick={() =>
                  handleFilterChange("job", isSelected ? "" : categoryId)
                }
              >
                {renderIcon(
                  category.iconKey || "circle",
                  18,
                  "",
                  isSelected,
                  category.color || "#1E90FF"
                )}
                <span>{category.name || "직업"}</span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-4 flex justify-end space-x-2">
        <Button variant="outline" onClick={onCancel} className="px-4 py-2">
          취소
        </Button>
        <Button
          className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
          onClick={onApplyFilters}
        >
          필터 적용
        </Button>
      </div>
    </div>
  );
};

export default FilterPanel;
