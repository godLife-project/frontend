import axiosInstance from "@/api/axiosInstance";
import { reissueToken } from "@/utils/routineUtils";

/**
 * 루틴 데이터를 가져오는 함수
 * @param {number} currentPage - 현재 페이지
 * @param {number} pageSize - 페이지당 표시할 아이템 수
 * @param {string} searchTerm - 검색어
 * @param {object} filters - 필터 옵션 (sort, order, status, target, job)
 * @returns {Promise<{data: object, error: string}>} - 결과 데이터 또는 에러 메시지
 */
export const fetchRoutineData = async (
  currentPage,
  pageSize,
  searchTerm,
  filters
) => {
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

    let token = localStorage.getItem("accessToken");
    const response = await axiosInstance.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    if (response.data) {
      return { data: response.data, error: null };
    }

    return { data: null, error: "데이터를 불러오는데 실패했습니다." };
  } catch (error) {
    console.error("루틴 리스트 조회 실패:", error);

    // 토큰 만료 시 재발급 처리
    if (error.response && error.response.status === 401) {
      try {
        await reissueToken();
        // 토큰 재발급 후 다시 시도
        return fetchRoutineData(currentPage, pageSize, searchTerm, filters);
      } catch (refreshError) {
        console.error("토큰 재발급 실패:", refreshError);
        return {
          data: null,
          error: "인증이 만료되었습니다. 다시 로그인해주세요.",
        };
      }
    }

    return { data: null, error: "루틴 목록을 불러오는데 문제가 발생했습니다." };
  }
};

/**
 * 관심사 카테고리 데이터를 가져오는 함수
 * @returns {Promise<Array>} - 카테고리 목록 배열
 */
export const fetchTargetCategoryData = async () => {
  try {
    // API 호출
    const response = await axiosInstance.get("/categories/target");
    console.log("관심사 카테고리 데이터 로드 완료");
    return response.data;
  } catch (error) {
    console.error("관심사 카테고리 데이터 로드 실패:", error);
    return null;
  }
};

/**
 * 직업 카테고리 데이터를 가져오는 함수
 * @returns {Promise<Array>} - 카테고리 목록 배열
 */
export const fetchJobCategoryData = async () => {
  try {
    // API 호출
    const response = await axiosInstance.get("/categories/job");
    console.log("직업 카테고리 데이터 로드 완료");
    return response.data;
  } catch (error) {
    console.error("직업 카테고리 데이터 로드 실패:", error);
    return null;
  }
};
