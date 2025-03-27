// MyRoutineList.jsx - API 호출 로직이 여기로 이동
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import RoutineList from "@/components/routine/list/RoutineList";
import axiosInstance from "@/api/axiosInstance";
import { reissueToken } from "@/utils/routineUtils";

export default function RoutineList() {
  const [routines, setRoutines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 데이터 가져오기 (RoutineList에서 옮겨온 API 호출 로직)
  useEffect(() => {
    const fetchRoutineData = async () => {
      setIsLoading(true);
      setError(null);

      let token = localStorage.getItem("accessToken");

      try {
        const getRoutines = async (authToken) => {
          try {
            const response = await axiosInstance.get("/list/plan/rank", {});
            return response;
          } catch (error) {
            // 토큰 만료 처리
            if (error.response && error.response.status === 401) {
              const newToken = await reissueToken(navigate);
              return await axiosInstance.get("/list/plan/rank", {});
            }
            throw error;
          }
        };

        const response = await getRoutines(token);
        console.log("루틴 리스트 데이터:", response.data);

        if (response.data && response.data.status === "success") {
          setRoutines(response.data.message || []);
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

    fetchRoutineData();
  }, [navigate]);

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
      />
    </>
  );
}
