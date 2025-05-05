import React, { useState, useRef } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { AlertCircle, Send, RotateCcw } from "lucide-react";

// Toast UI Editor 임포트
import { Editor } from "@toast-ui/react-editor";
import "@toast-ui/editor/dist/toastui-editor.css";

const QnACreate = () => {
  // 상태 관리
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 네비게이션
  const navigate = useNavigate();

  // 에디터 참조
  const editorRef = useRef(null);

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }

    // Toast UI 에디터 내용 가져오기
    const editorContent = editorRef.current?.getInstance().getMarkdown();

    if (!editorContent || !editorContent.trim()) {
      setError("내용을 입력해주세요.");
      return;
    }

    if (!category) {
      setError("카테고리를 선택해주세요.");
      return;
    }

    // 제출 상태 변경
    setIsSubmitting(true);
    setError("");

    try {
      // API 요청 데이터
      const requestData = {
        title,
        content: editorContent, // 에디터 내용
        category,
        isPrivate,
      };

      console.log("전송 데이터:", requestData);

      // API 호출
      const response = await axios.post("/api/qna", requestData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      // 성공 시 목록 페이지로 이동
      if (response.status === 201 || response.status === 200) {
        navigate("/qna/list");
      } else {
        setError("문의 등록 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("QnA 등록 오류:", error);
      setError(
        error.response?.data?.message || "문의 등록 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 폼 초기화
  const handleReset = () => {
    setTitle("");
    setCategory("");
    setError("");
    // 에디터 초기화
    editorRef.current?.getInstance().reset();
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <CardTitle>1:1 문의 작성</CardTitle>
          <CardDescription>
            궁금하신 내용이나 문제점을 자세히 설명해 주시면 빠른 시일 내에
            답변해 드리겠습니다.
          </CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            {/* 오류 메시지 */}
            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>오류</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {/* 카테고리 선택 */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                카테고리
              </label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger id="category">
                  <SelectValue placeholder="문의 유형을 선택해주세요" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="account">계정 관련</SelectItem>
                  <SelectItem value="payment">결제 관련</SelectItem>
                  <SelectItem value="service">서비스 이용</SelectItem>
                  <SelectItem value="suggestion">기능 제안</SelectItem>
                  <SelectItem value="bug">오류 신고</SelectItem>
                  <SelectItem value="other">기타</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* 제목 입력 */}
            <div className="space-y-2">
              <label htmlFor="title" className="text-sm font-medium">
                제목
              </label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="문의 제목을 입력해주세요"
                maxLength={100}
              />
            </div>

            {/* 내용 입력 - Toast UI Editor */}
            <div className="space-y-2">
              <label htmlFor="content" className="text-sm font-medium">
                내용
              </label>
              <div className="border rounded-md">
                <Editor
                  initialValue=""
                  previewStyle="vertical"
                  height="400px"
                  initialEditType="markdown"
                  useCommandShortcut={true}
                  ref={editorRef}
                  toolbarItems={[
                    ["heading", "bold", "italic", "strike"],
                    ["hr", "quote"],
                    ["ul", "ol", "task", "indent", "outdent"],
                    ["table", "image", "link"],
                    ["code", "codeblock"],
                  ]}
                  placeholder="문의 내용을 자세히 작성해주세요. 이미지나 파일을 첨부할 수 있습니다."
                  language="ko-KR"
                />
              </div>
            </div>

            {/* 공개 여부 */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="isPrivate"
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                checked={isPrivate}
                onChange={(e) => setIsPrivate(e.target.checked)}
              />
              <label htmlFor="isPrivate" className="text-sm">
                비공개 문의로 등록
              </label>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting}
              className="flex items-center gap-1"
            >
              <RotateCcw className="h-4 w-4" /> 초기화
            </Button>

            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/qna/list")}
                disabled={isSubmitting}
              >
                취소
              </Button>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1"
              >
                <Send className="h-4 w-4" />
                {isSubmitting ? "제출 중..." : "문의 등록"}
              </Button>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default QnACreate;
