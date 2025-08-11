// import React, { useState, useEffect, useRef } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import axiosInstance from "@/api/axiosInstance";

// // UI 컴포넌트
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardFooter,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
// import { AlertCircle, ArrowLeft, Save, RotateCcw } from "lucide-react";

// // Toast UI Editor 임포트
// import { Editor } from "@toast-ui/react-editor";
// import "@toast-ui/editor/dist/toastui-editor.css";

// const QnAEdit = () => {
//   // URL 파라미터에서 QnA ID 가져오기
//   const { qnaIdx } = useParams();
//   const navigate = useNavigate();

//   // 상태 관리
//   const [title, setTitle] = useState("");
//   const [category, setCategory] = useState("");
//   const [parentCategory, setParentCategory] = useState("");
//   const [categories, setCategories] = useState([]);
//   const [categoryLoading, setCategoryLoading] = useState(true);
//   const [isLoading, setIsLoading] = useState(true);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [error, setError] = useState("");
//   const [originalData, setOriginalData] = useState(null);

//   // 에디터 참조
//   const editorRef = useRef(null);

//   // 카테고리 데이터 가져오기
//   const fetchCategories = async () => {
//     setCategoryLoading(true);
//     try {
//       const response = await axiosInstance.get("/categories/qna");
//       if (response.status === 200) {
//         setCategories(response.data);
//       }
//     } catch (error) {
//       console.error("카테고리 로딩 오류:", error);
//       setError("카테고리를 불러오는 중 오류가 발생했습니다.");
//     } finally {
//       setCategoryLoading(false);
//     }
//   };

//   // QnA 상세 정보 불러오기
//   const fetchQnADetail = async () => {
//     setIsLoading(true);
//     setError("");

//     try {
//       console.log("QnA 상세 정보 요청 시작. qnaIdx:", qnaIdx);

//       const response = await axiosInstance.get(`/qna/auth/${qnaIdx}`, {
//         headers: {
//           Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//         },
//       });

//       console.log("API 응답:", response);

//       if (response.status === 200) {
//         // 응답 데이터 처리
//         const data = response.data.message || response.data;
//         console.log("응답 데이터:", data);

//         // 상태 설정
//         setTitle(data.title || "");
//         setOriginalData(data);

//         // 카테고리 설정 (부모와 자식)
//         const childCategoryId = data.category;
//         setCategory(String(childCategoryId) || "");

//         // 부모 카테고리 찾기
//         if (categories.length > 0 && childCategoryId) {
//           for (const parent of categories) {
//             const childCategory = parent.childCategory.find(
//               (child) => child.categoryIdx === childCategoryId
//             );

//             if (childCategory) {
//               setParentCategory(String(parent.parentIdx));
//               break;
//             }
//           }
//         }

//         // 에디터 내용 설정 - 로딩 후 약간의 지연을 두고 설정
//         setTimeout(() => {
//           if (editorRef.current) {
//             // data.body 또는 data.content 필드 확인
//             const contentToSet = data.body || data.content || "";
//             console.log("에디터에 설정할 내용:", contentToSet);
//             editorRef.current.getInstance().setMarkdown(contentToSet);
//           }
//         }, 300);
//       } else {
//         setError("문의 정보를 불러오는 중 오류가 발생했습니다.");
//       }
//     } catch (error) {
//       console.error("QnA 정보 불러오기 오류:", error);

//       if (error.response) {
//         console.error("에러 응답:", error.response);
//         console.error("상태 코드:", error.response.status);

//         if (error.response.status === 403) {
//           setError(
//             "이 문의에 접근할 권한이 없습니다. 본인이 작성한 문의만 수정할 수 있습니다."
//           );
//         } else if (error.response.status === 401) {
//           setError("인증이 만료되었습니다. 다시 로그인해주세요.");
//         } else {
//           setError(
//             error.response.data?.message ||
//               "문의 정보를 불러오는 중 오류가 발생했습니다."
//           );
//         }
//       } else if (error.request) {
//         setError("서버에서 응답이 없습니다. 네트워크 연결을 확인해주세요.");
//       } else {
//         setError(
//           error.message || "문의 정보를 불러오는 중 오류가 발생했습니다."
//         );
//       }
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // 부모 카테고리 변경 핸들러
//   const handleParentCategoryChange = (value) => {
//     setParentCategory(value);

