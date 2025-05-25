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
  Heart,
  X,
  Lock,
  Unlock,
} from "lucide-react";
import { Link } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";

const LikedRoutineTabContent = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [routineData, setRoutineData] = useState(null);
  const [deleteLoading, setDeleteLoading] = useState(false); // 삭제 로딩 상태
  const [deletingItem, setDeletingItem] = useState(null); // 개별 삭제 중인 아이템

  // 필터 상태
  const [filters, setFilters] = useState({
    page: 1,
    size: 3,
    target: null,
    job: null,
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
  const fetchLikedRoutines = async (params = filters) => {
    try {
      setLoading(true);

      // 쿼리 파라미터 구성
      const queryParams = new URLSearchParams();
      queryParams.append("page", params.page);
      queryParams.append("size", params.size);
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
        `/myPage/auth/list/myLike?${queryParams.toString()}`,
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
      console.error("좋아요한 루틴 데이터를 불러오는 중 오류 발생:", err);
      setError("좋아요한 루틴 데이터를 불러오는 데 실패했습니다.");
    } finally {
      setLoading(false);
    }
  };

  // 개별 좋아요 루틴 삭제 API 호출
  const deleteSingleLike = async (planIdx) => {
    if (!window.confirm("이 루틴의 좋아요를 취소하시겠습니까?")) {
      return;
    }

    try {
      setDeletingItem(planIdx);

      const response = await axiosInstance.delete(
        `/myPage/auth/delete/likes?planIndexes=${planIdx}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 10000,
        }
      );

      // 삭제 성공 시
      alert("좋아요가 취소되었습니다.");
      fetchLikedRoutines(); // 리스트 새로고침
    } catch (err) {
      console.error("좋아요 삭제 중 오류 발생:", err);
      alert("좋아요 취소에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setDeletingItem(null);
    }
  };

  // 전체 좋아요 취소 API 호출
  const deleteAllLikes = async () => {
    const allRoutines = routineData ? routineData.plans : [];

    if (allRoutines.length === 0) {
      alert("취소할 좋아요 루틴이 없습니다.");
      return;
    }

    if (
      !window.confirm(
        `현재 페이지의 모든 좋아요(${allRoutines.length}개)를 취소하시겠습니까?`
      )
    ) {
      return;
    }

    try {
      setDeleteLoading(true);

      // 현재 페이지의 모든 planIdx 수집
      const planIndexes = allRoutines
        .map((routine) => routine.planInfos.planIdx)
        .join(",");

      const response = await axiosInstance.delete(
        `/myPage/auth/delete/likes?planIndexes=${planIndexes}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 10000,
        }
      );

      // 삭제 성공 시
      alert("모든 좋아요가 취소되었습니다.");
      fetchLikedRoutines(); // 리스트 새로고침
    } catch (err) {
      console.error("전체 좋아요 삭제 중 오류 발생:", err);
      alert("좋아요 취소에 실패했습니다. 다시 시도해주세요.");
    } finally {
      setDeleteLoading(false);
    }
  };

  useEffect(() => {
    if (accessToken) {
      fetchLikedRoutines();
    } else {
      setError("로그인이 필요합니다.");
      setLoading(false);
    }
  }, [accessToken]);

  // 필터 변경시 데이터 다시 로드
  const handleFilterChange = (newFilters) => {
    const updatedFilters = { ...filters, ...newFilters, page: 1 }; // 필터 변경시 첫 페이지로
    setFilters(updatedFilters);
    fetchLikedRoutines(updatedFilters);
  };

  // 페이지 변경
  const handlePageChange = (newPage) => {
    const updatedFilters = { ...filters, page: newPage };
    setFilters(updatedFilters);
    fetchLikedRoutines(updatedFilters);
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

  // 로딩 상태
  if (loading) {
    return (
      <div className="p-5 text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto mb-2"></div>
        <p className="text-sm text-gray-500">좋아요한 루틴을 불러오는 중...</p>
      </div>
    );
  }

  // 에러 상태
  if (error) {
    return (
      <div className="p-5 text-center">
        <p className="text-sm text-red-500 mb-3">{error}</p>
        <button
          onClick={() => fetchLikedRoutines()}
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
              placeholder="좋아요한 루틴 제목으로 검색..."
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
              {/* 목표 필터 (target) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  목표 분야
                </label>
                <select
                  value={filters.target || ""}
                  onChange={(e) =>
                    handleFilterChange({
                      target: e.target.value || null,
                    })
                  }
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="">전체</option>
                  <option value="health">건강</option>
                  <option value="study">공부</option>
                  <option value="hobby">취미</option>
                  <option value="work">업무</option>
                  <option value="exercise">운동</option>
                  {/* 실제 목표 옵션은 API 응답에 따라 조정 */}
                </select>
              </div>

              {/* 직업 필터 (job) */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  직업
                </label>
                <select
                  value={filters.job || ""}
                  onChange={(e) =>
                    handleFilterChange({
                      job: e.target.value || null,
                    })
                  }
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="">전체</option>
                  <option value="student">학생</option>
                  <option value="office">직장인</option>
                  <option value="freelancer">프리랜서</option>
                  <option value="entrepreneur">사업가</option>
                  {/* 실제 직업 옵션은 API 응답에 따라 조정 */}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* 정렬 순서 */}
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">
                  정렬 순서
                </label>
                <select
                  value={filters.order}
                  onChange={(e) =>
                    handleFilterChange({ order: e.target.value })
                  }
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value="desc">최신순</option>
                  <option value="asc">오래된순</option>
                </select>
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
                  className="w-full px-2 py-1 text-sm border border-gray-300 rounded"
                >
                  <option value={3}>3개</option>
                  <option value={5}>5개</option>
                  <option value={7}>7개</option>
                  <option value={10}>10개</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 빈 상태일 때 */}
      {allRoutines.length === 0 ? (
        <div className="p-5 text-center">
          <Heart size={32} className="mx-auto text-gray-400 mb-2" />
          <p className="text-sm text-gray-500">
            {filters.search
              ? "검색 결과가 없습니다."
              : "아직 좋아요한 루틴이 없습니다."}
          </p>
          {!filters.search && (
            <Link
              to="/routines"
              className="inline-block mt-3 text-xs px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              루틴 둘러보기
            </Link>
          )}
        </div>
      ) : (
        <>
          {/* 전체 좋아요 취소 버튼 */}
          <div className="flex justify-end">
            <button
              onClick={deleteAllLikes}
              disabled={deleteLoading}
              className="flex items-center space-x-2 px-3 py-1 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>{deleteLoading ? "취소 중..." : "모두 삭제"}</span>
            </button>
          </div>

          {/* 루틴 리스트 */}
          <div className="space-y-3">
            {allRoutines.map((routine) => {
              const planIdx = routine.planInfos.planIdx;
              const isDeleting = deletingItem === planIdx;

              return (
                <div
                  key={planIdx}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between">
                    {/* 루틴 내용 */}
                    <div className="flex-1 pr-3">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center space-x-2 flex-1">
                          <span
                            className="text-xs text-white px-2 py-1 rounded"
                            style={{
                              backgroundColor: routine.targetInfos.color,
                            }}
                          >
                            {routine.targetInfos.name}
                          </span>
                          <Link
                            to={`/routine/detail/${planIdx}`}
                            className="font-medium text-gray-800 flex-1 hover:text-blue-600"
                          >
                            {routine.planInfos.planTitle}
                          </Link>
                        </div>
                      </div>

                      <div className="mt-3 text-xs text-gray-500">
                        <div className="flex items-center space-x-5">
                          <span>
                            좋아요 날짜:{" "}
                            {routine.likedDate
                              ? new Date(routine.likedDate).toLocaleDateString(
                                  "ko-KR"
                                )
                              : new Date(
                                  routine.planInfos.planSubDate
                                ).toLocaleDateString("ko-KR")}
                          </span>
                          <div className="flex items-center space-x-1">
                            <Heart size={18} className="text-pink-500" />
                            <span>
                              좋아요 {routine.planInfos.likeCount || 0}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* X 아이콘 (삭제 버튼) */}
                    <button
                      onClick={() => deleteSingleLike(planIdx)}
                      disabled={isDeleting}
                      className="flex-shrink-0 p-1   disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {isDeleting ? (
                        <div className="w-4 h-4 border-2 border-red-500 border-t-transparent rounded-full animate-spin"></div>
                      ) : (
                        <X size={25} />
                      )}
                    </button>
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

export default LikedRoutineTabContent;
