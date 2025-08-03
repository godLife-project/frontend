// import React, { useState, useRef, useEffect } from "react";
// import { useNavigate, useParams } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { useToast } from "@/components/ui/use-toast";
// import { Loader2, ArrowLeft, Calendar } from "lucide-react";
// import { Switch } from "@/components/ui/switch";
// import {
//   Popover,
//   PopoverContent,
//   PopoverTrigger,
// } from "@/components/ui/popover";
// import { Calendar as CalendarComponent } from "@/components/ui/calendar";
// import { format } from "date-fns/format";
// import { ko } from "date-fns/locale";
// import { cn } from "@/lib/utils";
// import axiosInstance from "@/api/axiosInstance";

// // Toast UI Editor 불러오기
// import { Editor } from "@toast-ui/react-editor";
// import "@toast-ui/editor/dist/toastui-editor.css";

// const NoticeCreateEdit = () => {
//   const { noticeIdx } = useParams(); // URL에서 공지사항 ID를 가져옴 (있으면 수정 모드)
//   const isEditMode = !!noticeIdx; // ID가 있으면 수정 모드, 없으면 생성 모드

//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const [title, setTitle] = useState("");
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isLoading, setIsLoading] = useState(isEditMode); // 수정 모드일 경우 초기 로딩 상태
//   const editorRef = useRef(null);
//   const [userIdx, setUserIdx] = useState(null);
//   const [originalNotice, setOriginalNotice] = useState(null);

//   // 팝업 관련 상태 추가
//   const [isPopup, setIsPopup] = useState(false);
//   const [popupStartDate, setPopupStartDate] = useState(null);
//   const [popupEndDate, setPopupEndDate] = useState(null);

//   // 사용자 정보 가져오기
//   useEffect(() => {
//     const getUserInfo = () => {
//       const user = JSON.parse(localStorage.getItem("user") || "{}");
//       setUserIdx(user.userIdx || 1); // 기본값 1 또는 실제 사용자 ID
//     };

//     getUserInfo();
//   }, []);

//   const [startDatePopoverOpen, setStartDatePopoverOpen] = useState(false);
//   const [endDatePopoverOpen, setEndDatePopoverOpen] = useState(false);

//   // 에디터가 초기화된 후와 원본 데이터가 로드된 후에 내용 설정
//   useEffect(() => {
//     if (!isLoading && originalNotice && editorRef.current) {
//       setTimeout(() => {
//         const editorInstance = editorRef.current.getInstance();
//         editorInstance.setMarkdown(originalNotice.noticeSub || "");
//       }, 100); // 약간의 지연을 주어 에디터가 완전히 마운트된 후 실행
//     }
//   }, [isLoading, originalNotice]);

//   useEffect(() => {
//     if (isEditMode) {
//       const fetchNoticeForEdit = async () => {
//         try {
//           // 실제 API 호출 코드
//           const response = await axiosInstance.get(`/notice/${noticeIdx}`);
//           console.log("원본 API 응답:", response.data);

//           // API 응답 구조에 맞게 데이터 처리
//           let noticeData;
//           if (response.data && response.data.message) {
//             // response.data가 { code: 200, message: {...}, status: 'success' } 형태인 경우
//             noticeData = response.data.message;
//           } else {
//             // 기존 방식 (response.data가 직접 공지사항 데이터인 경우)
//             noticeData = response.data;
//           }

//           console.log("수정할 공지사항 데이터:", noticeData);

//           // 데이터 설정
//           setTitle(noticeData.noticeTitle || "");
//           setOriginalNotice(noticeData);

//           // 팝업 관련 데이터 설정
//           setIsPopup(noticeData.isPopup === "Y");

//           if (noticeData.popupStartDate) {
//             setPopupStartDate(new Date(noticeData.popupStartDate));
//           }

//           if (noticeData.popupEndDate) {
//             setPopupEndDate(new Date(noticeData.popupEndDate));
//           }

//           setIsLoading(false);
//         } catch (error) {
//           console.error("공지사항 데이터 로딩 실패:", error);
//           toast({
//             title: "공지사항 불러오기에 실패했습니다",
//             description:
//               error.response?.data?.message || "서버 오류가 발생했습니다",
//             variant: "destructive",
//           });
//           setIsLoading(false);
//           // 오류 발생시 목록으로 돌아가기
//           navigate("/notice/list");
//         }
//       };

