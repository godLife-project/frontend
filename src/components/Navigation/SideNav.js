// components/Navigation/SideNav.js
import {React, useEffect, useState} from 'react';
import axiosInstance from '@/api/axiosInstance';
import { useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button"
import { Menu } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const MenuItem = ({ item }) => {
  const navigate = useNavigate();
  
  if (item.submenu) {
    return (
      <Accordion type="single" collapsible>
        <AccordionItem value={item.topName} className="border-b">
          <AccordionTrigger className="py-2 hover:no-underline">
            {item.topName}
          </AccordionTrigger>
          <AccordionContent>
            <div className="pl-4 space-y-2">
              {item.submenu.map((subItem) => (
                <Button
                  key={subItem.href}
                  variant="ghost"
                  className="w-full justify-start text-sm"
                >
                  {subItem.label}
                </Button>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    )
  }

  return (
    <Accordion type="single">
      <AccordionItem value={item.topName} className="border-b">
        <AccordionTrigger 
          className="py-2 hover:no-underline"
          hasSubmenu={false}  // 이 prop을 통해 chevron 숨김
          onClick={() => navigate(item.topAddr)}
        >
          {item.topName}
        </AccordionTrigger>
      </AccordionItem>
    </Accordion>
  )
}
const SideNav = () => {
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    axiosInstance.get("/categories/topMenu") // 스프링 부트에서 제공하는 API 호출
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  return (
    <div className="md:hidden fixed top-4 right-4 z-50">
      <Sheet>
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
                {categories.map((item, index) => (
                  <li key={item.topAddr}>
                    <MenuItem item={item} />
                  </li>
                ))}
              </ul>
            </nav>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}

export default SideNav
