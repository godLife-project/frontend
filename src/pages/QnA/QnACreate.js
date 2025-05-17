import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
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
  const [parentCategory, setParentCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  // 네비게이션
  const navigate = useNavigate();

  // 에디터 참조
  const editorRef = useRef(null);

  // 카테고리 데이터 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const response = await axiosInstance.get('/categories/qna');
        if (response.status === 200) {
          setCategories(response.data);
          // 기본값 설정
          if (response.data && response.data.length > 0) {
            setParentCategory(response.data[0].parentIdx.toString());
            if (response.data[0].childCategory && response.data[0].childCategory.length > 0) {
              setCategory(response.data[0].childCategory[0].categoryIdx.toString());
            }
          }
        }
      } catch (error) {
        console.error('카테고리 로딩 오류:', error);
        setError('카테고리를 불러오는 중 오류가 발생했습니다.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  // 부모 카테고리 변경 핸들러
  const handleParentCategoryChange = (value) => {
    setParentCategory(value);
    
    // 선택된 부모 카테고리의 첫 번째 자식 카테고리로 기본값 설정
    const parent = categories.find(p => p.parentIdx.toString() === value);
    if (parent && parent.childCategory && parent.childCategory.length > 0) {
      setCategory(parent.childCategory[0].categoryIdx.toString());
    } else {
      setCategory("");
    }
  };

  // 현재 선택된 부모 카테고리의 자식 카테고리 목록 가져오기
  const getChildCategories = () => {
    if (!parentCategory) return [];
    const parent = categories.find(p => p.parentIdx.toString() === parentCategory);
    return parent ? parent.childCategory : [];
  };

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
        category: parseInt(category, 10), // 문자열을 정수로 변환
      };

      console.log("전송 데이터:", requestData);

      // API 호출
      const response = await axiosInstance.post("/qna/auth/create", requestData, {
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
    // 기본 카테고리 설정
    if (categories && categories.length > 0) {
      setParentCategory(categories[0].parentIdx.toString());
      if (categories[0].childCategory && categories[0].childCategory.length > 0) {
        setCategory(categories[0].childCategory[0].categoryIdx.toString());
      }
    }
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

            {/* 카테고리 선택 - 부모 카테고리 먼저 선택 */}
            <div className="space-y-2">
              <label htmlFor="parentCategory" className="text-sm font-medium">
                대분류
              </label>
              <Select 
                value={parentCategory} 
                onValueChange={handleParentCategoryChange}
                disabled={isLoading}
              >
                <SelectTrigger id="parentCategory">
                  <SelectValue placeholder="대분류를 선택해주세요" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-md">
                  {categories.map((parent) => (
                    <SelectItem 
                      key={parent.parentIdx} 
                      value={parent.parentIdx.toString()}
                    >
                      {parent.parentName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* 하위 카테고리 선택 */}
            <div className="space-y-2">
              <label htmlFor="category" className="text-sm font-medium">
                세부 카테고리
              </label>
              <Select 
                value={category} 
                onValueChange={setCategory}
                disabled={isLoading || !parentCategory}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="세부 카테고리를 선택해주세요" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-md">
                  {getChildCategories().map((child) => (
                    <SelectItem 
                      key={child.categoryIdx} 
                      value={child.categoryIdx.toString()}
                    >
                      {child.categoryName}
                    </SelectItem>
                  ))}
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
          </CardContent>

          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={handleReset}
              disabled={isSubmitting || isLoading}
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
                disabled={isSubmitting || isLoading}
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