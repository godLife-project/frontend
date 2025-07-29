import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from "react-router-dom"; // ✅ useNavigate 추가
import axiosInstance from '../api/axiosInstance';

const TopNavbar = () => {
  const [categories, setCategories] = useState([]);
  const navigate = useNavigate(); // ✅ 페이지 이동용

  useEffect(() => {
    axiosInstance.get("/categories/topMenu")
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  // ✅ 로그아웃 처리 함수
  const handleLogout = async () => {
    try {
      const response = await axiosInstance.post("/user/logout", null, {
        withCredentials: true, // ✅ 쿠키 포함
      });

      if (response.status === 200) {
        localStorage.removeItem("accessToken"); // ✅ accessToken 제거
        localStorage.removeItem("userName");
        localStorage.removeItem("userNick");
        localStorage.removeItem("nickTag");
        alert("로그아웃되었습니다.");
        navigate("/login"); // ✅ 로그인 페이지로 이동
      }
    } catch (error) {
      console.error("로그아웃 실패:", error);
      alert("로그아웃 중 오류가 발생했습니다.");
    }
  };

  return (
    <nav style={{
      padding: "10px",
      background: "#333",
      color: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      <div>
        <Link to="/" style={{ marginRight: "15px", color: "white" }}>Main</Link>
        {categories.map((category) => (
          <Link
            key={category.topIdx}
            to={category.topAddr}
            style={{ marginRight: "15px", color: "white" }}
          >
            {category.topName}
          </Link>
        ))}
      </div>

      <div>
        <Link to="/chat" style={{ marginRight: "15px", color: "white" }}>채팅</Link>
        <Link to="/qnaService" style={{ marginRight: "15px", color: "white" }}>문의서비스</Link>
        <Link to="/login" style={{ marginRight: "15px", color: "white" }}>로그인</Link>
        <Link to="/join" style={{ marginRight: "15px", color: "white" }}>회원가입</Link>

        {/* ✅ 로그아웃 버튼 */}
        <button onClick={handleLogout} style={{ background: "transparent", color: "white", border: "none", cursor: "pointer" }}>
          로그아웃
        </button>
      </div>
    </nav>
  );
};

export default TopNavbar;