//       fetchNoticeForEdit();
//     }
//   }, [isEditMode, noticeIdx, navigate, toast]);

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!title.trim()) {
//       toast({
//         title: "제목을 입력해주세요",
//         variant: "destructive",
//       });
//       return;
//     }

//     // 에디터 내용 가져오기
//     const editorContent = editorRef.current?.getInstance().getMarkdown();

//     if (!editorContent || editorContent.trim() === "") {
//       toast({
//         title: "내용을 입력해주세요",
//         variant: "destructive",
//       });
//       return;
//     }

//     // 팝업 일자 유효성 검사
//     if (isPopup) {
//       if (!popupStartDate || !popupEndDate) {
//         toast({
//           title: "팝업 시작일과 종료일을 모두 입력해주세요",
//           variant: "destructive",
//         });
//         return;
//       }

//       if (popupEndDate < popupStartDate) {
//         toast({
//           title: "팝업 종료일은 시작일보다 이후여야 합니다",
//           variant: "destructive",
//         });
//         return;
//       }
//     }

//     setIsSubmitting(true);

//     try {
//       const token = localStorage.getItem("accessToken");

//       // 요청 데이터 준비
//       const noticeData = {
//         noticeTitle: title,
//         noticeSub: editorContent,
//         isPopup: isPopup ? "Y" : "N",
//         popupStartDate:
//           isPopup && popupStartDate
//             ? format(popupStartDate, "yyyy-MM-dd")
//             : null,
//         popupEndDate:
//           isPopup && popupEndDate ? format(popupEndDate, "yyyy-MM-dd") : null,
//       };

//       console.log("전송할 데이터:", noticeData);

//       if (isEditMode) {
//         // 수정 API 호출 코드
//         const url = `/notice/admin/${noticeIdx}`;
//         await axiosInstance.patch(url, noticeData, {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         toast({
//           title: "공지사항이 성공적으로 수정되었습니다",
//           variant: "default",
//         });
//       } else {
//         // 생성 API 호출 코드
//         const url = "/notice/admin/create";
//         await axiosInstance.post(url, noticeData, {
//           headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${token}`,
//           },
//         });

//         toast({
//           title: "공지사항이 성공적으로 등록되었습니다",
//           variant: "default",
//         });
//       }

//       // 성공 후 공지사항 목록 페이지로 이동
//       navigate("/notice/list");
//     } catch (error) {
//       console.error(`공지사항 ${isEditMode ? "수정" : "등록"} 실패:`, error);
//       toast({
//         title: `공지사항 ${isEditMode ? "수정" : "등록"}에 실패했습니다`,
//         description:
//           error.response?.data?.message || "서버 오류가 발생했습니다",
//         variant: "destructive",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const handleCancel = () => {
//     navigate(-1);
//   };

//   // 시작일 날짜 선택 핸들러
//   const handleStartDateSelect = (date) => {
//     setPopupStartDate(date);
//     setStartDatePopoverOpen(false); // 시작일 Popover 닫기
//   };

//   // 종료일 날짜 선택 핸들러
//   const handleDateSelect = (date) => {
//     setPopupEndDate(date);
//     setEndDatePopoverOpen(false); // 종료일 Popover 닫기
//   };

//   if (isLoading) {
//     return (
//       <div className="container mx-auto py-8">
//         <div className="flex justify-center items-center h-60">
//           <div className="flex flex-col items-center gap-2">
//             <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent"></div>
//             <p className="text-muted-foreground">공지사항을 불러오는 중...</p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto py-8">
//       <Button variant="ghost" className="mb-6 pl-2" onClick={handleCancel}>
//         <ArrowLeft className="mr-2 h-4 w-4" />
//         뒤로 가기
//       </Button>

//       <Card className="w-full">
//         <CardHeader>
//           <CardTitle className="text-2xl font-bold">
//             공지사항 {isEditMode ? "수정" : "작성"}
//           </CardTitle>
//         </CardHeader>
//         <CardContent>
//           <form onSubmit={handleSubmit} className="space-y-6">
//             <div className="space-y-2">
//               <label htmlFor="title" className="text-sm font-medium">
//                 제목
//               </label>
//               <Input
//                 id="title"
//                 value={title}
//                 onChange={(e) => setTitle(e.target.value)}
//                 placeholder="공지사항 제목을 입력하세요"
//                 className="w-full"
//               />
//             </div>

//             <div className="space-y-2">
//               <label className="text-sm font-medium">내용</label>
//               <div className="min-h-[400px] border rounded-md">
//                 <Editor
//                   ref={editorRef}
//                   initialValue=""
//                   previewStyle="vertical"
//                   height="400px"
//                   initialEditType="wysiwyg"
//                   useCommandShortcut={true}
//                   language="ko-KR"
//                   onLoad={() => {
//                     // 에디터 로드 완료 시
//                     if (isEditMode && originalNotice) {
//                       // 수정 모드이고 데이터가 있으면 내용 설정
//                       setTimeout(() => {
//                         const editorInstance = editorRef.current.getInstance();
//                         editorInstance.setMarkdown(
//                           originalNotice.noticeSub || ""
//                         );
//                       }, 100);
//                     }
//                   }}
//                 />
//               </div>
//             </div>

//             {/* 팝업 관련 설정 추가 */}
//             <div className="space-y-4 border rounded-md p-4 bg-slate-50">
//               <div className="flex items-center justify-between">
//                 <div className="space-y-0.5">
//                   <label className="text-sm font-medium">팝업으로 표시</label>
//                   <p className="text-sm text-muted-foreground">
//                     이 공지사항을 팝업창으로 표시합니다
//                   </p>
//                 </div>
//                 <Switch
//                   checked={isPopup}
//                   onCheckedChange={setIsPopup}
//                   aria-label="팝업 표시 여부"
//                 />
//               </div>

//               {isPopup && (
//                 <div className="pt-3 space-y-4">
//                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//                     <div className="space-y-2">
//                       <label className="text-sm font-medium">팝업 시작일</label>
//                       <Popover
//                         open={startDatePopoverOpen}
//                         onOpenChange={setStartDatePopoverOpen}
//                       >
//                         <PopoverTrigger asChild>
//                           <Button
//                             variant={"outline"}
//                             className={cn(
//                               "w-full justify-start text-left font-normal",
//                               !popupStartDate && "text-muted-foreground"
//                             )}
//                           >
//                             <Calendar className="mr-2 h-4 w-4" />
//                             {popupStartDate ? (
//                               format(popupStartDate, "yyyy년 MM월 dd일", {
//                                 locale: ko,
//                               })
//                             ) : (
//                               <span>날짜 선택</span>
//                             )}
//                           </Button>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-auto p-0" align="start">
//                           <div className="bg-white rounded-md shadow-md border">
//                             <CalendarComponent
//                               mode="single"
//                               selected={popupStartDate}
//                               onSelect={handleStartDateSelect}
//                               initialFocus
//                               className="bg-white"
//                             />
//                           </div>
//                         </PopoverContent>
//                       </Popover>
//                     </div>

//                     <div className="space-y-2">
//                       <label className="text-sm font-medium">팝업 종료일</label>
//                       <Popover
//                         open={endDatePopoverOpen}
//                         onOpenChange={setEndDatePopoverOpen}
//                       >
//                         <PopoverTrigger asChild>
//                           <Button
//                             variant={"outline"}
//                             className={cn(
//                               "w-full justify-start text-left font-normal",
//                               !popupEndDate && "text-muted-foreground"
//                             )}
//                           >
//                             <Calendar className="mr-2 h-4 w-4" />
//                             {popupEndDate ? (
//                               format(popupEndDate, "yyyy년 MM월 dd일", {
//                                 locale: ko,
//                               })
//                             ) : (
//                               <span>날짜 선택</span>
//                             )}
//                           </Button>
//                         </PopoverTrigger>
//                         <PopoverContent className="w-auto p-0" align="start">
//                           <div className="bg-white rounded-md shadow-md border">
//                             <CalendarComponent
//                               mode="single"
//                               selected={popupEndDate}
//                               onSelect={handleDateSelect}
//                               initialFocus
//                               className="bg-white"
//                               disabled={(date) =>
//                                 popupStartDate ? date < popupStartDate : false
//                               }
//                             />
//                           </div>
//                         </PopoverContent>
//                       </Popover>
//                     </div>
//                   </div>

//                   <p className="text-xs text-muted-foreground">
//                     설정된 기간 동안 사용자에게 공지사항 팝업이 표시됩니다.
//                   </p>
//                 </div>
//               )}
//             </div>

//             <div className="flex justify-end space-x-4">
//               <Button
//                 type="button"
//                 variant="outline"
//                 onClick={handleCancel}
//                 disabled={isSubmitting}
//               >
//                 취소
//               </Button>
//               <Button type="submit" disabled={isSubmitting}>
//                 {isSubmitting ? (
//                   <>
//                     <Loader2 className="mr-2 h-4 w-4 animate-spin" />
//                     {isEditMode ? "수정 중..." : "등록 중..."}
//                   </>
//                 ) : isEditMode ? (
//                   "수정하기"
//                 ) : (
//                   "등록하기"
//                 )}
//               </Button>
//             </div>
//           </form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// };

// export default NoticeCreateEdit;
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Loader2, ArrowLeft, Calendar } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns/format";
import { ko } from "date-fns/locale";
import { cn } from "@/lib/utils";
import axiosInstance from "@/api/axiosInstance";

