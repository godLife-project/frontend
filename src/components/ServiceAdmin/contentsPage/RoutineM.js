import React, { useState, useEffect, useCallback } from "react";
import { Search, RotateCcw } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import { useToast } from "@/components/ui/use-toast";

const AdminRoutineList = ({ onRoutineSelect, isStandalone = true }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // 상태 관리
  const [routines, setRoutines] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 카테고리 상태 추가
  const [categories, setCategories] = useState([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  // 검색 및 필터
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    targetIdx: "",
    sort: "latest",
  });

  // 페이지네이션
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalCount, setTotalCount] = useState(0);

  // 로그인 체크
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast({
        variant: "destructive",
        title: "로그인이 필요합니다",
        description: "관리자 루틴 관리를 위해 로그인해주세요.",
      });
      if (!isStandalone) {
        navigate("/user/login");
      }
    }
  }, [navigate, toast, isStandalone]);

  // 카테고리 목록 가져오기
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const accessToken = localStorage.getItem("accessToken");

      if (!accessToken) {
        toast({
          variant: "destructive",
          title: "로그인이 필요합니다",
          description: "카테고리 정보를 불러오기 위해 로그인해주세요.",
        });
        return;
      }

      const response = await axiosInstance.get("/categories/challenge", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      console.log("카테고리 데이터:", response.data);

      // 응답 데이터 구조에 따라 처리
      let categoryData = [];
      if (Array.isArray(response.data)) {
        categoryData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        categoryData = response.data.data;
      } else if (response.data && Array.isArray(response.data.content)) {
        categoryData = response.data.content;
      }

      setCategories(categoryData);
      console.log("✅ 카테고리 로드 성공:", categoryData);
    } catch (err) {
      console.error("❌ 카테고리 로드 실패:", err);
      toast({
        variant: "destructive",
        title: "카테고리 로딩 실패",
        description: "카테고리 정보를 불러오는데 실패했습니다.",
      });
      setCategories([]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // 루틴 데이터 가져오기
  const fetchRoutines = useCallback(
    async (page = 1) => {
      setLoading(true);
      setError(null);

      try {
        const accessToken = localStorage.getItem("accessToken");

        if (!accessToken) {
          toast({
            variant: "destructive",
            title: "로그인이 필요합니다",
            description: "루틴 목록을 불러오기 위해 로그인해주세요.",
          });
          if (!isStandalone) {
            navigate("/user/login");
          }
          return;
        }

        // 요청 파라미터 구성
        const params = {
          page: page,
          size: pageSize,
        };

        // 검색어가 있으면 추가
        if (searchTerm.trim()) {
          params.search = searchTerm.trim();
        }

        // 정렬 옵션 추가
        if (filters.sort) {
          params.sort = filters.sort;
        }

        // API 엔드포인트와 파라미터 결정
        let apiUrl;
        if (filters.targetIdx) {
          // 특정 카테고리의 최신 루틴 조회
          apiUrl = `/admin/plans/latest/${filters.targetIdx}`;
        } else {
          // 전체 관리자 루틴 조회
          apiUrl = "/admin/plans";
        }

        console.log("🔍 API 요청:", apiUrl, params);

        const response = await axiosInstance.get(apiUrl, {
          headers: { Authorization: `Bearer ${accessToken}` },
          params: params,
        });

        console.log("API 응답:", response);

        if (response?.data?.status === 200 || response?.data) {
          const responseData = response.data;

          // 응답 데이터 구조에 따라 처리
          let plans = [];
          let totalPages = 1;
          let pageSize = 10;
          let currentPage = 1;

          if (responseData.plans) {
            plans = responseData.plans;
            totalPages = responseData.totalPages || 1;
            pageSize = responseData.pageSize || 10;
            currentPage = responseData.currentPage || 1;
          } else if (Array.isArray(responseData)) {
            plans = responseData;
          } else if (responseData.data && Array.isArray(responseData.data)) {
            plans = responseData.data;
          } else if (
            responseData.content &&
            Array.isArray(responseData.content)
          ) {
            plans = responseData.content;
            totalPages = responseData.totalPages || 1;
            pageSize = responseData.size || 10;
            currentPage = responseData.number + 1 || 1;
          }

          setRoutines(plans);
          setTotalPages(totalPages);
          setPageSize(pageSize);
          setCurrentPage(currentPage);
          setTotalCount(totalPages * pageSize);

          console.log("✅ 데이터 로드 성공:", {
            count: plans.length,
            totalPages,
            currentPage,
          });

          if (plans.length === 0 && searchTerm) {
            toast({
              title: "검색 결과 없음",
              description: "검색 조건에 맞는 루틴이 없습니다.",
            });
          }
        } else {
          console.error("루틴 목록 조회 실패:", response?.data?.message);
          setError(
            response?.data?.message || "데이터를 불러오는데 실패했습니다."
          );
          toast({
            variant: "destructive",
            title: "데이터 로딩 실패",
            description:
              response?.data?.message || "루틴 목록을 불러오는데 실패했습니다.",
          });
        }
      } catch (err) {
        console.error("❌ API 요청 실패:", err);

        let errorMessage = "루틴 목록을 불러오는데 실패했습니다.";

        if (err.response?.status === 401) {
          errorMessage = "로그인이 필요합니다.";
          localStorage.removeItem("accessToken");
          if (!isStandalone) {
            navigate("/user/login");
          }
        } else if (err.response?.status === 403) {
          errorMessage = "접근 권한이 없습니다.";
        } else if (err.response?.status === 404) {
          errorMessage = "해당 카테고리를 찾을 수 없습니다.";
        } else if (err.response?.data?.message) {
          errorMessage = err.response.data.message;
        }

        setError(errorMessage);
        setRoutines([]);

        toast({
          variant: "destructive",
          title: "오류 발생",
          description: errorMessage,
        });
      } finally {
        setLoading(false);
      }
    },
    [pageSize, searchTerm, filters, navigate, toast, isStandalone]
  );

  // 초기 로드 및 상태 변경시 데이터 로드
  useEffect(() => {
    fetchCategories();
    fetchRoutines(currentPage);
  }, [filters.targetIdx, filters.sort]);

  // 검색어 변경시 디바운싱 처리
  useEffect(() => {
    const timer = setTimeout(() => {
      setCurrentPage(1);
      fetchRoutines(1);
    }, 500);

    return () => clearTimeout(timer);
  }, [searchTerm]);

  // 검색 처리
  const handleSearch = () => {
    setCurrentPage(1);
    fetchRoutines(1);
  };

  // 필터 리셋
  const handleResetFilters = () => {
    setSearchTerm("");
    setFilters({ targetIdx: "", sort: "latest" });
    setCurrentPage(1);
  };

  // 페이지 변경
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
      fetchRoutines(page);
    }
  };

  // 루틴 카드 클릭
  const handleRoutineClick = (planIdx) => {
    if (onRoutineSelect) {
      onRoutineSelect(planIdx);
    } else {
      // 루틴 상세 페이지로 이동
      navigate(`/routine/detail/${planIdx}`);
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("ko-KR", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    });
  };

  // 카테고리 이름 매핑
  const getCategoryName = (targetIdx) => {
    const category = categories.find(
      (cat) => (cat.targetIdx || cat.challCateIdx || cat.id) === targetIdx
    );
    return category
      ? category.targetName ||
          category.challName ||
          category.name ||
          category.title
      : `카테고리 ${targetIdx}`;
  };

  // 루틴 카드 렌더링
  const renderRoutineCard = (routine) => (
    <div
      key={routine.planIdx}
      className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow cursor-pointer border border-gray-200"
      onClick={() => handleRoutineClick(routine.planIdx)}
    >
      <div className="flex justify-between items-start mb-4">
        <h3
          className="text-lg font-semibold text-gray-800 line-clamp-2"
          title={routine.planTitle}
        >
          {routine.planTitle.length > 10
            ? routine.planTitle.substring(0, 10) + "..."
            : routine.planTitle}
        </h3>
        <span className="text-xs text-gray-500 ml-2 whitespace-nowrap">
          ID: {routine.planIdx}
        </span>
      </div>

      <div className="space-y-2 text-sm text-gray-600">
        <div className="flex justify-between">
          <span>작성자 ID:</span>
          <span className="font-medium">{routine.userIdx}</span>
        </div>
        <div className="flex justify-between">
          <span>카테고리:</span>
          <span className="font-medium text-blue-600">
            {getCategoryName(routine.targetIdx)}
          </span>
        </div>
        <div className="flex justify-between">
          <span>등록일:</span>
          <span className="font-medium">{formatDate(routine.planSubDate)}</span>
        </div>
      </div>
    </div>
  );

  // 페이지네이션 렌더링
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <div className="bg-white px-4 py-2 flex items-center justify-between border-t border-gray-200 sm:px-6">
        <div className="flex-1 flex justify-between sm:hidden">
          <button
            onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="relative inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            이전
          </button>
          <button
            onClick={() =>
              handlePageChange(Math.min(totalPages, currentPage + 1))
            }
            disabled={currentPage === totalPages}
            className="ml-3 relative inline-flex items-center px-3 py-1 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
          >
            다음
          </button>
        </div>
        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
          <div>
            <p className="text-xs text-gray-700">
              전체 <span className="font-medium">{totalCount}</span>개 중{" "}
              <span className="font-medium">
                {(currentPage - 1) * pageSize + 1}
              </span>
              -
              <span className="font-medium">
                {Math.min(currentPage * pageSize, totalCount)}
              </span>
              개 표시
            </p>
          </div>
          <div>
            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-2 py-1 rounded-l-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                이전
              </button>

              {[...Array(totalPages)].map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`relative inline-flex items-center px-3 py-1 border text-xs font-medium ${
                      currentPage === page
                        ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                        : "bg-white border-gray-300 text-gray-500 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() =>
                  handlePageChange(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
                className="relative inline-flex items-center px-2 py-1 rounded-r-md border border-gray-300 bg-white text-xs font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
              >
                다음
              </button>
            </nav>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div
      className={
        isStandalone ? "max-w-7xl mx-auto px-4 py-8" : "h-full flex flex-col"
      }
    >
      {/* 헤더 */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">관리자 루틴 관리</h1>
          <p className="text-gray-600 mt-1">
            총 {totalCount}개의 루틴 (페이지 {currentPage}/{totalPages})
          </p>
        </div>
      </div>

      {/* 검색 및 필터 */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              검색어
            </label>
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                placeholder="루틴 제목으로 검색..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          <div className="w-48">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              카테고리
            </label>
            <select
              value={filters.targetIdx}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, targetIdx: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              disabled={categoriesLoading}
            >
              <option value="">전체</option>
              {categories.map((category) => (
                <option
                  key={
                    category.targetIdx || category.challCateIdx || category.id
                  }
                  value={
                    category.targetIdx || category.challCateIdx || category.id
                  }
                >
                  {category.targetName ||
                    category.challName ||
                    category.name ||
                    category.title}
                </option>
              ))}
            </select>
          </div>

          <div className="w-32">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              정렬
            </label>
            <select
              value={filters.sort}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, sort: e.target.value }))
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="latest">최신순</option>
              <option value="oldest">오래된순</option>
            </select>
          </div>

          <button
            onClick={handleSearch}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            검색
          </button>

          <button
            type="button"
            onClick={handleResetFilters}
            className="p-2 text-gray-600 hover:text-gray-800 transition-colors"
            title="필터 초기화"
          >
            <RotateCcw size={20} />
          </button>
        </div>
      </div>

      {/* 로딩 및 에러 상태 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p className="text-sm">{error}</p>
        </div>
      )}

      {/* 컨텐츠 영역 */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-6 text-center">
            <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            <p className="mt-2 text-sm text-gray-600">로딩 중...</p>
          </div>
        ) : routines.length === 0 ? (
          <div className="p-6 text-center text-gray-500">
            {searchTerm ? "검색 결과가 없습니다." : "등록된 루틴이 없습니다."}
          </div>
        ) : (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {routines.map(renderRoutineCard)}
            </div>
          </div>
        )}

        {/* 페이지네이션 */}
        {renderPagination()}
      </div>
    </div>
  );
};

export default AdminRoutineList;
