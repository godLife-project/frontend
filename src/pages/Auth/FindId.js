// FindId.js
import React, { useState } from "react";
import axiosInstance from "@/api/axiosInstance";
import { useNavigate } from "react-router-dom";
import { User, Mail, Eye, ArrowLeft, Key } from "lucide-react";

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

function FindId() {
  const navigate = useNavigate();
  const { toast } = useToast();

  // 사용자 입력 상태
  const [userName, setUserName] = useState("");
  const [userEmail, setUserEmail] = useState("");
  const [verificationCode, setVerificationCode] = useState("");

  // 서버에서 받은 데이터 관련 상태
  const [foundUserId, setFoundUserId] = useState("");
  const [isVerified, setIsVerified] = useState(false);

  // 상태 관리
  const [loading, setLoading] = useState(false);
  // 1: 이름/이메일 입력, 2: 마스킹 아이디 결과, 3: 이메일 인증, 4: 상세 아이디 결과
  const [step, setStep] = useState(1);

  // 이메일 인증 코드 요청 (상세 찾기 버튼 클릭 시)
  const requestVerificationCode = async () => {
    setLoading(true);

    try {
      const response = await axiosInstance.post(
        "/verify/emails/send/just/verification-requests",
        { userEmail: userEmail }
      );

      if (response.status === 200) {
        toast({
          title: "인증 메일 발송 완료",
          description: "입력하신 이메일로 인증코드가 발송되었습니다.",
        });
        setStep(3); // 인증 코드 입력 단계로 이동
      } else {
        toast({
          variant: "destructive",
          title: "오류",
          description: "이메일 발송에 실패했습니다.",
        });
      }
    } catch (error) {
      console.error("이메일 인증 요청 중 오류 발생:", error);
      toast({
        variant: "destructive",
        title: "오류",
        description:
          "이메일 인증 요청 중 오류가 발생했습니다. 다시 시도해주세요.",
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

    try {
      const response = await axiosInstance.post(
        `/verify/emails/just/verifications?code=${verificationCode}`,
        {
          userEmail: userEmail,
        }
      );

      if (response.status === 200) {
        toast({
          title: "인증 성공",
          description: "이메일 인증이 완료되었습니다.",
        });
        setIsVerified(true);
        // 인증 성공 후 바로 상세 아이디 찾기 진행
        findDetailedUserId();
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

  // 아이디 찾기 (마스킹 처리된 아이디)
  const findUserId = async (e) => {
    e.preventDefault();

    if (!userName.trim()) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "이름을 입력해주세요.",
      });
      return;
    }

    if (!userEmail.trim()) {
      toast({
        variant: "destructive",
        title: "오류",
        description: "이메일을 입력해주세요.",
      });
      return;
    }

    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `/user/find/userId?userName=${userName}&userEmail=${userEmail}`
      );

      console.log("서버 응답:", response);

      if (response.status === 200 && response.data) {
        setFoundUserId(response.data.message); // API 응답 구조에 맞게 조정 필요
        toast({
          title: "아이디 찾기 성공",
          description: "아이디를 찾았습니다.",
        });
        setStep(2); // 마스킹된 아이디 결과 화면으로 이동
      } else {
        toast({
          variant: "destructive",
          title: "오류",
          description: "일치하는 계정 정보가 없습니다.",
        });
      }
    } catch (error) {
      console.error("아이디 찾기 중 오류 발생:", error);
      toast({
        variant: "destructive",
        title: "오류",
        description: "아이디 찾기 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 아이디 상세 찾기 (마스킹 없는 아이디)
  const findDetailedUserId = async () => {
    setLoading(true);

    try {
      const response = await axiosInstance.get(
        `/user/find/userId/noMask?userName=${userName}&userEmail=${userEmail}`
      );

      console.log("상세 아이디 서버 응답:", response);

      if (response.status === 200 && response.data) {
        setFoundUserId(response.data.message); // API 응답 구조에 맞게 조정 필요
        toast({
          title: "아이디 상세 찾기 성공",
          description: "전체 아이디를 확인하였습니다.",
        });
        setStep(4); // 상세 아이디 결과 화면으로 이동
      } else {
        toast({
          variant: "destructive",
          title: "오류",
          description: "아이디 상세 정보를 가져오는데 실패했습니다.",
        });
      }
    } catch (error) {
      console.error("아이디 상세 찾기 중 오류 발생:", error);
      toast({
        variant: "destructive",
        title: "오류",
        description:
          "아이디 상세 찾기 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
    } finally {
      setLoading(false);
    }
  };

  // 1단계: 이름, 이메일 입력
  const renderStep1 = () => (
    <form onSubmit={findUserId} className="space-y-4">
      <div className="relative">
        <User className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
        <Input
          placeholder="이름"
          value={userName}
          onChange={(e) => setUserName(e.target.value)}
          className="pl-10"
          disabled={loading}
        />
      </div>

      <div className="relative">
        <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
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
        {loading ? "찾는 중..." : "아이디 찾기"}
      </Button>

      <div className="mt-4 text-center text-sm">
        <a
          href="#"
          className="text-blue-600 hover:text-blue-800 font-medium"
          onClick={(e) => {
            e.preventDefault();
            navigate("/user/find_password");
          }}
        >
          비밀번호를 잊으셨나요?
        </a>
      </div>
    </form>
  );

  // 2단계: 마스킹 아이디 표시
  const renderStep2 = () => (
    <div className="space-y-4">
      <div className="border p-4 rounded-md bg-gray-50 text-center">
        <p className="text-sm text-gray-500 mb-2">회원님의 아이디</p>
        <div className="font-bold text-lg flex items-center justify-center">
          <span className="mr-2">{foundUserId}</span>
        </div>
      </div>

      <p className="text-sm text-gray-600 text-center">
        아이디의 일부는 보안을 위해 가려져 있습니다.
      </p>

      <Button
        onClick={requestVerificationCode}
        className="w-full bg-blue-500"
        disabled={loading}
      >
        <Eye className="h-4 w-4 mr-2" />
        아이디 상세 찾기
      </Button>

      <div className="flex space-x-2 mt-4">
        <Button
          onClick={() => navigate("/user/login")}
          className="flex-1 bg-blue-500"
        >
          로그인
        </Button>
        <Button
          onClick={() => navigate("/user/find_password")}
          className="flex-1"
          variant="outline"
        >
          비밀번호 찾기
        </Button>
      </div>

      <Button
        onClick={() => {
          setStep(1);
          setFoundUserId("");
          setVerificationCode("");
          setIsVerified(false);
        }}
        variant="ghost"
        className="w-full mt-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        다시 찾기
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

  // 4단계: 상세 아이디 표시
  const renderStep4 = () => (
    <div className="space-y-4">
      <div className="border p-4 rounded-md bg-gray-50 text-center">
        <p className="text-sm text-gray-500 mb-2">회원님의 전체 아이디</p>
        <div className="font-bold text-lg flex items-center justify-center">
          <span className="mr-2">{foundUserId}</span>
        </div>
      </div>

      <div className="flex space-x-2">
        <Button
          onClick={() => navigate("/user/login")}
          className="flex-1 bg-blue-500"
        >
          로그인
        </Button>
        <Button
          onClick={() => navigate("/user/find-password")}
          className="flex-1"
          variant="outline"
        >
          비밀번호 찾기
        </Button>
      </div>

      <Button
        onClick={() => {
          setStep(1);
          setFoundUserId("");
          setVerificationCode("");
          setIsVerified(false);
        }}
        variant="ghost"
        className="w-full mt-2"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        다시 찾기
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
              아이디 찾기
            </CardTitle>
            <CardDescription className="text-center">
              {step === 1 && "이름과 이메일을 입력하여 아이디를 찾으세요"}
              {step === 2 && "아이디 확인"}
              {step === 3 && "인증 코드 입력"}
              {step === 4 && "전체 아이디 확인"}
            </CardDescription>
          </CardHeader>
          <CardContent>{renderCurrentStep()}</CardContent>
          {step === 1 && (
            <CardFooter className="flex flex-col">
              <div className="text-center w-full">
                <span className="text-sm text-gray-500">
                  로그인 페이지로 돌아가기
                </span>{" "}
                <Button
                  type="button"
                  className="text-blue-600 bg-transparent border-none hover:bg-transparent p-0 text-sm font-medium"
                  onClick={() => navigate("/user/login")}
                >
                  로그인
                </Button>
              </div>
            </CardFooter>
          )}
        </Card>
      </div>
    </div>
  );
}

export default FindId;
