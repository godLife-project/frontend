// import { ArrowLeft } from "lucide-react";
// import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { Textarea } from "@/components/ui/textarea";
// import { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import * as z from "zod";
// import axiosInstance from "@/api/axiosInstance";
// import { useToast } from "@/components/ui/use-toast";
// import { useForm } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";
// import {
//   Form,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormControl,
//   FormMessage,
// } from "@/components/ui/form";

// const faqSchema = z.object({
//   faqTitle: z.string().min(1, "제목을 입력해주세요"),
//   faqAnswer: z.string().min(1, "답변을 입력해주세요"),
//   faqCategory: z.string().min(1, "카테고리를 선택해주세요"),
// });

// export default function FAQWritePage() {
//   const { toast } = useToast();
//   const navigate = useNavigate();
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [isLoading, setIsLoading] = useState(true);
//   const [categories, setCategories] = useState([]);

//   const form = useForm({
//     resolver: zodResolver(faqSchema),
//     defaultValues: {
//       faqTitle: "",
//       faqAnswer: "",
//       faqCategory: "",
//     },
//     mode: "onSubmit", // 폼 제출 시에만 유효성 검사 실행
//   });

//   // API에서 카테고리 목록 가져오기
//   useEffect(() => {
//     const fetchCategories = async () => {
//       try {
//         // 로그인 상태 확인 및 토큰 가져오기
//         const accessToken = localStorage.getItem("accessToken");

//         const response = await axiosInstance.get(
//           "/admin/compSystem/faqCategory",
//           {
//             headers: {
//               Authorization: `Bearer ${accessToken}`,
//               "Content-Type": "application/json",
//             },
//           }
//         );

//         console.log("API 응답 전체 데이터:", response.data);

//         // 응답 데이터 구조 확인 및 추출
//         let categoryData = [];
//         if (response.data && Array.isArray(response.data.faqCategory)) {
//           // API 응답이 { faqCategory: Array(2), code: 200, ... } 형태인 경우
//           categoryData = response.data.faqCategory;
//         } else if (
//           response.data &&
//           response.data.result === true &&
//           Array.isArray(response.data.data)
//         ) {
//           // API 응답이 {result: true, data: []} 형태인 경우
//           categoryData = response.data.data;
//         } else if (response.data && Array.isArray(response.data.message)) {
//           // API 응답이 {message: []} 형태인 경우
//           categoryData = response.data.message;
//         } else if (Array.isArray(response.data)) {
//           // API 응답이 바로 배열인 경우
//           categoryData = response.data;
//         }

//         // 카테고리 데이터가 있으면 사용
//         setCategories(categoryData);
//         console.log("카테고리 데이터:", categoryData);
//         setIsLoading(false);
//       } catch (err) {
//         console.error("카테고리 데이터를 가져오는 중 오류 발생:", err);

//         // 인증 오류(401, 403)이거나 토큰이 없는 경우 토스트 메시지를 표시하지 않음
//         const accessToken = localStorage.getItem("accessToken");
//         if (
//           accessToken &&
//           !(
//             err.response &&
//             (err.response.status === 401 || err.response.status === 403)
//           )
//         ) {
//           toast({
//             variant: "destructive",
//             title: "카테고리 로딩 실패",
//             description: "카테고리 정보를 불러오는 중 오류가 발생했습니다.",
//           });
//         }

//         setCategories([]);
//         setIsLoading(false);
//       }
//     };

//     fetchCategories();
//   }, [toast]);

//   // FAQ 작성 API 요청 함수
//   const onSubmit = async (data) => {
//     setIsSubmitting(true);
//     try {
//       // 로그인 상태 확인
//       const accessToken = localStorage.getItem("accessToken");
//       if (!accessToken) {
//         toast({
//           variant: "destructive",
//           title: "로그인이 필요합니다",
//           description: "FAQ 작성을 위해 로그인해주세요.",
//         });
//         navigate("/user/login");
//         return;
//       }

//       // data.faqCategory는 이미 실제 faqCategoryIdx 값임 (문자열 형태)
//       // 숫자로 변환하여 전송
//       const categoryIdx = parseInt(data.faqCategory, 10);

//       const submitData = {
//         faqTitle: data.faqTitle,
//         faqAnswer: data.faqAnswer,
//         faqCategory: categoryIdx,
//       };

