// components/Navigation/SideNav.js
import { React, useEffect, useState } from "react";
import { useApi } from "../../hooks/useApi";

import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Menu } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const MenuItem = ({ item, onMenuClick }) => {
  const navigate = useNavigate();

  const handleClick = (addr) => {
    navigate(addr);
    onMenuClick(); // 메뉴 클릭 시 사이드메뉴 닫기
  };

  if (item.children && item.children.length > 0) {
    return (
      <Accordion type="single" collapsible>
        <AccordionItem value={item.name} className="border-b">
          <AccordionTrigger className="py-2 hover:no-underline">
            {item.name}
          </AccordionTrigger>
          <AccordionContent>
            <div className="pl-4 space-y-2">
              {item.children.map((subItem) => (
                <Button
                  key={subItem.topIdx}
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  onClick={() => handleClick(subItem.addr)}
                >
                  {subItem.name}
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    );
  }

  return (
    <Accordion type="single">
      <AccordionItem value={item.name} className="border-b">
        <AccordionTrigger
          className="py-2 hover:no-underline"
          hasSubmenu={false}
          onClick={() => handleClick(item.addr)}
        >
          {item.name}
        </AccordionTrigger>
      </AccordionItem>
    </Accordion>
  );
};

const SideNav = ({ categories }) => {
  const [isOpen, setIsOpen] = useState(false);

  // 권한 확인 함수 추가
  const getUserRole = () => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken || accessToken === "null") return "user";

    const userInfo = localStorage.getItem("userInfo");
    if (!userInfo) return "user";

    try {
      const parsedUserInfo = JSON.parse(userInfo);
      return parsedUserInfo.roleStatus === true ? "admin" : "user";
    } catch {
      return "user";
    }
  };

  const handleMenuClick = () => {
    setIsOpen(false);
  };

  const userRole = getUserRole(); // 권한 확인

  return (
    <div className="md:hidden fixed top-4 right-4 z-50">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <Button variant="outline" size="icon">
            <Menu className="h-5 w-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="p-0">
          <div className="flex flex-col h-full">
            <SheetHeader className="px-6 py-4 border-b">
              <SheetTitle>메뉴</SheetTitle>
            </SheetHeader>
            <nav className="flex-1 overflow-y-auto px-6 py-4">
              <ul className="space-y-3">
                {categories
                  .filter(
                    (item) =>
                      userRole === "admin" || item.addr !== "/adminBoard"
                  ) // 필터링 추가
                  .map((item) => (
                    <li key={item.topIdx}>
                      <MenuItem item={item} onMenuClick={handleMenuClick} />
                    </li>
                  ))}
              </ul>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default SideNav;
