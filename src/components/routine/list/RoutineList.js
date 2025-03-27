import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Filter,
  Clock,
  Eye,
  Heart,
  GitFork,
  Flame,
  X,
  Search,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import axiosInstance from "@/api/axiosInstance";
import { reissueToken } from "@/utils/routineUtils";
import RoutineCard from "@/components/routine/list/RoutineCard";
import SearchBar from "@/components/common/SearchBar/SearchBar";
import FilterPanel from "@/components/common/SearchBar/FilterPanel";
import Pagination from "@/components/common/Pagination";
import EmptyState from "@/components/routine/list/EmptyState";

const RoutineList = () => {
  const [routines, setRoutines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [targetCategories, setTargetCategories] = useState([]);
  const [jobCategories, setJobCategories] = useState([]);

  // 필터 상태 관리
  const [searchTerm, setSearchTerm] = useState("");
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    sort: "latest", // 최신순
    order: "desc", // 내림차순
    status: "", // 상태 필터 (1: 진행중, 2: 대기중, 3: 완료)
    target: "", // 목표 카테고리
    job: "", // 직업 카테고리
  });

  // 페이지 사이즈 옵션 (상수로 분리하여 일관성 유지)
  const PAGE_SIZE_OPTIONS = [10, 20, 30];

  const navigate = useNavigate();

  // API에서 관심사 카테고리 데이터 가져오기
  const fetchTargetCategoryData = async () => {
    try {
      const response = await axiosInstance.get("/categories/target");
      setTargetCategories(response.data);
      console.log("관심사 카테고리 데이터 로드 완료");
    } catch (error) {
      console.error("관심사 카테고리 데이터 로드 실패:", error);
    }
  };

  // API에서 직업 카테고리 데이터 가져오기
  const fetchJobCategoryData = async () => {
    try {
      const response = await axiosInstance.get("/categories/job");
      setJobCategories(response.data);
      console.log("직업 카테고리 데이터 로드 완료");
    } catch (error) {
      console.error("직업 카테고리 데이터 로드 실패:", error);
    }
  };

  // 컴포넌트 마운트 시 카테고리 데이터 로드
  useEffect(() => {
    // 두 카테고리 데이터를 병렬로 요청
    Promise.all([fetchTargetCategoryData(), fetchJobCategoryData()]).catch(
      (error) => {
        console.error("카테고리 데이터 로드 중 오류 발생:", error);
      }
    );
  }, []);

  // 데이터 가져오기 (필터 적용)
  const fetchRoutineData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 쿼리 파라미터 구성
      const queryParams = new URLSearchParams();
      queryParams.append("page", currentPage);
      queryParams.append("size", pageSize);

      // 검색어
      if (searchTerm) {
        queryParams.append("search", searchTerm);
      }

      // 정렬 기준
      if (filters.sort) {
        queryParams.append("sort", filters.sort);
      }

      // 정렬 순서
      if (filters.order) {
        queryParams.append("order", filters.order);
      }

      // 상태 필터 (진행중, 대기중, 완료)
      if (filters.status) {
        queryParams.append("status", filters.status);
      }

      // 관심사 카테고리
      if (filters.target) {
        queryParams.append("target", filters.target);
      }

      // 직업 카테고리
      if (filters.job) {
        queryParams.append("job", filters.job);
      }

      // API 호출
      const url = `/list/plan/default?${queryParams.toString()}`;
      console.log("API 요청 URL:", url);
      console.log("페이지 크기 파라미터:", queryParams.get("size"));

      let token = localStorage.getItem("accessToken");

      try {
        const response = await axiosInstance.get(url, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          validateStatus: function (status) {
            // 200과 204 모두 성공으로 처리
            return status === 200 || status === 204;
          },
        });

        // 204 No Content 응답 처리
        if (response.status === 204) {
          console.log("204 응답: 검색 결과가 없습니다");
          // 검색 결과가 없는 경우 빈 배열 설정
          setRoutines([]);
          setTotalPages(0);
          setTotalPosts(0);
        } else if (response.data && response.data.plans) {
          // 정상 응답 처리
          console.log("API 응답:", response.data);
          console.log(
            `요청한 페이지 크기: ${pageSize}, 받은 결과 개수: ${response.data.plans.length}`
          );
          setRoutines(response.data.plans);
          setTotalPages(response.data.totalPages);
          setTotalPosts(response.data.totalPosts);
          setCurrentPage(response.data.currentPage);
        } else {
          setError("데이터를 불러오는데 실패했습니다.");
        }
      } catch (error) {
        console.error("루틴 리스트 조회 실패:", error);

        // 토큰 만료 시 재발급 처리
        if (error.response && error.response.status === 401) {
          try {
            await reissueToken();
            fetchRoutineData(); // 토큰 재발급 후 다시 시도
            return;
          } catch (refreshError) {
            console.error("토큰 재발급 실패:", refreshError);
            // 로그인 페이지로 리다이렉트 또는 다른 처리
          }
        }

        setError("데이터를 불러오는데 문제가 발생했습니다.");
      }
    } catch (error) {
      console.error("예상치 못한 오류:", error);
      setError("데이터를 불러오는데 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지, 필터, 검색어가 변경될 때마다 데이터 다시 가져오기
  useEffect(() => {
    console.log("페이지 사이즈 변경됨:", pageSize);
    fetchRoutineData();
  }, [
    currentPage,
    pageSize,
    searchTerm,
    filters.sort,
    filters.order,
    filters.target,
    filters.job,
    filters.status,
  ]);

  // 루틴 카드 클릭 핸들러
  const handleRoutineCardClick = (planIdx) => {
    navigate(`/routine/detail/${planIdx}`);
  };

  // 검색 핸들러
  const handleSearch = (term) => {
    setSearchTerm(term);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  // 검색어 지우기 핸들러
  const handleSearchClear = () => {
    setSearchTerm("");
    setCurrentPage(1); // 검색 초기화 시 첫 페이지로 이동
    // 여기서 검색어 지우기만 함 (fetchRoutineData는 의존성 배열에 의해 자동 호출됨)
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setFilters({
      sort: "latest",
      order: "desc",
      target: "",
      job: "",
      status: "",
    });
    setSearchTerm("");
    setCurrentPage(1);
  };

  // 필터 변경 핸들러 (FilterPanel 컴포넌트로 전달)
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  // 필터 적용 핸들러
  const handleApplyFilters = () => {
    setIsFilterOpen(false);
    setCurrentPage(1); // 필터 적용 시 첫 페이지로 이동
    fetchRoutineData();
  };

  // 정렬 방식 변경
  const handleSortChange = (sortType) => {
    setFilters((prev) => ({
      ...prev,
      sort: sortType,
    }));
  };

  // 페이지 변경 핸들러
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };

  // 페이지 사이즈 변경 핸들러
  const handlePageSizeChange = (newSize) => {
    setPageSize(newSize);
    setCurrentPage(1); // 페이지 사이즈 변경 시 첫 페이지로 이동
  };

  // 정렬 표시 아이콘
  const getSortIcon = (sortType) => {
    switch (sortType) {
      case "latest":
        return <Clock size={18} />;
      case "view":
        return <Eye size={18} />;
      case "like":
        return <Heart size={18} />;
      case "fork":
        return <GitFork size={18} />;
      case "fire":
        return <Flame size={18} />;
      default:
        return <Clock size={18} />;
    }
  };

  // 정렬 표시 텍스트
  const getSortText = (sortType) => {
    switch (sortType) {
      case "latest":
        return "최신순";
      case "view":
        return "조회순";
      case "like":
        return "추천순";
      case "fork":
        return "포크순";
      case "fire":
        return "불꽃순";
      default:
        return "최신순";
    }
  };

  // 검색 및 필터 UI 렌더링 (로딩 중이나 에러 상태에서도 보여줌)
  const renderSearchAndFilters = () => (
    <>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          공개 루틴 탐색
        </h1>
        <p className="text-gray-600">
          다른 사용자들의 루틴을 살펴보고 영감을 얻으세요.
        </p>
      </div>

      {/* 검색 및 필터 섹션 */}
      <div className="mb-8">
        <div className="mb-4 flex justify-between items-center">
          <div className="text-sm text-gray-500">
            {!isLoading && !error && `총 ${totalPosts}개의 루틴`}
          </div>
          {(searchTerm ||
            Object.values(filters).some(
              (val) => val && val !== "latest" && val !== "desc"
            )) && (
            <button
              className="text-blue-500 text-sm flex items-center"
              onClick={handleResetFilters}
            >
              <X size={14} className="mr-1" />
              필터 초기화
            </button>
          )}
        </div>

        <div className="flex space-x-2">
          {/* SearchBar 컴포넌트 사용 (onClear 핸들러 추가) */}
          <SearchBar
            onSearch={handleSearch}
            onClear={handleSearchClear}
            initialSearchTerm={searchTerm}
            placeholder="루틴 제목, 작성자, 직업 등 검색..."
          />

          {/* 필터 버튼 */}
          <button
            className={`px-4 py-2 border rounded-lg flex items-center ${
              isFilterOpen ||
              Object.values(filters).some(
                (val) => val && val !== "latest" && val !== "desc"
              )
                ? "bg-blue-50 text-blue-600 border-blue-200"
                : "bg-white border-gray-300 text-gray-700"
            }`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter size={18} className="mr-2" />
            필터
            {Object.values(filters).filter(
              (val) => val && val !== "latest" && val !== "desc"
            ).length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {
                  Object.values(filters).filter(
                    (val) => val && val !== "latest" && val !== "desc"
                  ).length
                }
              </span>
            )}
          </button>

          {/* 정렬 드롭다운 */}
          <Select value={filters.sort} onValueChange={handleSortChange}>
            <SelectTrigger className="w-32">
              <div className="flex items-center space-x-2">
                {getSortIcon(filters.sort)}
                <span>{getSortText(filters.sort)}</span>
              </div>
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="latest" className="flex items-center">
                <div className="flex items-center space-x-2">
                  <Clock size={16} className="mr-2" />
                  <span>최신순</span>
                </div>
              </SelectItem>
              <SelectItem value="view">
                <div className="flex items-center space-x-2">
                  <Eye size={16} className="mr-2" />
                  <span>조회순</span>
                </div>
              </SelectItem>
              <SelectItem value="like">
                <div className="flex items-center space-x-2">
                  <Heart size={16} className="mr-2" />
                  <span>추천순</span>
                </div>
              </SelectItem>
              <SelectItem value="fork">
                <div className="flex items-center space-x-2">
                  <GitFork size={16} className="mr-2" />
                  <span>포크순</span>
                </div>
              </SelectItem>
              <SelectItem value="fire">
                <div className="flex items-center space-x-2">
                  <Flame size={16} className="mr-2" />
                  <span>불꽃순</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* FilterPanel 컴포넌트 사용 */}
        {isFilterOpen && (
          <FilterPanel
            filters={filters}
            onFilterChange={handleFilterChange}
            onApplyFilters={handleApplyFilters}
            onCancel={() => setIsFilterOpen(false)}
            targetCategories={targetCategories}
            jobCategories={jobCategories}
          />
        )}
      </div>
    </>
  );

  // 루틴 콘텐츠 영역 렌더링 (로딩/에러/데이터 없음/데이터 있음 상태 별 처리)
  const renderContent = () => {
    // 로딩 중 상태
    if (isLoading) {
      return (
        <EmptyState
          icon={Loader2}
          title="데이터를 불러오는 중입니다"
          message="잠시만 기다려 주세요..."
          iconColor="text-blue-300"
          iconSize={60}
          onAction={null}
        />
      );
    }

    // 에러 상태
    if (error) {
      return (
        <EmptyState
          icon={AlertTriangle}
          title="데이터 로드 실패"
          message={error}
          actionText="다시 시도"
          iconColor="text-red-300"
          onAction={() => fetchRoutineData()}
        />
      );
    }

    // 데이터 없음 상태
    if (routines.length === 0) {
      // 필터 또는 검색어가 적용된 경우와 그렇지 않은 경우
      const isFiltered =
        searchTerm ||
        Object.values(filters).some(
          (val) => val && val !== "latest" && val !== "desc"
        );

      return (
        <EmptyState
          icon={Search}
          title={isFiltered ? "검색 결과가 없습니다" : "등록된 루틴이 없습니다"}
          message={
            isFiltered
              ? "검색어나 필터 조건을 변경해 보세요"
              : "첫 번째 루틴을 만들어 보세요"
          }
          actionText={isFiltered ? "필터 초기화" : "루틴 만들기"}
          onAction={
            isFiltered ? handleResetFilters : () => navigate("/routine/create")
          }
        />
      );
    }

    // 데이터 있음 상태
    return (
      <>
        {/* 루틴 리스트 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
          {routines.map((routine) => (
            <RoutineCard
              key={routine.planInfos.planIdx}
              routine={routine}
              onClick={handleRoutineCardClick}
              isPublic={true}
              isActive={routine.planInfos.isActive === 1}
            />
          ))}
        </div>

        {/* Pagination 컴포넌트 사용 */}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          totalItems={totalPosts}
          pageSize={pageSize}
          onPageChange={handlePageChange}
          onPageSizeChange={handlePageSizeChange}
          pageSizeOptions={PAGE_SIZE_OPTIONS}
          itemName="루틴"
        />
      </>
    );
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* 검색 및 필터 UI */}
      {renderSearchAndFilters()}

      {/* 콘텐츠 영역 (로딩/에러/빈 상태/데이터 표시) */}
      {renderContent()}
    </div>
  );
};

export default RoutineList;
