import React, { useState } from "react";
import { User, FileText, MessageSquare, CheckCircle, Menu } from "lucide-react";
import CompSystem from "@/components/ServiceAdmin/compSystem/compSystem";
import FaqCategory from "@/components/ServiceAdmin/faqPage/faqCategory";
const AdminDashboard = () => {
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [activePage, setActivePage] = useState("컴포넌트 관리");

  const toggleMenu = () => {
    setMenuCollapsed(!menuCollapsed);
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* 왼쪽 사이드바 */}
      <div
        className={`bg-blue-600 text-white ${
          menuCollapsed ? "w-16" : "w-64"
        } transition-all duration-300 flex flex-col`}
      >
        <div className="p-4 flex items-center justify-between border-b border-blue-500">
          {!menuCollapsed && (
            <span className="text-lg font-semibold">관리자 페이지</span>
          )}
          <button
            onClick={toggleMenu}
            className="p-2 rounded-md hover:bg-blue-700"
          >
            <Menu size={20} />
          </button>
        </div>

        <nav className="flex-1">
          <ul>
            <li
              className={`hover:bg-blue-700 ${
                activePage === "챌린지 관리" ? "bg-blue-700" : ""
              }`}
            >
              <button
                onClick={() => setActivePage("챌린지 관리")}
                className="w-full flex items-center p-4 space-x-3 text-left"
              >
                <CheckCircle size={20} />
                {!menuCollapsed && <span>챌린지 관리</span>}
              </button>
            </li>
            <li
              className={`hover:bg-blue-700 ${
                activePage === "컴포넌트 관리" ? "bg-blue-700" : ""
              }`}
            >
              <button
                onClick={() => setActivePage("컴포넌트 관리")}
                className="w-full flex items-center p-4 space-x-3 text-left"
              >
                <FileText size={20} />
                {!menuCollapsed && <span>컴포넌트 관리</span>}
              </button>
            </li>
            <li
              className={`hover:bg-blue-700 ${
                activePage === "유저 관리" ? "bg-blue-700" : ""
              }`}
            >
              <button
                onClick={() => setActivePage("유저 관리")}
                className="w-full flex items-center p-4 space-x-3 text-left"
              >
                <User size={20} />
                {!menuCollapsed && <span>유저 관리</span>}
              </button>
            </li>
            <li
              className={`hover:bg-blue-700 ${
                activePage === "FAQ 관리" ? "bg-blue-700" : ""
              }`}
            >
              <button
                onClick={() => setActivePage("FAQ 관리")}
                className="w-full flex items-center p-4 space-x-3 text-left"
              >
                <FileText size={20} />
                {!menuCollapsed && <span>FAQ 관리</span>}
              </button>
            </li>
            <li
              className={`hover:bg-blue-700 ${
                activePage === "1:1 문의" ? "bg-blue-700" : ""
              }`}
            >
              <button
                onClick={() => setActivePage("1:1 문의")}
                className="w-full flex items-center p-4 space-x-3 text-left"
              >
                <MessageSquare size={20} />
                {!menuCollapsed && <span>1:1 문의</span>}
              </button>
            </li>
          </ul>
        </nav>
      </div>
      {/* 메인 콘텐츠 영역 */}
      <div className="flex-1 overflow-auto">
        <header className="bg-white p-4 shadow flex justify-between items-center">
          <h1 className="text-xl font-semibold">{activePage}</h1>
        </header>

        <main className="p-6">
          {/* 컴포넌트 관리 페이지 */}
          {activePage === "컴포넌트 관리" && <CompSystem />}

          {activePage === "챌린지 관리" && (
            <div className="bg-white p-6 rounded-md shadow">
              <h2 className="text-xl font-semibold mb-4">챌린지 관리</h2>
              <p className="mb-4">
                여기에 챌린지 관리 관련 컨텐츠가 표시됩니다.
              </p>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
                새 챌린지 추가
              </button>
            </div>
          )}

          {activePage === "유저 관리" && (
            <div className="bg-white p-6 rounded-md shadow">
              <h2 className="text-xl font-semibold mb-4">유저 관리</h2>
              <p className="mb-4">여기에 유저 관리 관련 컨텐츠가 표시됩니다.</p>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
                새 유저 추가
              </button>
            </div>
          )}

          {activePage === "FAQ 관리" && <FaqCategory />}

          {activePage === "1:1 문의" && (
            <div className="bg-white p-6 rounded-md shadow">
              <h2 className="text-xl font-semibold mb-4">1:1 문의</h2>
              <p className="mb-4">여기에 1:1 문의 관련 컨텐츠가 표시됩니다.</p>
              <button className="px-4 py-2 bg-blue-500 text-white rounded-md">
                문의 답변하기
              </button>
            </div>
          )}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
