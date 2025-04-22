// FindPassword.jsx
import React, { useState } from "react";
import axiosInstance from "@/api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { User, Mail, Key, ArrowLeft } from "lucide-react";

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
import { useToast } from "@/components/ui/use-toast";

function FindPassword() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // 현재 단계를 관리하는 상태
  const [step, setStep] = useState(1);

  // 사용자 입력 상태
  const [userId, setUserId] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  // 서버에서 받은 데이터 관련 상태
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");

  // 에러 메시지, 로딩 상태 등
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // 아이디 확인 및 이메일 조회
  const checkUserId = async (e) => {
    e.preventDefault();

    if (!userId.trim()) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "아이디를 입력해주세요.",
      });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/user/check-id", { userId });

      if (response.data.success) {
        setUserEmail(response.data.email);
        toast({
          title: "확인 완료",
          description: "아이디가 확인되었습니다.",
        });
        // 단계 진행 (이메일 확인 단계로)
        setStep(2);
      } else {
        toast({
          variant: "destructive",
          title: "오류",
          description: "존재하지 않는 아이디입니다.",
        });
      }
    } catch (error) {
      console.error("아이디 확인 중 오류 발생:", error);
      toast({
        variant: "destructive",
        title: "오류",
        description: "아이디 확인 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 인증 코드 전송
  const sendVerificationCode = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/user/send-verification", {
        userId,
      });

      if (response.data.success) {
        toast({
          title: "전송 완료",
          description: "인증 코드가 이메일로 전송되었습니다.",
        });
        // 단계 진행 (인증 코드 입력 단계로)
        setStep(3);
      } else {
        toast({
          variant: "destructive",
          title: "오류",
          description: "인증 코드 전송에 실패했습니다.",
        });
      }
    } catch (error) {
      console.error("인증 코드 전송 중 오류 발생:", error);
      toast({
        variant: "destructive",
        title: "오류",
        description:
          "인증 코드 전송 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 인증 코드 확인
  const verifyCode = async (e) => {
    e.preventDefault();

    if (!verificationCode.trim()) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "인증 코드를 입력해주세요.",
      });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post("/user/verify-code", {
        userId,
        verificationCode,
      });

      if (response.data.success) {
        setPassword(response.data.password);
        toast({
          title: "인증 성공",
          description: "인증이 완료되었습니다.",
        });
        // 단계 진행 (비밀번호 표시 단계로)
        setStep(4);
      } else {
        toast({
          variant: "destructive",
          title: "오류",
          description: "인증 코드가 일치하지 않습니다.",
        });
      }
    } catch (error) {
      console.error("인증 코드 확인 중 오류 발생:", error);
      toast({
        variant: "destructive",
        title: "오류",
        description:
          "인증 코드 확인 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 1단계: 아이디 입력
  const renderStep1 = () => (
    <form onSubmit={checkUserId} className="space-y-4">
      <div className="relative">
        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="아이디"
          value={userId}
          onChange={(e) => setUserId(e.target.value)}
          className="pl-10"
          disabled={loading}
        />
      </div>

      <Button type="submit" className="w-full bg-blue-500" disabled={loading}>
        {loading ? "처리 중..." : "다음"}
      </Button>

      <div className="text-center text-sm mt-4">
        <a
          href="/find-id"
          className="text-blue-600 hover:text-blue-800 font-medium"
          onClick={(e) => {
            e.preventDefault();
            navigate("/find-id");
          }}
        >
          아이디를 잊으셨나요?
        </a>
      </div>
    </form>
  );

  // 2단계: 이메일 확인 및 인증코드 전송
  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="border p-3 rounded-md bg-gray-50">
        <div className="flex items-center">
          <Mail className="h-5 w-5 text-gray-500 mr-2" />
          <span className="text-gray-700">
            {/* 이메일 일부를 가려서 표시 */}
            {userEmail.replace(/(\w{2})[\w.-]+@([\w.]+\w)/, "$1***@$2")}
          </span>
        </div>
      </div>

      <p className="text-sm text-gray-600">
        입력하신 아이디와 연결된 이메일로 인증 코드를 보내시겠습니까?
      </p>

      <Button
        onClick={sendVerificationCode}
        className="w-full bg-blue-500"
        disabled={loading}
      >
        {loading ? "전송 중..." : "인증 코드 전송"}
      </Button>

      <Button
        onClick={() => {
          setStep(1);
          setError("");
          setSuccess("");
        }}
        variant="outline"
        className="w-full"
        disabled={loading}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        뒤로 가기
      </Button>
    </div>
  );

  // 3단계: 인증 코드 입력
  const renderStep3 = () => (
    <form onSubmit={verifyCode} className="space-y-4">
      <p className="text-sm text-gray-600 mb-2">
        이메일로 전송된 인증 코드를 입력해주세요.
      </p>

      <div className="relative">
        <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          type="text"
          placeholder="인증 코드"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value)}
          className="pl-10"
          disabled={loading}
        />
      </div>

      <Button type="submit" className="w-full bg-blue-500" disabled={loading}>
        {loading ? "확인 중..." : "인증 확인"}
      </Button>

      <Button
        onClick={() => {
          setStep(2);
          setVerificationCode("");
          setError("");
          setSuccess("");
        }}
        variant="outline"
        className="w-full"
        disabled={loading}
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        뒤로 가기
      </Button>
    </form>
  );

  // 4단계: 비밀번호 표시 및 로그인 유도
  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="border p-4 rounded-md bg-gray-50 text-center">
        <p className="text-sm text-gray-500 mb-2">회원님의 비밀번호</p>
        <div className="font-bold text-lg">{password}</div>
      </div>

      <p className="text-sm text-gray-600">
        로그인 후 보안을 위해 비밀번호를 변경하시는 것을 권장합니다.
      </p>

      <Button
        onClick={() => navigate("/user/login")}
        className="w-full bg-blue-500"
      >
        로그인 페이지로 이동
      </Button>
    </div>
  );

  // 현재 단계에 따라 적절한 컴포넌트 렌더링
  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
      case 4:
        return renderStep4();
      default:
        return renderStep1();
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-4">
        <Card className="shadow-lg">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">
              비밀번호 찾기
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1 && "아이디를 입력하여 비밀번호를 찾으세요"}
              {step === 2 && "이메일 확인 및 인증코드 전송"}
              {step === 3 && "인증 코드 확인"}
              {step === 4 && "비밀번호 확인 완료"}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderCurrentStep()}</CardContent>
          {step === 1 && (
            <CardFooter className="flex flex-col">
              <div className="text-center w-full">
                <span className="text-sm text-gray-500">
                  로그인 페이지로 돌아가기
                </span>{" "}
                <a
                  href="#"
                  className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  onClick={(e) => {
                    e.preventDefault();
                    navigate("/user/login");
                  }}
                >
                  로그인
                </a>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

export default FindPassword;
