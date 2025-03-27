// src/pages/routine/PublicRoutineList.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Clock,
  X,
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

const RoutineList = () => {
  const [routines, setRoutines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);
  const [pageSize, setPageSize] = useState(9);

  // 필터 상태 관리
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInputTerm, setSearchInputTerm] = useState(""); // 입력 중인 검색어
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [filters, setFilters] = useState({
    sort: "latest", // 최신순, 인기순
    target: "", // 목표 카테고리
    job: "", // 직업 카테고리
    status: "all", // 상태 필터
  });

  const [searchLogs, setSearchLogs] = useState([]);
  const [isSearchLogOpen, setIsSearchLogOpen] = useState(false);
  const searchInputRef = useRef(null);
  const searchLogRef = useRef(null);

  // 검색 로그 불러오기 함수
  const fetchSearchLogs = async () => {
    try {
      const response = await axiosInstance.get("/search/log");

      console.log("전체 응답:", response);
      console.log("응답 데이터:", response.data);

      // 응답 구조에 맞게 검색 로그 추출
      const searchLogs = response.data.message || [];

      setSearchLogs(searchLogs);
    } catch (error) {
      console.error("검색 로그 불러오기 실패:", error);
      setSearchLogs([]);
    }
  };

  // 검색바 클릭 시 로그 불러오기
  const handleSearchInputFocus = () => {
    fetchSearchLogs();
    setIsSearchLogOpen(true);
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target) &&
        searchLogRef.current &&
        !searchLogRef.current.contains(event.target)
      ) {
        setIsSearchLogOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 검색어 선택 핸들러
  const handleSearchLogSelect = (log) => {
    setSearchInputTerm(log);
    setSearchTerm(log);
    setIsSearchLogOpen(false);
  };

  // 검색 로그 삭제 함수 추가
  const handleDeleteSearchLog = async (logIdx) => {
    try {
      // 검색 로그 삭제 API 호출
      await axiosInstance.patch(`/search/log/${logIdx}`);

      // 로컬 상태에서 해당 로그 제거
      setSearchLogs((prevLogs) =>
        prevLogs.filter((log) => log.logIdx !== logIdx)
      );
    } catch (error) {
      console.error("검색 로그 삭제 실패:", error);
    }
  };

  const navigate = useNavigate();

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

      // 목표 카테고리
      if (filters.target) {
        queryParams.append("target", filters.target);
      }

      // 직업 카테고리
      if (filters.job) {
        queryParams.append("job", filters.job);
      }

      // 상태 필터 (활성/비활성)
      if (filters.status && filters.status !== "all") {
        queryParams.append("status", filters.status);
      }

      // API 호출 (실제 API 경로로 변경 필요)
      // const url = `/list/plan/default?${queryParams.toString()}`;
      const url = `/list/plan/default`;
      console.log("API 요청 URL:", url);

      // 임시 데이터 사용 (개발 중)
      // 실제 API 연동 시 아래 코드 대신 axiosInstance.get 사용
      const dummyData = {
        totalPosts: 23,
        plans: [
          {
            planInfos: {
              rank: 1,
              planIdx: 105,
              userNick: "htest1 #1",
              planTitle: "루틴 인증 테스트5",
              planSubDate: "2025-03-12 23:36:33",
              viewCount: 3,
              likeCount: 0,
              forkCount: 0,
              isActive: 0,
              isCompleted: 0,
            },
            targetInfos: {
              name: "공부/자기개발",
              iconKey: "book-open",
              icon: "BookOpen",
              color: "#008080",
            },
            jobDefault: {
              name: "개발자",
              iconKey: "code",
              icon: "Code",
              color: "#1E90FF",
            },
            jobEtc: null,
            fireInfos: {
              lvIdx: 1,
              fireName: "빨강 1등급",
              fireColor: "#FFCCCC",
              fireEffect: null,
            },
          },
          {
            planInfos: {
              rank: 2,
              planIdx: 104,
              userNick: "htest1 #1",
              planTitle: "루틴 인증 테스트4",
              planSubDate: "2025-03-12 23:36:17",
              viewCount: 1,
              likeCount: 0,
              forkCount: 0,
              isActive: 1,
              isCompleted: 0,
            },
            targetInfos: {
              name: "공부/자기개발",
              iconKey: "book-open",
              icon: "BookOpen",
              color: "#008080",
            },
            jobDefault: {
              name: "개발자",
              iconKey: "code",
              icon: "Code",
              color: "#1E90FF",
            },
            jobEtc: null,
            fireInfos: {
              lvIdx: 1,
              fireName: "빨강 1등급",
              fireColor: "#FFCCCC",
              fireEffect: null,
            },
          },
          {
            planInfos: {
              rank: 3,
              planIdx: 102,
              userNick: "htest1 #1",
              planTitle: "루틴 인증 테스트2",
              planSubDate: "2025-03-12 23:35:26",
              viewCount: 2,
              likeCount: 0,
              forkCount: 0,
              isActive: 1,
              isCompleted: 0,
            },
            targetInfos: {
              name: "공부/자기개발",
              iconKey: "book-open",
              icon: "BookOpen",
              color: "#008080",
            },
            jobDefault: {
              name: "크리에이터",
              iconKey: "video",
              icon: "Video",
              color: "#800080",
            },
            jobEtc: null,
            fireInfos: {
              lvIdx: 1,
              fireName: "빨강 1등급",
              fireColor: "#FFCCCC",
              fireEffect: null,
            },
          },
          {
            planInfos: {
              rank: 4,
              planIdx: 101,
              userNick: "htest1 #1",
              planTitle: "루틴 인증 테스트1",
              planSubDate: "2025-03-12 23:35:11",
              viewCount: 3,
              likeCount: 0,
              forkCount: 0,
              isActive: 1,
              isCompleted: 0,
            },
            targetInfos: {
              name: "공부/자기개발",
              iconKey: "book-open",
              icon: "BookOpen",
              color: "#008080",
            },
            jobDefault: {
              name: "크리에이터",
              iconKey: "video",
              icon: "Video",
              color: "#800080",
            },
            jobEtc: null,
            fireInfos: {
              lvIdx: 1,
              fireName: "빨강 1등급",
              fireColor: "#FFCCCC",
              fireEffect: null,
            },
          },
          {
            planInfos: {
              rank: 5,
              planIdx: 91,
              userNick: "sdddfffz #1",
              planTitle: "희만의 루틴 인증 테스트용 루틴",
              planSubDate: "2025-03-11 23:56:18",
              viewCount: 0,
              likeCount: 0,
              forkCount: 0,
              isActive: 0,
              isCompleted: 0,
            },
            targetInfos: {
              name: "공부/자기개발",
              iconKey: "book-open",
              icon: "BookOpen",
              color: "#008080",
            },
            jobDefault: {
              name: "크리에이터",
              iconKey: "video",
              icon: "Video",
              color: "#800080",
            },
            jobEtc: null,
            fireInfos: {
              lvIdx: 1,
              fireName: "빨강 1등급",
              fireColor: "#FFCCCC",
              fireEffect: null,
            },
          },
          {
            planInfos: {
              rank: 6,
              planIdx: 90,
              userNick: "sdddfffz #1",
              planTitle: "희만의 루틴 인증 테스트용 루틴",
              planSubDate: "2025-03-11 23:56:16",
              viewCount: 0,
              likeCount: 0,
              forkCount: 0,
              isActive: 1,
              isCompleted: 0,
            },
            targetInfos: {
              name: "공부/자기개발",
              iconKey: "book-open",
              icon: "BookOpen",
              color: "#008080",
            },
            jobDefault: {
              name: "크리에이터",
              iconKey: "video",
              icon: "Video",
              color: "#800080",
            },
            jobEtc: null,
            fireInfos: {
              lvIdx: 1,
              fireName: "빨강 1등급",
              fireColor: "#FFCCCC",
              fireEffect: null,
            },
          },
          {
            planInfos: {
              rank: 10,
              planIdx: 86,
              userNick: "sdddfffz #1",
              planTitle: "희만의 루틴 인증 테스트용 루틴",
              planSubDate: "2025-03-11 23:56:04",
              viewCount: 9,
              likeCount: 6,
              forkCount: 1,
              isActive: 1,
              isCompleted: 0,
            },
            targetInfos: {
              name: "공부/자기개발",
              iconKey: "book-open",
              icon: "BookOpen",
              color: "#008080",
            },
            jobDefault: {
              name: "크리에이터",
              iconKey: "video",
              icon: "Video",
              color: "#800080",
            },
            jobEtc: null,
            fireInfos: {
              lvIdx: 4,
              fireName: "빨강 4등급",
              fireColor: "#FF3333",
              fireEffect: null,
            },
          },
        ],
        totalPages: 3,
        currentPage: 1,
      };

      // API 결과 처리
      // setRoutines(dummyData.plans); // 실제 API 연동 시 response.data.plans
      // setTotalPages(dummyData.totalPages); // 실제 API 연동 시 response.data.totalPages
      // setTotalPosts(dummyData.totalPosts); // 실제 API 연동 시 response.data.totalPosts
      // setCurrentPage(dummyData.currentPage); // 실제 API 연동 시 response.data.currentPage

      // 실제 API 연동 코드 (주석 처리)
      let token = localStorage.getItem("accessToken");
      const response = await axiosInstance.get(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.data && response.data.plans) {
        setRoutines(response.data.plans);
        setTotalPages(response.data.totalPages);
        setTotalPosts(response.data.totalPosts);
        setCurrentPage(response.data.currentPage);
      } else {
        setError("데이터를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("루틴 리스트 조회 실패:", error);
      setError("루틴 목록을 불러오는데 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  // 페이지, 필터, 검색어가 변경될 때마다 데이터 다시 가져오기
  useEffect(() => {
    fetchRoutineData();
  }, [currentPage, pageSize, searchTerm, filters.sort]);

  // 루틴 카드 클릭 핸들러
  const handleRoutineCardClick = (planIdx) => {
    navigate(`/routine/detail/${planIdx}`);
  };

  // 검색 핸들러
  const handleSearch = async (e) => {
    e.preventDefault();

    try {
      console.log("검색어:", searchInputTerm);

      const response = await axiosInstance.get(
        `/search/log?keyword=${searchInputTerm}`
        // 토큰이 필요하다면 아래 헤더 추가
        // headers: {
        //   Authorization: `Bearer ${localStorage.getItem('accessToken')}`
        // }
      );

      console.log("검색 로그 API 응답:", response);
      console.log("검색 로그 API 상태:", response.status);
      console.log("검색 로그 API 데이터:", response.data);

      // 기존 검색 로직
      setSearchTerm(searchInputTerm);
      setCurrentPage(1); // 검색 시 첫 페이지로 이동
      setIsSearchLogOpen(false); // 검색 로그 드롭다운 닫기
    } catch (error) {
      console.error("검색 로그 저장 전체 에러:", error);

      // 더 자세한 에러 정보
      if (error.response) {
        // 서버가 응답을 반환했지만 상태 코드가 2xx 범위를 벗어난 경우
        console.error("에러 응답:", error.response.data);
        console.error("에러 상태:", error.response.status);
        console.error("에러 헤더:", error.response.headers);
      } else if (error.request) {
        // 요청은 보내졌지만 응답을 받지 못한 경우
        console.error("에러 요청:", error.request);
      } else {
        // 오류를 발생시킨 요청 설정
        console.error("Error", error.message);
      }
    }
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setFilters({
      sort: "latest",
      target: "",
      job: "",
      status: "all",
    });
    setSearchTerm("");
    setSearchInputTerm("");
    setCurrentPage(1);
  };

  // 필터 적용
  const handleApplyFilters = () => {
    setIsFilterOpen(false);
    setCurrentPage(1); // 필터 적용 시 첫 페이지로 이동
    fetchRoutineData();
  };

  // 정렬 방식 토글
  const handleSortToggle = () => {
    setFilters((prev) => ({
      ...prev,
      sort: prev.sort === "latest" ? "popular" : "latest",
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

  // 필터 변경 핸들러
  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({
      ...prev,
      [key]: value,
    }));
  };

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex justify-center items-center h-64">
          <div className="animate-pulse flex flex-col items-center">
            <div className="w-12 h-12 bg-blue-200 rounded-full mb-4"></div>
            <div className="text-lg text-blue-500 font-medium">로딩 중...</div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-col justify-center items-center h-64 text-red-500">
          <p className="mb-4 text-lg">{error}</p>
          <Button
            onClick={() => window.location.reload()}
            className="bg-red-100 text-red-600 hover:bg-red-200"
          >
            다시 시도
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
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
          <div className="text-sm text-gray-500">총 {totalPosts}개의 루틴</div>
          {(searchTerm ||
            Object.values(filters).some(
              (val) => val && val !== "latest" && val !== "all"
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
          {/* 검색 바 */}
          <div className="flex-1 relative">
            <form onSubmit={handleSearch}>
              <input
                ref={searchInputRef}
                type="text"
                placeholder="루틴 제목, 작성자, 직업 등 검색..."
                value={searchInputTerm}
                onChange={(e) => setSearchInputTerm(e.target.value)}
                onFocus={handleSearchInputFocus}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
              />
              <Search
                className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                size={18}
              />
              {searchInputTerm && (
                <button
                  type="button"
                  onClick={() => setSearchInputTerm("")}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X size={16} />
                </button>
              )}
            </form>

            {/* 검색 로그 드롭다운 */}
            {isSearchLogOpen && (
              <div
                ref={searchLogRef}
                className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg"
              >
                <div className="p-2 border-b border-gray-200">
                  <h4 className="text-sm font-medium text-gray-600">
                    최근 검색어
                  </h4>
                </div>
                {searchLogs.length > 0 ? (
                  <ul className="max-h-60 overflow-y-auto">
                    {searchLogs.map((log) => (
                      <li
                        key={log.logIdx}
                        className="px-4 py-2 hover:bg-gray-100 flex justify-between items-center cursor-pointer"
                      >
                        <span
                          onClick={() =>
                            handleSearchLogSelect(log.searchKeyword)
                          }
                          className="text-sm text-gray-700 flex-grow"
                        >
                          {log.searchKeyword}
                        </span>
                        <button
                          onClick={(e) => {
                            e.stopPropagation(); // 리스트 항목 클릭 이벤트 방지
                            handleDeleteSearchLog(log.logIdx);
                          }}
                          className="text-gray-400 hover:text-red-500 ml-2"
                        >
                          <X size={16} />
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <div className="p-4 text-center text-gray-500 text-sm">
                    최근 검색어가 없습니다.
                  </div>
                )}
              </div>
            )}
          </div>
          {/* 필터 버튼 */}
          <button
            className={`px-4 py-2 border rounded-lg flex items-center ${
              isFilterOpen ||
              Object.values(filters).some(
                (val) => val && val !== "latest" && val !== "all"
              )
                ? "bg-blue-50 text-blue-600 border-blue-200"
                : "bg-white border-gray-300 text-gray-700"
            }`}
            onClick={() => setIsFilterOpen(!isFilterOpen)}
          >
            <Filter size={18} className="mr-2" />
            필터
            {Object.values(filters).filter(
              (val) => val && val !== "latest" && val !== "all"
            ).length > 0 && (
              <span className="ml-2 bg-blue-100 text-blue-700 rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {
                  Object.values(filters).filter(
                    (val) => val && val !== "latest" && val !== "all"
                  ).length
                }
              </span>
            )}
          </button>

          {/* 정렬 버튼 */}
          <button
            className={`px-4 py-2 border rounded-lg flex items-center ${
              filters.sort !== "latest"
                ? "bg-blue-50 text-blue-600 border-blue-200"
                : "bg-white border-gray-300 text-gray-700"
            }`}
            onClick={handleSortToggle}
          >
            {filters.sort === "latest" ? (
              <>
                <Clock size={18} className="mr-2" />
                최신순
              </>
            ) : (
              <>
                <TrendingUp size={18} className="mr-2" />
                인기순
              </>
            )}
          </button>
        </div>

        {/* 필터 패널 */}
        {isFilterOpen && (
          <div className="mt-4 p-4 bg-gray-50 border border-gray-200 rounded-lg">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* 목표 카테고리 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  목표 카테고리
                </label>
                <select
                  value={filters.target}
                  onChange={(e) => handleFilterChange("target", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">전체</option>
                  <option value="study">공부/자기개발</option>
                  <option value="exercise">운동/건강</option>
                  <option value="hobby">취미/여가</option>
                  <option value="social">사회/대인관계</option>
                </select>
              </div>

              {/* 직업 카테고리 필터 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  직업 카테고리
                </label>
                <select
                  value={filters.job}
                  onChange={(e) => handleFilterChange("job", e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">전체</option>
                  <option value="developer">개발자</option>
                  <option value="designer">디자이너</option>
                  <option value="marketer">마케터</option>
                  <option value="creator">크리에이터</option>
                </select>
              </div>

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
                  <option value="all">전체</option>
                  <option value="active">활성</option>
                  <option value="inactive">비활성</option>
                  <option value="completed">완료</option>
                </select>
              </div>
            </div>

            <div className="mt-4 flex justify-end">
              <Button
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                onClick={handleApplyFilters}
              >
                필터 적용
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* 루틴이 없을 때 */}
      {routines.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <Search className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-medium text-gray-700 mb-2">
            검색 결과가 없습니다
          </h3>
          <p className="text-gray-500 mb-4">
            다른 검색어나 필터 조건을 시도해보세요
          </p>
          <Button
            onClick={handleResetFilters}
            variant="outline"
            className="mt-2"
          >
            필터 초기화
          </Button>
        </div>
      ) : (
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

          {/* 페이지네이션 */}
          <div className="mt-8 mb-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="flex items-center">
                <span className="text-sm text-gray-500 mr-2">표시 개수:</span>
                <Select
                  value={String(pageSize)}
                  onValueChange={(value) => handlePageSizeChange(Number(value))}
                >
                  <SelectTrigger className="w-24 h-9">
                    <SelectValue placeholder="개수" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="9">9개</SelectItem>
                    <SelectItem value="18">18개</SelectItem>
                    <SelectItem value="27">27개</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(1)}
                  disabled={currentPage === 1}
                  className="px-2 h-9"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  처음
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="px-2 h-9"
                >
                  이전
                </Button>

                <div className="px-3 py-2 border rounded-md bg-white">
                  <span className="text-sm">
                    {currentPage} / {totalPages} 페이지
                  </span>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage >= totalPages}
                  className="px-2 h-9"
                >
                  다음
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(totalPages)}
                  disabled={currentPage >= totalPages}
                  className="px-2 h-9"
                >
                  마지막
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </div>

              <div className="text-sm text-gray-500">
                총 {totalPosts}개의 루틴
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default RoutineList;