// React-Quill 임포트
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";

const NoticeCreateEdit = () => {
  const { noticeIdx } = useParams(); // URL에서 공지사항 ID를 가져옴 (있으면 수정 모드)
  const isEditMode = !!noticeIdx; // ID가 있으면 수정 모드, 없으면 생성 모드

  const navigate = useNavigate();
  const { toast } = useToast();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState(""); // 에디터 내용을 state로 관리
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(isEditMode); // 수정 모드일 경우 초기 로딩 상태
  const [userIdx, setUserIdx] = useState(null);
  const [originalNotice, setOriginalNotice] = useState(null);

  // 팝업 관련 상태 추가
  const [isPopup, setIsPopup] = useState(false);
  const [popupStartDate, setPopupStartDate] = useState(null);
  const [popupEndDate, setPopupEndDate] = useState(null);

  const [startDatePopoverOpen, setStartDatePopoverOpen] = useState(false);
  const [endDatePopoverOpen, setEndDatePopoverOpen] = useState(false);

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
      [{ color: [] }, { background: [] }],
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
    "color",
    "background",
  ];

  // 사용자 정보 가져오기
  useEffect(() => {
    const getUserInfo = () => {
      const user = JSON.parse(localStorage.getItem("user") || "{}");
      setUserIdx(user.userIdx || 1); // 기본값 1 또는 실제 사용자 ID
    };

    getUserInfo();
  }, []);

  // 수정 모드일 때 기존 공지사항 데이터 로드
  useEffect(() => {
    if (isEditMode) {
      const fetchNoticeForEdit = async () => {
        try {
          // 실제 API 호출 코드
          const response = await axiosInstance.get(`/notice/${noticeIdx}`);
          console.log("원본 API 응답:", response.data);

          // API 응답 구조에 맞게 데이터 처리
          let noticeData;
          if (response.data && response.data.message) {
            // response.data가 { code: 200, message: {...}, status: 'success' } 형태인 경우
            noticeData = response.data.message;
          } else {
            // 기존 방식 (response.data가 직접 공지사항 데이터인 경우)
            noticeData = response.data;
          }

          console.log("수정할 공지사항 데이터:", noticeData);

          // 데이터 설정
          setTitle(noticeData.noticeTitle || "");
          setContent(noticeData.noticeSub || ""); // 에디터 내용 설정
          setOriginalNotice(noticeData);

          // 팝업 관련 데이터 설정
          setIsPopup(noticeData.isPopup === "Y");

          if (noticeData.popupStartDate) {
            setPopupStartDate(new Date(noticeData.popupStartDate));
          }

          if (noticeData.popupEndDate) {
            setPopupEndDate(new Date(noticeData.popupEndDate));
          }

          setIsLoading(false);
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
          navigate("/notice/list");
        }
      };

      fetchNoticeForEdit();
    }
  }, [isEditMode, noticeIdx, navigate, toast]);

  // 에디터 내용 변경 핸들러
  const handleContentChange = (value) => {
    setContent(value);
    console.log("에디터 내용 변경:", value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!title.trim()) {
      toast({
        title: "제목을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    // React-Quill 내용 가져오기 (HTML 형태)
    const editorContent = content;
    console.log("에디터에서 가져온 내용:", editorContent);

    // 빈 내용 체크 (HTML 태그 제거 후 확인)
    const textContent = editorContent.replace(/<[^>]*>/g, "").trim();
    if (!textContent) {
      toast({
        title: "내용을 입력해주세요",
        variant: "destructive",
      });
      return;
    }

    // 팝업 일자 유효성 검사
    if (isPopup) {
      if (!popupStartDate || !popupEndDate) {
        toast({
          title: "팝업 시작일과 종료일을 모두 입력해주세요",
          variant: "destructive",
        });
        return;
      }

      if (popupEndDate < popupStartDate) {
        toast({
          title: "팝업 종료일은 시작일보다 이후여야 합니다",
          variant: "destructive",
        });
        return;
      }
    }

    setIsSubmitting(true);

    try {
      const token = localStorage.getItem("accessToken");

      // 요청 데이터 준비
      const noticeData = {
        noticeTitle: title,
        noticeSub: editorContent, // HTML 형태로 전송
        isPopup: isPopup ? "Y" : "N",
        popupStartDate:
          isPopup && popupStartDate
            ? format(popupStartDate, "yyyy-MM-dd")
            : null,
        popupEndDate:
          isPopup && popupEndDate ? format(popupEndDate, "yyyy-MM-dd") : null,
      };

      console.log("전송할 데이터:", noticeData);

      if (isEditMode) {
        // 수정 API 호출 코드
        const url = `/notice/admin/${noticeIdx}`;
        await axiosInstance.patch(url, noticeData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

        toast({
          title: "공지사항이 성공적으로 수정되었습니다",
          variant: "default",
        });
      } else {
        // 생성 API 호출 코드
        const url = "/notice/admin/create";
        await axiosInstance.post(url, noticeData, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        });

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

  // 시작일 날짜 선택 핸들러
  const handleStartDateSelect = (date) => {
    setPopupStartDate(date);
    setStartDatePopoverOpen(false); // 시작일 Popover 닫기
  };

  // 종료일 날짜 선택 핸들러
  const handleDateSelect = (date) => {
    setPopupEndDate(date);
    setEndDatePopoverOpen(false); // 종료일 Popover 닫기
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
                <ReactQuill
                  value={content}
                  onChange={handleContentChange}
                  modules={quillModules}
                  formats={quillFormats}
                  placeholder="공지사항 내용을 입력하세요"
                  style={{
                    height: "400px",
                    marginBottom: "42px", // 툴바 공간 확보
                  }}
                />
              </div>
            </div>

            {/* 팝업 관련 설정 추가 */}
            <div className="space-y-4 border rounded-md p-4 bg-slate-50">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">팝업으로 표시</label>
                  <p className="text-sm text-muted-foreground">
                    이 공지사항을 팝업창으로 표시합니다
                  </p>
                </div>
                <Switch
                  checked={isPopup}
                  onCheckedChange={setIsPopup}
                  aria-label="팝업 표시 여부"
                />
              </div>

              {isPopup && (
                <div className="pt-3 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">팝업 시작일</label>
                      <Popover
                        open={startDatePopoverOpen}
                        onOpenChange={setStartDatePopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !popupStartDate && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {popupStartDate ? (
                              format(popupStartDate, "yyyy년 MM월 dd일", {
                                locale: ko,
                              })
                            ) : (
                              <span>날짜 선택</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="bg-white rounded-md shadow-md border">
                            <CalendarComponent
                              mode="single"
                              selected={popupStartDate}
                              onSelect={handleStartDateSelect}
                              initialFocus
                              className="bg-white"
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">팝업 종료일</label>
                      <Popover
                        open={endDatePopoverOpen}
                        onOpenChange={setEndDatePopoverOpen}
                      >
                        <PopoverTrigger asChild>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !popupEndDate && "text-muted-foreground"
                            )}
                          >
                            <Calendar className="mr-2 h-4 w-4" />
                            {popupEndDate ? (
                              format(popupEndDate, "yyyy년 MM월 dd일", {
                                locale: ko,
                              })
                            ) : (
                              <span>날짜 선택</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0" align="start">
                          <div className="bg-white rounded-md shadow-md border">
                            <CalendarComponent
                              mode="single"
                              selected={popupEndDate}
                              onSelect={handleDateSelect}
                              initialFocus
                              className="bg-white"
                              disabled={(date) =>
                                popupStartDate ? date < popupStartDate : false
                              }
                            />
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </div>

                  <p className="text-xs text-muted-foreground">
                    설정된 기간 동안 사용자에게 공지사항 팝업이 표시됩니다.
                  </p>
                </div>
              )}
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
