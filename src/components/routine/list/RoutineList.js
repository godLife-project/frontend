// components/routine/list/RoutineList.jsx
import React from "react";
import {
  Clock,
  Eye,
  Heart,
  GitFork,
  Flame,
  Filter,
  Search,
  AlertTriangle,
  Loader2,
  Plus,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 경로 수정: RoutineCard 경로 변경
import RoutineCard from "@/components/routine/list/RoutineCard";

// 인라인 EmptyState 컴포넌트 정의
const EmptyState = ({
  icon: Icon,
  title,
  description,
  buttonText,
  onAction,
  iconColor = "text-gray-400",
  iconSize = 48,
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center border border-dashed border-gray-300 rounded-lg bg-gray-50">
      <Icon className={`${iconColor} mb-4`} size={iconSize} />
      <h3 className="text-xl font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6 max-w-md">{description}</p>
      {buttonText && onAction && (
        <Button onClick={onAction}>{buttonText}</Button>
      )}
    </div>
  );
};

const RoutineList = ({
  routines = [],
  isLoading = false,
  error = null,

  // 액션 핸들러
  onCardClick,
  onAddNewRoutine,
  onRetry = () => {}, // 새로 추가한 onRetry 핸들러

  // 레이아웃 타입
  isMyRoutine = false,

  // 검색 및 필터 관련 (공개 루틴 전용)
  searchTerm = "",
  onSearch = () => {},
  filters = {},
  onFilterChange = () => {},
  onResetFilters = () => {},

  // 페이지네이션 (공개 루틴 전용)
  currentPage = 1,
  totalPages = 1,
  totalPosts = 0,
  onPageChange = () => {}, // 누락된 onPageChange 함수 기본값 추가
}) => {
  // 마이 루틴 목록 렌더링
  const renderMyRoutineList = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </div>
      );
    }

    if (error) {
      return (
        <EmptyState
          icon={AlertTriangle}
          title="데이터를 불러올 수 없습니다"
          description={error}
          buttonText="다시 시도"
          onAction={onRetry}
        />
      );
    }

    // 루틴 데이터가 없는 경우
    if (!Array.isArray(routines) || routines.length === 0) {
      return (
        <EmptyState
          icon={Plus}
          title="등록된 루틴이 없습니다"
          description="첫 번째 루틴을 만들어 보세요"
          buttonText="루틴 만들기"
          onAction={onAddNewRoutine}
        />
      );
    }

    // 활성화된 루틴과 비활성화된 루틴 분류
    const activeRoutines = routines.filter((routine) => {
      const planInfos = routine.myPlanInfos || routine.planInfos;
      return planInfos && planInfos.isActive === 1;
    });

    const inactiveRoutines = routines.filter((routine) => {
      const planInfos = routine.myPlanInfos || routine.planInfos;
      return planInfos && planInfos.isActive !== 1;
    });

    return (
      <div className="space-y-8">
        {/* 헤더 영역 */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-1">
              나의 루틴 목록
            </h1>
            <p className="text-gray-600">총 {routines.length}개의 루틴</p>
          </div>
          <Button onClick={onAddNewRoutine} className="flex items-center">
            <Plus size={16} className="mr-2" />새 루틴
          </Button>
        </div>

        {/* 활성화된 루틴 섹션 */}
        <div>
          <div className="flex items-center mb-4 gap-2">
            <CheckCircle className="text-green-500" size={20} />
            <h2 className="text-xl font-bold text-gray-800">활성화 루틴</h2>
            <span className="bg-green-100 text-green-800 text-sm px-2 py-0.5 rounded-full">
              {activeRoutines.length}
            </span>
          </div>

          {activeRoutines.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {activeRoutines.map((routine) => (
                <RoutineCard
                  key={
                    routine.myPlanInfos?.planIdx || routine.planInfos?.planIdx
                  }
                  routine={routine}
                  onClick={onCardClick}
                  isPublic={false}
                  isActive={true}
                />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
              <p className="text-gray-600 mb-2">활성화된 루틴이 없습니다.</p>
              <Button
                variant="outline"
                onClick={onAddNewRoutine}
                className="mt-2"
              >
                <Plus size={16} className="mr-2" />새 루틴 만들기
              </Button>
            </div>
          )}
        </div>

        {/* 비활성화된 루틴 섹션 */}
        <div>
          <div className="flex items-center mb-4 gap-2">
            <XCircle className="text-gray-400" size={20} />
            <h2 className="text-xl font-bold text-gray-800">비활성화 루틴</h2>
            <span className="bg-gray-100 text-gray-600 text-sm px-2 py-0.5 rounded-full">
              {inactiveRoutines.length}
            </span>
          </div>

          {inactiveRoutines.length > 0 ? (
            <div className="grid grid-cols-1 gap-6">
              {inactiveRoutines.map((routine) => (
                <RoutineCard
                  key={
                    routine.myPlanInfos?.planIdx || routine.planInfos?.planIdx
                  }
                  routine={routine}
                  onClick={onCardClick}
                  isPublic={false}
                  isActive={false}
                />
              ))}
            </div>
          ) : (
            <div className="border border-dashed border-gray-300 rounded-lg p-6 text-center bg-gray-50">
              <p className="text-gray-600">비활성화된 루틴이 없습니다.</p>
            </div>
          )}
        </div>
      </div>
    );
  };

  // 공개 루틴 탐색 렌더링
  const renderPublicRoutineSearch = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
        </div>
      );
    }

    if (error) {
      return (
        <EmptyState
          icon={AlertTriangle}
          title="데이터를 불러올 수 없습니다"
          description={error}
          buttonText="다시 시도"
          onAction={() => window.location.reload()}
        />
      );
    }

    return (
      <>
        {/* 루틴 목록 */}
        {!routines || routines.length === 0 ? (
          <EmptyState
            icon={Search}
            title="검색 결과가 없습니다"
            description="다른 검색어나 필터 조건을 시도해보세요"
            buttonText="필터 초기화"
            onAction={onResetFilters}
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {routines.map((routine) => (
              <RoutineCard
                key={routine.planInfos?.planIdx}
                routine={routine}
                onClick={onCardClick}
                isPublic={true}
              />
            ))}
          </div>
        )}

        {/* 페이지네이션 (간단한 버전) */}
        {totalPages > 1 && (
          <div className="flex justify-center mt-8">
            <div className="flex space-x-1">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <Button
                    key={page}
                    variant={currentPage === page ? "default" : "outline"}
                    size="sm"
                    onClick={() => onPageChange(page)}
                    className={`w-10 h-10 ${
                      currentPage === page
                        ? "bg-blue-500 text-white"
                        : "text-gray-600"
                    }`}
                  >
                    {page}
                  </Button>
                )
              )}
            </div>
          </div>
        )}
      </>
    );
  };

  // isMyRoutine 프롭에 따라 다른 UI 렌더링
  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {isMyRoutine ? renderMyRoutineList() : renderPublicRoutineSearch()}
    </div>
  );
};

export default RoutineList;
