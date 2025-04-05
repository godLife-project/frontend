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

//유효성 검사 스키마
const signupSchema = z
  .object({
    userId: z.string(),
    userPw: z.string(),
    userPwConfirm: z.string(),
    userName: z.string(),
    userNick: z.string(),
    userEmail: z.string().email(),
    userGender: z.enum(["1", "2", "3"]),
    jobIdx: z.string(),
    userPhone: z.string(),
    targetIdx: z.string(),
    verificationCode: z.string(),
  })
  .refine((data) => data.userPw === data.userPwConfirm, {
    message: "비밀번호가 일치하지 않습니다.",
    path: ["userPwConfirm"],
  });

const SignUpForm = () => {
  const userIdInputRef = useRef(null); // 아이디 입력란 Ref
  const userPwInputRef = useRef(null);
  const userPwConfirmInputRef = useRef(null);
  const userNameInputRef = useRef(null);
  const userNickInputRef = useRef(null);
  const userEmailInputRef = useRef(null);
  const jobIdxInputRef = useRef(null);
  const targetIdxInputRef = useRef(null);
  const userPhoneInputRef = useRef(null);
  const userGenderInputRef = useRef(null);
  const emailCheckInputRef = useRef(null);
  const navigate = useNavigate();

  const [loading, setLoading] = useState(false);
  const [isIdValid, setIsIdValid] = useState(null);
  const [serverError, setServerError] = useState(""); // 서버 오류 메시지를 저장할 상태 변수
  const [jobCategories, setJobCategories] = useState([]);
  const [targetCategories, setTargetCategories] = useState([]);
  const [isEmailVerified, setIsEmailVerified] = useState(false);
  const { toast } = useToast();

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
      targetIdx: "",
      userPhone: "",
      verificationCode: "",
    },
  });

  // 에러가 있는 필드 스타일 적용
  const getInputStyle = (fieldName) => {
    return form.formState.errors[fieldName]
      ? { borderColor: "#f87171", outline: "none" }
      : {};
  };

  // 폼 제출 시 에러가 있는 필드에 자동 포커스 - 수정
  useEffect(() => {
    const errors = form.formState.errors;
    if (Object.keys(errors).length > 0) {
      const firstError = Object.keys(errors)[0];

      switch (firstError) {
        case "userId":
          userIdInputRef.current?.focus();
          break;
        case "userPw":
          userPwInputRef.current?.focus();
          break;
        case "userPwConfirm":
          userPwConfirmInputRef.current?.focus();
          break;
        case "userName":
          userNameInputRef.current?.focus();
          break;
        case "userNick":
          userNickInputRef.current?.focus();
          break;
        case "userEmail":
          userEmailInputRef.current?.focus();
          break;
        case "userPhone":
          userPhoneInputRef.current?.focus();
          break;
        default:
          // Select나 Radio 같은 필드는 토스트 메시지로 표시
          if (errors[firstError].message) {
            // 하나의 오류 메시지만 표시
            toast({
              title: "입력 오류",
              description: errors[firstError].message,
              variant: "destructive",
            });
          }
      }
    }
  }, [form.formState.submitCount]); // 매번 렌더링마다 체크하지 않고 제출할 때만 체크

  //직업 카테고리
  useEffect(() => {
    const fetchJobCategories = async () => {
      try {
        const response = await axiosInstance.get(`categories/job`);
        console.log("직업 카테고리 데이터:", response.data);
        setJobCategories(
          response.data.map((item) => ({
            jobIdx: item.idx,
            jobName: item.name,
          }))
        );
      } catch (error) {
        console.error("직업 카테고리 데이터 가져오기 실패:", error);
      }
    };

    fetchJobCategories();
  }, []);

  //관심사 카테고리
  useEffect(() => {
    const fetchTargetCategories = async () => {
      try {
        const response = await axiosInstance.get(`categories/target`);
        console.log("관심사 카테고리 데이터:", response.data);
        setTargetCategories(
          response.data.map((item) => ({
            targetIdx: item.idx,
            targetName: item.name,
          }))
        );
      } catch (error) {
        console.error("관심사 카테고리 데이터 가져오기 실패:", error);
      }
    };

    fetchTargetCategories();
  }, []);

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
      userIdInputRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      const response = await axiosInstance.get(`user/checkId/${userId}`);

      console.log("중복 확인 응답 데이터:", response.data);

      if (response.data === true) {
        setIsIdValid(false);
        alert("이미 사용 중인 아이디입니다.");
        userIdInputRef.current?.focus();
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

  //이메일 중복 확인 함수
  const checkDuplicateEmail = async () => {
    const userEmail = form.getValues("userEmail").trim();
    if (!userEmail) {
      alert("이메일을 입력해주세요.");
      userEmailInputRef.current?.focus();
      return;
    }

    setLoading(true);
    try {
      // 요청 본문에 이메일 포함
      const response = await axiosInstance.post(
        `/verify/emails/send/verification-requests`,
        {
          userEmail: userEmail,
        }
      );

      console.log("이메일 인증 코드 전송 응답:", response.data);

      // API가 성공 정보를 반환한다고 가정
      alert("인증 코드가 이메일로 전송되었습니다.");

      // 인증 코드를 위한 새 필드와 확인 함수가 필요할 수 있습니다
    } catch (error) {
      console.error("이메일 인증 코드 전송 오류:", error);

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        // 서버에서 보낸 특정 오류 메시지 처리
        alert(error.response.data.message);
      } else {
        alert("인증 코드 전송 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 이메일 인증번호 확인 함수
  const checkVerificationsEmail = async () => {
    const userEmail = form.getValues("userEmail").trim();
    const verificationCode = form.getValues("verificationCode").trim(); // 인증 코드 입력 필드 값

    if (!userEmail) {
      alert("이메일을 입력해주세요.");
      emailCheckInputRef.current?.focus();
      return;
    }

    if (!verificationCode) {
      alert("인증 코드를 입력해주세요.");
      emailCheckInputRef.current?.focus(); // 인증 코드 입력 필드에 대한 ref 필요
      return;
    }

    setLoading(true);
    try {
      // Correct way: code as query parameter, userEmail in body
      const response = await axiosInstance.post(
        `/verify/emails/verifications?code=${verificationCode}`,
        {
          userEmail: userEmail,
        }
      );

      console.log("이메일 인증 코드 확인 응답:", response.data);

      // 인증 성공 처리
      alert("이메일 인증이 완료되었습니다.");
      setIsEmailVerified(true); // 이메일 인증 상태를 저장하는 상태 변수 필요
    } catch (error) {
      console.error("이메일 인증 코드 확인 오류:", error);

      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        // 서버에서 보낸 특정 오류 메시지 처리
        alert(error.response.data.message);
      } else {
        alert("인증 코드 확인 중 오류가 발생했습니다.");
      }
    } finally {
      setLoading(false);
    }
  };

  // 회원가입 API 요청 함수
  const onSubmit = async (data) => {
    const { userPwConfirm, verificationCode, ...apiData } = data;
    const submitData = {
      ...apiData,
      userGender: parseInt(data.userGender, 10),
      jobIdx: parseInt(data.jobIdx || "0", 10), // 문자열을 숫자로 변환
      targetIdx: parseInt(data.targetIdx || "0", 10), // 문자열을 숫자로 변환
    };
    const formData = form.getValues();
    console.log("회원가입 버튼 클릭됨, 전달된 데이터:", submitData);

    if (!isEmailVerified) {
      toast({
        variant: "destructive",
        title: "이메일 인증 필요",
        description: "이메일 인증을 완료해주세요.",
      });
      return;
    }

    if (!isIdValid) {
      toast({
        variant: "destructive",
        title: "아이디 확인 필요",
        description: "아이디 중복 확인을 완료해주세요.",
      });
      userIdInputRef.current?.focus();
      return;
    }

    if (data.userPw !== data.userPwConfirm) {
      toast({
        variant: "destructive",
        title: "비밀번호 불일치",
        description: "비밀번호가 일치하지 않습니다.",
      });
      userPwConfirmInputRef.current?.focus();
      return;
    }

    setLoading(true);
    setServerError(""); // 기존 서버 오류 초기화

    try {
      const response = await axiosInstance.post(`/user/join`, submitData);
      console.log("응답 객체:", response);
      console.log("회원가입 응답:", response.data);

      if (response.data.success === false) {
        // 서버에서 반환한 오류 메시지를 그대로 표시
        if (response.data.message) {
          setServerError(response.data.message);
          toast({
            variant: "destructive",
            title: "회원가입 실패",
            description: response.data.message,
          });
        }
      } else {
        toast({
          title: "회원가입 성공",
          description: "로그인 페이지로 이동합니다.",
        });
        navigate("/login");
      }
    } catch (error) {
      console.error("회원가입 실패:", error);

      // 서버 응답에서 오류 메시지 확인
      if (error.response && error.response.data) {
        let errorMessage = "";
        let errorField = "";

        // 오류 메시지 추출
        if (typeof error.response.data === "string") {
          errorMessage = error.response.data;
        } else if (error.response.data.message) {
          errorMessage = error.response.data.message;
        } else if (error.response.data.error) {
          errorMessage = error.response.data.error;
        } else {
          // 객체인 경우 첫 번째 오류 메시지 사용
          const errorObj = error.response.data;
          for (const key in errorObj) {
            if (errorObj[key]) {
              errorMessage = errorObj[key];
              errorField = key; // 오류 발생한 필드
              break;
            }
          }
        }

        // 오류 메시지가 없으면 기본 메시지 사용
        if (!errorMessage) {
          errorMessage = "회원가입에 실패했습니다.";
        }

        setServerError(errorMessage);

        toast({
          variant: "destructive",
          title: "회원가입 실패",
          description: errorMessage,
        });

        setTimeout(() => {
          if (errorField === "userId" && userIdInputRef.current) {
            userIdInputRef.current.focus();
          } else if (errorField === "userPw" && userPwInputRef.current) {
            userPwInputRef.current.focus();
          } else if (errorField === "userName" && userNameInputRef.current) {
            userNameInputRef.current.focus();
          } else if (errorField === "userNick" && userNickInputRef.current) {
            userNickInputRef.current.focus();
          } else if (errorField === "userEmail" && userEmailInputRef.current) {
            userEmailInputRef.current.focus();
          } else if (errorField === "jobIdx" && jobIdxInputRef.current) {
            jobIdxInputRef.current.focus();
          } else if (errorField === "targetIdx" && targetIdxInputRef.current) {
            targetIdxInputRef.current.focus();
          } else if (errorField === "userPhone" && userPhoneInputRef.current) {
            userPhoneInputRef.current.focus();
          } else if (
            errorField === "userGender" &&
            userGenderInputRef.current
          ) {
            userGenderInputRef.current.focus();
          }
        }, 0);
      } else {
        setServerError("회원가입에 실패했습니다.");
        toast({
          variant: "destructive",
          title: "회원가입 실패",
          description: "회원가입 처리 중 오류가 발생했습니다.",
        });
      }
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
              {/* 서버에서 반환된 오류 메시지 표시 */}
              {serverError && (
                <div className="text-red-500 text-sm p-2 bg-red-50 rounded-md">
                  {serverError}
                </div>
              )}

              <FormField
                control={form.control}
                name="userEmail"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>이메일</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input
                          type="email"
                          placeholder="Email"
                          {...field}
                          ref={emailCheckInputRef}
                          style={getInputStyle("userEmail")}
                        />
                        <Button
                          type="button"
                          className="min-w-[68px] bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 text-xs rounded"
                          onClick={checkDuplicateEmail}
                        >
                          인증하기
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="verificationCode"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="인증번호 입력"
                          {...field}
                          ref={emailCheckInputRef}
                          style={getInputStyle("verificationCode")}
                        />
                        <Button
                          type="button"
                          className="min-w-[68px] bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 text-xs rounded"
                          onClick={checkVerificationsEmail}
                        >
                          확인
                        </Button>
                      </div>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="userId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>아이디</FormLabel>
                    <FormControl>
                      <div className="flex items-center space-x-2">
                        <Input
                          placeholder="ID"
                          {...field}
                          ref={userIdInputRef}
                          style={getInputStyle("userId")}
                        />
                        <Button
                          type="button"
                          className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-2 text-xs rounded"
                          onClick={checkDuplicateId}
                        >
                          중복 확인
                        </Button>
                      </div>
                    </FormControl>
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
                        <Input
                          placeholder="User name"
                          {...field}
                          ref={userNameInputRef}
                          style={getInputStyle("userName")}
                        />
                      </FormControl>
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
                        <Input
                          placeholder="Nick name"
                          {...field}
                          ref={userNickInputRef}
                          style={getInputStyle("userNick")}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="userPhone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>휴대폰번호</FormLabel>
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="'-' 포함하고 입력"
                        pattern="[0-9]{3}-[0-9]{4}-[0-9]{4}"
                        {...field}
                        ref={userPhoneInputRef}
                        style={getInputStyle("userPhone")}
                      />
                    </FormControl>
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
                      <Input
                        type="password"
                        placeholder="Password"
                        {...field}
                        ref={userPwInputRef}
                        style={getInputStyle("userPw")}
                      />
                    </FormControl>
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
                          ref={userPwConfirmInputRef}
                          style={getInputStyle("userPwConfirm")}
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
                        ref={userGenderInputRef}
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
                            <RadioGroupItem value="3" />
                          </FormControl>
                          <FormLabel>비밀</FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
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
                          onValueChange={(value) => {
                            console.log("Selected value:", value); // 값 확인
                            field.onChange(value);
                          }}
                          value={field.value?.toString()} // 값이 문자열인지 확인
                          ref={jobIdxInputRef}
                        >
                          <SelectTrigger
                            className="w-full"
                            style={getInputStyle("jobIdx")}
                          >
                            <SelectValue placeholder="선택" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectGroup>
                              {jobCategories.length > 0 ? (
                                jobCategories.map((job) => (
                                  <SelectItem
                                    key={job.jobIdx}
                                    value={job.jobIdx?.toString()}
                                  >
                                    {job.jobName}
                                  </SelectItem>
                                ))
                              ) : (
                                <>
                                  <SelectItem value="1">개발자</SelectItem>
                                  <SelectItem value="2">디자이너</SelectItem>
                                  <SelectItem value="0">선택안함</SelectItem>
                                </>
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="targetIdx"
                  render={({ field }) => (
                    <FormItem className="w-full">
                      <FormLabel>관심사</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                          ref={targetIdxInputRef}
                        >
                          <SelectTrigger
                            className="w-full"
                            style={getInputStyle("targetIdx")}
                          >
                            <SelectValue placeholder="선택" />
                          </SelectTrigger>
                          <SelectContent className="bg-white">
                            <SelectGroup>
                              {targetCategories.length > 0 ? (
                                targetCategories.map((target) => (
                                  <SelectItem
                                    key={target.targetIdx}
                                    value={target.targetIdx?.toString()}
                                  >
                                    {target.targetName}
                                  </SelectItem>
                                ))
                              ) : (
                                <>
                                  {/* <SelectItem value="1">미라클모닝</SelectItem>
                              <SelectItem value="2">운동</SelectItem>
                              <SelectItem value="0">선택안함</SelectItem> */}
                                </>
                              )}
                            </SelectGroup>
                          </SelectContent>
                        </Select>
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-black text-white"
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
