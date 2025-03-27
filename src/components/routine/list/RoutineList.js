import React from "react";
import { Button } from "@/components/ui/button";
import { PlusCircle, CheckCircle, XCircle, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ChevronLeft, ChevronRight } from "lucide-react";
import RoutineCard from "./RoutineCard";

// 페이지네이션 컴포넌트
const Pagination = ({ pagination }) => {
  // pagination이 없으면 렌더링하지 않음
  if (!pagination) return null;

  const { page, size, totalItems, onPageChange, onSizeChange } = pagination;

  // 총 페이지 수 계산
  const totalPages = Math.ceil(totalItems / size) || 1;

  return (
    <div className="mt-8 mb-12">
      <div className="flex flex-col md:flex-row justify-between items-center gap-4">
        <div className="flex items-center">
          <span className="text-sm text-gray-500 mr-2">표시 개수:</span>
          <Select
            value={String(size)}
            onValueChange={(value) => onSizeChange(Number(value))}
          >
            <SelectTrigger className="w-24 h-9">
              <SelectValue placeholder="개수" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="10">10개</SelectItem>
              <SelectItem value="20">20개</SelectItem>
              <SelectItem value="50">50개</SelectItem>
              <SelectItem value="100">100개</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(1)}
            disabled={page === 1}
            className="px-2 h-9"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            처음
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="px-2 h-9"
          >
            이전
          </Button>

          <div className="px-3 py-2 border rounded-md bg-white">
            <span className="text-sm">
              {page} / {totalPages} 페이지
            </span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="px-2 h-9"
          >
            다음
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(totalPages)}
            disabled={page >= totalPages}
            className="px-2 h-9"
          >
            마지막
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>

        <div className="text-sm text-gray-500">총 {totalItems}개의 루틴</div>
      </div>
    </div>
  );
};

// 메인 루틴 리스트 컴포넌트 - 검색 및 필터 기능 제거된 버전
const RoutineList = ({
  routines,
  isLoading,
  error,
  onCardClick,
  onAddNewRoutine,
  pagination, // 페이지네이션 정보
}) => {
  // null/undefined 체크 추가
  const safeRoutines = routines || [];

  // 상태에 따른 루틴 분류
  const activeRoutines = safeRoutines.filter(
    (routine) => routine?.myPlanInfos?.isActive
  );
  const inactiveRoutines = safeRoutines.filter(
    (routine) => routine?.myPlanInfos && !routine.myPlanInfos.isActive
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-200 rounded-full mb-4"></div>
          <div className="text-lg text-blue-500 font-medium">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-red-500">
        <p className="mb-4 text-lg">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-red-100 text-red-600 hover:bg-red-200"
        >
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">나의 루틴 목록</h1>
          <p className="text-gray-500 mt-1">
            총 {pagination?.totalItems || safeRoutines.length}개의 루틴
          </p>
        </div>
        <Button
          onClick={onAddNewRoutine}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 font-medium py-2 px-4 shadow-md transition-all hover:shadow-lg"
        >
          <PlusCircle className="w-4 h-4 mr-2" />새 루틴
        </Button>
      </div>

      {/* 결과가 없을 때 */}
      {safeRoutines.length === 0 && (
        <div className="text-center py-10 bg-gray-50 rounded-lg border border-gray-200 mb-6">
          <Search className="w-12 h-12 text-gray-300 mx-auto mb-3" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            루틴이 없습니다
          </h3>
          <p className="text-gray-500">새로운 루틴을 추가해 보세요</p>
          <Button onClick={onAddNewRoutine} variant="outline" className="mt-4">
            새 루틴 만들기
          </Button>
        </div>
      )}

      {safeRoutines.length > 0 && (
        <div className="space-y-10">
          {/* 활성 루틴 섹션 */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-1.5 rounded-md mr-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">활성 루틴</h2>
              <span className="bg-green-100 text-green-700 text-sm font-medium ml-3 px-2.5 py-0.5 rounded-full">
                {activeRoutines.length}
              </span>
            </div>

            {activeRoutines.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">활성화된 루틴이 없습니다.</p>
                <Button
                  onClick={onAddNewRoutine}
                  variant="link"
                  className="text-blue-600 mt-2"
                >
                  새 루틴 만들기
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeRoutines.map((routine) => (
                  <RoutineCard
                    key={routine.myPlanInfos.planIdx}
                    routine={routine}
                    onClick={onCardClick}
                    isActive={true}
                    isPublic={false}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 비활성 루틴 섹션 */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-1.5 rounded-md mr-2">
                <XCircle className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">비활성 루틴</h2>
              <span className="bg-blue-100 text-blue-700 text-sm font-medium ml-3 px-2.5 py-0.5 rounded-full">
                {inactiveRoutines.length}
              </span>
            </div>

            {inactiveRoutines.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border border-dashed border-blue-200">
                <p className="text-blue-500">비활성화된 루틴이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inactiveRoutines.map((routine) => (
                  <RoutineCard
                    key={routine.myPlanInfos.planIdx}
                    routine={routine}
                    onClick={onCardClick}
                    isActive={false}
                    isPublic={false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 페이지네이션 추가 */}
      {safeRoutines.length > 0 && <Pagination pagination={pagination} />}
    </div>
  );
};

export default RoutineList;