//     // 선택된 부모 카테고리의 첫 번째 자식 카테고리로 기본값 설정
//     const parent = categories.find((p) => p.parentIdx.toString() === value);
//     if (parent && parent.childCategory && parent.childCategory.length > 0) {
//       setCategory(parent.childCategory[0].categoryIdx.toString());
//     } else {
//       setCategory("");
//     }
//   };

//   // 현재 선택된 부모 카테고리의 자식 카테고리 목록 가져오기
//   const getChildCategories = () => {
//     if (!parentCategory) return [];
//     const parent = categories.find(
//       (p) => p.parentIdx.toString() === parentCategory
//     );
//     return parent ? parent.childCategory : [];
//   };

//   // 폼 제출 처리
//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     // 유효성 검사
//     if (!title.trim()) {
//       setError("제목을 입력해주세요.");
//       return;
//     }

//     // Toast UI 에디터 내용 가져오기
//     let editorContent = "";
//     if (editorRef.current) {
//       editorContent = editorRef.current.getInstance().getMarkdown();
//       console.log("에디터에서 가져온 내용:", editorContent);
//     }

//     if (!editorContent || !editorContent.trim()) {
//       setError("내용을 입력해주세요.");
//       return;
//     }

//     if (!category) {
//       setError("카테고리를 선택해주세요.");
//       return;
//     }

//     // 제출 상태 변경
//     setIsSubmitting(true);
//     setError("");

//     try {
//       // API 요청 데이터
//       const requestData = {
//         qnaIdx: parseInt(qnaIdx, 10),
//         title,
//         content: editorContent, // 서버 API가 'content' 필드를 예상함
//         category: parseInt(category, 10),
//       };

//       console.log("전송 데이터:", requestData);

//       // API 호출
//       const response = await axiosInstance.patch(
//         "/qna/auth/modify",
//         requestData,
//         {
//           headers: {
//             Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
//           },
//         }
//       );

//       console.log("수정 응답:", response);

//       // 성공 시 상세 페이지로 이동
//       if (response.status === 200) {
//         alert("문의가 수정되었습니다.");
//         navigate(`/qna/detail/${qnaIdx}`);
//       } else {
//         setError("문의 수정 중 오류가 발생했습니다.");
//       }
//     } catch (error) {
//       console.error("QnA 수정 오류:", error);

//       // 요청 및 응답 정보 상세 로깅
//       if (error.response) {
//         console.error("에러 상태:", error.response.status);
//         console.error("에러 데이터:", error.response.data);
//         console.error("에러 헤더:", error.response.headers);
//       }

//       setError(
//         error.response?.data?.message || "문의 수정 중 오류가 발생했습니다."
//       );
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   // 폼 초기화 (원래 데이터로 되돌리기)
//   const handleReset = () => {
//     if (originalData) {
//       setTitle(originalData.title || "");

//       // 카테고리 초기화
//       const childCategoryId = originalData.category;
//       setCategory(String(childCategoryId) || "");

//       // 부모 카테고리 찾기
//       if (categories.length > 0 && childCategoryId) {
//         for (const parent of categories) {
//           const childCategory = parent.childCategory.find(
//             (child) => child.categoryIdx === childCategoryId
//           );

//           if (childCategory) {
//             setParentCategory(String(parent.parentIdx));
//             break;
//           }
//         }
//       }

//       // 에디터 내용 초기화
//       setTimeout(() => {
//         if (editorRef.current) {
//           // body 또는 content 필드 확인
//           const contentToSet = originalData.body || originalData.content || "";
//           editorRef.current.getInstance().setMarkdown(contentToSet);
//         }
//       }, 100);
//     }
//     setError("");
//   };

//   // 컴포넌트 마운트 시 상세 정보 불러오기
//   useEffect(() => {
//     fetchCategories();

//     if (qnaIdx) {
//       fetchQnADetail();
//     } else {
//       setError("문의 ID가 없습니다.");
//       setIsLoading(false);
//     }
//   }, [qnaIdx]);

