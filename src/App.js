// import React from "react";
// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Navigate,
// } from "react-router-dom";
// import { AuthProvider, useAuth } from "./context/AuthContext";
// import { ToastProvider } from "@/components/ui/use-toast";
// import { Toaster } from "@/components/ui/toaster";
// import Layout from "./components/layout/Layout";
// import PopupManager from "./components/common/Popup/PopupManager";

// // 공통 페이지
// import Home from "./pages/Home/Home";
// import Signup from "./pages/Auth/SignUp";
// import Login from "./pages/Auth/Login";
// import FindPassword from "./pages/Auth/FindPassword";
// import FindId from "./pages/Auth/FindId";
// import MyPage from "./pages/MyPage/MyPage";

// // 루틴
// import MyRoutineList from "./pages/Routine/MyRoutineList";
// import RoutineDetailPage from "./pages/Routine/Detail";
// import RoutineCreatePage from "./pages/Routine/Create";
// import RoutineListPage from "./pages/Routine/List";

// // 채팅
// import SimpleChat from "./components/SimpleChat";
// import SocketChat from "./components/SoketChat";

// // 공지사항
// import NoticeListPage from "./pages/Notice/NoticeList";
// import NoticeDetail from "./pages/Notice/NoticeDetail";
// import NoticeCreateEdit from "./pages/Notice/NoticeCreateEdit";

// // QnA
// import QnaAdminDashboard from "./pages/QnA/QnADashboard";
// import QnACreate from "./pages/QnA/QnACreate";
// import QnAList from "./components/QnA/QnaList";
// import QnADetail from "./components/QnA/QnaDetail";
// import QnAEdit from "./components/QnA/QnAEdit";
// import ChatRoom from "./pages/QnA/QnaSubscriber";

// // 챌린지
// import ChallengeListPage from "./pages/Challenge/List";
// import ChallengeWritePage from "./pages/Challenge/Write";
// import ChallengDetailPage from "./pages/Challenge/Detail";
// import ChallengModifyPage from "./pages/Challenge/Modify";

// // FAQ
// import FAQListPage from "./pages/FAQ/FAQList";
// import FAQWritePage from "./pages/FAQ/Write";
// import FAQEditPage from "./pages/FAQ/Modify";

// // 관리자
// import AdminDashboard from "./pages/ServiceAdmin/List";

// // 인증 보호 라우트
// function ProtectedRoute({ children }) {
//   const { isAuthenticated } = useAuth();
//   return isAuthenticated ? children : <Navigate to="/user/login" replace />;
// }

// function AppContent() {
//   const { isAuthenticated, loading } = useAuth();

//   if (loading) {
//     return (
//       <div className="flex items-center justify-center h-screen">
//         <div className="text-center">
//           <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
//           <p>로딩 중...</p>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <Layout>
//       <PopupManager />
//       <Routes>
//         {/* QnA */}
//         <Route path="/qna/edit/:qnaIdx" element={<QnAEdit />} />
//         <Route path="/qna/detail/:qnaIdx" element={<QnADetail />} />
//         <Route path="/qna/list" element={<QnAList />} />
//         <Route path="/qna/create" element={<QnACreate />} />
//         <Route path="/qna" element={<QnaAdminDashboard />} />
//         <Route path="/qna2" element={<ChatRoom />} />

//         {/* Challenge */}
//         <Route path="/challenge" element={<ChallengeListPage />} />
//         <Route path="/challenge/write" element={<ChallengeWritePage />} />
//         <Route
//           path="/challenge/modify/:challIdx"
//           element={<ChallengModifyPage />}
//         />
//         {/* <Route
//           path="/challenge/list/:challIdx"
//           element={<ChallengDetailPage />}
//         /> */}
//         <Route
//           path="/challenge/detail/:challIdx"
//           element={<ChallengDetailPage />}
//         />

//         {/* FAQ */}
//         <Route path="/FAQ" element={<FAQListPage />} />
//         <Route path="/FAQ/write" element={<FAQWritePage />} />
//         <Route path="/FAQ/modify/:faqIdx" element={<FAQEditPage />} />

//         {/* Notice */}
//         <Route path="/notice/detail/:noticeIdx" element={<NoticeDetail />} />
//         <Route path="/notice/edit/:noticeIdx" element={<NoticeCreateEdit />} />
//         <Route path="/notice/create" element={<NoticeCreateEdit />} />
//         <Route path="/notice/list" element={<NoticeListPage />} />

//         {/* Routine */}
//         <Route path="/routine/list" element={<RoutineListPage />} />
//         <Route path="/routine/mylist" element={<MyRoutineList />} />
//         <Route
//           path="/routine/detail/:planIdx"
//           element={<RoutineDetailPage />}
//         />
//         <Route
//           path="/routine/create"
//           element={
//             isAuthenticated ? (
//               <RoutineCreatePage />
//             ) : (
//               <Navigate to="/user/login" replace />
//             )
//           }
//         />

//         {/* Chat */}
//         <Route path="/chat" element={<SocketChat />} />
//         <Route path="/simplechat" element={<SimpleChat />} />

//         {/* User */}
//         <Route path="/user/login" element={<Login />} />
//         <Route path="/user/signup" element={<Signup />} />
//         <Route path="/user/find_id" element={<FindId />} />
//         <Route path="/user/find_password" element={<FindPassword />} />
//         <Route path="/user/MyPage" element={<MyPage />} />