//       console.log("등록할 FAQ 데이터:", submitData);

//       const response = await axiosInstance.post(
//         "/faq/admin/write",
//         submitData,
//         {
//           headers: { Authorization: `Bearer ${accessToken}` },
//         }
//       );

//       toast({
//         title: "FAQ가 등록되었습니다",
//         description: "FAQ 목록으로 이동합니다.",
//       });

//       navigate("/faq");
//     } catch (error) {
//       console.error("FAQ 등록 중 오류 발생:", error);
//       toast({
//         variant: "destructive",
//         title: "FAQ 등록 실패",
//         description: "잠시 후 다시 시도해주세요.",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   if (isLoading) {
//     return (
//       <div className="container mx-auto py-8 flex justify-center items-center">
//         <p>카테고리 데이터를 불러오는 중...</p>
//       </div>
//     );
//   }

//   // 카테고리 데이터가 없을 경우
//   if (categories.length === 0) {
//     return (
//       <div className="container mx-auto py-8">
//         <Button
//           variant="ghost"
//           className="mb-6 pl-2"
//           onClick={() => navigate(-1)}
//         >
//           <ArrowLeft className="mr-2 h-4 w-4" />
//           뒤로 가기
//         </Button>

//         <Card className="w-full">
//           <CardHeader>
//             <CardTitle className="text-2xl font-bold">FAQ 작성</CardTitle>
//           </CardHeader>
//           <CardContent>
//             <div className="flex flex-col items-center justify-center py-6">
//               <p className="text-center mb-4">
//                 카테고리 정보를 불러올 수 없습니다.
//               </p>
//               <Button onClick={() => window.location.reload()}>새로고침</Button>
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     );
//   }

//   return (
//     <div className="container mx-auto py-8">
//       <Button
//         variant="ghost"
//         className="mb-6 pl-2"
//         onClick={() => navigate(-1)}
//       >
//         <ArrowLeft className="mr-2 h-4 w-4" />
//         뒤로 가기
//       </Button>

