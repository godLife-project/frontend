// import React from "react";
// import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
// import { AuthProvider } from "./context/AuthContext";
// import { ToastProvider } from "@/components/ui/use-toast";
// import { Toaster } from "@/components/ui/toaster";
// import Layout from "./components/layout/Layout";
// import Home from "./pages/Home/Home";
// import Signup from "./pages/Auth/SignUp";
// import Login from "./pages/Auth/Login";
// import ChallengeWritePage from "./pages/Challenge/Write";
// // import RoutineCreator from "./pages/Routine/Create";
// // import RoutineCreator2 from "./pages/Routine/Create copy 2";
// // import RoutineCreatePage from "./pages/Routine/create copy";

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
//           <Layout>
//             <Routes>
//               {/* <Route path="/routine/create3" element={<RoutineCreatePage />} />
//               <Route path="/routine/create2" element={<RoutineCreator2 />} />
//               <Route path="/routine/create" element={<RoutineCreator />} /> */}
//               <Route path="/challenge/write" element={<ChallengeWritePage />} />
//               <Route path="/user/login" element={<Login />} />
//               <Route path="/user/signup" element={<Signup />} />
//               <Route path="/" element={<Home />} />
//             </Routes>
//           </Layout>
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
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home/Home";
import Signup from "./pages/Auth/SignUp";
import Login from "./pages/Auth/Login";
import ChallengeWritePage from "./pages/Challenge/Write";

// Protected route component
const ProtectedRoute = ({ children }) => {
  const isAuthenticated = !!localStorage.getItem("accessToken");

  if (!isAuthenticated) {
    // Redirect to login if not authenticated
    return <Navigate to="/user/login" replace />;
  }

  return children;
};

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
                path="/challenge/write"
                element={
                  <ProtectedRoute>
                    <ChallengeWritePage />
                  </ProtectedRoute>
                }
              />
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
