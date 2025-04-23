import React, { useEffect, useState } from 'react';
import { Link } from "react-router-dom";
import axiosInstance from '../api/axiosInstance';

const TopNavbar = () => {
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    axiosInstance.get("/categories/topMenu") // 스프링 부트에서 제공하는 API 호출
      .then((response) => setCategories(response.data))
      .catch((error) => console.error("Error fetching categories:", error));
  }, []);

  return (
    <nav style={{
      padding: "10px",
      background: "#333",
      color: "white",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center"
    }}>
      {/* 왼쪽 메뉴 */}
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

      {/* 오른쪽 메뉴 */}
      <div>
        <Link to="/chat" style={{ marginRight: "15px", color: "white" }}>채팅</Link>
        <Link to="/qnaService" style={{ marginRight: "15px", color: "white" }}>문의서비스</Link>
        <Link to="/login" style={{ marginRight: "15px", color: "white" }}>로그인</Link>
        <Link to="/join" style={{ color: "white" }}>회원가입</Link>
      </div>
    </nav>
  );
};

export default TopNavbar;
