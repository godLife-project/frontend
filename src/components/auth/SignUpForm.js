import { useState, useRef, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/api/axiosInstance";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// ✅ 유효성 검사 스키마
const signupSchema = z
  .object({
    userId: z.string().min(1, { message: "아이디를 입력해주세요." }),
    userPw: z.string(),
    userPwConfirm: z.string(),
    userName: z.string(),
    userNick: z.string(),
    // userEmail: z.string().email(),
    userGender: z.enum(["1", "2", "0"]),
    jobIdx: z.string().min(1),
  })
  .refine((data) => data.userPw === data.userPwConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["userPwConfirm"],
  });

const SignUpForm = () => {
  const userIdInputRef = useRef(null); // 아이디 입력란 Ref
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [isIdValid, setIsIdValid] = useState(null);
  const { toast } = useToast();
  const form = useForm({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      userId: "",
      userPw: "",
      userPwConfirm: "",
      userName: "",
      userNick: "",
      // userEmail: "",
      userGender: "",
      jobIdx: "",
      userBirth: "",
    },

    
  });

  const checkPassdMatch = () => {
    // form.getValues()로 현재 입력된 값을 가져옵니다.
    const password = form.getValues("userPw").trim();
    const confirmPassword = form.getValues("userPwConfirm").trim();

    if (!password || !confirmPassword) {
      alert("비밀번호를 입력해주세요.");
      return;
    }

    if (password !== confirmPassword) {
      alert("비밀번호가 일치하지 않습니다.");
    } else {
      alert("비밀번호가 일치합니다.");
    }
  };

  //아이디 중복 확인 함수
  const checkDuplicateId = async () => {
    const userId = form.getValues("userId").trim();
    if (!userId) {
      alert("아이디를 입력해주세요.");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get(`user/checkId/${userId}`);

      console.log("중복 확인 응답 데이터:", response.data);

      if (response.data === true) {
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
      setLoading(false);
    }
  };

  // 회원가입 API 요청 함수
  const onSubmit = async (data) => {
    const { userPwConfirm, ...apiData } = data;
    // const submitData = {
    //   ...data,
    //   jobIdx: parseInt(data.jobIdx, 10),
    //   userGender: parseInt(data.userGender, 10) // 문자열을 정수로 변환
    // };
    const submitData = {
      ...data,
      userGender: parseInt(data.userGender, 10) // 문자열을 정수로 변환
    };
    const formData = form.getValues();
    console.log("회원가입 버튼 클릭됨, 전달된 데이터:", submitData);
    if (!isIdValid) {
      alert("아이디 중복 확인을 완료해주세요.");
      userIdInputRef.current?.focus();
      return;
    }

    if (formData.userPw !== formData.userPwConfirm) {
      alert("비밀번호가 일치하지 않습니다.");
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.post(`/user/join`, submitData);
      console.log("응답 객체:", response);
      console.log("회원가입 응답:", response.data);

      if (response.data.success) {
        alert("회원가입 성공!");
        navigate("/login");
      } else {
        alert("회원가입 실패: " + response.data.message);
      }
    } catch (error) {
      console.error("회원가입 실패:", error);
      alert("회원가입에 실패했습니다.");
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
                  name="userNick"
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
                name="userPwConfirm"
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
                          onClick={checkPassdMatch}
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
                        onValueChange={field.onChange}
                        value={field.value}
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
                  name="jobIdx"
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
                              <SelectItem value="1">개발자</SelectItem>
                              <SelectItem value="2">디자이너</SelectItem>
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* <FormField
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
                /> */}
              </div>
              <Button
                type="submit"
                className="w-full bg-blue-500 text-white"
                disabled={loading}
              >
                {loading ? "회원가입 중..." : "회원가입"}
              </Button>
            </form>
          </Form>
        </ScrollArea>
      </div>
    </div>
  );
};

export default SignUpForm;
