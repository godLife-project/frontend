import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/api/axiosInstance";

const NoticeListPage = () => {
  const [notices, setNotices] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchNotices = async () => {
      setIsLoading(true);
      try {
        // ==================== 실제 API 호출 코드 (현재는 주석 처리) ====================
        // const url = "/notice";
        // const response = await axiosInstance.get(url);
        // setNotices(response.data);
        // console.log(response.data);

        // ============================================================================

        // 목데이터를 사용하는 부분 (작성자 정보 추가)
        const mockData = {
          code: 200,
          message: [
            {
              noticeIdx: 26,
              noticeTitle: "공지사항 제목이다",
              noticeSub: "하나 둘 셋 ",
              userIdx: 0,
              userName: "시스템관리자",
              noticeDate: "2025-03-27 17:34:02",
              noticeModify: null,
            },
            {
              noticeIdx: 24,
              noticeTitle: "제목이 바뀜ㅎ1",
              noticeSub: "내용도 바꿈 ㅋ",
              userIdx: 1,
              userName: "김운영자",
              noticeDate: "2025-03-26 20:11:09",
              noticeModify: null,
            },
            {
              noticeIdx: 3,
              noticeTitle: "서비스 점검 안내",
              noticeSub:
                "안녕하세요. 더나은 서비스 제공을 위해 서버 점검을 진행합니다.\n    점검일시 : 2025년 02월20일 (목) 02:00 ~ 05:00\n\n점검 중에는 서비스 이용이 일시적으로 중단될 수 있으니 양해 부탁드립니다. 더 나은 서비스를 제공하기 위한 노력이니 많은 협조 부탁드립니다. 문의사항이 있으시면 고객센터로 연락주세요.",
              userIdx: 0,
              userName: "시스템관리자",
              noticeDate: "2025-02-19 15:09:38",
              noticeModify: null,
            },
            {
              noticeIdx: 2,
              noticeTitle: "커뮤니티 가이드라인 안내",
              noticeSub:
                "우리 커뮤니티가 더욱 건강한 공간이 될 수 있도록 규칙을 알려드립니다.\n    1. 욕설, 비방, 차별적 발언을 삼가주세요.\n    2. 다른 회원을 존중하고 배려하는 마음을 가져주세요.\n    3. 불법적인 콘텐츠나 스팸을 게시하지 마세요.\n    4. 개인정보 보호에 주의해주세요.\n    5. 저작권을 침해하는 콘텐츠를 게시하지 마세요.\n    6. 광고성 콘텐츠는 관련 게시판에만 작성해주세요.\n    7. 논쟁이 될 수 있는 주제에 대해서는 서로 다른 의견을 존중해주세요.\n\n모두가 함께 만들어가는 커뮤니티가 될 수 있도록 협조 부탁드립니다. 가이드라인을 위반할 경우 경고 없이 게시물이 삭제되거나 계정이 정지될 수 있습니다.",
              userIdx: 2,
              userName: "박매니저",
              noticeDate: "2025-02-19 15:09:33",
              noticeModify: null,
            },
            {
              noticeIdx: 1,
              noticeTitle: "사이트 오픈 안내",
              noticeSub:
                "안녕하세요 여러분! godLife 플랫폼이 정식 오픈했습니다! 많은 이용 부탁드립니다.",
              userIdx: 1,
              userName: "김운영자",
              noticeDate: "2025-02-19 15:09:31",
              noticeModify: null,
            },
          ],
          status: "success",
        };

        // 실제 API 응답을 시뮬레이션하기 위해 짧은 지연 추가
        setTimeout(() => {
          if (mockData.status === "success") {
            setNotices(mockData.message);
          } else {
            throw new Error("공지사항을 불러오는데 실패했습니다.");
          }
        }, 500); // 0.5초 지연
      } catch (err) {
        setError(err.message);
        console.error("공지사항 로딩 오류:", err);
      } finally {
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };

    fetchNotices();
  }, []);

  const handleCreateNotice = () => {
    navigate("/notice/create");
  };

  const handleViewNotice = (noticeIdx) => {
    navigate(`/notice/detail/${noticeIdx}`);
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
                  </div>
                  <time className="text-xs text-muted-foreground">
                    {formatDate(notice.noticeDate)}
                  </time>
                </div>

                <div className="flex items-center mt-2">
                  <div className="h-6 w-6 rounded-full bg-indigo-100 flex items-center justify-center text-xs text-indigo-700 font-medium">
                    {notice.userName ? notice.userName.charAt(0) : "?"}
                  </div>
                  <span className="ml-2 text-sm font-medium text-gray-600">
                    {notice.userName || "알 수 없음"}
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
        )}
      </Card>
    </div>
  );
};

export default NoticeListPage;
