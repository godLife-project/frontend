import { createContext, useContext, useState, useEffect } from "react";

// Context 생성
const AuthContext = createContext(null);

// 목업 사용자 데이터
const MOCK_USER = {
  userIdx: 123,
  userNick: "해쟈",
  nickTag: "#test",
  jobIdx: 1,
  targetIdx: 2,
  roleStatus: "normal",
  email: "haeji1124@naver.com",
};

// Provider 컴포넌트 생성
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // 개발 모드에서 자동 로그인 설정 (백엔드 서버 셧다운 상황에서)
  const DEV_MODE = true; // 필요시 false로 변경

  // 앱 로드 시 로컬 스토리지에서 사용자 정보 확인
  useEffect(() => {
    const checkAuth = () => {
      // 개발 모드에서는 자동으로 Mock 유저로 로그인
      if (DEV_MODE) {
        console.log("개발 모드: Mock 사용자로 자동 로그인됨");
        setUser(MOCK_USER);
        setIsAuthenticated(true);
        localStorage.setItem("userInfo", JSON.stringify(MOCK_USER));
        localStorage.setItem("accessToken", "mock-token-for-development");
      } else {
        // 정상 작동 모드 (백엔드 연결 시)
        const accessToken = localStorage.getItem("accessToken");
        const userInfo = localStorage.getItem("userInfo");

        if (accessToken && userInfo) {
          setUser(JSON.parse(userInfo));
          setIsAuthenticated(true);
        }
      }

      setLoading(false);
    };

    checkAuth();
  }, []);

  // 로그인 함수
  const login = (
    userData = MOCK_USER,
    tokens = { accessToken: "mock-token-for-development" }
  ) => {
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

    // 개발 모드에서는 자동으로 다시 로그인 (필요시 주석 처리)
    if (DEV_MODE) {
      setTimeout(() => {
        login(MOCK_USER, { accessToken: "mock-token-for-development" });
      }, 1000); // 1초 후 자동 로그인
    }
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
