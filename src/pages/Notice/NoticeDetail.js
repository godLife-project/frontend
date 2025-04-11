import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Loader2,
  ArrowLeft,
  Calendar,
  Edit2,
  Clock,
  Trash2,
} from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/api/axiosInstance";

// Toast UI Viewer 불러오기
import { Viewer } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor-viewer.css";

const NoticeDetail = () => {
  const [isDeleting, setIsDeleting] = useState(false);
  const { noticeIdx } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [notice, setNotice] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNoticeDetail = async () => {
      setIsLoading(true);
      try {
        // API 호출 코드
        const response = await axiosInstance.get(`/notice/${noticeIdx}`);

        // 응답 구조에 맞게 데이터 처리
        // response.data가 { code: 200, message: {...}, status: 'success' } 형태인 경우
        if (response.data && response.data.message) {
          setNotice(response.data.message);
          console.log("API 응답:", response.data);
          console.log("공지사항 데이터:", response.data.message);
        } else {
          // 기존 방식 (response.data가 직접 공지사항 데이터인 경우)
          setNotice(response.data);
          console.log("공지사항 데이터:", response.data);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("API 오류:", err);
        setError("공지사항을 불러오는데 실패했습니다.");
        setIsLoading(false);
        toast({
          title: "오류가 발생했습니다",
          description: err.message || "공지사항을 불러오는데 실패했습니다.",
          variant: "destructive",
        });
      }
    };

    fetchNoticeDetail();
  }, [noticeIdx, toast]);

  const handleGoBack = () => {
    navigate("/notice/list");
  };

  const handleDeleteNotice = async (noticeIdx) => {
    // 삭제 확인
    if (!window.confirm("정말로 이 공지사항을 삭제하시겠습니까?")) {
      return;
    }

    setIsDeleting(true);

    try {
      // API 호출 코드
      const token = localStorage.getItem("accessToken");

      await axiosInstance.delete(`/notice/admin/${noticeIdx}`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      toast({
        title: "공지사항이 삭제되었습니다",
        variant: "default",
      });

      // 삭제 후 목록 페이지로 이동
      navigate("/notice/list");
    } catch (err) {
      console.error("공지사항 삭제 실패:", err);
      toast({
        title: "공지사항 삭제에 실패했습니다",
        description: err.response?.data?.message || "서버 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
    }
  };

  // 날짜 포맷팅 함수
  const formatDate = (dateString) => {
    if (!dateString) return "";

    try {
      const date = new Date(dateString);
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

  if (isLoading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-60">
          <div className="flex flex-col items-center gap-2">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
            <p className="text-muted-foreground">공지사항을 불러오는 중...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-60 p-6">
          <div className="text-center">
            <p className="text-red-500 text-lg mb-2">⚠️ 오류가 발생했습니다</p>
            <p className="text-muted-foreground">{error}</p>
            <Button variant="outline" className="mt-4" onClick={handleGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              목록 보기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!notice) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center items-center h-60 p-6">
          <div className="text-center">
            <p className="text-lg mb-2">공지사항을 찾을 수 없습니다</p>
            <Button variant="outline" className="mt-4" onClick={handleGoBack}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              뒤로 가기
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" className="mb-6 pl-2" onClick={handleGoBack}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        목록으로 돌아가기
      </Button>

      <Card className="overflow-hidden border shadow-sm">
        <CardHeader className="pb-4 pt-6 px-6">
          <div className="flex flex-col space-y-1.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs text-blue-700 ring-1 ring-inset ring-blue-700/10 mr-2">
                  No.{notice.noticeIdx}
                </span>
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="mr-1 h-4 w-4" />
                <span>{formatDate(notice.noticeDate)}</span>
                {notice.noticeModify && (
                  <div className="flex items-center ml-4">
                    <Clock className="mr-1 h-4 w-4" />
                    <span>{formatDate(notice.noticeModify)} (수정됨)</span>
                  </div>
                )}
              </div>
            </div>
            <CardTitle className="text-2xl font-bold mt-2">
              {notice.noticeTitle}
            </CardTitle>

            <div className="flex items-center mt-3">
              <div className="h-7 w-7 rounded-full bg-indigo-100 flex items-center justify-center text-xs text-indigo-700 font-medium">
                {notice.userName ? notice.userName.charAt(0) : "?"}
              </div>
              <span className="ml-2 text-sm font-medium text-gray-600">
                {notice.userName || "알 수 없음"}
              </span>
            </div>
          </div>
        </CardHeader>

        <CardContent className="px-6 py-4 border-t border-b">
          <div className="prose prose-blue max-w-none">
            {/* Toast UI Viewer를 통해 마크다운 내용 표시 */}
            <Viewer initialValue={notice.noticeSub} />
          </div>
        </CardContent>

        <CardFooter className="flex justify-end gap-2 pt-6 pb-6 px-6">
          <Button
            variant="outline"
            onClick={() => navigate(`/notice/edit/${notice.noticeIdx}`)}
          >
            <Edit2 className="mr-2 h-4 w-4" />
            수정
          </Button>
          <Button
            variant="destructive"
            onClick={() => handleDeleteNotice(notice.noticeIdx)}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                삭제 중...
              </>
            ) : (
              <>
                <Trash2 className="mr-2 h-4 w-4" />
                삭제
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default NoticeDetail;
