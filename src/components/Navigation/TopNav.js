import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";
import { ChevronDown } from "lucide-react";
import { Bell } from "lucide-react";
import { UserNav } from "./UserNav";

const NavItem = ({ item }) => {
  const navigate = useNavigate();

  if (item.children && item.children.length > 0) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="flex items-center gap-1">
            {item.name}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="bg-white">
          {item.children.map((subItem) => (
            <DropdownMenuItem
              key={subItem.topIdx}
              onClick={() => navigate(subItem.addr)}
            >
              {subItem.name}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button
      variant="ghost"
      className="font-medium"
      onClick={() => navigate(item.addr)}
    >
      {item.name}
    </Button>
  );
};

const TopNav = ({ categories }) => {
  return (
    <div className="h-16 items-center px-4 flex">
      {/* 로고 - 모든 화면에서 보임 */}
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">
          <span className="text-white font-semibold">G</span>
        </div>
        <span className="font-semibold text-lg">GodLife</span>
      </div>

      {/* 데스크톱 네비게이션 - 데스크톱에서만 보임 */}
      <nav className="hidden md:flex flex-1 ml-8">
        <ul className="flex items-center gap-6">
          {categories.map((item) => (
            <li key={item.topIdx}>
              <NavItem item={item} />
            </li>
          ))}
        </ul>
      </nav>

      {/* 액션 버튼 - 모든 화면에서 보임 */}
      <div className="flex items-center gap-2 ml-auto mr-14 md:mr-0 ">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <UserNav />
      </div>
    </div>
  );
};

export default TopNav;
