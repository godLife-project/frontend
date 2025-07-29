// FindPassword.js
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
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 서버에서 받은 데이터 관련 상태
  const [userEmail, setUserEmail] = useState("");
  const [password, setPassword] = useState("");

  // 에러 메시지, 로딩 상태 등
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  // 이메일 조회
  const checkUserEmail = async (e) => {
    e.preventDefault();
    console.log({ userEmail: userEmail });

    if (!userEmail.trim()) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "이메일을 입력해주세요.",
      });
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axiosInstance.post(
        "/verify/emails/send/just/verification-requests",
        { userEmail: userEmail }
      );

      console.log("인증메일 전송 서버 응답:", response); // 응답 구조 확인용

      // API 응답 구조에 맞게 수정
      if (response.status === 200) {
        // 성공 조건을 API 응답에 맞게 수정
        toast({
          title: "인증 메일 발송 완료",
          description: "입력하신 이메일로 인증코드가 발송되었습니다.",
        });
        // 바로 인증코드 입력 단계로 진행
        setStep(2);
      } else {
        toast({
          variant: "destructive",
          title: "오류",
          description: "이메일 발송에 실패했습니다.",
        });
      }
    } catch (error) {
      console.error("이메일 확인 중 오류 발생:", error);
      toast({
        variant: "destructive",
        title: "오류",
        description: "이메일 확인 중 오류가 발생했습니다. 다시 시도해주세요.",
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
      const response = await axiosInstance.post(
        `/verify/emails/just/verifications?code=${verificationCode}`,
        {
          userEmail: userEmail,
        }
      );
      console.log("코드인증 확인 서버 응답:", response); // 응답 구조 확인용
      if (response.data.verified) {
        // 인증 성공하면 비밀번호 변경 화면으로
        toast({
          title: "인증 성공",
          description: "새로운 비밀번호를 설정해주세요.",
        });
        // 단계 진행 비번 변경 화면으로
        setStep(3);
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

  // 비밀번호 변경
  const changePassword = async (e) => {
    e.preventDefault();

    if (!newPassword.trim()) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "새 비밀번호를 입력해주세요.",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "비밀번호가 일치하지 않습니다.",
      });
      return;
    }

    setLoading(true);
    setError("");

    try {
      // 비밀번호 변경 API 호출
      const response = await axiosInstance.patch(
        `/user/find/userPw/${userEmail}`,
        {
          userPw: newPassword,
          userPwConfirm: confirmPassword,
        }
      );

      if (response.status === 200) {
        toast({
          title: "비밀번호 변경 완료",
          description: "비밀번호가 성공적으로 변경되었습니다.",
        });
        // 로그인 페이지로 이동
        navigate("/user/login");
      } else {
        toast({
          variant: "destructive",
          title: "오류",
          description: "비밀번호 변경에 실패했습니다.",
        });
      }
    } catch (error) {
      console.error("비밀번호 변경 중 오류 발생:", error);
      toast({
        variant: "destructive",
        title: "오류",
        description: "비밀번호 변경 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 1단계: 이메일 입력
  const renderStep1 = () => (
    <form onSubmit={checkUserEmail} className="space-y-4">
      <div className="relative">
        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="이메일"
          value={userEmail}
          onChange={(e) => setUserEmail(e.target.value)}
          className="pl-10"
          disabled={loading}
          type="email"
        />
      </div>

      <Button type="submit" className="w-full bg-blue-500" disabled={loading}>
        {loading ? "처리 중..." : "다음"}
      </Button>

      <div className="mt-4 text-center text-sm">
        <a
          href="#"
          className="text-blue-600 hover:text-blue-800 font-medium"
          onClick={(e) => {
            e.preventDefault();
            navigate("/user/find_id");
          }}
        >
          아이디를 잊으셨나요?
        </a>
      </div>
    </form>
  );

  // 2단계: 인증 코드 입력
  const renderStep2 = () => (
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
          setStep(1);
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

  // 3단계: 새 비밀번호 설정
  const renderStep3 = () => (
    <form onSubmit={changePassword} className="space-y-4">
      <p className="text-sm text-gray-600 mb-2">
        새로운 비밀번호를 입력해주세요.
      </p>

      <div className="relative">
        <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          type="password"
          placeholder="새 비밀번호"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          className="pl-10"
          disabled={loading}
        />
      </div>

      <div className="relative">
        <Key className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          type="password"
          placeholder="새 비밀번호 확인"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          className="pl-10"
          disabled={loading}
        />
      </div>

      <Button type="submit" className="w-full bg-blue-500" disabled={loading}>
        {loading ? "변경 중..." : "비밀번호 변경"}
      </Button>

      <Button
        onClick={() => {
          setStep(2);
          setNewPassword("");
          setConfirmPassword("");
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

  // 현재 단계에 따라 적절한 컴포넌트 렌더링
  const renderCurrentStep = () => {
    switch (step) {
      case 1:
        return renderStep1();
      case 2:
        return renderStep2();
      case 3:
        return renderStep3();
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
              {step === 1 && "이메일을 입력하여 비밀번호를 찾으세요"}
              {step === 2 && "인증 코드 입력"}
              {step === 3 && "새 비밀번호 설정"}
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
                  className="text-blue-600 hover:text-blue-800 font-medium"
                  onClick={() => navigate("/user/login")}
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