//   // 카테고리 로드 후 QnA 정보 다시 가져오기
//   useEffect(() => {
//     if (!categoryLoading && categories.length > 0 && originalData) {
//       // 부모 카테고리 찾기
//       const childCategoryId = originalData.category;

//       if (childCategoryId) {
//         for (const parent of categories) {
//           const childCategory = parent.childCategory.find(
//             (child) => child.categoryIdx === childCategoryId
//           );

//           if (childCategory) {
//             setParentCategory(String(parent.parentIdx));
//             setCategory(String(childCategoryId));
//             break;
//           }
//         }
//       }
//     }
//   }, [categoryLoading, categories, originalData]);

//   // 로그 출력용 - 에디터 내용 확인
//   const logEditorContent = () => {
//     if (editorRef.current) {
//       const content = editorRef.current.getInstance().getMarkdown();
//       console.log("현재 에디터 내용:", content);
//     }
//   };

//   return (
//     <div className="container mx-auto py-8 px-4">
//       <Card className="max-w-3xl mx-auto">
//         <CardHeader>
//           <div className="flex items-center mb-2">
//             <Button
//               variant="ghost"
//               size="sm"
//               onClick={() => navigate(`/qna/detail/${qnaIdx}`)}
//               className="mr-2"
//             >
//               <ArrowLeft className="h-4 w-4 mr-1" /> 돌아가기
//             </Button>
//           </div>
//           <CardTitle>1:1 문의 수정</CardTitle>
//           <CardDescription>
//             문의 내용을 수정한 후 저장 버튼을 클릭하세요.
//           </CardDescription>
//         </CardHeader>

//         {isLoading || categoryLoading ? (
//           <CardContent className="flex justify-center items-center py-12">
//             <RotateCcw className="h-8 w-8 animate-spin opacity-70" />
//             <span className="ml-2">데이터를 불러오는 중...</span>
//           </CardContent>
//         ) : (
//           <form onSubmit={handleSubmit}>
//             <CardContent className="space-y-6">
//               {/* 오류 메시지 */}
//               {error && (
//                 <Alert variant="destructive">
//                   <AlertCircle className="h-4 w-4" />
//                   <AlertTitle>오류</AlertTitle>
//                   <AlertDescription>{error}</AlertDescription>
//                 </Alert>
//               )}

//               {/* 카테고리 선택 - 부모 카테고리 먼저 선택 */}
//               <div className="space-y-2">
//                 <label htmlFor="parentCategory" className="text-sm font-medium">
//                   대분류
//                 </label>
//                 <Select
//                   value={parentCategory}
//                   onValueChange={handleParentCategoryChange}
//                 >
//                   <SelectTrigger id="parentCategory">
//                     <SelectValue placeholder="대분류를 선택해주세요" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-white border shadow-md">
//                     {categories.map((parent) => (
//                       <SelectItem
//                         key={parent.parentIdx}
//                         value={parent.parentIdx.toString()}
//                       >
//                         {parent.parentName}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* 하위 카테고리 선택 */}
//               <div className="space-y-2">
//                 <label htmlFor="category" className="text-sm font-medium">
//                   세부 카테고리
//                 </label>
//                 <Select
//                   value={category}
//                   onValueChange={setCategory}
//                   disabled={!parentCategory}
//                 >
//                   <SelectTrigger id="category">
//                     <SelectValue placeholder="세부 카테고리를 선택해주세요" />
//                   </SelectTrigger>
//                   <SelectContent className="bg-white border shadow-md">
//                     {getChildCategories().map((child) => (
//                       <SelectItem
//                         key={child.categoryIdx}
//                         value={child.categoryIdx.toString()}
//                       >
//                         {child.categoryName}
//                       </SelectItem>
//                     ))}
//                   </SelectContent>
//                 </Select>
//               </div>

//               {/* 제목 입력 */}
//               <div className="space-y-2">
//                 <label htmlFor="title" className="text-sm font-medium">
//                   제목
//                 </label>
//                 <Input
//                   id="title"
//                   value={title}
//                   onChange={(e) => setTitle(e.target.value)}
//                   placeholder="문의 제목을 입력해주세요"
//                   maxLength={100}
//                 />
//               </div>

