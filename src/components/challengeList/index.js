import React, { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import {
  Clock,
  Users,
  ArrowUpDown,
  Loader2,
  Search,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { MdOutlineMode, MdOutlineDelete } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/api/axiosInstance";

// Props 추가: onChallengeSelect, onCreateNew
const ChallengeListPage = ({ onChallengeSelect, onCreateNew }) => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // localStorage에서 accessToken과 userIdx 가져오기
  const accessToken = localStorage.getItem("accessToken");
  const userInfoString = localStorage.getItem("userInfo");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const userIdx = userInfo?.userIdx || "21";
  const roleStatus = userInfo?.roleStatus || false;

  // 상태 관리
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [deleting, setDeleting] = useState(false);

  // 카테고리 관련 상태
  const [categories, setCategories] = useState([
    { value: "all", label: "모든 카테고리" },
  ]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);

  // 고급 필터 토글 상태
  const [showAdvancedFilter, setShowAdvancedFilter] = useState(false);

  // 검색 및 필터링 상태
  const [searchTitle, setSearchTitle] = useState("");
  const [searchCategory, setSearchCategory] = useState("all");
  const [sortOrder, setSortOrder] = useState("default");

  // 페이징 상태
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 5;

  // 정렬 옵션
  const sortOptions = [
    { value: "default", label: "기본순" },
    { value: "chall_idx DESC", label: "최신순" },
    { value: "chall_idx ASC", label: "오래된순" },
    { value: "challEndTime ASC", label: "마감일 빠른 순" },
    { value: "challEndTime DESC", label: "마감일 늦은 순" },
  ];

  // 상태 텍스트 매핑 함수
  const getStatusText = (status) => {
    const statusMap = {
      IN_PROGRESS: "진행중",
      PUBLISHED: "게시중",
      COMPLETED: "종료됨",
      WAITING: "대기중",
      게시중: "게시중",
      진행중: "진행중",
      종료됨: "종료됨",
      대기중: "대기중",
      완료됨: "완료됨",
    };

    return statusMap[status] || status || "상태 정보 없음";
  };

  // 상태별 스타일 매핑 함수
  const getStatusStyle = (status) => {
    const normalizedStatus = getStatusText(status);

    const styleMap = {
      진행중: {
        variant: "secondary",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      게시중: {
        variant: "secondary",
        className: "bg-blue-100 text-blue-800 border-blue-200",
      },
      종료됨: {
        variant: "default",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      완료됨: {
        variant: "default",
        className: "bg-green-100 text-green-800 border-green-200",
      },
      대기중: {
        variant: "outline",
        className: "bg-gray-100 text-gray-800 border-gray-200",
      },
    };

    return (
      styleMap[normalizedStatus] || {
        variant: "destructive",
        className: "bg-red-100 text-red-800 border-red-200",
      }
    );
  };

  // 카테고리 목록 가져오기
  const fetchCategories = async () => {
    try {
      setCategoriesLoading(true);
      const response = await axiosInstance.get("/categories/challenge");
      console.log("카테고리 API 응답:", response.data);

      let categoryData = [];
      if (Array.isArray(response.data)) {
        categoryData = response.data;
      } else if (response.data && Array.isArray(response.data.data)) {
        categoryData = response.data.data;
      } else if (response.data && Array.isArray(response.data.content)) {
        categoryData = response.data.content;
      }

      const categoryOptions = [
        { value: "all", label: "모든 카테고리" },
        ...categoryData
          .map((category) => {
            const value =
              category.challName || category.name || category.categoryName;
            const label =
              category.challName ||
              category.name ||
              category.categoryName ||
              "이름 없음";
            return { value, label };
          })
          .filter((option) => option.value && option.value.trim() !== ""),
      ];

      console.log("처리된 카테고리 옵션:", categoryOptions);
      setCategories(categoryOptions);
    } catch (err) {
      console.error("카테고리 불러오기 오류:", err);
      setCategories([{ value: "all", label: "모든 카테고리" }]);
    } finally {
      setCategoriesLoading(false);
    }
  };

  // 컴포넌트 마운트 시 카테고리 목록 가져오기
  useEffect(() => {
    fetchCategories();
  }, []);

  // 챌린지 데이터 fetching (검색 API 사용)
  const fetchChallenges = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const params = {};

      if (currentPage > 0) {
        params.page = currentPage;
      }

      params.size = pageSize;

      if (sortOrder && sortOrder !== "default") {
        params.sort = sortOrder;
      }

      if (searchTitle.trim()) {
        params.challTitle = searchTitle.trim();
      }

      if (searchCategory && searchCategory !== "all") {
        params.challCategory = searchCategory;
      }

      console.log("검색 파라미터:", params);

      const response = await axiosInstance.get("/challenges/search", {
        params,
      });

      console.log("검색 API 응답:", response.data);

      if (response.data && typeof response.data === "object") {
        if (response.data.content && Array.isArray(response.data.content)) {
          setChallenges(response.data.content);
          setTotalPages(response.data.totalPages || 0);
          setTotalElements(response.data.totalElements || 0);
        } else if (Array.isArray(response.data)) {
          setChallenges(response.data);
          setTotalPages(1);
          setTotalElements(response.data.length);
        } else {
          const possibleArrays = ["data", "challenges", "items", "list"];
          let found = false;

          for (const field of possibleArrays) {
            if (Array.isArray(response.data[field])) {
              console.log(`데이터 필드 발견: ${field}`);
              setChallenges(response.data[field]);
              setTotalPages(response.data.totalPages || 1);
              setTotalElements(
                response.data.totalElements || response.data[field].length
              );
              found = true;
              break;
            }
          }

          if (!found) {
            console.error(
              "API 응답에서 배열 필드를 찾을 수 없습니다:",
              response.data
            );
            setChallenges([]);
            setTotalPages(0);
            setTotalElements(0);
          }
        }
      } else {
        console.error("API 응답이 예상 형식과 다릅니다:", response.data);
        setChallenges([]);
        setTotalPages(0);
        setTotalElements(0);
      }
    } catch (err) {
      console.error("챌린지 검색 오류:", err);
      setError("챌린지를 불러오는 중 오류가 발생했습니다.");
      setChallenges([]);
      setTotalPages(0);
      setTotalElements(0);
    } finally {
      setLoading(false);
    }
  }, [currentPage, pageSize, sortOrder, searchTitle, searchCategory]);

  useEffect(() => {
    fetchChallenges();
  }, [fetchChallenges]);

  const handleSearch = () => {
    setCurrentPage(0);
    fetchChallenges();
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter") {
      handleSearch();
    }
  };

  const handleSortChange = (value) => {
    setSortOrder(value);
    setCurrentPage(0);
  };

  const handlePageChange = (page) => {
    if (page >= 0 && page < totalPages) {
      setCurrentPage(page);
    }
  };

  // 🔥 수정된 챌린지 클릭 핸들러
  const handleChallengeClick = (challenge) => {
    if (onChallengeSelect) {
      // 통합 모드일 때: 콜백 함수 사용
      onChallengeSelect(challenge);
    } else {
      // 독립 모드일 때: navigate 사용
      navigate(`/challenge/detail/${challenge.challIdx}`);
    }
  };

  // 🔥 수정된 새 챌린지 버튼 핸들러
  const handleCreateNewClick = () => {
    if (onCreateNew) {
      // 통합 모드일 때: 콜백 함수 사용
      onCreateNew();
    } else {
      // 독립 모드일 때: navigate 사용
      navigate("/challenge/write");
    }
  };

  // 챌린지 삭제 함수
  const deleteChallenge = async (challIdx, event) => {
    event.stopPropagation();

    if (!window.confirm("정말 이 챌린지를 삭제하시겠습니까?")) {
      return;
    }

    try {
      setDeleting(true);

      await axiosInstance.patch(
        "/admin/challenges/delete",
        { challIdx: challIdx },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast({
        title: "성공",
        description: "챌린지가 성공적으로 삭제되었습니다.",
      });

      fetchChallenges();
    } catch (err) {
      console.error("챌린지 삭제 실패:", err);
      toast({
        title: "오류",
        description: "챌린지 삭제에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  // 수정 버튼 핸들러
  const handleEditClick = (challIdx, event) => {
    event.stopPropagation();
    navigate(`/challenge/modify/${challIdx}`);
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return "종료 날짜 미정";

    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return "유효하지 않은 날짜";
      }

      const hours = date.getHours().toString().padStart(2, "0");
      const minutes = date.getMinutes().toString().padStart(2, "0");

      return ` ~ ${date.getFullYear()}년 ${
        date.getMonth() + 1
      }월 ${date.getDate()}일 ${hours}:${minutes}`;
    } catch (error) {
      console.error("날짜 포맷팅 오류:", error);
      return "날짜 형식 오류";
    }
  };

  // 카테고리 매핑 함수 (challCategoryIdx 인덱스 기반)
  const getCategoryName = (categoryValue) => {
    if (!categoryValue && categoryValue !== 0) return "미분류";

    if (typeof categoryValue === "number") {
      const category = categories[categoryValue];
      return category ? category.label : `카테고리 ${categoryValue}`;
    }

    const category = categories.find((cat) => cat.value === categoryValue);
    return category ? category.label : categoryValue;
  };

  // 수정 버튼 컴포넌트 (관리자만)
  const ModifyButton = ({ challIdx }) => {
    if (roleStatus === true) {
      return (
        <MdOutlineMode
          className="w-5 h-5 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors"
          onClick={(e) => handleEditClick(challIdx, e)}
          title="수정하기"
        />
      );
    }
    return null;
  };

  // 삭제 버튼 컴포넌트 (관리자만)
  const DeleteButton = ({ challIdx }) => {
    if (roleStatus === true) {
      return (
        <MdOutlineDelete
          className="w-5 h-5 text-gray-600 hover:text-red-600 cursor-pointer transition-colors"
          onClick={(e) => deleteChallenge(challIdx, e)}
          title="삭제하기"
        />
      );
    }
    return null;
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
        <Button onClick={fetchChallenges} className="mt-4">
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* 🔥 수정된 새 챌린지 버튼 */}
      <div className="flex justify-end mb-4">
        {roleStatus === true && (
          <Button
            className="bg-black text-white"
            onClick={handleCreateNewClick}
          >
            + 새 챌린지
          </Button>
        )}
      </div>

      {/* 검색 섹션 */}
      <div>
        {/* 메인 검색창 */}
        <div className="mb-3 bg-white">
          <div className="relative">
            <Input
              type="text"
              placeholder="챌린지 제목 검색..."
              value={searchTitle}
              onChange={(e) => setSearchTitle(e.target.value)}
              onKeyPress={handleKeyPress}
              className="pr-10 h-12 text-base"
            />
            <Search
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 w-5 h-5 cursor-pointer transition-colors"
              onClick={handleSearch}
              title="검색하기"
            />
          </div>
        </div>

        {/* 고급 필터 토글 버튼 */}
        <div className="flex items-center justify-between pb-5">
          <Button
            variant="outline"
            onClick={() => setShowAdvancedFilter(!showAdvancedFilter)}
            className="flex items-center gap-2 border-gray-300"
          >
            <Filter className="w-4 h-4" />
            고급 필터
            {showAdvancedFilter ? (
              <ChevronUp className="w-4 h-4" />
            ) : (
              <ChevronDown className="w-4 h-4" />
            )}
          </Button>
        </div>

        {/* 고급 필터 영역 */}
        {showAdvancedFilter && (
          <div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4">
              {/* 카테고리 선택 */}
              <div>
                <label className="block text-sm font-medium  text-gray-700 mb-2">
                  카테고리
                </label>
                <Select
                  value={searchCategory}
                  onValueChange={setSearchCategory}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="카테고리 선택" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {categoriesLoading ? (
                      <SelectItem value="loading" disabled>
                        카테고리 불러오는 중...
                      </SelectItem>
                    ) : (
                      categories
                        .filter(
                          (option) => option.value && option.value.trim() !== ""
                        )
                        .map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* 정렬 선택 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  정렬 기준
                </label>
                <Select value={sortOrder} onValueChange={handleSortChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="정렬 기준" />
                  </SelectTrigger>
                  <SelectContent className="bg-white">
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <ArrowUpDown className="mr-2 h-4 w-4" />
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 챌린지 목록 */}
      {challenges.length === 0 ? (
        <div className="text-center text-gray-500 py-10">
          {searchTitle || (searchCategory && searchCategory !== "all")
            ? "검색 조건에 맞는 챌린지가 없습니다."
            : "현재 진행 중인 챌린지가 없습니다."}
        </div>
      ) : (
        <>
          <div className="grid gap-4 mb-4">
            {challenges.map((challenge, index) => {
              if (index === 0) {
                console.log("challCategoryIdx:", challenge.challCategoryIdx);
                console.log("challState:", challenge.challState);
                console.log("전체 객체:", challenge);
              }

              const statusStyle = getStatusStyle(challenge.challState);

              return (
                <Card
                  key={challenge.challIdx || index}
                  className="hover:shadow-lg transition-shadow bg-white shadow-sm cursor-pointer"
                  onClick={() => handleChallengeClick(challenge)}
                >
                  <CardHeader>
                    <CardTitle className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        {/* 카테고리 배지 (제목 왼쪽) */}
                        {(() => {
                          const categoryValue =
                            challenge.challCategoryIdx !== undefined
                              ? challenge.challCategoryIdx
                              : challenge.challCategory ||
                                challenge.categoryName ||
                                challenge.category ||
                                challenge.challName ||
                                null;

                          return categoryValue !== null &&
                            categoryValue !== undefined ? (
                            <Badge variant="secondary" className="text-xs">
                              {getCategoryName(categoryValue)}
                            </Badge>
                          ) : (
                            <Badge
                              variant="outline"
                              className="text-xs text-gray-400"
                            >
                              카테고리 없음
                            </Badge>
                          );
                        })()}

                        {/* 제목 */}
                        <span>{challenge.challTitle || "제목 없음"}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        {/* 상태 배지 (제목 오른쪽) */}
                        {challenge.challState && (
                          <Badge
                            variant={statusStyle.variant}
                            className={`text-xs ${statusStyle.className}`}
                          >
                            {getStatusText(challenge.challState)}
                          </Badge>
                        )}
                      </div>
                    </CardTitle>
                    <CardDescription className="p-2">
                      {challenge.challDescription || "설명 없음"}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center space-x-2 pb-2">
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
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* 페이지네이션 */}
          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 0}
                    className={
                      currentPage === 0
                        ? "cursor-not-allowed opacity-50"
                        : "cursor-pointer"
                    }
                  />
                </PaginationItem>

                {[...Array(totalPages)].map((_, index) => (
                  <PaginationItem key={index}>
                    <PaginationLink
                      onClick={() => handlePageChange(index)}
                      isActive={currentPage === index}
                      className="cursor-pointer"
                    >
                      {index + 1}
                    </PaginationLink>
                  </PaginationItem>
                ))}

                <PaginationItem>
                  <PaginationNext
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages - 1}
                    className={
                      currentPage === totalPages - 1
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

export default ChallengeListPage;
