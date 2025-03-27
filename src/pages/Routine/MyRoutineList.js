import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import RoutineList from "@/components/routine/list/RoutineList";
import axiosInstance from "@/api/axiosInstance";
import { reissueToken } from "@/utils/routineUtils";

export default function MyRoutineList() {
  const [routines, setRoutines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // 데이터 가져오기 (필터 없음)
  const fetchRoutineData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    let token = localStorage.getItem("accessToken");

    try {
      const getRoutines = async (authToken) => {
        const url = `/list/auth/myPlans`;

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
  }, [navigate]); // 의존성 배열에서 filters와 searchTerm 제거

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

  return (
    <>
      <RoutineList
        routines={routines}
        isLoading={isLoading}
        error={error}
        onCardClick={handleRoutineCardClick}
        onAddNewRoutine={handleAddNewRoutine}
        // 검색 및 필터 관련 prop 제거
      />
    </>
  );
}
