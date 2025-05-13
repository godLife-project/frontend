import { ArrowLeft } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import * as z from "zod";
import axiosInstance from "@/api/axiosInstance";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
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
  faqCategory: z.string().min(1, "카테고리를 입력해주세요"),
});

export default function FAQWritePage() {
  const { toast } = useToast();
  const [category, setCategory] = useState("");
  const suggestions = ["루틴", "챌린지", "계정", "기타"];
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm({
    resolver: zodResolver(faqSchema),
    defaultValues: {
      faqTitle: "",
      faqAnswer: "",
      faqCategory: "",
    },
    mode: "onSubmit", // 폼 제출 시에만 유효성 검사 실행
  });

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

      const submitData = {
        ...data,
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
                    <FormLabel className="text-sm font-medium text-gray-900">
                      카테고리
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        onChange={(e) => {
                          field.onChange(e);
                          setCategory(e.target.value);
                        }}
                        placeholder="카테고리 입력"
                        className="w-full"
                      />
                    </FormControl>
                    <div className="mt-2 flex flex-wrap gap-2">
                      {suggestions.map((suggestion, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 hover:bg-gray-200 cursor-pointer"
                          onClick={() => {
                            field.onChange(suggestion);
                            setCategory(suggestion);
                          }}
                        >
                          {suggestion}
                        </span>
                      ))}
                    </div>
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
