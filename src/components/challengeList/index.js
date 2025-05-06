import React, { useState, useMemo, useEffect } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Clock, Users, ArrowUpDown, Loader2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";

const ChallengeListForm = () => {
  const navigate = useNavigate();

  // localStorage에서 accessToken과 userIdx 가져오기
  const accessToken = localStorage.getItem("accessToken");
  const userInfoString = localStorage.getItem("userInfo");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const userIdx = userInfo?.userIdx || "21";
  const roleStatus = userInfo?.roleStatus || false; // 기본값은 false

  // 상태 관리
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortOrder, setSortOrder] = useState("earliest");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 페이지당 보여줄 아이템 수

  // 챌린지 데이터 fetching
  useEffect(() => {
    const fetchChallenges = async () => {
      try {
        setLoading(true);
        const response = await axiosInstance.get("/challenges/latest");
        console.log("API 응답 데이터:", response.data); // 응답 데이터 구조 확인

        // 응답 데이터가 배열인지 확인하고, 아니면 적절히 처리
        if (Array.isArray(response.data)) {
          setChallenges(response.data);
        } else if (response.data && typeof response.data === "object") {
          // 응답이 객체이고 내부 필드 중 배열이 있는지 확인
          const possibleArrays = [
            "content",
            "data",
            "challenges",
            "items",
            "list",
          ];

          for (const field of possibleArrays) {
            if (Array.isArray(response.data[field])) {
              console.log(`데이터 필드 발견: ${field}`);
              setChallenges(response.data[field]);
              break;
            }
          }

          // 어떤 필드도 배열이 아닌 경우
          if (!Array.isArray(challenges)) {
            console.error(
              "API 응답에서 배열 필드를 찾을 수 없습니다:",
              response.data
            );
            setChallenges([]);
          }
        } else {
          console.error("API 응답이 예상 형식과 다릅니다:", response.data);
          setChallenges([]);
        }

        setError(null);
      } catch (err) {
        console.error("챌린지 데이터 가져오기 오류:", err);
        setError("챌린지를 불러오는 중 오류가 발생했습니다.");
        setChallenges([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  // 챌린지 상세 페이지로 이동하는 핸들러
  const handleChallengeClick = (challIdx) => {
    // 상세 페이지로 이동
    navigate(`/challenge/detail/${challIdx}`);
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return "종료 날짜 미정";

    try {
      const date = new Date(dateString);
      // 유효한 날짜인지 확인
      if (isNaN(date.getTime())) {
        return "유효하지 않은 날짜";
      }

      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return `종료일 : ${date.getFullYear()}년 ${
        date.getMonth() + 1
      }월 ${date.getDate()}일 ${hours}:${minutes}`;
    } catch (error) {
      console.error("날짜 포맷팅 오류:", error);
      return "날짜 형식 오류";
    }
  };

  // 카테고리 매핑 함수
  const getCategoryName = (categoryIdx) => {
    const categories = {
      6: "테스트 카테고리",
    };
    return categories[categoryIdx] || "미분류";
  };

  // 정렬된 챌린지 목록
  const sortedChallenges = useMemo(() => {
    // challenges가 배열이 아니면 빈 배열 반환
    if (!Array.isArray(challenges)) {
      console.warn("challenges가 배열이 아닙니다:", challenges);
      return [];
    }

    try {
      return [...challenges].sort((a, b) => {
        // a나 b가 유효한 객체가 아닌 경우 처리
        if (!a || !b) return 0;

        // 종료 날짜 없는 챌린지 처리
        if (!a.challEndTime) return 1;
        if (!b.challEndTime) return -1;

        try {
          // 정렬 순서에 따라 다른 정렬 로직
          return sortOrder === "earliest"
            ? new Date(a.challEndTime) - new Date(b.challEndTime)
            : new Date(b.challEndTime) - new Date(a.challEndTime);
        } catch (error) {
          console.error("날짜 정렬 오류:", error);
          return 0;
        }
      });
    } catch (error) {
      console.error("챌린지 정렬 중 오류 발생:", error);
      return [];
    }
  }, [challenges, sortOrder]);

  // 페이지네이션된 챌린지 목록
  const paginatedChallenges = useMemo(() => {
    try {
      if (!Array.isArray(sortedChallenges)) {
        return [];
      }

      const startIndex = (currentPage - 1) * itemsPerPage;
      return sortedChallenges.slice(startIndex, startIndex + itemsPerPage);
    } catch (error) {
      console.error("페이지네이션 오류:", error);
      return [];
    }
  }, [sortedChallenges, currentPage]);

  // 전체 페이지 수 계산
  const totalPages = Math.max(
    1,
    Math.ceil(
      (Array.isArray(sortedChallenges) ? sortedChallenges.length : 0) /
        itemsPerPage
    )
  );

  // 정렬 변경 핸들러
  const handleSortChange = (value) => {
    setSortOrder(value);
    setCurrentPage(1); // 정렬 변경 시 첫 페이지로 리셋
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    if (page >= 1 && page <= totalPages) {
      setCurrentPage(page);
    }
  };

  // 로딩 상태 렌더링
  if (loading) {
    return (
      <div className="flex justify-center items-center h-full py-10">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  // 에러 상태 렌더링
  if (error) {
    return (
      <div className="text-center text-red-500 py-10">
        {error}
        <Button onClick={() => window.location.reload()} className="mt-4">
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex items-center space-x-2">
          <Select value={sortOrder} onValueChange={handleSortChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="정렬 기준" />
            </SelectTrigger>
            <SelectContent className="bg-white">
              <SelectItem value="earliest">
                <div className="flex items-center">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  마감일 빠른 순
                </div>
              </SelectItem>
              <SelectItem value="latest">
                <div className="flex items-center">
                  <ArrowUpDown className="mr-2 h-4 w-4" />
                  마감일 늦은 순
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        {roleStatus === true && (
          <div className="flex justify-center space-x-2 mt-6">
            <Button
              className="bg-black text-white"
              onClick={() => navigate(`/challenge/write`)}
            >
              + 새 챌린지
            </Button>
          </div>
        )}
      </div>

      {!Array.isArray(challenges) || challenges.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          현재 진행 중인 챌린지가 없습니다.
        </div>
      ) : (
        <>
          <div className="grid gap-4 mb-4">
            {paginatedChallenges.map((challenge, index) => (
              <Card
                key={challenge.challIdx || index}
                className="hover:shadow-lg transition-shadow bg-white shadow-sm cursor-pointer"
                onClick={() => handleChallengeClick(challenge.challIdx)}
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {challenge.challTitle || "제목 없음"}
                    <Badge variant="secondary">
                      {getCategoryName(challenge.challCategoryIdx)}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {challenge.challDescription || "설명 없음"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-gray-500" />
                      <span>
                        참가자: {challenge.currentParticipants || 0} /{" "}
                        {challenge.maxParticipants || 0}
                      </span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Clock className="w-5 h-5 text-gray-500" />
                      <span>{formatDate(challenge.challEndTime)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* 페이지네이션*/}
          {totalPages >= 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={
                      currentPage === 1
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      onClick={() => handlePageChange(index + 1)}
                      isActive={currentPage === index + 1}
                      className="cursor-pointer"
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={
                      currentPage === totalPages
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </>
      )}
    </div>
  );
};

export default ChallengeListForm;
