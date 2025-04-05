import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft } from "lucide-react";
import axiosInstance from "@/api/axiosInstance";

// Toast UI Editor 불러오기
import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";

const NoticeCreateEdit = () => {
  const { noticeIdx } = useParams(); // URL에서 공지사항 ID를 가져옴 (있으면 수정 모드)
  const isEditMode = !!noticeIdx; // ID가 있으면 수정 모드, 없으면 생성 모드

  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode); // 수정 모드일 경우 초기 로딩 상태
  const editorRef = useRef(null);
  const [userIdx, setUserIdx] = useState(null);
  const [originalNotice, setOriginalNotice] = useState(null);

  // 사용자 정보 가져오기
  useEffect(() => {
    const getUserInfo = () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserIdx(user.userIdx || 1); // 기본값 1 또는 실제 사용자 ID
    };

    getUserInfo();
  }, []);

  // 사용자 정보 가져오기
  // 수정 모드인 경우 기존 공지사항 데이터 가져오기

  // 에디터가 초기화된 후와 원본 데이터가 로드된 후에 내용 설정
  useEffect(() => {
    if (!isLoading && originalNotice && editorRef.current) {
      setTimeout(() => {
        const editorInstance = editorRef.current.getInstance();
        editorInstance.setMarkdown(originalNotice.noticeSub || "");
      }, 100); // 약간의 지연을 주어 에디터가 완전히 마운트된 후 실행
    }
  }, [isLoading, originalNotice]);
  useEffect(() => {
    if (isEditMode) {
      const fetchNoticeForEdit = async () => {
        try {
          // ==================== 실제 API 호출 코드 ====================
          // const response = await axiosInstance.get(`/notice/${noticeIdx}`);
          // const noticeData = response.data;
          // ============================================================

          // 목데이터 (실제 환경에서는 API 응답 사용)
          const mockNoticeData = {
            noticeIdx: parseInt(noticeIdx),
            noticeTitle: "서비스 점검 안내",
            noticeSub:
              "안녕하세요. 더나은 서비스 제공을 위해 서버 점검을 진행합니다.\n\n점검일시 : 2025년 02월20일 (목) 02:00 ~ 05:00\n\n점검 중에는 서비스 이용이 일시적으로 중단될 수 있으니 양해 부탁드립니다. 더 나은 서비스를 제공하기 위한 노력이니 많은 협조 부탁드립니다.\n\n문의사항이 있으시면 고객센터로 연락주세요.",
            userIdx: 0,
            userName: "시스템관리자",
            noticeDate: "2025-02-19 15:09:38",
            noticeModify: null,
          };

          // 지연 시뮬레이션
          setTimeout(() => {
            setTitle(mockNoticeData.noticeTitle);
            setOriginalNotice(mockNoticeData);
            setIsLoading(false);
          }, 500);
        } catch (error) {
          console.error("공지사항 데이터 로딩 실패:", error);
          toast({
            title: "공지사항 불러오기에 실패했습니다",
            description:
              error.response?.data?.message || "서버 오류가 발생했습니다",
            variant: "destructive",
          });
          setIsLoading(false);
          // 오류 발생시 목록으로 돌아가기
          navigate("/notice");
        }
      };

      fetchNoticeForEdit();
    }
  }, [isEditMode, noticeIdx, navigate, toast]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "제목을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    // 에디터 내용 가져오기
    const editorContent = editorRef.current?.getInstance().getMarkdown();

    if (!editorContent || editorContent.trim() === "") {
      toast({
        title: "내용을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");

      if (isEditMode) {
        // ==================== 수정 API 호출 코드 ====================
        // const url = `/notice/admin/update/${noticeIdx}`;
        // await axiosInstance.put(
        //   url,
        //   {
        //     noticeTitle: title,
        //     noticeSub: editorContent,
        //     userIdx: userIdx,
        //   },
        //   {
        //     headers: {
        //       "Content-Type": "application/json",
        //       Authorization: `Bearer ${token}`,
        //     },
        //   }
        // );
        // ============================================================

        // 업데이트 성공 시뮬레이션 (목데이터용)
        await new Promise((resolve) => setTimeout(resolve, 800));

        toast({
          title: "공지사항이 성공적으로 수정되었습니다",
          variant: "default",
        });
      } else {
        // ==================== 생성 API 호출 코드 ====================
        // const url = "/notice/admin/create";
        // await axiosInstance.post(
        //   url,
        //   {
        //     noticeTitle: title,
        //     noticeSub: editorContent,
        //     userIdx: userIdx,
        //   },
        //   {
        //     headers: {
        //       "Content-Type": "application/json",
        //       Authorization: `Bearer ${token}`,
        //     },
        //   }
        // );
        // ============================================================

        // 생성 성공 시뮬레이션 (목데이터용)
        await new Promise((resolve) => setTimeout(resolve, 800));

        toast({
          title: "공지사항이 성공적으로 등록되었습니다",
          variant: "default",
        });
      }

      // 성공 후 공지사항 목록 페이지로 이동
      navigate("/notice/list");
    } catch (error) {
      console.error(`공지사항 ${isEditMode ? "수정" : "등록"} 실패:`, error);
      toast({
        title: `공지사항 ${isEditMode ? "수정" : "등록"}에 실패했습니다`,
        description:
          error.response?.data?.message || "서버 오류가 발생했습니다",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    navigate(-1);
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

  return (
    <div className="container mx-auto py-8">
      <Button variant="ghost" className="mb-6 pl-2" onClick={handleCancel}>
        <ArrowLeft className="mr-2 h-4 w-4" />
        뒤로 가기
      </Button>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">
            공지사항 {isEditMode ? "수정" : "작성"}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                제목
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="공지사항 제목을 입력하세요"
                className="w-full"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">내용</label>
              <div className="min-h-[400px] border rounded-md">
                <Editor
                  ref={editorRef}
                  initialValue=""
                  previewStyle="vertical"
                  height="400px"
                  initialEditType="wysiwyg"
                  useCommandShortcut={true}
                  language="ko-KR"
                  onLoad={() => {
                    // 에디터 로드 완료 시
                    if (isEditMode && originalNotice) {
                      // 수정 모드이고 데이터가 있으면 내용 설정
                      setTimeout(() => {
                        const editorInstance = editorRef.current.getInstance();
                        editorInstance.setMarkdown(
                          originalNotice.noticeSub || ""
                        );
                      }, 100);
                    }
                  }}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isSubmitting}
              >
                취소
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {isEditMode ? "수정 중..." : "등록 중..."}
                  </>
                ) : isEditMode ? (
                  "수정하기"
                ) : (
                  "등록하기"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NoticeCreateEdit;
