import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
  PaginationEllipsis,
} from "@/components/ui/pagination";
import { ChevronLeft, ChevronRight } from "lucide-react";
import axiosInstance from "@/api/axiosInstance";

// 목 데이터 생성
const mockNotices = Array.from({ length: 35 }, (_, index) => ({
  noticeIdx: index + 1,
  noticeTitle: `공지사항 제목 ${index + 1}`,
  noticeSub: `이것은 공지사항 ${
    index + 1
  }의 내용입니다. 여기에는 공지사항의 상세 내용이 들어갑니다. 공지사항에는 다양한 정보가 포함될 수 있습니다. 예를 들어 서비스 점검 일정, 새로운 기능 소개, 중요 정책 안내 등이 여기에 기재됩니다.`,
  noticeDate: new Date(
    2025,
    3,
    Math.floor(Math.random() * 30) + 1
  ).toISOString(),
  noticeModify:
    Math.random() > 0.7
      ? new Date(2025, 3, Math.floor(Math.random() * 30) + 1).toISOString()
      : null,
  writeName: ["관리자", "시스템", "운영팀"][Math.floor(Math.random() * 3)],
  isPopup: Math.random() > 0.8 ? "Y" : "N",
}));

const NoticeListPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const currentPage = parseInt(searchParams.get("page") || "1", 10);
  const pageSize = 10;

  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalPages, setTotalPages] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const navigate = useNavigate();

  // 페이지 변경 함수
  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;

    setSearchParams({ page: newPage.toString() });
  };

  useEffect(() => {
    const fetchNotices = async () => {
      setIsLoading(true);
      try {
        // API 호출 대신 목 데이터 사용
        setTimeout(() => {
          // 현재 페이지에 해당하는 데이터만 추출
          const start = (currentPage - 1) * pageSize;
          const end = start + pageSize;
          const paginatedNotices = mockNotices.slice(start, end);

          // 데이터 및 페이지네이션 정보 설정
          setNotices(paginatedNotices);
          setTotalItems(mockNotices.length);
          setTotalPages(Math.ceil(mockNotices.length / pageSize));
          setIsLoading(false);
        }, 500); // 로딩 시뮬레이션

        /* 실제 API 코드는 주석 처리
        const url = `/notice?page=${currentPage}&size=${pageSize}`;
        const response = await axiosInstance.get(url);

        console.log("API 응답 확인:", response.data);

        if (response.data && Array.isArray(response.data.data)) {
          setNotices(response.data.data);
          
          if (response.data.totalItems !== undefined) {
            setTotalItems(response.data.totalItems);
            setTotalPages(Math.ceil(response.data.totalItems / pageSize));
          } else if (response.data.totalPages !== undefined) {
            setTotalPages(response.data.totalPages);
          } else {
            setTotalPages(Math.max(1, Math.ceil(response.data.data.length / pageSize)));
          }
        } else {
          console.warn("예상치 못한 API 응답 구조:", response.data);
          setNotices([]);
          setTotalPages(1);
        }
        */
      } catch (err) {
        setError(err.message || "공지사항을 불러오는데 실패했습니다.");
        console.error("공지사항 로딩 오류:", err);
        setNotices([]);
      }
    };

    fetchNotices();
  }, [currentPage, pageSize]);

  const handleCreateNotice = () => {
    navigate("/notice/create");
  };

  const handleViewNotice = (noticeIdx) => {
    navigate(`/notice/detail/${noticeIdx}`);
  };

  // 페이지네이션 표시 함수
  const renderPagination = () => {
    // 페이지 범위 계산 (최대 5개의 페이지 번호 표시)
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, startPage + 4);

    // 페이지 범위 조정
    if (endPage - startPage < 4 && totalPages > 5) {
      if (startPage === 1) {
        endPage = Math.min(totalPages, 5);
      } else if (endPage === totalPages) {
        startPage = Math.max(1, totalPages - 4);
      }
    }

    const pages = Array.from(
      { length: endPage - startPage + 1 },
      (_, i) => startPage + i
    );

    return (
      <Pagination className="mt-6">
        <PaginationContent>
          <PaginationItem>
            <PaginationPrevious
              onClick={() => handlePageChange(currentPage - 1)}
              className={
                currentPage <= 1
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>

          {startPage > 1 && (
            <>
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(1)}>
                  1
                </PaginationLink>
              </PaginationItem>
              {startPage > 2 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
            </>
          )}

          {pages.map((page) => (
            <PaginationItem key={page}>
              <PaginationLink
                isActive={page === currentPage}
                onClick={() => handlePageChange(page)}
              >
                {page}
              </PaginationLink>
            </PaginationItem>
          ))}

          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && (
                <PaginationItem>
                  <PaginationEllipsis />
                </PaginationItem>
              )}
              <PaginationItem>
                <PaginationLink onClick={() => handlePageChange(totalPages)}>
                  {totalPages}
                </PaginationLink>
              </PaginationItem>
            </>
          )}

          <PaginationItem>
            <PaginationNext
              onClick={() => handlePageChange(currentPage + 1)}
              className={
                currentPage >= totalPages
                  ? "pointer-events-none opacity-50"
                  : "cursor-pointer"
              }
            />
          </PaginationItem>
        </PaginationContent>
      </Pagination>
    );
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    try {
      const date = new Date(dateString);

      // YYYY.MM.DD HH:MM 형식으로 포맷팅
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");

      return `${year}.${month}.${day} ${hours}:${minutes}`;
    } catch (err) {
      return dateString;
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex flex-col space-y-2">
        <h1 className="text-3xl font-extrabold tracking-tight">공지사항</h1>
        <p className="text-muted-foreground">
          중요한 안내 및 업데이트 사항을 확인하세요
        </p>
      </div>

      <div className="flex justify-end mb-6">
        <Button
          onClick={handleCreateNotice}
          className="bg-primary hover:bg-primary/90 text-white font-medium"
        >
          공지사항 작성
        </Button>
      </div>

      <Card className="overflow-hidden border-0 shadow-md">
        {isLoading ? (
          <div className="flex justify-center items-center h-60">
            <div className="flex flex-col items-center gap-2">
              <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
              <p className="text-muted-foreground">공지사항을 불러오는 중...</p>
            </div>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center h-60 p-6">
            <div className="text-center">
              <p className="text-red-500 text-lg mb-2">
                ⚠️ 오류가 발생했습니다
              </p>
              <p className="text-muted-foreground">{error}</p>
            </div>
          </div>
        ) : notices.length === 0 ? (
          <div className="flex justify-center items-center h-60 p-6">
            <div className="text-center">
              <p className="text-lg mb-2">📝 등록된 공지사항이 없습니다</p>
              <p className="text-muted-foreground">
                곧 새로운 공지사항이 등록될 예정입니다
              </p>
            </div>
          </div>
        ) : (
          <>
            <div className="divide-y divide-gray-100">
              {notices.map((notice) => (
                <div
                  key={notice.noticeIdx}
                  className="cursor-pointer p-6 transition-colors hover:bg-gray-50"
                  onClick={() => handleViewNotice(notice.noticeIdx)}
                >
                  <div className="flex items-start justify-between mb-1">
                    <div>
                      <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700 ring-1 ring-inset ring-blue-700/10 mr-2">
                        No.{notice.noticeIdx}
                      </span>
                      <h3 className="text-lg font-semibold inline">
                        {notice.noticeTitle}
                      </h3>
                      {notice.isPopup === "Y" && (
                        <span className="ml-2 inline-flex items-center rounded-full bg-red-50 px-2 py-1 text-xs text-red-700 ring-1 ring-inset ring-red-700/10">
                          팝업
                        </span>
                      )}
                    </div>
                    <time className="text-xs text-muted-foreground">
                      {formatDate(notice.noticeDate)}
                    </time>
                  </div>

                  <div className="flex items-center mt-2">
                    <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs text-indigo-700 font-medium">
                      {notice.writeName ? notice.writeName.charAt(0) : "?"}
                    </div>
                    <span className="ml-2 text-sm font-medium text-gray-600">
                      {notice.writeName || "알 수 없음"}
                    </span>
                  </div>

                  <div className="mt-3 relative">
                    <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed pr-16">
                      {notice.noticeSub}
                    </p>
                    {notice.noticeSub && notice.noticeSub.length > 100 && (
                      <div className="absolute bottom-0 right-0 bg-gradient-to-l from-white via-white to-transparent w-20 h-full flex items-end justify-end">
                        <span className="text-xs text-blue-500 px-2 py-1">
                          더보기
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 페이지네이션 컴포넌트 */}
            {renderPagination()}
          </>
        )}
      </Card>

      {!isLoading && !error && notices.length > 0 && (
        <div className="mt-4 text-sm text-center text-muted-foreground">
          전체 {totalItems || "?"}개 중 {(currentPage - 1) * pageSize + 1}-
          {Math.min(currentPage * pageSize, totalItems || notices.length)} 표시
        </div>
      )}
    </div>
  );
};

export default NoticeListPage;
