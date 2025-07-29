import { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
import { Lock, Edit, Eye, EyeOff } from "lucide-react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import AccountDeletion from "./AccountDeletion";
import axiosInstance from "@/api/axiosInstance";

export default function PasswordSection() {
  // 비밀번호 관련 상태
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);
  const [passwordError, setPasswordError] = useState("");

  // 비밀번호 변경 대화상자 상태
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);

  const accessToken = localStorage.getItem("accessToken");
  const { toast } = useToast();

  // 비밀번호 저장 핸들러
  const handlePasswordSave = async () => {
    // 입력 유효성 검사
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError("모든 필드를 입력해주세요.");
      return;
    }

    // 비밀번호 일치 확인
    if (newPassword !== confirmPassword) {
      setPasswordError("새 비밀번호와 확인 비밀번호가 일치하지 않습니다.");
      return;
    }

    setPasswordError("");
    setIsUpdating(true);

    try {
      // 비밀번호 업데이트 요청
      await axiosInstance.patch(
        "/myPage/auth/security/change/password",
        {
          originalPw: currentPassword,
          userPw: newPassword,
          userPwConfirm: confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          timeout: 5000, // 5초 타임아웃 설정
        }
      );

      // 성공 메시지
      toast({
        title: "비밀번호가 업데이트되었습니다",
        description: "성공적으로 비밀번호가 변경되었습니다.",
      });

      // 입력 필드 초기화
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // 대화상자 닫기
      setShowPasswordDialog(false);
    } catch (err) {
      console.error("비밀번호 업데이트 중 오류 발생:", err);

      // 오류 메시지 처리
      const errorMessage =
        err.response?.data?.message ||
        "비밀번호를 업데이트하는 데 문제가 발생했습니다.";

      setPasswordError(errorMessage);
    } finally {
      setIsUpdating(false);
    }
  };

  // 대화상자 취소 핸들러
  const handleCancel = () => {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setShowPasswordDialog(false);
  };

  // 비밀번호 마스킹 함수
  const maskPassword = () => {
    return "••••••••";
  };

  return (
    <div className="rounded-2xl shadow-md bg-white overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-white">
        <h1 className="text-xl font-bold">보안 설정</h1>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          <div>
            {/* 비밀번호 필드 */}
            <div className="flex items-center p-4  text-left">
              <Lock className="text-indigo-500 mr-3" size={20} />
              <div className="flex-1">
                <div className="text-sm text-gray-500">비밀번호</div>
                <div className="flex items-center justify-between">
                  <span className="font-medium">{maskPassword()}</span>
                  <AlertDialog
                    open={showPasswordDialog}
                    onOpenChange={setShowPasswordDialog}
                  >
                    <AlertDialogTrigger asChild>
                      <button className="text-indigo-500 hover:text-indigo-700 flex items-center">
                        <Edit size={16} className="mr-1" />
                        <span className="text-sm">수정하기</span>
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>비밀번호 변경</AlertDialogTitle>
                        <AlertDialogDescription>
                          현재 비밀번호와 새로운 비밀번호를 입력해주세요.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <div className="py-4 space-y-4">
                        {/* 현재 비밀번호 */}
                        <div className="relative">
                          <Input
                            type={showCurrentPassword ? "text" : "password"}
                            placeholder="현재 비밀번호"
                            value={currentPassword}
                            onChange={(e) => setCurrentPassword(e.target.value)}
                            className={passwordError ? "border-red-500" : ""}
                          />
                          <button
                            onClick={() =>
                              setShowCurrentPassword(!showCurrentPassword)
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                            type="button"
                          >
                            {showCurrentPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>

                        {/* 새 비밀번호 */}
                        <div className="relative">
                          <Input
                            type={showNewPassword ? "text" : "password"}
                            placeholder="새 비밀번호"
                            value={newPassword}
                            onChange={(e) => setNewPassword(e.target.value)}
                          />
                          <button
                            onClick={() => setShowNewPassword(!showNewPassword)}
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                            type="button"
                          >
                            {showNewPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>

                        {/* 새 비밀번호 확인 */}
                        <div className="relative">
                          <Input
                            type={showConfirmPassword ? "text" : "password"}
                            placeholder="새 비밀번호 확인"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                          />
                          <button
                            onClick={() =>
                              setShowConfirmPassword(!showConfirmPassword)
                            }
                            className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500"
                            type="button"
                          >
                            {showConfirmPassword ? (
                              <EyeOff size={16} />
                            ) : (
                              <Eye size={16} />
                            )}
                          </button>
                        </div>

                        {passwordError && (
                          <p className="text-sm text-red-500 mt-1">
                            {passwordError}
                          </p>
                        )}
                      </div>

                      <AlertDialogFooter>
                        <AlertDialogCancel
                          onClick={handleCancel}
                          disabled={isUpdating}
                        >
                          취소
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handlePasswordSave}
                          disabled={isUpdating}
                          className="bg-indigo-500 hover:bg-indigo-600"
                        >
                          {isUpdating ? "처리 중..." : "변경하기"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="pt-6 self-end">
          <AccountDeletion />
        </div>
      </div>
    </div>
  );
}
