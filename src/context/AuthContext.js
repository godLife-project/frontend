import { createContext, useState, useEffect, useContext } from "react";

// Context 생성
export const AuthContext = createContext(null);

// Provider 컴포넌트 생성
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 앱 로드 시 로컬 스토리지에서 사용자 정보 확인
  useEffect(() => {
    const checkAuth = () => {
      try {
        // 로컬 스토리지 확인
        const accessToken = localStorage.getItem("accessToken");
        const userInfo = localStorage.getItem("userInfo");

        console.log("로컬 스토리지 확인:", { accessToken, userInfo });

        if (accessToken && userInfo) {
          const parsedUser = JSON.parse(userInfo);
          setUser(parsedUser);
          setIsAuthenticated(true); // roleStatus와 상관없이 토큰이 있으면 인증된 것으로 간주
          console.log("인증 완료:", parsedUser);
        }
      } catch (error) {
        console.error("인증 확인 중 오류 발생:", error);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // 로그인 함수
  const login = (userData, tokens = { accessToken: "default-token" }) => {
    console.log("로그인 함수 호출됨:", userData, tokens);

    const { accessToken, refreshToken } = tokens;

    // 토큰 저장
    localStorage.setItem("accessToken", accessToken);
    if (refreshToken) {
      localStorage.setItem("refreshToken", refreshToken);
    }

    // 사용자 정보 저장
    localStorage.setItem("userInfo", JSON.stringify(userData));

    // 상태 업데이트
    setUser(userData);
    setIsAuthenticated(true);

    console.log("로그인 완료, 상태:", {
      isAuthenticated: true,
      user: userData,
    });
  };

  // 로그아웃 함수
  const logout = () => {
    // 로컬 스토리지 정보 삭제
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    localStorage.removeItem("userInfo");

    // 상태 업데이트
    setUser(null);
    setIsAuthenticated(false);

    console.log("로그아웃 완료");
  };

  // 사용자 정보 업데이트
  const updateUser = (newUserData) => {
    const updatedUser = { ...user, ...newUserData };
    localStorage.setItem("userInfo", JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        loading,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Context를 쉽게 사용하기 위한 커스텀 훅
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth는 AuthProvider 내부에서만 사용할 수 있습니다.");
  }
  return context;
};
