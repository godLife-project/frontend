import React from "react";
import { User, LogOut, Settings, Bell } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { useToast } from "@/components/ui/use-toast";

export function UserNav() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  // 로그인 여부에 따라 다른 UI 표시
  if (!isAuthenticated) {
    return (
      <Button size="sm" onClick={() => navigate("/user/login")}>
        로그인
      </Button>
    );
  }

  // 사용자 이니셜 생성 (아바타 표시용)
  const getInitials = () => {
    if (!user || !user.userNick) return "U";
    return user.userNick.charAt(0).toUpperCase();
  };

  // 로그아웃 처리 함수
  const handleLogout = () => {
    // 로그아웃 함수 호출
    logout();

    // 성공 메시지 표시
    toast({
      title: "로그아웃 성공",
      description: "성공적으로 로그아웃되었습니다.",
      duration: 3000,
    });

    // 로그인 페이지로 리다이렉트
    navigate("/user/login");
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="rounded-full">
          <Avatar className="h-8 w-8">
            <AvatarFallback>{getInitials()}</AvatarFallback>
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">
              {user?.userNick || "사용자"}
            </p>
            <p className="text-xs leading-none text-muted-foreground">
              {user?.email || `@${user?.nickTag || "user"}`}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => navigate("/user/profile/settings")}>
          <Settings className="mr-2 h-4 w-4" />
          <span>프로필 설정</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => navigate("/user/profile/notifications")}
        >
          <Bell className="mr-2 h-4 w-4" />
          <span>알림 설정</span>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>로그아웃</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