//       <Card className="w-full">
//         <CardHeader>
//           <CardTitle className="text-2xl font-bold">FAQ 작성</CardTitle>
//         </CardHeader>
//         <CardContent>
//           <Form {...form}>
//             <form
//               onSubmit={form.handleSubmit(onSubmit, (errors) => {
//                 console.log("유효성 검사 실패:", errors);
//                 toast({
//                   variant: "destructive",
//                   title: "입력 오류",
//                   description: "모든 필수 항목을 올바르게 입력해주세요.",
//                 });
//               })}
//               className="space-y-6"
//             >
//               <FormField
//                 control={form.control}
//                 name="faqCategory"
//                 render={({ field }) => (
//                   <FormItem className="space-y-2">
//                     <FormLabel className="text-sm font-medium text-gray-900">
//                       카테고리
//                     </FormLabel>
//                     <Select onValueChange={field.onChange} defaultValue="">
//                       <FormControl>
//                         <SelectTrigger className="w-full">
//                           <SelectValue placeholder="카테고리를 선택하세요" />
//                         </SelectTrigger>
//                       </FormControl>
//                       <SelectContent className="bg-white">
//                         {categories.map((category) => (
//                           <SelectItem
//                             key={category.faqCategoryIdx}
//                             value={category.faqCategoryIdx.toString()}
//                           >
//                             {category.faqCategoryName}
//                           </SelectItem>
//                         ))}
//                       </SelectContent>
//                     </Select>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="faqTitle"
//                 render={({ field }) => (
//                   <FormItem className="space-y-2">
//                     <FormLabel className="text-sm font-medium text-gray-900">
//                       제목
//                     </FormLabel>
//                     <FormControl>
//                       <Input
//                         {...field}
//                         placeholder="FAQ 제목을 입력하세요"
//                         className="w-full"
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="faqAnswer"
//                 render={({ field }) => (
//                   <FormItem className="space-y-2">
//                     <FormLabel className="text-sm font-medium text-gray-900">
//                       답변
//                     </FormLabel>
//                     <FormControl>
//                       <Textarea
//                         {...field}
//                         placeholder="내용을 입력하세요"
//                         className="w-full"
//                       />
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//               <div className="flex justify-end space-x-4">
//                 <Button
//                   type="button"
//                   variant="outline"
//                   onClick={() => navigate(`/faq`)}
//                 >
//                   취소
//                 </Button>
//                 <Button type="submit" disabled={isSubmitting}>
//                   {isSubmitting ? "등록 중..." : "등록하기"}
//                 </Button>
//               </div>
//             </form>
//           </Form>
//         </CardContent>
//       </Card>
//     </div>
//   );
// }
import { ArrowLeft, Plus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import axiosInstance from "@/api/axiosInstance";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

const faqSchema = z.object({
  faqTitle: z.string().min(1, "제목을 입력해주세요"),
  faqAnswer: z.string().min(1, "답변을 입력해주세요"),
  faqCategory: z.string().min(1, "카테고리를 선택해주세요"),
});

export default function FAQWritePage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);

  // 카테고리 추가 관련 상태
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const form = useForm({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      faqTitle: "",
      faqAnswer: "",
      faqCategory: "",
    },
    mode: "onSubmit", // 폼 제출 시에만 유효성 검사 실행
  });

  // API에서 카테고리 목록 가져오기
  const fetchCategories = async () => {
    try {
      // 로그인 상태 확인 및 토큰 가져오기
      const accessToken = localStorage.getItem("accessToken");

      const response = await axiosInstance.get(
        "/admin/compSystem/faqCategory",
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("API 응답 전체 데이터:", response.data);

      // 응답 데이터 구조 확인 및 추출
      let categoryData = [];
      if (response.data && Array.isArray(response.data.faqCategory)) {
        // API 응답이 { faqCategory: Array(2), code: 200, ... } 형태인 경우
        categoryData = response.data.faqCategory;
      } else if (
        response.data &&
        response.data.result === true &&
        Array.isArray(response.data.data)
      ) {
        // API 응답이 {result: true, data: []} 형태인 경우
        categoryData = response.data.data;
      } else if (response.data && Array.isArray(response.data.message)) {
        // API 응답이 {message: []} 형태인 경우
        categoryData = response.data.message;
      } else if (Array.isArray(response.data)) {
        // API 응답이 바로 배열인 경우
        categoryData = response.data;
      }

      // 카테고리 데이터가 있으면 사용
      setCategories(categoryData);
      console.log("카테고리 데이터:", categoryData);
      setIsLoading(false);
    } catch (err) {
      console.error("카테고리 데이터를 가져오는 중 오류 발생:", err);

      // 인증 오류(401, 403)이거나 토큰이 없는 경우 토스트 메시지를 표시하지 않음
      const accessToken = localStorage.getItem("accessToken");
      if (
        accessToken &&
        !(
          err.response &&
          (err.response.status === 401 || err.response.status === 403)
        )
      ) {
        toast({
          variant: "destructive",
          title: "카테고리 로딩 실패",
          description: "카테고리 정보를 불러오는 중 오류가 발생했습니다.",
        });
      }

      setCategories([]);
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [toast]);

  // 카테고리 추가 함수
  const handleAddCategory = async () => {
    if (!newCategoryName.trim()) {
      toast({
        variant: "destructive",
        title: "입력 오류",
        description: "카테고리 이름을 입력해주세요.",
      });
      return;
    }

    setIsAddingCategory(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        toast({
          variant: "destructive",
          title: "로그인이 필요합니다",
          description: "카테고리 추가를 위해 로그인해주세요.",
        });
        navigate("/user/login");
        return;
      }

      const response = await axiosInstance.post(
        "/admin/compSystem/faqCategory",
        {
          faqCategoryName: newCategoryName.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      console.log("카테고리 추가 응답:", response.data);

      toast({
        title: "카테고리가 추가되었습니다",
        description: `'${newCategoryName.trim()}' 카테고리가 성공적으로 추가되었습니다.`,
      });

      // 카테고리 목록 새로고침
      await fetchCategories();

      // 입력 필드 초기화 및 다이얼로그 닫기
      setNewCategoryName("");
      setIsDialogOpen(false);
    } catch (error) {
      console.error("카테고리 추가 중 오류 발생:", error);
      toast({
        variant: "destructive",
        title: "카테고리 추가 실패",
        description: "잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsAddingCategory(false);
    }
  };

  // FAQ 작성 API 요청 함수
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // 로그인 상태 확인
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        toast({
          variant: "destructive",
          title: "로그인이 필요합니다",
          description: "FAQ 작성을 위해 로그인해주세요.",
        });
        navigate("/user/login");
        return;
      }

      // data.faqCategory는 이미 실제 faqCategoryIdx 값임 (문자열 형태)
      // 숫자로 변환하여 전송
      const categoryIdx = parseInt(data.faqCategory, 10);

      const submitData = {
        faqTitle: data.faqTitle,
        faqAnswer: data.faqAnswer,
        faqCategory: categoryIdx,
      };

      console.log("등록할 FAQ 데이터:", submitData);

      const response = await axiosInstance.post(
        "/faq/admin/write",
        submitData,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      toast({
        title: "FAQ가 등록되었습니다",
        description: "FAQ 목록으로 이동합니다.",
      });

      navigate("/faq");
    } catch (error) {
      console.error("FAQ 등록 중 오류 발생:", error);
      toast({
        variant: "destructive",
        title: "FAQ 등록 실패",
        description: "잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center">
        <p>카테고리 데이터를 불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Button
        variant="ghost"
        className="mb-6 pl-2"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        뒤로 가기
      </Button>

      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-2xl font-bold">FAQ 작성</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form
              onSubmit={form.handleSubmit(onSubmit, (errors) => {
                console.log("유효성 검사 실패:", errors);
                toast({
                  variant: "destructive",
                  title: "입력 오류",
                  description: "모든 필수 항목을 올바르게 입력해주세요.",
                });
              })}
              className="space-y-6"
            >
              <FormField
                control={form.control}
                name="faqCategory"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <div className="flex items-center justify-between">
                      <FormLabel className="text-sm font-medium text-gray-900">
                        카테고리
                      </FormLabel>
                      <Dialog
                        open={isDialogOpen}
                        onOpenChange={setIsDialogOpen}
                      >
                        <DialogTrigger asChild>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => setIsDialogOpen(true)}
                          >
                            <Plus className="mr-1 h-3 w-3" />
                            카테고리 추가
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <DialogHeader>
                            <DialogTitle>새 카테고리 추가</DialogTitle>
                            <DialogDescription>
                              새로운 FAQ 카테고리를 추가합니다.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="grid gap-4 py-4">
                            <div className="space-y-2">
                              <label
                                htmlFor="categoryName"
                                className="text-sm font-medium"
                              >
                                카테고리 이름
                              </label>
                              <Input
                                id="categoryName"
                                placeholder="카테고리 이름을 입력하세요"
                                value={newCategoryName}
                                onChange={(e) =>
                                  setNewCategoryName(e.target.value)
                                }
                                onKeyPress={(e) => {
                                  if (e.key === "Enter") {
                                    handleAddCategory();
                                  }
                                }}
                              />
                            </div>
                          </div>
                          <DialogFooter>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setIsDialogOpen(false);
                                setNewCategoryName("");
                              }}
                            >
                              취소
                            </Button>
                            <Button
                              type="button"
                              onClick={handleAddCategory}
                              disabled={isAddingCategory}
                            >
                              {isAddingCategory ? "추가 중..." : "추가"}
                            </Button>
                          </DialogFooter>
                        </DialogContent>
                      </Dialog>
                    </div>
                    <Select onValueChange={field.onChange} defaultValue="">
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="카테고리를 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        {categories.length === 0 ? (
                          <SelectItem value="" disabled>
                            카테고리가 없습니다. 새 카테고리를 추가해주세요.
                          </SelectItem>
                        ) : (
                          categories.map((category) => (
                            <SelectItem
                              key={category.faqCategoryIdx}
                              value={category.faqCategoryIdx.toString()}
                            >
                              {category.faqCategoryName}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="faqTitle"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-gray-900">
                      제목
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="FAQ 제목을 입력하세요"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="faqAnswer"
                render={({ field }) => (
                  <FormItem className="space-y-2">
                    <FormLabel className="text-sm font-medium text-gray-900">
                      답변
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="내용을 입력하세요"
                        className="w-full"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex justify-end space-x-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate(`/faq`)}
                >
                  취소
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "등록 중..." : "등록하기"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
