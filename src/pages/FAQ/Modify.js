import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

const faqSchema = z.object({
  faqTitle: z.string().min(1, "제목을 입력해주세요"),
  faqAnswer: z.string().min(1, "답변을 입력해주세요"),
  faqCategory: z.string().min(1, "카테고리를 선택해주세요"),
});

export default function FAQEditPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const { faqIdx } = useParams(); // URL에서 faqIdx 파라미터 가져오기

  const form = useForm({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      faqTitle: "",
      faqAnswer: "",
      faqCategory: "",
    },
    mode: "onSubmit",
  });

  // API에서 카테고리 목록 가져오기
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // 로그인 상태 확인 및 토큰 가져오기
        const accessToken = localStorage.getItem("accessToken");

        const response = await axiosInstance.get("/categories/faq", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

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
        fetchFAQ(categoryData);
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
        fetchFAQ([]);
      }
    };

    fetchCategories();
  }, [faqIdx, toast]);

  // 기존 FAQ 데이터 불러오기
  const fetchFAQ = async (categoryData) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        toast({
          variant: "destructive",
          title: "로그인이 필요합니다",
          description: "FAQ 수정을 위해 로그인해주세요.",
        });
        navigate("/user/login");
        return;
      }

      // FAQ 데이터 조회
      const response = await axiosInstance.get(`/faq/${faqIdx}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      const faqData = response.data.message;
      console.log("받아온 FAQ 데이터:", faqData); // 디버깅용

      // 폼에 기존 데이터 설정
      // 카테고리는 문자열로 변환하여 설정
      const categoryIdxStr = faqData.faqCategory.toString();
      form.reset({
        faqTitle: faqData.faqTitle,
        faqAnswer: faqData.faqAnswer,
        faqCategory: categoryIdxStr,
      });

      setIsLoading(false);
    } catch (error) {
      console.error("FAQ 데이터 불러오기 실패:", error);
      toast({
        variant: "destructive",
        title: "FAQ 데이터 불러오기 실패",
        description: "잠시 후 다시 시도해주세요.",
      });
      navigate("/faq");
    }
  };

  // FAQ 수정 API 요청 함수
  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        toast({
          variant: "destructive",
          title: "로그인이 필요합니다",
          description: "FAQ 수정을 위해 로그인해주세요.",
        });
        navigate("/user/login");
        return;
      }

      // 카테고리 값을 숫자로 변환
      const categoryIdx = parseInt(data.faqCategory, 10);

      const submitData = {
        faqTitle: data.faqTitle,
        faqAnswer: data.faqAnswer,
        faqCategory: categoryIdx,
      };

      console.log("수정할 FAQ 데이터:", submitData);

      // PATCH 요청으로 FAQ 수정
      await axiosInstance.patch(`/faq/admin/${faqIdx}`, submitData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
      });

      toast({
        title: "FAQ가 수정되었습니다",
        description: "FAQ 목록으로 이동합니다.",
      });

      navigate("/adminBoard?tab=faq");
    } catch (error) {
      console.error("FAQ 수정 중 오류 발생:", error);
      toast({
        variant: "destructive",
        title: "FAQ 수정 실패",
        description:
          error.response?.data?.message || "잠시 후 다시 시도해주세요.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-8 flex justify-center items-center">
        <p>데이터를 불러오는 중...</p>
      </div>
    );
  }

  // 카테고리 데이터가 없을 경우
  if (categories.length === 0) {
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
            <CardTitle className="text-2xl font-bold">FAQ 수정</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col items-center justify-center py-6">
              <p className="text-center mb-4">
                카테고리 정보를 불러올 수 없습니다.
              </p>
              <Button onClick={() => window.location.reload()}>새로고침</Button>
            </div>
          </CardContent>
        </Card>
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
          <CardTitle className="text-2xl font-bold">FAQ 수정</CardTitle>
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
                    <FormLabel className="text-sm font-medium text-gray-900">
                      카테고리
                    </FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="카테고리를 선택하세요" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="bg-white">
                        {categories.map((category) => (
                          <SelectItem
                            key={category.faqCategoryIdx}
                            value={category.faqCategoryIdx.toString()}
                          >
                            {category.faqCategoryName}
                          </SelectItem>
                        ))}
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
                  onClick={() => navigate("/adminBoard?tab=faq")}
                >
                  취소
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "수정 중..." : "수정하기"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