//               {/* 내용 입력 - Toast UI Editor */}
//               <div className="space-y-2">
//                 <label htmlFor="content" className="text-sm font-medium">
//                   내용
//                 </label>
//                 <div className="border rounded-md">
//                   <Editor
//                     initialValue=""
//                     previewStyle="vertical"
//                     height="400px"
//                     initialEditType="markdown"
//                     useCommandShortcut={true}
//                     ref={editorRef}
//                     toolbarItems={[
//                       ["heading", "bold", "italic", "strike"],
//                       ["hr", "quote"],
//                       ["ul", "ol", "task", "indent", "outdent"],
//                       ["table", "image", "link"],
//                       ["code", "codeblock"],
//                     ]}
//                     placeholder="문의 내용을 자세히 작성해주세요. 이미지나 파일을 첨부할 수 있습니다."
//                     language="ko-KR"
//                     onChange={logEditorContent} // 디버깅용 - 변경 시 내용 로깅
//                   />
//                 </div>
//               </div>
//             </CardContent>

//             <CardFooter className="flex justify-between">
//               <div className="flex gap-2">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={handleReset}
//                   disabled={isSubmitting}
//                   className="flex items-center gap-1"
//                 >
//                   <RotateCcw className="h-4 w-4" /> 되돌리기
//                 </Button>
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => navigate(`/qna/detail/${qnaIdx}`)}
//                   disabled={isSubmitting}
//                 >
//                   취소
//                 </Button>
//               </div>

//               <Button
//                 type="submit"
//                 disabled={isSubmitting}
//                 className="flex items-center gap-1"
//               >
//                 <Save className="h-4 w-4" />
//                 {isSubmitting ? "저장 중..." : "저장하기"}
//               </Button>
//             </CardFooter>
//           </form>
//         )}
//       </Card>
//     </div>
//   );
// };

// export default QnAEdit;

import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
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
import { AlertCircle, ArrowLeft, Save, RotateCcw } from "lucide-react";

