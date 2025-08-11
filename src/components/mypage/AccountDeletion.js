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
import axiosInstance from "@/api/axiosInstance";

export default function AccountDeletion() {
  // useToast 훅 사용
  const { toast } = useToast();

  // localStorage에서 accessToken 가져오기
  const accessToken = localStorage.getItem("accessToken");

  // 회원탈퇴 확인 모달
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 회원탈퇴 관련 상태
  const [deletePassword, setDeletePassword] = useState("");
  const [deletePasswordError, setDeletePasswordError] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirmDialog, setShowDeleteConfirmDialog] = useState(false);

  // 회원탈퇴 처리
  const handleDeleteAccount = async () => {
    // 비밀번호 입력 확인
    if (!deletePassword) {
      setDeletePasswordError("비밀번호를 입력해주세요.");
      return;
    }

    setIsDeleting(true);
    setDeletePasswordError("");

    try {
      // 회원탈퇴 API 요청
      await axiosInstance.patch(
        "/myPage/auth/accountDeletion",
        {
          userPw: deletePassword,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          timeout: 5000, // 5초 타임아웃 설정
        }
      );

      toast({
        title: "회원탈퇴 완료",
        description: "계정이 성공적으로 삭제되었습니다.",
      });

      // 토스트 메시지가 보일 수 있도록 짧은 딜레이 후 리다이렉트
      setTimeout(() => {
        // 로그아웃 및 홈 페이지로 리다이렉트 처리
        localStorage.removeItem("accessToken");
        localStorage.removeItem("userInfo");

        // 리다이렉트 처리
        window.location.href = "/";
      }, 2000); // 2초 딜레이
    } catch (err) {
      console.error("회원탈퇴 중 오류 발생:", err);
      const errorMessage =
        err.response?.data?.message || "회원탈퇴 처리 중 문제가 발생했습니다.";

      setDeletePasswordError(errorMessage);

      toast({
        variant: "destructive",
        title: "회원탈퇴 실패",
        description: errorMessage,
      });
    } finally {
      setIsDeleting(false);
      setShowDeleteConfirmDialog(false); // 모달 닫기
    }
  };

  return (
    // 회원 탈퇴 버튼 - AlertDialog로 변경
    <div className="flex justify-end">
      <AlertDialog
        open={showDeleteConfirmDialog}
        onOpenChange={setShowDeleteConfirmDialog}
      >
        <AlertDialogTrigger asChild>
          <button className="text-sm text-red-500 hover:text-red-700">
            회원 탈퇴
          </button>
        </AlertDialogTrigger>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>정말 탈퇴하시겠습니까?</AlertDialogTitle>
            <AlertDialogDescription>
              이 작업은 되돌릴 수 없습니다. 본인 확인을 위해 비밀번호를
              입력해주세요.
            </AlertDialogDescription>
          </AlertDialogHeader>

          <div className="py-4">
            <Input
              type="password"
              placeholder="비밀번호를 입력하세요"
              value={deletePassword}
              onChange={(e) => setDeletePassword(e.target.value)}
              className={deletePasswordError ? "border-red-500" : ""}
            />
            {deletePasswordError && (
              <p className="text-sm text-red-500 mt-1">{deletePasswordError}</p>
            )}
          </div>

          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>취소</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteAccount}
              disabled={isDeleting}
              className="bg-red-500 hover:bg-red-600"
            >
              {isDeleting ? "처리 중..." : "탈퇴하기"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
