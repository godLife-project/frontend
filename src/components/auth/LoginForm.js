import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { Eye, EyeOff, Lock, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const loginFormSchema = z.object({
  userId: z.string().min(1, { message: "아이디를 입력해주세요." }),
  userPw: z
    .string()
    .min(4, { message: "비밀번호는 최소 4자 이상이어야 합니다." }),
});

const LoginForm = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { data, loading, error, post, headers, getTokens } = useApi();
  const { toast } = useToast();
  const navigate = useNavigate();

  const form = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      userId: "",
      userPw: "",
    },
  });

  // 데이터가 변경되면 실행됨
  useEffect(() => {
    if (data) {
      console.log("API 응답 데이터:", data);

      // 토큰 정보 가져오기
      const { accessToken, refreshToken } = getTokens();
      console.log("Access Token:", accessToken);
      console.log("Refresh Token Cookie:", refreshToken);

      // 모든 쿠키 출력 (확인용)
      console.log("All Cookies:", document.cookie);

      // 모든 응답 헤더 출력 (확인용)
      console.log("Response Headers:", headers);

      // 로그인 성공 처리
      toast({
        title: "로그인 성공",
        description: "환영합니다!",
      });

      // 토큰 정보를 로컬 스토리지나 상태에 저장 (옵션)
      if (accessToken) {
        localStorage.setItem("accessToken", accessToken);
      }

      // 로그인 성공 후 리다이렉트
      navigate("/");
    }
  }, [data, navigate, toast, headers, getTokens]);

  // 에러가 발생하면 실행됨
  useEffect(() => {
    if (error) {
      console.error("로그인 오류:", error);
      toast({
        variant: "destructive",
        title: "로그인 실패",
        description: "아이디 또는 비밀번호를 확인해주세요.",
      });
    }
  }, [error, toast]);

  const onSubmit = (formData) => {
    console.log("로그인 시도:", formData);
    // withCredentials를 true로 설정하여 쿠키를 받을 수 있도록 함
    post("/user/login", formData);
  };

  const togglePasswordVisibility = () => {
    setShowPassword((prev) => !prev);
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              로그인
            </CardTitle>
            <CardDescription className="text-center">
              계정에 로그인하여 시작하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="userId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>아이디</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            placeholder="your ID"
                            className="pl-10"
                            {...field}
                          />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="userPw"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>비밀번호</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                          <Input
                            type={showPassword ? "text" : "password"}
                            className="pl-10 pr-10"
                            {...field}
                          />
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="absolute right-0 top-0 h-10 w-10 text-gray-400"
                            onClick={togglePasswordVisibility}
                          >
                            {showPassword ? (
                              <EyeOff className="h-4 w-4" />
                            ) : (
                              <Eye className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "로그인 중..." : "로그인"}
                </Button>
              </form>
            </Form>
            <div className="mt-4 text-center text-sm">
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  // 비밀번호 찾기 페이지로 이동
                }}
              >
                비밀번호를 잊으셨나요?
              </a>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col">
            <div className="text-center w-full">
              <span className="text-sm text-gray-500">계정이 없으신가요?</span>{" "}
              <a
                href="#"
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  navigate("/signup");
                }}
              >
                회원가입
              </a>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default LoginForm;