// React-Quill 임포트
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const QnAEdit = () => {
  // URL 파라미터에서 QnA ID 가져오기
  const { qnaIdx } = useParams();
  const navigate = useNavigate();

  // 상태 관리
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // 에디터 내용을 state로 관리
  const [category, setCategory] = useState("");
  const [parentCategory, setParentCategory] = useState("");
  const [categories, setCategories] = useState([]);
  const [categoryLoading, setCategoryLoading] = useState(true);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [originalData, setOriginalData] = useState(null);

  // React-Quill 설정
  const quillModules = {
    toolbar: [
      [{ header: [1, 2, 3, false] }],
      ["bold", "italic", "underline", "strike"],
      [{ list: "ordered" }, { list: "bullet" }],
      [{ indent: "-1" }, { indent: "+1" }],
      ["link", "image"],
      ["blockquote", "code-block"],
      [{ align: [] }],
      ["clean"],
    ],
  };

  const quillFormats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "bullet",
    "indent",
    "link",
    "image",
    "blockquote",
    "code-block",
    "align",
  ];

  // 카테고리 데이터 가져오기
  const fetchCategories = async () => {
    setCategoryLoading(true);
    try {
      const response = await axiosInstance.get("/categories/qna");
      if (response.status === 200) {
        setCategories(response.data);
      }
    } catch (error) {
      console.error("카테고리 로딩 오류:", error);
      setError("카테고리를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setCategoryLoading(false);
    }
  };

  // QnA 상세 정보 불러오기
  const fetchQnADetail = async () => {
    setIsLoading(true);
    setError("");

    try {
      console.log("QnA 상세 정보 요청 시작. qnaIdx:", qnaIdx);

      const response = await axiosInstance.get(`/qna/auth/${qnaIdx}`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
        },
      });

      console.log("API 응답:", response);

      if (response.status === 200) {
        // 응답 데이터 처리
        const data = response.data.message || response.data;
        console.log("응답 데이터:", data);

        // 상태 설정
        setTitle(data.title || "");
        setOriginalData(data);

        // 에디터 내용 설정 - React-Quill은 즉시 설정 가능하지만
        // 혹시 타이밍 이슈가 있다면 약간의 지연을 둘 수 있음
        const contentToSet = data.body || data.content || "";
        console.log("에디터에 설정할 내용:", contentToSet);

        // 일반적으로는 바로 설정해도 됨
        setContent(contentToSet);

        // 만약 문제가 생긴다면 이렇게 사용 가능:
        // setTimeout(() => {
        //   setContent(contentToSet);
        // }, 100);

        // 카테고리 설정 (부모와 자식)
        const childCategoryId = data.category;
        setCategory(String(childCategoryId) || "");

        // 부모 카테고리 찾기
        if (categories.length > 0 && childCategoryId) {
          for (const parent of categories) {
            const childCategory = parent.childCategory.find(
              (child) => child.categoryIdx === childCategoryId
            );

            if (childCategory) {
              setParentCategory(String(parent.parentIdx));
              break;
            }
          }
        }
      } else {
        setError("문의 정보를 불러오는 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("QnA 정보 불러오기 오류:", error);

      if (error.response) {
        console.error("에러 응답:", error.response);
        console.error("상태 코드:", error.response.status);

        if (error.response.status === 403) {
          setError(
            "이 문의에 접근할 권한이 없습니다. 본인이 작성한 문의만 수정할 수 있습니다."
          );
        } else if (error.response.status === 401) {
          setError("인증이 만료되었습니다. 다시 로그인해주세요.");
        } else {
          setError(
            error.response.data?.message ||
              "문의 정보를 불러오는 중 오류가 발생했습니다."
          );
        }
      } else if (error.request) {
        setError("서버에서 응답이 없습니다. 네트워크 연결을 확인해주세요.");
      } else {
        setError(
          error.message || "문의 정보를 불러오는 중 오류가 발생했습니다."
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // 부모 카테고리 변경 핸들러
  const handleParentCategoryChange = (value) => {
    setParentCategory(value);

    // 선택된 부모 카테고리의 첫 번째 자식 카테고리로 기본값 설정
    const parent = categories.find((p) => p.parentIdx.toString() === value);
    if (parent && parent.childCategory && parent.childCategory.length > 0) {
      setCategory(parent.childCategory[0].categoryIdx.toString());
    } else {
      setCategory("");
    }
  };

  // 현재 선택된 부모 카테고리의 자식 카테고리 목록 가져오기
  const getChildCategories = () => {
    if (!parentCategory) return [];
    const parent = categories.find(
      (p) => p.parentIdx.toString() === parentCategory
    );
    return parent ? parent.childCategory : [];
  };

  // 에디터 내용 변경 핸들러
  const handleContentChange = (value) => {
    setContent(value);
    console.log("에디터 내용 변경:", value);
  };

  // 폼 제출 처리
  const handleSubmit = async (e) => {
    e.preventDefault();

    // 유효성 검사
    if (!title.trim()) {
      setError("제목을 입력해주세요.");
      return;
    }

    // React-Quill 내용 가져오기 (HTML 형태)
    const editorContent = content;
    console.log("에디터에서 가져온 내용:", editorContent);

    // 빈 내용 체크 (HTML 태그 제거 후 확인)
    const textContent = editorContent.replace(/<[^>]*>/g, "").trim();
    if (!textContent) {
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
        qnaIdx: parseInt(qnaIdx, 10),
        title,
        content: editorContent, // HTML 형태로 전송
        category: parseInt(category, 10),
      };

      console.log("전송 데이터:", requestData);

      // API 호출
      const response = await axiosInstance.patch(
        "/qna/auth/modify",
        requestData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("accessToken")}`,
          },
        }
      );

      console.log("수정 응답:", response);

      // 성공 시 상세 페이지로 이동
      if (response.status === 200) {
        alert("문의가 수정되었습니다.");
        navigate(`/qna/detail/${qnaIdx}`);
      } else {
        setError("문의 수정 중 오류가 발생했습니다.");
      }
    } catch (error) {
      console.error("QnA 수정 오류:", error);

      // 요청 및 응답 정보 상세 로깅
      if (error.response) {
        console.error("에러 상태:", error.response.status);
        console.error("에러 데이터:", error.response.data);
        console.error("에러 헤더:", error.response.headers);
      }

      setError(
        error.response?.data?.message || "문의 수정 중 오류가 발생했습니다."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // 폼 초기화 (원래 데이터로 되돌리기)
  const handleReset = () => {
    if (originalData) {
      setTitle(originalData.title || "");

      // 카테고리 초기화
      const childCategoryId = originalData.category;
      setCategory(String(childCategoryId) || "");

      // 부모 카테고리 찾기
      if (categories.length > 0 && childCategoryId) {
        for (const parent of categories) {
          const childCategory = parent.childCategory.find(
            (child) => child.categoryIdx === childCategoryId
          );

          if (childCategory) {
            setParentCategory(String(parent.parentIdx));
            break;
          }
        }
      }

      // 에디터 내용 초기화
      const contentToReset = originalData.body || originalData.content || "";
      setContent(contentToReset);
    }
    setError("");
  };

  // 컴포넌트 마운트 시 상세 정보 불러오기
  useEffect(() => {
    fetchCategories();

    if (qnaIdx) {
      fetchQnADetail();
    } else {
      setError("문의 ID가 없습니다.");
      setIsLoading(false);
    }
  }, [qnaIdx]);

  // 카테고리 로드 후 QnA 정보 다시 가져오기
  useEffect(() => {
    if (!categoryLoading && categories.length > 0 && originalData) {
      // 부모 카테고리 찾기
      const childCategoryId = originalData.category;

      if (childCategoryId) {
        for (const parent of categories) {
          const childCategory = parent.childCategory.find(
            (child) => child.categoryIdx === childCategoryId
          );

          if (childCategory) {
            setParentCategory(String(parent.parentIdx));
            setCategory(String(childCategoryId));
            break;
          }
        }
      }
    }
  }, [categoryLoading, categories, originalData]);

  return (
    <div className="container mx-auto py-8 px-4">
      <Card className="max-w-3xl mx-auto">
        <CardHeader>
          <div className="flex items-center mb-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate(`/qna/detail/${qnaIdx}`)}
              className="mr-2"
            >
              <ArrowLeft className="h-4 w-4 mr-1" /> 돌아가기
            </Button>
          </div>
          <CardTitle>1:1 문의 수정</CardTitle>
          <CardDescription>
            문의 내용을 수정한 후 저장 버튼을 클릭하세요.
          </CardDescription>
        </CardHeader>

        {isLoading || categoryLoading ? (
          <CardContent className="flex justify-center items-center py-12">
            <RotateCcw className="h-8 w-8 animate-spin opacity-70" />
            <span className="ml-2">데이터를 불러오는 중...</span>
          </CardContent>
        ) : (
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
                  disabled={!parentCategory}
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

              {/* 내용 입력 - React-Quill */}
              <div className="space-y-2">
                <label htmlFor="content" className="text-sm font-medium">
                  내용
                </label>
                <div className="border rounded-md">
                  <ReactQuill
                    value={content}
                    onChange={handleContentChange}
                    modules={quillModules}
                    formats={quillFormats}
                    placeholder="문의 내용을 자세히 작성해주세요. 이미지나 파일을 첨부할 수 있습니다."
                    style={{
                      height: "300px",
                      marginBottom: "42px", // 툴바 공간 확보
                    }}
                  />
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex justify-between">
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleReset}
                  disabled={isSubmitting}
                  className="flex items-center gap-1"
                >
                  <RotateCcw className="h-4 w-4" /> 되돌리기
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/qna/detail/${qnaIdx}`)}
                  disabled={isSubmitting}
                >
                  취소
                </Button>
              </div>

              <Button
                type="submit"
                disabled={isSubmitting}
                className="flex items-center gap-1"
              >
                <Save className="h-4 w-4" />
                {isSubmitting ? "저장 중..." : "저장하기"}
              </Button>
            </CardFooter>
          </form>
        )}
      </Card>
    </div>
  );
};

export default QnAEdit;
