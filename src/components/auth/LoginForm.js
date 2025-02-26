import { useState, useEffect, useRef } from "react";
import axiosInstance from "@/api/axiosInstance";
import { useAuth } from "../../context/AuthContext"; 
import { useNavigate } from "react-router-dom";
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);
  const { toast } = useToast();
  const navigate = useNavigate();
  const errorShown = useRef(false);
  const { login } = useAuth(); // useAuth 훅 사용

  const form = useForm({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      userId: "",
      userPw: "",
    },
  });

  const getTokens = (responseHeaders) => {
    if (!responseHeaders) return { accessToken: null, refreshToken: null };

    const accessToken = responseHeaders["authorization"] || responseHeaders["Authorization"] || null;
    const refreshToken = responseHeaders["refresh-token"] || null;
    
    const cleanAccessToken = accessToken
      ? accessToken.startsWith("Bearer ") ? accessToken.substring(7) : accessToken
      : null;

    return {
      accessToken: cleanAccessToken,
      refreshToken,
    };
  };


  // 에러가 발생하면 실행됨
  // useEffect 부분 수정
useEffect(() => {
  if (data && !errorShown.current) {
    console.log("API 응답 데이터:", data);

    // 로그인 성공 처리 (한 번만 실행)
    toast({
      title: "로그인 성공",
      description: "환영합니다!",
    });

    // 로그인 성공 후 리다이렉트
    navigate("/");

    // 토스트가 표시되었음을 표시
    errorShown.current = true;
  }
}, [data, navigate, toast]);

// onSubmit 함수 수정
const onSubmit = async (formData) => {
  // 새 로그인 시도 시 에러 상태 초기화
  errorShown.current = false;
  console.log("로그인 시도:", formData);
  setLoading(true);
  
  try {
    const response = await axiosInstance.post("/user/login", formData, {
      withCredentials: true
    });
    
    // 응답 데이터 설정
    setData(response.data);
    
    // 토큰 정보 가져오기 및 저장 (여기서는 토스트 없음)
    const tokens = getTokens(response.headers);
    if (response.data && tokens.accessToken) {
      login(response.data, tokens); // 사용자 데이터와 토큰 전달
    }
    
    // 에러 상태 초기화
    setError(null);
  } catch (err) {
    console.error("로그인 오류:", err);
    setError(err);
  } finally {
    setLoading(false);
  }
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
                <Button
                  type="submit"
                  className="w-full bg-blue-500"
                  disabled={loading}
                >
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
                  navigate("/user/signup");
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
