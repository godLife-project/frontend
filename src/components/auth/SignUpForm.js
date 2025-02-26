import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useApi } from "../../hooks/useApi";
import { useToast } from "@/components/ui/use-toast";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const signupSchema = z
  .object({
    userId: z.string().min(1, { message: "아이디를 입력해주세요." }),
    userPw: z
      .string()
      .min(4, { message: "비밀번호는 최소 4자 이상이어야 합니다." }),
    userPwConfirm: z
      .string()
      .min(4, { message: "비밀번호 확인을 입력해주세요." }),
    userName: z.string().min(2, { message: "이름을 입력해주세요." }),
    userNick: z.string().min(1, { message: "닉네임을 입력해주세요." }),
    userEmail: z
      .string()
      .email({ message: "올바른 이메일 주소를 입력해주세요." }),
    userGender: z.enum(["1", "2", "0"], {
      message: "성별을 선택해주세요.",
    }),
    jobIdx: z.string().min(1, { message: "직업을 선택해주세요." }),
    userBirth: z.string().min(1, { message: "생년월일을 선택해주세요." }),
  })
  .refine((data) => data.userPw === data.userPwConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["userPwConfirm"],
  });

const SignUpForm = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // 로딩 상태 추가
  const [isIdValid, setIsIdValid] = useState(null); // 아이디 중복 여부 상태 추가
  const { data, error, post } = useApi();
  const { toast } = useToast();

  useEffect(() => {
    if (data) {
      console.log("회원가입 응답 데이터:", data);

      toast({
        title: "회원가입 성공",
        description: "로그인 페이지로 이동합니다.",
      });
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    }
  }, [data, navigate, toast]);

  const checkDuplicateId = async () => {
    const userId = form.getValues("userId");
    if (!userId) {
      alert("아이디를 입력해주세요.");
      return;
    }

    setLoading(true); // 로딩 시작
    try {
      const response = await fetch(`/api/check-id?userId=${userId}`);
      const data = await response.json();

      if (data.isDuplicate) {
        setIsIdValid(false);
        alert("이미 사용 중인 아이디입니다.");
      } else {
        setIsIdValid(true);
        alert("사용 가능한 아이디입니다!");
      }
    } catch (error) {
      console.error("아이디 중복 확인 오류:", error);
      alert("중복 확인 중 오류가 발생했습니다.");
    } finally {
      setLoading(false); // 로딩 종료
    }
  };

  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      userId: "",
      userPw: "",
      userPwConfirm: "",
      userName: "",
      userNick: "",
      userEmail: "",
      userGender: "",
      jobIdx: "",
      userBirth: "",
    },
  });

  //  회원가입 처리 함수
  const onSubmit = async (formData) => {
    setLoading(true);
    try {
      console.log("회원가입 데이터:", formData);
      // TODO: 회원가입 API 요청 (백엔드 연동)
      setTimeout(() => {
        alert("회원가입 성공");
        navigate("/login"); // 로그인 페이지로 이동
      }, 2000);
    } catch (error) {
      console.error("회원가입 실패:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-screen bg-gray-200 flex items-center justify-center">
      <div className="bg-white p-6 rounded-3xl shadow-md w-full max-w-sm h-[500px]">
        <ScrollArea className="h-[450px] pr-2">
          <div className="flex justify-between">
            <span className="font-semibold">
              Welcome to <span className="text-blue-500">LOREM</span>
            </span>
            <div className="flex flex-col space-x-4 pt-2">
              <span className="text-gray-400 text-xs">계정이 있으신가요?</span>
              <Button
                type="button"
                className="text-xs bg-transparent border-none p-0 h-3 pt-3 text-gray-400 hover:text-blue-500 hover:bg-white focus:outline-none shadow-none ring-0"
                onClick={() => navigate("/login")}
              >
                로그인하러 가기
              </Button>
            </div>
          </div>

          <div className="pb-7 text-4xl font-bold">Sign up</div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>아이디</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input placeholder="ID" {...field} />
                        <Button
                          type="button"
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 text-xs rounded"
                          onClick={checkDuplicateId}
                        >
                          중복 확인
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex space-x-4">
                <FormField
                  control={form.control}
                  name="userName"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>이름</FormLabel>
                      <FormControl>
                        <Input placeholder="User name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nickName"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>닉네임</FormLabel>
                      <FormControl>
                        <Input placeholder="Nick name" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="userPw"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Password"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userPW"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>비밀번호 확인</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="password"
                          placeholder="Password"
                          {...field}
                        />
                        <Button
                          type="button"
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 text-xs rounded"
                          onClick={checkDuplicateId}
                        >
                          비밀번호 확인
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="userGender"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>성별</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange} // ✅ React Hook Form과 연결
                        value={field.value} // ✅ 현재 선택된 값
                        className="flex space-x-4"
                      >
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem value="1" />
                          </FormControl>
                          <FormLabel>남성</FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem value="2" />
                          </FormControl>
                          <FormLabel>여성</FormLabel>
                        </FormItem>
                        <FormItem>
                          <FormControl>
                            <RadioGroupItem value="0" />
                          </FormControl>
                          <FormLabel>비밀</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex space-x-4">
                <FormField
                  control={form.control}
                  name="job"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>직업</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="선택" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectGroup>
                              <SelectLabel>직업 선택</SelectLabel>
                              <SelectItem value="developer">개발자</SelectItem>
                              <SelectItem value="designer">디자이너</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="userBirth"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>생년월일</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} className="w-full" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-500 text-white"
                disabled={loading}
              >
                {loading ? "회원가입 중..." : "Sign up"}
              </Button>
            </form>
          </Form>
        </ScrollArea>
      </div>
    </div>
  );
};

export default SignUpForm;
