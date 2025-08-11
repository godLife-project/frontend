// pages/MyRoutineList.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import RoutineList from "@/components/routine/list/RoutineList";
import axiosInstance from "@/api/axiosInstance";
import { reissueToken } from "@/utils/routineUtils";

const MyRoutineList = () => {
  const [routines, setRoutines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const navigate = useNavigate();

  // 데이터 가져오기
  // 데이터 가져오기 함수 수정
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
            // validateStatus를 추가하여 204도 성공으로 처리
            validateStatus: function (status) {
              return (status >= 200 && status < 300) || status === 204;
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
              validateStatus: function (status) {
                return (status >= 200 && status < 300) || status === 204;
              },
            });
          }
          throw error;
        }
      };

      const response = await getRoutines(token);
      console.log("루틴 리스트 데이터:", response.status, response.data);

      // 204 상태 처리 (루틴이 없음)
      if (response.status === 204) {
        console.log("루틴이 없습니다 (204 No Content)");
        setRoutines([]);
        setError(null); // 이건 에러가 아니므로 에러 상태 초기화
      }
      // 200 상태 처리 (정상)
      else if (response.data && response.data.status === "success") {
        const routinesData = response.data.message || [];
        console.log("가져온 루틴 데이터:", routinesData);
        setRoutines(routinesData);
      }
      // 그 외 상태 처리 (비정상)
      else {
        console.error("API 응답 오류:", response.data);
        setError("데이터를 불러오는데 실패했습니다.");
      }
    } catch (error) {
      console.error("루틴 리스트 조회 실패:", error);
      setError("루틴 목록을 불러오는데 문제가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  }, [navigate]);

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

  // 에러 상태에서 다시 시도 핸들러 (수정된 부분)
  const handleRetry = () => {
    fetchRoutineData();
  };

  return (
    <RoutineList
      routines={routines}
      isLoading={isLoading}
      error={error}
      onCardClick={handleRoutineCardClick}
      onAddNewRoutine={handleAddNewRoutine}
      onRetry={handleRetry}
      isMyRoutine={true} // 마이루틴 모드 활성화
    />
  );
};

export default MyRoutineList;
