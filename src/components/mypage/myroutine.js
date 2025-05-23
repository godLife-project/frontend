import React, { useState, useEffect } from "react";
import {
  CheckCircle,
  Target,
  Trophy,
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import axiosInstance from "@/api/axiosInstance";

const RoutineTabContent = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [routineData, setRoutineData] = useState(null);

  // 필터 상태
  const [filters, setFilters] = useState({
    page: 1,
    size: 3,
    status: 0,
    target: null,
    job: null,
    sort: "latest",
    order: "desc",
    search: "",
  });

  // 검색어 임시 상태
  const [searchInput, setSearchInput] = useState("");

  // 필터 표시 상태
  const [showFilters, setShowFilters] = useState(false);

  // 토큰 가져오기
  const accessToken = localStorage.getItem("accessToken");

  // API 호출 함수
  const fetchMyRoutines = async (params = filters) => {
    try {
      setLoading(true);

      // 쿼리 파라미터 구성
      const queryParams = new URLSearchParams();
      queryParams.append("page", params.page);
      queryParams.append("size", params.size);
      queryParams.append("status", params.status);
      queryParams.append("sort", params.sort);
      queryParams.append("order", params.order);

      if (params.target) {
        queryParams.append("target", params.target);
      }
      if (params.job) {
        queryParams.append("job", params.job);
      }
      if (params.search) {
        queryParams.append("search", params.search);
      }

      const response = await axiosInstance.get(
        `/myPage/auth/list/myPlan?${queryParams.toString()}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 10000,
        }
      );

      setRoutineData(response.data);
      setError(null);
    } catch (err) {
      console.error("루틴 데이터를 불러오는 중 오류 발생:", err);
      setError("루틴 데이터를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    if (accessToken) {
      fetchMyRoutines();
    } else {
      setError("로그인이 필요합니다.");
      setLoading(false);
    }
  }, [accessToken]);

  // 필터 변경시 데이터 다시 로드
  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }; // 필터 변경시 첫 페이지로
    setFilters(updatedFilters);
    fetchMyRoutines(updatedFilters);
  };

  // 페이지 변경
  const handlePageChange = (newPage) => {
    const updatedFilters = { ...filters, page: newPage };
    setFilters(updatedFilters);
    fetchMyRoutines(updatedFilters);
  };

  // 검색 실행
  const handleSearch = () => {
    handleFilterChange({ search: searchInput });
  };

  // 검색 초기화
  const handleSearchReset = () => {
    setSearchInput("");
    handleFilterChange({ search: "" });
  };

  // Enter 키로 검색
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // API 데이터가 있으면 사용, 없으면 빈 배열
  const allRoutines = routineData ? routineData.plans : [];
  const totalPages = routineData ? routineData.totalPages : 1;
  const currentPage = routineData ? routineData.currentPage : 1;

  // 상태 옵션
  const statusOptions = [
    { value: 0, label: "전체" },
    { value: 1, label: "진행중" },
    { value: 2, label: "대기중" },
    { value: 3, label: "완료" },
    { value: 4, label: "조기종료" },
    { value: 5, label: "진행+대기" },
  ];

  // 정렬 옵션
  const sortOptions = [
    { value: "latest", label: "등록일" },
    { value: "view", label: "조회수" },
    { value: "like", label: "추천수" },
    { value: "fork", label: "포크수" },
    { value: "fire", label: "불꽃 경험치" },
  ];

  // 로딩 상태
  if (loading) {
    return (
      <div className="p-5 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-sm text-gray-500">루틴을 불러오는 중...</p>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm text-red-500 mb-3">{error}</p>
        <button
          onClick={() => fetchMyRoutines()}
          className="text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          다시 시도
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* 검색 및 필터 */}
      <div className="space-y-3">
        {/* 검색바 */}
        <div className="flex space-x-2">
          <div className="flex-1 relative">
            <input
              type="text"
              placeholder="루틴 제목으로 검색..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <Search
              size={16}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            검색
          </button>
          {filters.search && (
            <button
              onClick={handleSearchReset}
              className="px-3 py-2 bg-gray-500 text-white text-sm rounded-lg hover:bg-gray-600"
            >
              초기화
            </button>
          )}
        </div>

        {/* 필터 토글 버튼 */}
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
        >
          <Filter size={16} />
          <span>{showFilters ? "필터 숨기기" : "고급 필터"}</span>
          {showFilters ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
        </button>

        {/* 필터 패널 */}
        {showFilters && (
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-4">
              {/* 상태 필터 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  상태
                </label>
                <select
                  value={filters.status}
                  onChange={(e) =>
                    handleFilterChange({ status: parseInt(e.target.value) })
                  }
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  {statusOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* 정렬 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  정렬
                </label>
                <div className="flex space-x-1">
                  <select
                    value={filters.sort}
                    onChange={(e) =>
                      handleFilterChange({ sort: e.target.value })
                    }
                    className="flex-1 px-2 py-1 text-sm border border-gray-300 rounded"
                  >
                    {sortOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  <select
                    value={filters.order}
                    onChange={(e) =>
                      handleFilterChange({ order: e.target.value })
                    }
                    className="px-2 py-1 text-sm border border-gray-300 rounded"
                  >
                    <option value="desc">↓</option>
                    <option value="asc">↑</option>
                  </select>
                </div>
              </div>
            </div>

            {/* 페이지 크기 */}
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">
                페이지당 항목 수
              </label>
              <select
                value={filters.size}
                onChange={(e) =>
                  handleFilterChange({ size: parseInt(e.target.value) })
                }
                className="px-2 py-1 text-sm border border-gray-300 rounded"
              >
                <option value={3}>3개</option>
                <option value={5}>5개</option>
                <option value={7}>7개</option>
                <option value={10}>10개</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* 빈 상태일 때 */}
      {allRoutines.length === 0 ? (
        <div className="p-5 text-center">
          <CheckCircle size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">
            {filters.search
              ? "검색 결과가 없습니다."
              : "아직 등록된 루틴이 없습니다."}
          </p>
          {!filters.search && (
            <button className="mt-3 text-xs px-3 py-1 bg-blue-600 text-white rounded-lg">
              루틴 만들기
            </button>
          )}
        </div>
      ) : (
        <>
          {/* 루틴 리스트 */}
          <div className="space-y-3">
            {allRoutines.map((routine) => (
              <div
                key={routine.planInfos.planIdx}
                className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-shadow"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-800">
                      {routine.planInfos.planTitle}
                    </span>
                    <span
                      className="text-xs text-white px-2 py-1 rounded"
                      style={{ backgroundColor: routine.targetInfos.color }}
                    >
                      {routine.targetInfos.name}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4 text-sm">
                  <div className="flex items-center text-gray-600">
                    <Target size={14} className="mr-2 text-blue-500" />
                    <span>조회 {routine.planInfos.viewCount}회</span>
                  </div>
                </div>

                <div className="mt-3 text-xs text-gray-500">
                  <div className="flex justify-between items-center">
                    <span>
                      등록일:{" "}
                      {new Date(
                        routine.planInfos.planSubDate
                      ).toLocaleDateString("ko-KR")}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center space-x-2 py-4">
              <button
                onClick={() => handlePageChange(currentPage - 1)}
                disabled={currentPage <= 1}
                className="flex items-center px-3 py-1 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                <ChevronLeft size={16} />
                이전
              </button>

              <div className="flex items-center space-x-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  const page = Math.max(1, currentPage - 2) + i;
                  if (page > totalPages) return null;

                  return (
                    <button
                      key={page}
                      onClick={() => handlePageChange(page)}
                      className={`px-3 py-1 text-sm rounded-lg ${
                        page === currentPage
                          ? "bg-blue-600 text-white"
                          : "border hover:bg-gray-50"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => handlePageChange(currentPage + 1)}
                disabled={currentPage >= totalPages}
                className="flex items-center px-3 py-1 text-sm border rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
              >
                다음
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default RoutineTabContent;
