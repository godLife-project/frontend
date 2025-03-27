import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import RoutineList from "@/components/routine/list/RoutineList";
import axiosInstance from "@/api/axiosInstance";
import { reissueToken } from "@/utils/routineUtils";

export default function MyRoutineList() {
  const [routines, setRoutines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [searchInputTerm, setSearchInputTerm] = useState(""); // 입력 중인 검색어
  // 필터 상태 관리
  const [filters, setFilters] = useState({
    status: "all", // 상태 필터 - 1: 진행중, 2: 대기중, 3: 완료, all: 진행+대기
    target: "", // 목표 카테고리
    job: "", // 직업 카테고리
    sort: "latest", // 정렬 기준
    order: "desc", // 정렬 순서
  });

  const navigate = useNavigate();

  // 데이터 가져오기 (필터 적용)
  const fetchRoutineData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    let token = localStorage.getItem("accessToken");

    try {
      const getRoutines = async (authToken) => {
        // 필터를 URL 쿼리 파라미터로 변환
        const queryParams = new URLSearchParams();

        // 상태 필터 적용
        if (filters.status && filters.status !== "all") {
          queryParams.append("status", filters.status);
        }

        // 목표 카테고리 필터 적용
        if (filters.target) {
          queryParams.append("target", filters.target);
        }

        // 직업 카테고리 필터 적용
        if (filters.job) {
          queryParams.append("job", filters.job);
        }

        // 정렬 기준 적용
        if (filters.sort) {
          queryParams.append("sort", filters.sort);
        }

        // 정렬 순서 적용
        if (filters.order) {
          queryParams.append("order", filters.order);
        }

        // 검색어 적용
        if (searchTerm) {
          queryParams.append("search", searchTerm);
        }

        // URL에 쿼리 파라미터 추가
        const queryString = queryParams.toString();
        const url = `/list/auth/myPlans${queryString ? `?${queryString}` : ""}`;

        console.log("API 요청 URL:", url);

        try {
          const response = await axiosInstance.get(url, {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          });
          return response;
        } catch (error) {
          // 토큰 만료 처리
          if (error.response && error.response.status === 401) {
            const newToken = await reissueToken(navigate);
            return await axiosInstance.get(url, {
              headers: {
                Authorization: `Bearer ${newToken}`,
              },
            });
          }
          throw error;
        }
      };

      const response = await getRoutines(token);
      console.log("루틴 리스트 데이터:", response.data);

      if (response.data && response.data.status === "success") {
        // 데이터 유효성 검사 추가
        const routinesData = response.data.message || [];
        console.log("가져온 루틴 데이터:", routinesData);
        setRoutines(routinesData);
      } else {
        console.error("API 응답 오류:", response.data);
        setError("데이터를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("루틴 리스트 조회 실패:", error);
      setError("루틴 목록을 불러오는데 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [navigate, filters, searchTerm]); // 의존성 배열에 filters와 searchTerm 추가

  // 필터나 검색어가 변경될 때마다 데이터 다시 가져오기
  useEffect(() => {
    fetchRoutineData();
  }, [fetchRoutineData]);

  // 루틴 카드 클릭 핸들러
  const handleRoutineCardClick = (planIdx) => {
    navigate(`/routine/detail/${planIdx}`);
  };

  // 새 루틴 추가 핸들러
  const handleAddNewRoutine = () => {
    navigate("/routine/create");
  };

  // 검색 핸들러
  const handleSearch = (value) => {
    // 실제 검색 실행 시에만 API 호출 (검색 버튼 클릭 또는 엔터)
    setSearchTerm(value);
  };

  // 필터 변경 핸들러 (이미 setFilters를 통해 처리)

  return (
    <>
      <RoutineList
        routines={routines}
        isLoading={isLoading}
        error={error}
        onCardClick={handleRoutineCardClick}
        onAddNewRoutine={handleAddNewRoutine}
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        searchInputTerm={searchInputTerm}
        setSearchInputTerm={setSearchInputTerm}
        filters={filters}
        setFilters={setFilters}
        onSearch={handleSearch}
      />
    </>
  );
}
