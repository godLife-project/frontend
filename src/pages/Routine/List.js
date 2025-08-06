// pages/PublicRoutineList.jsx - HTTP 상태코드별 처리 개선
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import RoutineList from "@/components/routine/list/RoutineList";
import axiosInstance from "@/api/axiosInstance";
import SearchWrapper from "@/components/common/SearchWrapper";

const PublicRoutineList = () => {
  const [routines, setRoutines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // 검색 및 필터 상태
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState({
    status: "all",
    target: "",
    job: "",
    sort: "latest",
    order: "desc",
  });

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  const navigate = useNavigate();

  // 데이터 가져오기
  const fetchRoutineData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // 쿼리 파라미터 구성
      const queryParams = new URLSearchParams();

      // 페이지 번호와 사이즈 (기본값 10 추가)
      queryParams.append("page", currentPage);
      queryParams.append("size", 10); // 페이지당 항목 수, 필요시 조정

      // 검색어
      if (searchTerm) {
        queryParams.append("search", searchTerm);
      }

      // 상태 필터 (all은 API에 전송하지 않음)
      if (filters.status && filters.status !== "all") {
        queryParams.append("status", filters.status);
      }

      // 목표 카테고리 필터 (빈 값이 아닐 때만)
      if (filters.target && filters.target.trim() !== "") {
        queryParams.append("target", filters.target);
      }

      // 직업 카테고리 필터 (빈 값이 아닐 때만)
      if (filters.job && filters.job.trim() !== "") {
        queryParams.append("job", filters.job);
      }

      // 정렬 기준
      if (filters.sort) {
        queryParams.append("sort", filters.sort);
      }

      // 정렬 순서
      if (filters.order) {
        queryParams.append("order", filters.order);
      }

      // API 호출 URL 로깅
      const url = `/list/plan/default?${queryParams.toString()}`;
      console.log("API 요청 URL:", url);

      const response = await axiosInstance.get(url);
      console.log("공개 루틴 데이터:", response.data);

      // 204 No Content - 조회된 내용이 없음 (정상적인 상황)
      if (response.status === 204) {
        setRoutines([]);
        setTotalPages(1);
        setTotalPosts(0);
      } else if (response.data && response.data.plans) {
        setRoutines(response.data.plans);
        setTotalPages(response.data.totalPages);
        setTotalPosts(response.data.totalPosts);
      } else {
        console.error("API 응답 오류:", response.data);
        setError("데이터를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("공개 루틴 목록 조회 실패:", error);

      // 400번대, 500번대 에러만 에러로 처리
      const status = error.response?.status;
      if (status >= 400) {
        setError("루틴 목록을 불러오는데 문제가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  }, [currentPage, searchTerm, filters]);

  // 모든 관련 상태 변경 시 데이터 로드
  useEffect(() => {
    fetchRoutineData();
  }, [currentPage, searchTerm, filters]);

  // 루틴 카드 클릭 핸들러
  const handleRoutineCardClick = (planIdx) => {
    navigate(`/routine/detail/${planIdx}`);
  };

  // 새 루틴 추가 핸들러
  const handleAddNewRoutine = () => {
    navigate("/routine/create");
  };

  const handleSearch = (inputValue) => {
    setSearchTerm(inputValue);
  };

  // 필터 초기화 핸들러
  const handleResetFilters = () => {
    setSearchTerm("");
    setFilters({
      status: "all",
      target: "",
      job: "",
      sort: "latest",
      order: "desc",
    });
    setCurrentPage(1);
  };

  const handleFilterChange = (key, value) => {
    setFilters((prevFilters) => ({
      ...prevFilters,
      [key]: value,
    }));
    setCurrentPage(1);
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // SearchWrapper를 통한 필터링 부분을 렌더링하는 함수
  const renderSearchFilter = () => (
    <SearchWrapper
      searchTerm={searchTerm}
      filters={filters}
      onFilterChange={handleFilterChange}
      totalResults={totalPosts}
      placeholder="루틴 제목, 작성자, 태그 검색..."
      onSearch={handleSearch}
    />
  );

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-gray-800 mb-2">공개 루틴 탐색</h1>
      <p className="text-gray-600 mb-6">
        다른 사용자들의 루틴을 살펴보고 영감을 얻으세요.
      </p>

      {/* SearchWrapper를 사용한 필터 UI */}
      {renderSearchFilter()}

      {/* RoutineList 컴포넌트 */}
      <RoutineList
        routines={routines}
        isLoading={isLoading}
        error={error}
        onCardClick={handleRoutineCardClick}
        onAddNewRoutine={handleAddNewRoutine}
        isMyRoutine={false}
        // 페이지네이션 관련 props
        currentPage={currentPage}
        totalPages={totalPages}
        totalPosts={totalPosts}
        onPageChange={handlePageChange}
        onResetFilters={handleResetFilters}
      />
    </div>
  );
};

export default PublicRoutineList;