//         {/* Admin */}
//         <Route path="/adminBoard" element={<AdminDashboard />} />

//         {/* Home */}
//         <Route path="/" element={<Home />} />
//       </Routes>
//     </Layout>
//   );
// }

// function App() {
//   return (
//     <AuthProvider>
//       <ToastProvider>
//         <Router
//           future={{
//             v7_startTransition: true,
//             v7_relativeSplatPath: true,
//           }}
//         >
//           <AppContent />
//           <Toaster />
//         </Router>
//       </ToastProvider>
//     </AuthProvider>
//   );
// }

// export default App;

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
import PopupManager from "./components/common/Popup/PopupManager";

// 공통 페이지
import Home from "./pages/Home/Home";
import Signup from "./pages/Auth/SignUp";
import Login from "./pages/Auth/Login";
import FindPassword from "./pages/Auth/FindPassword";
import FindId from "./pages/Auth/FindId";
import MyPage from "./pages/MyPage/MyPage";

// 루틴
import MyRoutineList from "./pages/Routine/MyRoutineList";
import RoutineDetailPage from "./pages/Routine/Detail";
import RoutineCreatePage from "./pages/Routine/Create";
import RoutineListPage from "./pages/Routine/List";

// 채팅
import SimpleChat from "./components/SimpleChat";
import SocketChat from "./components/SoketChat";

// 공지사항
import NoticeListPage from "./pages/Notice/NoticeList";
import NoticeDetail from "./pages/Notice/NoticeDetail";
import NoticeCreateEdit from "./pages/Notice/NoticeCreateEdit";

// QnA
import QnaAdminDashboard from "./pages/QnA/QnADashboard";
import QnACreate from "./pages/QnA/QnACreate";
import QnAList from "./components/QnA/QnaList";
import QnADetail from "./components/QnA/QnaDetail";
import QnAEdit from "./components/QnA/QnAEdit";
import ChatRoom from "./pages/QnA/QnaSubscriber";

// 챌린지
import ChallengeListPage from "./pages/Challenge/List";
import ChallengeWritePage from "./pages/Challenge/Write";
import ChallengDetailPage from "./pages/Challenge/Detail";
import ChallengModifyPage from "./pages/Challenge/Modify";

// FAQ
import FAQListPage from "./pages/FAQ/FAQList";
import FAQWritePage from "./pages/FAQ/Write";
import FAQEditPage from "./pages/FAQ/Modify";

// 관리자
import AdminDashboard from "./pages/ServiceAdmin/List";

// 인증 보호 라우트
function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? children : <Navigate to="/user/login" replace />;
}

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
    <>
      <PopupManager />
      <Routes>
        {/* 관리자 페이지 - Layout 없이 렌더링 */}
        <Route path="/adminBoard" element={<AdminDashboard />} />

        {/* 나머지 페이지들 - Layout으로 감싸서 렌더링 */}
        <Route
          path="/*"
          element={
            <Layout>
              <Routes>
                {/* QnA */}
                <Route path="/qna/edit/:qnaIdx" element={<QnAEdit />} />
                <Route path="/qna/detail/:qnaIdx" element={<QnADetail />} />
                <Route path="/qna/list" element={<QnAList />} />
                <Route path="/qna/create" element={<QnACreate />} />
                <Route path="/qna" element={<QnaAdminDashboard />} />
                <Route path="/qna2" element={<ChatRoom />} />

                {/* Challenge */}
                <Route path="/challenge" element={<ChallengeListPage />} />
                <Route
                  path="/challenge/write"
                  element={<ChallengeWritePage />}
                />
                <Route
                  path="/challenge/modify/:challIdx"
                  element={<ChallengModifyPage />}
                />
                <Route
                  path="/challenge/detail/:challIdx"
                  element={<ChallengDetailPage />}
                />

                {/* FAQ */}
                <Route path="/FAQ" element={<FAQListPage />} />
                <Route path="/FAQ/write" element={<FAQWritePage />} />
                <Route path="/FAQ/modify/:faqIdx" element={<FAQEditPage />} />

                {/* Notice */}
                <Route
                  path="/notice/detail/:noticeIdx"
                  element={<NoticeDetail />}
                />
                <Route
                  path="/notice/edit/:noticeIdx"
                  element={<NoticeCreateEdit />}
                />
                <Route path="/notice/create" element={<NoticeCreateEdit />} />
                <Route path="/notice/list" element={<NoticeListPage />} />

                {/* Routine */}
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

                {/* Chat */}
                <Route path="/chat" element={<SocketChat />} />
                <Route path="/simplechat" element={<SimpleChat />} />

                {/* User */}
                <Route path="/user/login" element={<Login />} />
                <Route path="/user/signup" element={<Signup />} />
                <Route path="/user/find_id" element={<FindId />} />
                <Route path="/user/find_password" element={<FindPassword />} />
                <Route path="/user/MyPage" element={<MyPage />} />

                {/* Home */}
                <Route path="/" element={<Home />} />
              </Routes>
            </Layout>
          }
        />
      </Routes>
    </>
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
          <AppContent />
          <Toaster />
        </Router>
      </ToastProvider>
    </AuthProvider>
  );
}

export default App;
