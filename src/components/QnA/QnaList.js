import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";

// UI 컴포넌트
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import {
  AlertCircle,
  PenSquare,
  RefreshCw,
  Search,
  Filter,
  X,
  ChevronUp,
  ChevronDown,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const QnAList = () => {
  // URL 검색 파라미터 관리
  const [searchParams, setSearchParams] = useSearchParams();
  
  // 상태 관리
  const [qnaList, setQnaList] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [totalPosts, setTotalPosts] = useState(0);
  const [currentPage, setCurrentPage] = useState(
    parseInt(searchParams.get("page") || "1")
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  
  // 필터링 및 정렬 상태
  const [status, setStatus] = useState(searchParams.get("status") || "all");
  const [sort, setSort] = useState(searchParams.get("sort") || "createdAt");
  const [order, setOrder] = useState(searchParams.get("order") || "desc");
  const [searchKeyword, setSearchKeyword] = useState(searchParams.get("search") || "");
  const [size, setSize] = useState(parseInt(searchParams.get("size") || "10"));
  
  // 임시 검색어 (Enter 키를 누르거나 검색 버튼을 클릭할 때까지 실제 검색에 반영되지 않음)
  const [tempSearch, setTempSearch] = useState(searchKeyword);
  
  // 카테고리 관리
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  
  // 필터가 열려있는지 여부
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  // 네비게이션
  const navigate = useNavigate();
  
  // 카테고리 데이터 가져오기
  const fetchCategories = async () => {
    setCategoryLoading(true);
    try {
      const response = await axiosInstance.get('/categories/qna');
      if (response.status === 200) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error('카테고리 로딩 오류:', error);
    } finally {
      setCategoryLoading(false);
    }
  };

  // 컴포넌트 마운트 시 카테고리 데이터 가져오기
  useEffect(() => {
    fetchCategories();
  }, []);

  // 상태값 매핑 (대문자 -> 소문자)
  const getApiStatusValue = (uiStatus) => {
    switch(uiStatus) {
      case "WAIT": return "wait";
      case "CONNECT": return "connect";
      case "RESPONDING": return "responding";
      case "COMPLETE": return "complete";
      case "SLEEP": return "sleep";
      default: return uiStatus.toLowerCase();
    }
  };

  // 정렬값 매핑
  const getApiSortValue = (uiSort) => {
    switch(uiSort) {
      case "createdAt": return "latest";
      case "title": return "title";
      case "category": return "category";
      case "qnaStatus": return "status";
      default: return uiSort;
    }
  };

  // URL 파라미터 업데이트 함수
  const updateURLParams = (params) => {
    const newParams = new URLSearchParams(searchParams);
    
    // 기존 파라미터 복사
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") {
        newParams.delete(key);
      } else {
        newParams.set(key, value);
      }
    });
    
    // 페이지가 1일 경우 URL에서 제거
    if (newParams.get("page") === "1") {
      newParams.delete("page");
    }
    
    // 상태가 "all"인 경우 URL에서 제거
    if (newParams.get("status") === "all") {
      newParams.delete("status");
    }
    
    // 정렬이 기본값인 경우 URL에서 제거
    if (newParams.get("sort") === "createdAt" && newParams.get("order") === "desc") {
      newParams.delete("sort");
      newParams.delete("order");
    }
    
    // 사이즈가 기본값인 경우 URL에서 제거
    if (newParams.get("size") === "10") {
      newParams.delete("size");
    }
    
    setSearchParams(newParams);
  };

  // QnA 목록 불러오기
  const fetchQnAList = async () => {
    setIsLoading(true);
    setError("");

    try {
      // API 요청 파라미터 구성
      const params = new URLSearchParams();
      params.append("page", currentPage);
      params.append("size", size);
      
      if (status !== "all") {
        // 소문자로 변환하여 API 요청에 맞춤
        params.append("status", getApiStatusValue(status));
      }
      
      // 정렬 필드 매핑
      if (sort) {
        params.append("sort", getApiSortValue(sort));
      }
      
      if (order) {
        params.append("order", order);
      }
      
      if (searchKeyword) {
        params.append("search", searchKeyword);
      }

      console.log("요청 파라미터:", params.toString()); // 디버깅용
      
      try {
        const response = await axiosInstance.get(`/list/auth/qna?${params.toString()}`, {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
          validateStatus: function (status) {
            // 200과 204 모두 성공으로 처리
            return status === 200 || status === 204;
          },
        });
        
        console.log("서버 응답 상태:", response.status);
        
        if (response.status === 200) {
          const data = response.data;
          
          // 데이터가 없는 경우 처리
          if (!data || !data.QnAs || data.QnAs.length === 0) {
            console.log("데이터 없음: 빈 배열로 설정");
            setQnaList([]);
            setTotalPages(0);
            setTotalPosts(0);
          } else {
            console.log("데이터 있음:", data.QnAs.length, "개 항목");
            setQnaList(data.QnAs);
            setTotalPages(data.totalPages || 0);
            setTotalPosts(data.totalPosts || 0);
            setCurrentPage(data.currentPage || 1);
          }
        } else if (response.status === 204) {
          // 204 No Content - 빈 배열로 처리
          console.log("204 응답: 콘텐츠 없음");
          setQnaList([]);
          setTotalPages(0);
          setTotalPosts(0);
        } else {
          console.error("비정상 응답 상태:", response.status);
          setError("문의 목록을 불러오는 중 오류가 발생했습니다.");
        }
      } catch (requestError) {
        console.error("요청 실패:", requestError);
        throw requestError; // 상위 catch 블록으로 에러 전달
      }
    } catch (error) {
      console.error("QnA 목록 불러오기 오류:", error);
      console.error("오류 응답:", error.response);
      console.error("오류 상태:", error.response?.status);
      console.error("오류 메시지:", error.response?.data?.message);
      
      // 응답 에러 종류에 따른 처리
      if (error.response) {
        // 서버가 응답을 반환한 경우
        if (error.response.status === 404) {
          console.log("404 오류: 데이터 없음");
          setQnaList([]);
          setTotalPages(0);
          setTotalPosts(0);
        } else if (error.response.status === 500) {
          // 서버 내부 오류
          console.error("서버 내부 오류");
          if (status !== "all") {
            // 필터 적용한 상태에서 오류 발생 시 빈 결과로 처리
            console.log("필터링 결과 없음 처리");
            setQnaList([]);
            setTotalPages(0);
            setTotalPosts(0);
          } else {
            setError("서버 내부 오류가 발생했습니다. 나중에 다시 시도해주세요.");
          }
        } else {
          setError(
            error.response?.data?.message || "문의 목록을 불러오는 중 오류가 발생했습니다."
          );
        }
      } else if (error.request) {
        // 요청은 전송되었지만 응답을 받지 못한 경우
        console.error("응답 없음");
        setError("서버로부터 응답을 받지 못했습니다. 네트워크 연결을 확인해주세요.");
      } else {
        // 요청 설정 중 오류 발생
        console.error("요청 설정 오류");
        setError("요청 설정 중 오류가 발생했습니다.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 필터 변경 시 URL 업데이트 및 API 호출
  useEffect(() => {
    updateURLParams({
      page: currentPage !== 1 ? currentPage : null,
      status: status !== "all" ? status : null,
      sort,
      order,
      search: searchKeyword,
      size: size !== 10 ? size : null,
    });
    
    fetchQnAList();
  }, [currentPage, status, sort, order, searchKeyword, size]);

  // 페이지 변경 처리
  const handlePageChange = (page) => {
    setCurrentPage(page);
  };

  // 검색어 제출 처리
  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setSearchKeyword(tempSearch);
    setCurrentPage(1); // 검색 시 첫 페이지로 이동
  };

  // 필터 초기화
  const handleResetFilters = () => {
    setStatus("all");
    setSort("createdAt");
    setOrder("desc");
    setSearchKeyword("");
    setTempSearch("");
    setSize(10);
    setCurrentPage(1);
  };

  // 정렬 변경
  const handleSortChange = (newSort) => {
    if (sort === newSort) {
      // 같은 열을 클릭한 경우 정렬 방향 전환
      setOrder(order === "asc" ? "desc" : "asc");
    } else {
      // 다른 열로 변경한 경우 기본 내림차순 정렬
      setSort(newSort);
      setOrder("desc");
    }
    setCurrentPage(1); // 정렬 변경 시 첫 페이지로 이동
  };

  // 상태 필터 변경
  const handleStatusChange = (newStatus) => {
    setStatus(newStatus);
    setCurrentPage(1); // 필터 변경 시 첫 페이지로 이동
  };

  // 페이지 크기 변경
  const handleSizeChange = (newSize) => {
    setSize(parseInt(newSize));
    setCurrentPage(1); // 페이지 크기 변경 시 첫 페이지로 이동
  };

  // 카테고리 이름 변환 함수 - 새로운 API 응답 구조에 맞게 수정
  const getCategoryName = (categoryId) => {
    if (categoryLoading || !categories.length) return "로딩 중...";
    
    // 모든 하위 카테고리를 탐색
    for (const parent of categories) {
      for (const child of parent.childCategory) {
        if (child.categoryIdx === categoryId) {
          return `${parent.parentName} > ${child.categoryName}`;
        }
      }
    }
    
    return "알 수 없음";
  };

  // 카테고리 정보 가져오기 (부모 카테고리와 자식 카테고리 모두)
  const getCategoryInfo = (categoryId) => {
    if (categoryLoading || !categories.length) return { parent: "로딩 중...", child: "로딩 중..." };
    
    // 모든 하위 카테고리를 탐색
    for (const parent of categories) {
      for (const child of parent.childCategory) {
        if (child.categoryIdx === categoryId) {
          return { 
            parent: parent.parentName,
            child: child.categoryName
          };
        }
      }
    }
    
    return { parent: "분류 없음", child: "분류 없음" };
  };

  // 상태에 따른 배지 스타일 변환
  const getStatusBadge = (status) => {
    switch (status) {
      case "WAIT":
        return <Badge variant="outline" className="bg-yellow-100">대기중</Badge>;
      case "CONNECT":
        return <Badge variant="outline" className="bg-blue-100">연결됨</Badge>;
      case "RESPONDING":
        return <Badge variant="outline" className="bg-purple-100">응대중</Badge>;
      case "COMPLETE":
        return <Badge variant="outline" className="bg-green-100">완료됨</Badge>;
      case "SLEEP":
        return <Badge variant="outline" className="bg-gray-100">휴면중</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  // 날짜 포맷 함수
  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  };

  // QnA 상세 페이지 이동
  const handleViewQnA = (qnaIdx) => {
    navigate(`/qna/detail/${qnaIdx}`);
  };

  // 정렬 아이콘 렌더링
  const renderSortIcon = (columnName) => {
    if (sort !== columnName) return null;
    
    return order === "asc" ? (
      <ChevronUp className="h-4 w-4 inline-block ml-1" />
    ) : (
      <ChevronDown className="h-4 w-4 inline-block ml-1" />
    );
  };

  // 페이지네이션 렌더링
  const renderPagination = () => {
    if (totalPages <= 1) return null;

    return (
      <Pagination>
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious 
              onClick={() => currentPage > 1 && handlePageChange(currentPage - 1)}
              className={currentPage <= 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
          
          {[...Array(totalPages)].map((_, index) => {
            const pageNumber = index + 1;
            
            // 현재 페이지 근처 5개 페이지만 표시
            if (
              pageNumber === 1 || 
              pageNumber === totalPages || 
              (pageNumber >= currentPage - 2 && pageNumber <= currentPage + 2)
            ) {
              return (
                <PaginationItem key={pageNumber}>
                  <PaginationLink
                    isActive={pageNumber === currentPage}
                    onClick={() => handlePageChange(pageNumber)}
                    className="cursor-pointer"
                  >
                    {pageNumber}
                  </PaginationLink>
                </PaginationItem>
              );
            }
            
            // 줄임표 표시 (처음과 끝 페이지 사이)
            if (
              (pageNumber === 2 && currentPage > 4) || 
              (pageNumber === totalPages - 1 && currentPage < totalPages - 3)
            ) {
              return (
                <PaginationItem key={`ellipsis-${pageNumber}`}>
                  <PaginationEllipsis />
                </PaginationItem>
              );
            }
            
            return null;
          })}
          
          <PaginationItem>
            <PaginationNext
              onClick={() => currentPage < totalPages && handlePageChange(currentPage + 1)}
              className={currentPage >= totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // 활성화된 필터 개수
  const getActiveFilterCount = () => {
    let count = 0;
    if (status !== "all") count++;
    if (sort !== "createdAt" || order !== "desc") count++;
    if (searchKeyword) count++;
    if (size !== 10) count++;
    return count;
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-5xl mx-auto">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>나의 1:1 문의 내역</CardTitle>
            <CardDescription>
              문의하신 내용과 답변을 확인하실 수 있습니다.
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => fetchQnAList()}
              disabled={isLoading}
              className="flex items-center gap-1"
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
              새로고침
            </Button>
            <Button
              onClick={() => navigate("/qna/create")}
              size="sm"
              className="flex items-center gap-1"
            >
              <PenSquare className="h-4 w-4" />
              문의하기
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          {/* 검색 및 필터 UI */}
          <div className="flex flex-col sm:flex-row gap-3">
            {/* 검색 폼 */}
            <form onSubmit={handleSearchSubmit} className="flex-1 flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="제목으로 검색..."
                  value={tempSearch}
                  onChange={(e) => setTempSearch(e.target.value)}
                  className="pr-8"
                />
                {tempSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setTempSearch("");
                      if (searchKeyword) {
                        setSearchKeyword("");
                        setCurrentPage(1);
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              <Button type="submit" size="sm" variant="secondary">
                <Search className="h-4 w-4 mr-1" />
                검색
              </Button>
            </form>

            {/* 필터 버튼 */}
            <div className="flex gap-2">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline" size="sm" className="flex items-center gap-1">
                    <Filter className="h-4 w-4" />
                    필터
                    {getActiveFilterCount() > 0 && (
                      <Badge className="ml-1 h-5 w-5 p-0 flex items-center justify-center">
                        {getActiveFilterCount()}
                      </Badge>
                    )}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64 bg-white border shadow-md">
                  <DropdownMenuLabel className="font-bold">문의 필터</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {/* 상태 필터 */}
                  <div className="p-2">
                    <label className="text-sm font-medium mb-1 block text-gray-700">상태</label>
                    <Select value={status} onValueChange={handleStatusChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="상태 선택" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="all">모든 상태</SelectItem>
                        <SelectItem value="WAIT">대기중</SelectItem>
                        <SelectItem value="CONNECT">연결됨</SelectItem>
                        <SelectItem value="RESPONDING">응대중</SelectItem>
                        <SelectItem value="COMPLETE">완료됨</SelectItem>
                        <SelectItem value="SLEEP">휴면중</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  {/* 정렬 필터 */}
                  <div className="p-2">
                    <label className="text-sm font-medium mb-1 block text-gray-700">정렬</label>
                    <div className="flex gap-2">
                      <Select value={sort} onValueChange={(value) => {
                        setSort(value);
                        setCurrentPage(1);
                      }}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="정렬 기준" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="createdAt">등록일</SelectItem>
                          <SelectItem value="title">제목</SelectItem>
                          <SelectItem value="category">카테고리</SelectItem>
                          <SelectItem value="qnaStatus">상태</SelectItem>
                        </SelectContent>
                      </Select>
                      
                      <Select value={order} onValueChange={(value) => {
                        setOrder(value);
                        setCurrentPage(1);
                      }}>
                        <SelectTrigger className="w-24">
                          <SelectValue placeholder="순서" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          <SelectItem value="asc">오름차순</SelectItem>
                          <SelectItem value="desc">내림차순</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  {/* 페이지 크기 */}
                  <div className="p-2">
                    <label className="text-sm font-medium mb-1 block text-gray-700">표시 개수</label>
                    <Select value={size.toString()} onValueChange={handleSizeChange}>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder="페이지당 항목 수" />
                      </SelectTrigger>
                      <SelectContent className="bg-white">
                        <SelectItem value="5">5개</SelectItem>
                        <SelectItem value="10">10개</SelectItem>
                        <SelectItem value="15">15개</SelectItem>
                        <SelectItem value="20">20개</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <DropdownMenuSeparator />
                  
                  {/* 필터 초기화 버튼 */}
                  <div className="p-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={handleResetFilters}
                      disabled={getActiveFilterCount() === 0}
                    >
                      필터 초기화
                    </Button>
                  </div>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>

          {/* 활성화된 필터 표시 영역 */}
          {getActiveFilterCount() > 0 && (
            <div className="flex flex-wrap gap-2 py-2">
              {status !== "all" && (
                <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
                  상태: {status === "WAIT" ? "대기중" : 
                         status === "CONNECT" ? "연결됨" :
                         status === "RESPONDING" ? "응대중" :
                         status === "COMPLETE" ? "완료됨" :
                         status === "SLEEP" ? "휴면중" : status}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => handleStatusChange("all")}
                  />
                </Badge>
              )}
              
              {(sort !== "createdAt" || order !== "desc") && (
                <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
                  정렬: {sort === "createdAt" ? "등록일" : 
                         sort === "title" ? "제목" :
                         sort === "category" ? "카테고리" :
                         sort === "qnaStatus" ? "상태" : sort}
                  ({order === "asc" ? "오름차순" : "내림차순"})
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => {
                      setSort("createdAt");
                      setOrder("desc");
                      setCurrentPage(1);
                    }}
                  />
                </Badge>
              )}
              
              {searchKeyword && (
                <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
                  검색어: {searchKeyword}
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => {
                      setSearchKeyword("");
                      setTempSearch("");
                      setCurrentPage(1);
                    }}
                  />
                </Badge>
              )}
              
              {size !== 10 && (
                <Badge variant="outline" className="flex items-center gap-1 bg-blue-50">
                  표시: {size}개
                  <X 
                    className="h-3 w-3 ml-1 cursor-pointer" 
                    onClick={() => handleSizeChange("10")}
                  />
                </Badge>
              )}
              
              <Button 
                variant="ghost"
                size="sm"
                className="text-xs h-7 px-2"
                onClick={handleResetFilters}
              >
                모두 초기화
              </Button>
            </div>
          )}

          {/* 오류 메시지 */}
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>오류</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* 로딩 상태 */}
          {isLoading || categoryLoading ? (
            <div className="flex justify-center items-center py-8">
              <RefreshCw className="h-8 w-8 animate-spin opacity-70" />
            </div>
          ) : qnaList.length === 0 ? (
            <div className="text-center py-12 border rounded-md">
              <p className="text-muted-foreground">
                {status !== "all" 
                  ? `"${status === "WAIT" ? "대기중" : 
                       status === "CONNECT" ? "연결됨" :
                       status === "RESPONDING" ? "응대중" :
                       status === "COMPLETE" ? "완료됨" :
                       status === "SLEEP" ? "휴면중" : status}" 상태의 문의가 없습니다.` 
                  : searchKeyword 
                    ? `"${searchKeyword}" 검색 결과가 없습니다.`
                    : "등록된 문의가 없습니다."}
              </p>
              <Button 
                onClick={() => navigate("/qna/create")} 
                variant="outline" 
                className="mt-4"
              >
                문의 등록하기
              </Button>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead 
                      className="w-14 text-center cursor-pointer"
                      onClick={() => handleSortChange("num")}
                    >
                      번호 {renderSortIcon("num")}
                    </TableHead>
                    <TableHead 
                      className="cursor-pointer"
                      onClick={() => handleSortChange("title")}
                    >
                      제목 {renderSortIcon("title")}
                    </TableHead>
                    <TableHead 
                      className="w-36 text-center cursor-pointer"
                      onClick={() => handleSortChange("category")}
                    >
                      카테고리 {renderSortIcon("category")}
                    </TableHead>
                    <TableHead 
                      className="w-28 text-center cursor-pointer"
                      onClick={() => handleSortChange("qnaStatus")}
                    >
                      상태 {renderSortIcon("qnaStatus")}
                    </TableHead>
                    <TableHead 
                      className="w-28 text-center cursor-pointer"
                      onClick={() => handleSortChange("createdAt")}
                    >
                      등록일 {renderSortIcon("createdAt")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {qnaList.map((qna) => (
                    <TableRow 
                      key={qna.qnaIdx}
                      className="cursor-pointer hover:bg-muted/50"
                      onClick={() => handleViewQnA(qna.qnaIdx)}
                    >
                      <TableCell className="text-center font-medium">{qna.num}</TableCell>
                      <TableCell>
                        {qna.title}
                        {qna.acount > 0 && (
                          <Badge variant="secondary" className="ml-2">
                            {qna.acount}
                          </Badge>
                        )}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {!categoryLoading && categories.length > 0 ? (
                          <div>
                            <div className="text-xs text-gray-500">
                              {(() => {
                                // 부모 카테고리 찾기
                                for (const parent of categories) {
                                  for (const child of parent.childCategory) {
                                    if (child.categoryIdx === qna.category) {
                                      return parent.parentName;
                                    }
                                  }
                                }
                                return "분류 없음";
                              })()}
                            </div>
                            <div className="font-medium mt-1">
                              {(() => {
                                // 자식 카테고리 찾기
                                for (const parent of categories) {
                                  for (const child of parent.childCategory) {
                                    if (child.categoryIdx === qna.category) {
                                      return child.categoryName;
                                    }
                                  }
                                }
                                return "분류 없음";
                              })()}
                            </div>
                          </div>
                        ) : (
                          "로딩 중..."
                        )}
                      </TableCell>
                      <TableCell className="text-center">
                        {getStatusBadge(qna.qnaStatus)}
                      </TableCell>
                      <TableCell className="text-center text-sm">
                        {formatDate(qna.createdAt)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>

        <CardFooter className="flex justify-between items-center">
          <div className="text-sm text-muted-foreground">
            총 {totalPosts}개의 문의 중 {qnaList.length}개 표시 (페이지 {currentPage}/{totalPages || 1})
          </div>
          {renderPagination()}
        </CardFooter>
      </Card>
    </div>
  );
};

export default QnAList;