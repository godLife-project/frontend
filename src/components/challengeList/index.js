import React, { useState, useMemo, useEffect } from "react";
import axios from "axios";
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

const ChallengeListForm = () => {
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
        const response = await axios.get("/challenges/latest");
        setChallenges(response.data);
        setError(null);
      } catch (err) {
        setError("챌린지를 불러오는 중 오류가 발생했습니다.");
        setChallenges([]);
      } finally {
        setLoading(false);
      }
    };

    fetchChallenges();
  }, []);

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return "종료 날짜 미정";
    const date = new Date(dateString);
    return `${date.getFullYear()}년 ${
      date.getMonth() + 1
    }월 ${date.getDate()}일 ${date.getHours()}:${date.getMinutes()}`;
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
    return [...challenges].sort((a, b) => {
      // 종료 날짜 없는 챌린지 처리
      if (!a.challEndTime) return 1;
      if (!b.challEndTime) return -1;

      // 정렬 순서에 따라 다른 정렬 로직
      return sortOrder === "earliest"
        ? new Date(a.challEndTime) - new Date(b.challEndTime)
        : new Date(b.challEndTime) - new Date(a.challEndTime);
    });
  }, [challenges, sortOrder]);

  // 페이지네이션된 챌린지 목록
  const paginatedChallenges = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedChallenges.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedChallenges, currentPage]);

  // 전체 페이지 수 계산
  const totalPages = Math.ceil(sortedChallenges.length / itemsPerPage);

  // 정렬 변경 핸들러
  const handleSortChange = (value) => {
    setSortOrder(value);
    setCurrentPage(1); // 정렬 변경 시 첫 페이지로 리셋
  };

  // 페이지 변경 핸들러
  const handlePageChange = (page) => {
    setCurrentPage(page);
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
      </div>

      {challenges.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          현재 진행 중인 챌린지가 없습니다.
        </div>
      ) : (
        <>
          <div className="grid gap-4 mb-4">
            {paginatedChallenges.map((challenge) => (
              <Card
                key={challenge.challIdx}
                className="hover:shadow-lg transition-shadow bg-white shadow-sm"
              >
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    {challenge.challTitle}
                    <Badge variant="secondary">
                      {getCategoryName(challenge.challCategoryIdx)}
                    </Badge>
                  </CardTitle>
                  <CardDescription>
                    {challenge.challDescription}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Users className="w-5 h-5 text-gray-500" />
                      <span>
                        참가자: {challenge.currentParticipants} /{" "}
                        {challenge.maxParticipants}
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

          {/* 페이지네이션 컴포넌트 */}
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                />
              </PaginationItem>

              {[...Array(totalPages)].map((_, index) => (
                <PaginationItem key={index}>
                  <PaginationLink
                    onClick={() => handlePageChange(index + 1)}
                    isActive={currentPage === index + 1}
                  >
                    {index + 1}
                  </PaginationLink>
                </PaginationItem>
              ))}

              <PaginationItem>
                <PaginationNext
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}
    </div>
  );
};

export default ChallengeListForm;
