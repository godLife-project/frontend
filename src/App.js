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
import Home from "./pages/Home/Home";
import Signup from "./pages/Auth/SignUp";
import Login from "./pages/Auth/Login";
import RoutineCreator from "./pages/Routine/Create";
import RoutineListPage from "./pages/Routine/List";
import RoutineDetailPage from "./pages/Routine/Detail";
import ChallengDetailPage from "./pages/Challenge/Detail";
import ChallengeWritePage from "./pages/Challenge/Write";
import ChallengeForm from "./components/challenge";
import ProtectedRoute from "./components/ProtectedRoute";
import ChallengModifyPage from "./pages/Challenge/Modify";
import ChallengeListPage from "./pages/Challenge/List";
import FAQListPage from "./pages/FAQ/FAQList";

// 인증이 필요한 라우트를 위한 컴포넌트
function AppRoutes() {
  const { isAuthenticated, loading } = useAuth();

  // 로딩 중인 경우 로딩 표시
  if (loading) {
    return <div>로딩 중...</div>;
  }

  console.log("현재 인증 상태:", isAuthenticated);

  return (
    <Routes>
      <Route path="/routine/detail/:planIdx" element={<RoutineDetailPage />} />
      <Route
        path="/routine/create"
        element={
          isAuthenticated ? (
            <RoutineCreator />
          ) : (
            <Navigate to="/user/login" replace />
          )
        }
      />
      <Route path="/user/login" element={<Login />} />
      <Route path="/user/signup" element={<Signup />} />
      <Route path="/" element={<Home />} />
    </Routes>
  );
}

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
          <Layout>
            <Routes>
              <Route path="/user/login" element={<Login />} />
              <Route path="/user/signup" element={<Signup />} />
              <Route
                path="/challenges/write"
                element={
                  <ProtectedRoute>
                    <ChallengeWritePage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/challenges/detail/:challIdx"
                element={
                  <ProtectedRoute>
                    <ChallengDetailPage />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/challenges/modify/:challIdx"
                element={<ChallengModifyPage />}
              />
              <Route path="/challenges/list" element={<ChallengeListPage />} />
              <Route
                path="/challenges/list/:challIdx"
                element={<ChallengDetailPage />}
              />
              <Route path="/FAQ" element={<FAQListPage />} />
              <Route path="/" element={<Home />} />
            </Routes>
          </Layout>
          <Toaster />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
