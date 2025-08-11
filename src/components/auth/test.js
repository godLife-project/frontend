import { useState } from "react";
import { Button } from "@/components/ui/button";
import axiosInstance from "@/api/axiosInstance";
import { useNavigate } from "react-router-dom";
const ApiTestButton = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const testApiCall = async () => {
    setLoading(true);
    try {
      const testData = {
        userId: "testUser",
        userPw: "testPassword123",
        userPwConfirm: "testPassword123",
        userName: "Test User",
        userNick: "Tester",
        userEmail: "test@example.com",
        userGender: "1",
        jobIdx: "developer",
        userBirth: "1990-01-01",
      };

      console.log("📡 API 요청 데이터:", testData);

      const response = await axiosInstance.post("/user/join", testData);

      console.log("✅ API 응답:", response.data);
      alert("API 요청 성공: " + JSON.stringify(response.data));
      if (response.data.success) {
        alert("회원가입 성공!");
      } else {
        alert("회원가입 실패: " + response.data.message);
      }
    } catch (error) {
      console.error("❌ API 요청 실패:", error);
      navigate("/login");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center">
      <Button
        className="bg-red-500 text-white px-4 py-2 rounded"
        onClick={testApiCall}
        disabled={loading}
      >
        {loading ? "테스트 중..." : "API 테스트 호출"}
      </Button>
    </div>
  );
};

export default ApiTestButton;
