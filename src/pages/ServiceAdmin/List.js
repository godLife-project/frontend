import React, { useState, useEffect } from "react";
import {
  User,
  FileText,
  MessageSquare,
  CheckCircle,
  Menu,
  ChevronDown,
  ChevronRight,
  Shield,
  AlertTriangle,
  Users,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import CompSystem from "@/components/ServiceAdmin/compSystem/compSystem";
import FaqCategory from "@/components/ServiceAdmin/faqPage/faqCategory";
import ChallengeManager from "@/components/ServiceAdmin/contentsPage/ChallengeM";
import RoutineManager from "@/components/ServiceAdmin/contentsPage/RoutineM";
import UserManager from "./AdminUser";
import QnaAdminDashboard from "../QnA/QnADashboard";

const AdminDashboard = () => {
  const [menuCollapsed, setMenuCollapsed] = useState(false);
  const [activePage, setActivePage] = useState("컴포넌트 관리");
  const [contentMenuExpanded, setContentMenuExpanded] = useState(false);
  const [userMenuExpanded, setUserMenuExpanded] = useState(false);
  const location = useLocation();

  const toggleMenu = () => {
    setMenuCollapsed(!menuCollapsed);
  };

  const toggleContentMenu = () => {
    setContentMenuExpanded(!contentMenuExpanded);
  };

  const toggleUserMenu = () => {
    setUserMenuExpanded(!userMenuExpanded);
  };

  // URL 파라미터에 따라 활성 페이지 설정
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const tab = params.get("tab");

    if (tab === "faq") {
      setActivePage("FAQ 관리");
    } else if (tab === "challenge") {
      setActivePage("챌린지 관리");
      setContentMenuExpanded(true);
    } else if (tab === "routine") {
      setActivePage("추천 루틴관리");
      setContentMenuExpanded(true);
    } else if (tab === "user") {
      setActivePage("유저 관리");
      setUserMenuExpanded(true);
    } else if (tab === "report") {
      setActivePage("신고처리");
      setUserMenuExpanded(true);
    } else if (tab === "permission") {
      setActivePage("권한관리");
      setUserMenuExpanded(true);
    } else if (tab === "inquiry") {
      setActivePage("1:1 문의");
    } else if (tab === "component") {
      setActivePage("컴포넌트 관리");
    }
  }, [location.search]);

  // 풀페이지 컴포넌트인지 확인
  const isFullPageComponent =
    activePage === "챌린지 관리" ||
    activePage === "유저 관리" ||
    activePage === "신고처리" ||
    activePage === "권한관리";

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
            {/* 컨텐츠 관리 (하위메뉴 있음) */}
            <li>
              <button
                onClick={toggleContentMenu}
                className="w-full flex items-center p-4 space-x-3 text-left hover:bg-blue-700"
              >
                <CheckCircle size={20} />
                {!menuCollapsed && (
                  <>
                    <span>컨텐츠 관리</span>
                    <div className="ml-auto">
                      {contentMenuExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </div>
                  </>
                )}
              </button>

              {/* 컨텐츠 관리 하위 메뉴 */}
              {contentMenuExpanded && !menuCollapsed && (
                <ul>
                  <li
                    className={`hover:bg-blue-700 ${
                      activePage === "추천 루틴관리" ? "bg-blue-700" : ""
                    }`}
                  >
                    <button
                      onClick={() => setActivePage("추천 루틴관리")}
                      className="w-full flex items-center p-3 pl-12 text-left text-sm"
                    >
                      <span>추천 루틴관리</span>
                    </button>
                  </li>
                  <li
                    className={`hover:bg-blue-700 ${
                      activePage === "챌린지 관리" ? "bg-blue-700" : ""
                    }`}
                  >
                    <button
                      onClick={() => setActivePage("챌린지 관리")}
                      className="w-full flex items-center p-3 pl-12 text-left text-sm"
                    >
                      <span>챌린지 관리</span>
                    </button>
                  </li>
                </ul>
              )}
            </li>

            {/* 컴포넌트 관리 */}
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

            {/* 유저 관리 (하위메뉴 있음) */}
            <li>
              <button
                onClick={toggleUserMenu}
                className="w-full flex items-center p-4 space-x-3 text-left hover:bg-blue-700"
              >
                <User size={20} />
                {!menuCollapsed && (
                  <>
                    <span>유저 관리</span>
                    <div className="ml-auto">
                      {userMenuExpanded ? (
                        <ChevronDown size={16} />
                      ) : (
                        <ChevronRight size={16} />
                      )}
                    </div>
                  </>
                )}
              </button>

              {/* 유저 관리 하위 메뉴 */}
              {userMenuExpanded && !menuCollapsed && (
                <ul>
                  <li
                    className={`hover:bg-blue-700 ${
                      activePage === "유저 관리" ? "bg-blue-700" : ""
                    }`}
                  >
                    <button
                      onClick={() => setActivePage("유저 관리")}
                      className="w-full flex items-center p-3 pl-12 text-left text-sm"
                    >
                      <span>유저 관리</span>
                    </button>
                  </li>
                  <li
                    className={`hover:bg-blue-700 ${
                      activePage === "신고처리" ? "bg-blue-700" : ""
                    }`}
                  >
                    <button
                      onClick={() => setActivePage("신고처리")}
                      className="w-full flex items-center p-3 pl-12 text-left text-sm"
                    >
                      <span>신고처리</span>
                    </button>
                  </li>
                  <li
                    className={`hover:bg-blue-700 ${
                      activePage === "권한관리" ? "bg-blue-700" : ""
                    }`}
                  >
                    <button
                      onClick={() => setActivePage("권한관리")}
                      className="w-full flex items-center p-3 pl-12 text-left text-sm"
                    >
                      <span>권한관리</span>
                    </button>
                  </li>
                </ul>
              )}
            </li>

            {/* FAQ 관리 */}
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

            {/* 1:1 문의 */}
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
      <div className="flex-1 overflow-auto flex flex-col">
        {/* 풀페이지 컴포넌트가 아닐 때만 헤더 표시 */}
        {!isFullPageComponent && (
          <header className="bg-white p-5 shadow flex justify-between items-center">
            <h1 className="text-xl font-semibold">{activePage}</h1>
          </header>
        )}

        {/* 메인 컨텐츠 - 풀페이지 컴포넌트일 때는 패딩 제거 */}
        <main className={`flex-1  ${isFullPageComponent ? "" : "p-6"}`}>
          {/* 컴포넌트 관리 페이지 */}
          {activePage === "컴포넌트 관리" && <CompSystem />}

          {activePage === "추천 루틴관리" && <RoutineManager />}

          {activePage === "챌린지 관리" && <ChallengeManager />}

          {/* 유저 관리 관련 페이지들 */}
          {(activePage === "유저 관리" ||
            activePage === "신고처리" ||
            activePage === "권한관리") && (
            <UserManager initialTab={activePage} />
          )}

          {activePage === "FAQ 관리" && <FaqCategory />}

          {activePage === "1:1 문의" && <QnaAdminDashboard />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;
