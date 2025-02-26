import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { ToastProvider } from "@/components/ui/use-toast";
import { Toaster } from "@/components/ui/toaster";
import Layout from "./components/layout/Layout";
import Home from "./pages/Home/Home";
import Signup from "./pages/Auth/SignUp";
import Login from "./pages/Auth/Login";

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
