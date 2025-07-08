import React, { useState, useEffect, useRef } from "react";
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
  Trash2,
  Square,
  CheckSquare,
  Lock,
  Unlock,
  X, // X 아이콘 추가
} from "lucide-react";
import { Link } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";

const RoutineTabContent = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [routineData, setRoutineData] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [privacyLoading, setPrivacyLoading] = useState({});

  // 선택된 루틴들의 planIdx 배열
  const [selectedRoutines, setSelectedRoutines] = useState([]);

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

  // 검색 기록 관련 상태
  const [searchHistory, setSearchHistory] = useState([]);
  const [showSearchHistory, setShowSearchHistory] = useState(false);
  const [searchHistoryLoading, setSearchHistoryLoading] = useState(false);

  // 검색창 ref
  const searchInputRef = useRef(null);
  const searchHistoryRef = useRef(null);

  // 토큰 가져오기
  const accessToken = localStorage.getItem("accessToken");

  // 검색 기록 조회 API
  const fetchSearchHistory = async () => {
    try {
      setSearchHistoryLoading(true);
      const response = await axiosInstance.get("/search/log?type=routine", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 10000,
      });

      // API 응답 구조: { code: 200, message: [...], status: "success" }
      const historyData = response.data;
      if (historyData && Array.isArray(historyData.message)) {
        setSearchHistory(historyData.message);
      } else {
        setSearchHistory([]);
      }
    } catch (err) {
      console.error("검색 기록 조회 중 오류 발생:", err);
      setSearchHistory([]);
    } finally {
      setSearchHistoryLoading(false);
    }
  };

  // 검색 기록 저장 API
  const saveSearchHistory = async (keyword) => {
    if (!keyword.trim()) return;

    try {
      await axiosInstance.get(
        `/search/log?keyword=${encodeURIComponent(keyword)}&type=routine`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 10000,
        }
      );
    } catch (err) {
      console.error("검색 기록 저장 중 오류 발생:", err);
    }
  };

  // 검색 기록 삭제 API
  const deleteSearchHistory = async (logIdx) => {
    try {
      await axiosInstance.patch(
        `/search/log/${logIdx}`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 10000,
        }
      );
      // 삭제 후 검색 기록 다시 조회
      fetchSearchHistory();
    } catch (err) {
      console.error("검색 기록 삭제 중 오류 발생:", err);
    }
  };

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

  // 선택된 루틴 삭제 API 호출
  const deleteSelectedRoutines = async () => {
    if (selectedRoutines.length === 0) {
      alert("삭제할 루틴을 선택해주세요.");
      return;
    }

    if (
      !window.confirm(
        `선택된 ${selectedRoutines.length}개의 루틴을 삭제하시겠습니까?`
      )
    ) {
      return;
    }

    try {
      setDeleteLoading(true);

      const response = await axiosInstance.patch(
        "/myPage/auth/delete/plans",
        selectedRoutines,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      alert("선택된 루틴이 삭제되었습니다.");
      setSelectedRoutines([]);
      fetchMyRoutines();
    } catch (err) {
      console.error("루틴 삭제 중 오류 발생:", err);
      alert("루틴 삭제에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setDeleteLoading(false);
    }
  };

  // 루틴 공개/비공개 전환 API 호출
  const toggleRoutinePrivacy = async (planIdx) => {
    try {
      setPrivacyLoading((prev) => ({ ...prev, [planIdx]: true }));

      const response = await axiosInstance.patch(
        "/myPage/auth/switch/isShared?mode=reverse",
        [planIdx],
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          timeout: 10000,
        }
      );

      fetchMyRoutines();
    } catch (err) {
      console.error("루틴 공개/비공개 전환 중 오류 발생:", err);
      alert("공개/비공개 설정 변경에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setPrivacyLoading((prev) => ({ ...prev, [planIdx]: false }));
    }
  };

  // 개별 루틴 선택/해제
  const toggleRoutineSelection = (planIdx) => {
    setSelectedRoutines((prev) =>
      prev.includes(planIdx)
        ? prev.filter((id) => id !== planIdx)
        : [...prev, planIdx]
    );
  };

  // 전체 선택/해제
  const toggleAllSelection = () => {
    const allRoutines = routineData ? routineData.plans : [];
    const currentPagePlanIds = allRoutines.map(
      (routine) => routine.planInfos.planIdx
    );

    const allSelected = currentPagePlanIds.every((id) =>
      selectedRoutines.includes(id)
    );

    if (allSelected) {
      setSelectedRoutines((prev) =>
        prev.filter((id) => !currentPagePlanIds.includes(id))
      );
    } else {
      setSelectedRoutines((prev) => {
        const newSelections = currentPagePlanIds.filter(
          (id) => !prev.includes(id)
        );
        return [...prev, ...newSelections];
      });
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

  // 검색창 외부 클릭 시 검색 기록 숨기기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target) &&
        searchHistoryRef.current &&
        !searchHistoryRef.current.contains(event.target)
      ) {
        setShowSearchHistory(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 필터 변경시 데이터 다시 로드
  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 };
    setFilters(updatedFilters);
    setSelectedRoutines([]);
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
    if (searchInput.trim()) {
      // 검색 기록 저장
      saveSearchHistory(searchInput.trim());
    }
    handleFilterChange({ search: searchInput });
    setShowSearchHistory(false);
  };

  // 검색 초기화 (X 아이콘 클릭 시)
  const handleSearchClear = () => {
    setSearchInput("");
    handleFilterChange({ search: "" });
    setShowSearchHistory(false);
  };

  // Enter 키로 검색
  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  // 검색창 포커스 시 검색 기록 표시
  const handleSearchFocus = () => {
    setShowSearchHistory(true);
    fetchSearchHistory();
  };

  // 검색 기록 항목 클릭
  const handleHistoryItemClick = (searchKeyword) => {
    setSearchInput(searchKeyword);
    handleFilterChange({ search: searchKeyword });
    setShowSearchHistory(false);
  };

  // API 데이터가 있으면 사용, 없으면 빈 배열
  const allRoutines = routineData ? routineData.plans : [];
  const totalPages = routineData ? routineData.totalPages : 1;
  const currentPage = routineData ? routineData.currentPage : 1;

  // 현재 페이지의 모든 항목이 선택되었는지 확인
  const currentPagePlanIds = allRoutines.map(
    (routine) => routine.planInfos.planIdx
  );
  const allCurrentPageSelected =
    currentPagePlanIds.length > 0 &&
    currentPagePlanIds.every((id) => selectedRoutines.includes(id));

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
            <Search
              size={16}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <input
              ref={searchInputRef}
              type="text"
              placeholder="검색어를 입력하세요."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={handleSearchFocus}
              className="w-full pl-10 pr-10 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {/* X 아이콘 - 검색어가 있을 때만 표시 */}
            {searchInput && (
              <button
                onClick={handleSearchClear}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
              >
                <X size={16} />
              </button>
            )}

            {/* 검색 기록 드롭다운 */}
            {showSearchHistory && (
              <div
                ref={searchHistoryRef}
                className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-300 rounded-lg shadow-lg z-50 max-h-60 overflow-y-auto"
              >
                {searchHistoryLoading ? (
                  <div className="p-3 text-center text-sm text-gray-500">
                    검색 기록을 불러오는 중...
                  </div>
                ) : Array.isArray(searchHistory) &&
                  searchHistory.length === 0 ? (
                  <div className="p-3 text-center text-sm text-gray-500">
                    최근 검색어가 없습니다.
                  </div>
                ) : (
                  <div className="py-1">
                    <div className="px-3 py-2 text-xs font-medium text-gray-700 border-b border-gray-100">
                      최근 검색어
                    </div>
                    {Array.isArray(searchHistory) &&
                      searchHistory.map((item) => (
                        <div
                          key={item.logIdx}
                          className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 group"
                        >
                          <button
                            onClick={() =>
                              handleHistoryItemClick(item.searchKeyword)
                            }
                            className="flex-1 text-left text-sm text-gray-700 hover:text-gray-900"
                          >
                            {item.searchKeyword}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteSearchHistory(item.logIdx);
                            }}
                            className="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                          >
                            <X size={12} className="text-gray-400" />
                          </button>
                        </div>
                      ))}
                  </div>
                )}
              </div>
            )}
          </div>
          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
          >
            검색
          </button>
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
          {/* 선택 컨트롤 바 */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div className="flex items-center space-x-3">
              <button
                onClick={toggleAllSelection}
                className="flex items-center space-x-2 text-sm text-gray-600 hover:text-gray-800"
              >
                {allCurrentPageSelected ? (
                  <CheckSquare size={16} className="text-blue-600" />
                ) : (
                  <Square size={16} />
                )}
                <span>전체 선택</span>
              </button>
            </div>

            {selectedRoutines.length > 0 && (
              <button
                onClick={deleteSelectedRoutines}
                disabled={deleteLoading}
                className="flex items-center space-x-2 px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Trash2 size={14} />
                <span>
                  {deleteLoading
                    ? "삭제 중..."
                    : `삭제 (${selectedRoutines.length})`}
                </span>
              </button>
            )}
          </div>

          {/* 루틴 리스트 - 개선된 레이아웃 */}
          <div className="space-y-3">
            {allRoutines.map((routine) => {
              const planIdx = routine.planInfos.planIdx;
              const isSelected = selectedRoutines.includes(planIdx);
              const isShared = routine.planInfos.isShared;
              const isPrivacyToggling = privacyLoading[planIdx];

              return (
                <div
                  key={planIdx}
                  className={`bg-white border rounded-lg p-4 hover:shadow-sm transition-all ${
                    isSelected
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200"
                  }`}
                >
                  <div className="flex items-center space-x-4">
                    {/* 체크박스 - 왼쪽 끝 중앙 정렬 */}
                    <button
                      onClick={() => toggleRoutineSelection(planIdx)}
                      className="flex-shrink-0 self-center"
                    >
                      {isSelected ? (
                        <CheckSquare size={18} className="text-blue-600" />
                      ) : (
                        <Square
                          size={18}
                          className="text-gray-400 hover:text-gray-600"
                        />
                      )}
                    </button>

                    {/* 루틴 내용 - 세로 배치 */}
                    <div className="flex-1">
                      {/* 카테고리 (맨 위) */}
                      <div className="mb-2 flex justify-start">
                        <span
                          className="text-xs text-white px-2 py-1 rounded"
                          style={{
                            backgroundColor: routine.targetInfos.color,
                          }}
                        >
                          {routine.targetInfos.name}
                        </span>
                      </div>

                      {/* 제목과 공개/비공개 버튼 */}
                      <div className="flex items-center justify-start mb-3">
                        <Link
                          to={`/routine/detail/${planIdx}`}
                          className="font-medium text-gray-800 flex-1 hover:text-blue-600 transition-colors"
                        >
                          {routine.planInfos.planTitle}
                        </Link>

                        {/* 공개/비공개 토글 버튼 */}
                        <button
                          onClick={() => toggleRoutinePrivacy(planIdx)}
                          disabled={isPrivacyToggling}
                          className={`ml-3 p-1 rounded hover:bg-gray-100 transition-colors ${
                            isPrivacyToggling
                              ? "opacity-50 cursor-not-allowed"
                              : ""
                          }`}
                          title={
                            isShared
                              ? "공개 상태 (클릭시 비공개)"
                              : "비공개 상태 (클릭시 공개)"
                          }
                        >
                          {isPrivacyToggling ? (
                            <div className="animate-spin w-4 h-4 border border-gray-400 border-t-transparent rounded-full" />
                          ) : isShared ? (
                            <Unlock size={16} className="text-green-600" />
                          ) : (
                            <Lock size={16} className="text-gray-400" />
                          )}
                        </button>
                      </div>

                      {/* 기타 정보 */}
                      <div className="text-xs text-gray-500">
                        <div className="flex items-center space-x-4">
                          <span>
                            등록일:{" "}
                            {new Date(
                              routine.planInfos.planSubDate
                            ).toLocaleDateString("ko-KR")}
                          </span>
                          <span>조회수 {routine.planInfos.viewCount}</span>
                          <span
                            className={`${
                              isShared ? "text-green-600" : "text-gray-400"
                            }`}
                          >
                            {isShared ? "공개" : "비공개"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
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
