import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { ToastProvider } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import Layout from "./components/layout/Layout";
import TimedPopup from "./components/common/Popup/TimedPopup";
import Home from "./pages/Home/Home";
import Signup from "./pages/Auth/SignUp";
import Login from "./pages/Auth/Login";
import MyRoutineList from "./pages/Routine/MyRoutineList";
import RoutineDetailPage from "./pages/Routine/Detail";
import RoutineCreatePage from "./pages/Routine/Create";
import RoutineListPage from "./pages/Routine/List";
import SimpleChat from "./components/SimpleChat";
import SocketChat from "./components/SoketChat";
import NoticeListPage from "./pages/Notice/NoticeList";
import NoticeDetail from "./pages/Notice/NoticeDetail";
import NoticeCreateEdit from "./pages/Notice/NoticeCreateEdit";
import PopupManager from "./components/common/Popup/PopupManager";
import AdminDashboard from "./pages/ServiceAdmin/List";
import MyPage from "./pages/MyPage/MyPage";
import FAQListPage from "./pages/FAQ/FAQList";
import FAQWritePage from "./pages/FAQ/Write";
import FAQEditPage from "./pages/FAQ/Modify";
import ChallengDetailPage from "./pages/Challenge/Detail";
import ChallengeWritePage from "./pages/Challenge/Write";
import ChallengeForm from "./components/challenge";
import ChallengModifyPage from "./pages/Challenge/Modify";
import ChallengeListPage from "./pages/Challenge/List";
// 인증이 필요한 라우트를 위한 컴포넌트
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/user/login" replace />;
}

// 인증 상태에 따른 라우트를 관리하는 컴포넌트
function AppContent() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p>로딩 중...</p>
        </div>
      </div>
    );
  }

  return (
    <Layout>
      <PopupManager />
      <Routes>
        <Route path="/challenge" element={<ChallengeListPage />} />
        <Route path="/challenge/write" element={<ChallengeWritePage />} />
        <Route
          path="/challenge/modify/:challIdx"
          element={<ChallengModifyPage />}
        />
        <Route
          path="/challenge/list/:challIdx"
          element={<ChallengDetailPage />}
        />
        <Route
          path="/challenge/detail/:challIdx"
          element={<ChallengDetailPage />}
        />
        <Route path="/FAQ" element={<FAQListPage />} />
        <Route path="/FAQ/write" element={<FAQWritePage />} />
        <Route path="/FAQ/modify/:faqIdx" element={<FAQEditPage />} />
        <Route path="/user/MyPage" element={<MyPage />} />
        <Route path="adminBoard" element={<AdminDashboard />} />
        <Route path="/notice/detail/:noticeIdx" element={<NoticeDetail />} />
        <Route path="/notice/edit/:noticeIdx" element={<NoticeCreateEdit />} />
        <Route path="/notice/create" element={<NoticeCreateEdit />} />
        <Route path="/notice/list" element={<NoticeListPage />} />
        <Route path="/chat" element={<SocketChat />} />
        <Route path="/simplechat" element={<SimpleChat />} />
        <Route path="/routine/list" element={<RoutineListPage />} />
        <Route path="/routine/mylist" element={<MyRoutineList />} />
        <Route
          path="/routine/detail/:planIdx"
          element={<RoutineDetailPage />}
        />
        <Route
          path="/routine/create"
          element={
            isAuthenticated ? (
              <RoutineCreatePage />
            ) : (
              <Navigate to="/user/login" replace />
            )
          }
        />
        <Route path="/user/login" element={<Login />} />
        <Route path="/user/signup" element={<Signup />} />
        <Route path="/" element={<Home />} />
      </Routes>
    </Layout>
  );
}

// 최상위 앱 컴포넌트
function App() {
  return (
    <AuthProvider>
      <ToastProvider>
        <Router
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <AppContent />
          <Toaster />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
