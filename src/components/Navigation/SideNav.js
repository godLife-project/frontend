// components/Navigation/SideNav.js
import React, { useState } from 'react'
import { Button } from "@/components/ui/button"
import { ChevronDown, Menu } from "lucide-react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { navItems } from './NavItems'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const MenuItem = ({ item }) => {
  const handleClick = (e) => {
    e.preventDefault();
    window.location.href = item.href;
  };

  if (item.submenu) {
    return (
      <Accordion type="single">
        <AccordionItem value={item.label} className="border-b">
          <AccordionTrigger className="py-2 hover:no-underline">
            {item.label}
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
      <AccordionItem value={item.label} className="border-b">
        <AccordionTrigger 
          className="py-2 hover:no-underline"
          hasSubmenu={false}  // 이 prop을 통해 chevron 숨김
          onClick={handleClick}
        >
          {item.label}
        </AccordionTrigger>
      </AccordionItem>
    </Accordion>
  )
}
const SideNav = () => {
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
                {navItems.map((item) => (
                  <li key={item.href}>
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