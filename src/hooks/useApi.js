import { useState, useCallback, useEffect } from "react";
import axiosInstance from "../api/axiosInstance";
import { useAuth } from "../context/AuthContext";

// 인증이 필요하지 않은 엔드포인트 목록
const PUBLIC_ENDPOINTS = [
  "/user/login",
  "/user/signup",
  "/user/forgot-password",
  // 기타 인증이 필요하지 않은 엔드포인트 추가
];

export const useApi = (
  initialUrl = null,
  initialMethod = "get",
  initialOptions = {}
) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(initialUrl !== null);
  const [error, setError] = useState(null);
  const [headers, setHeaders] = useState(null);
  const [request, setRequest] = useState({
    url: initialUrl,
    method: initialMethod,
    options: initialOptions,
  });

  const { login, logout } = useAuth();

  // 엔드포인트가 인증이 필요한지 확인하는 함수
  const requiresAuth = useCallback((url) => {
    // URL에서 쿼리 파라미터 제거
    const baseUrl = url.split("?")[0];
    // 정확한 경로 매칭 또는 경로 시작 패턴 확인
    return !PUBLIC_ENDPOINTS.some(
      (endpoint) => baseUrl === endpoint || baseUrl.startsWith(`${endpoint}/`)
    );
  }, []);

  // 헤더에서 토큰 정보를 추출하는 함수
  const getTokens = useCallback(
    (responseHeaders = headers) => {
      if (!responseHeaders) return { accessToken: null, refreshToken: null };

      const accessToken =
        responseHeaders["authorization"] ||
        responseHeaders["Authorization"] ||
        null;

      // 헤더에서 리프레시 토큰 추출 시도
      const refreshToken = responseHeaders["refresh-token"] || null;

      // 액세스 토큰에서 Bearer 제거
      const cleanAccessToken = accessToken
        ? accessToken.startsWith("Bearer ")
          ? accessToken.substring(7)
          : accessToken
        : null;

      return {
        accessToken: cleanAccessToken,
        refreshToken,
      };
    },
    [headers]
  );

  const makeRequest = useCallback((method, url, options = {}) => {
    setRequest({ method, url, options });
    setLoading(true);
    setError(null);
  }, []);

  // 편의를 위한 메서드별 함수들
  const get = useCallback(
    (url, params = {}, config = {}) => {
      const accessToken = localStorage.getItem("accessToken");
      const updatedConfig = {
        params,
        ...config,
        withCredentials: true,
      };

      // 인증이 필요한 엔드포인트인 경우에만 토큰 추가
      if (accessToken && requiresAuth(url)) {
        updatedConfig.headers = {
          ...updatedConfig.headers,
          Authorization: `Bearer ${accessToken}`,
        };
      }

      makeRequest("get", url, updatedConfig);
    },
    [makeRequest, requiresAuth]
  );

  const post = useCallback(
    (url, data = {}, config = {}) => {
      const accessToken = localStorage.getItem("accessToken");
      const updatedConfig = {
        data,
        ...config,
        withCredentials: true,
      };

      // 인증이 필요한 엔드포인트인 경우에만 토큰 추가
      if (accessToken && requiresAuth(url)) {
        updatedConfig.headers = {
          ...updatedConfig.headers,
          Authorization: `Bearer ${accessToken}`,
        };
      }

      makeRequest("post", url, updatedConfig);
    },
    [makeRequest, requiresAuth]
  );

  const put = useCallback(
    (url, data = {}, config = {}) => {
      const accessToken = localStorage.getItem("accessToken");
      const updatedConfig = {
        data,
        ...config,
        withCredentials: true,
      };

      // 인증이 필요한 엔드포인트인 경우에만 토큰 추가
      if (accessToken && requiresAuth(url)) {
        updatedConfig.headers = {
          ...updatedConfig.headers,
          Authorization: `Bearer ${accessToken}`,
        };
      }

      makeRequest("put", url, updatedConfig);
    },
    [makeRequest, requiresAuth]
  );

  const del = useCallback(
    (url, config = {}) => {
      const accessToken = localStorage.getItem("accessToken");
      const updatedConfig = {
        ...config,
        withCredentials: true,
      };

      // 인증이 필요한 엔드포인트인 경우에만 토큰 추가
      if (accessToken && requiresAuth(url)) {
        updatedConfig.headers = {
          ...updatedConfig.headers,
          Authorization: `Bearer ${accessToken}`,
        };
      }

      makeRequest("delete", url, updatedConfig);
    },
    [makeRequest, requiresAuth]
  );

  useEffect(() => {
    // 요청 정보가 없으면 아무것도 하지 않음
    if (!request.url) return;

    const fetchData = async () => {
      try {
        let response;

        // HTTP 메서드에 따라 다른 방식으로 요청
        if (request.method === "get" || request.method === "delete") {
          // GET과 DELETE는 두 번째 인자로 config 객체를 받음
          response = await axiosInstance[request.method](request.url, {
            ...request.options,
            withCredentials: true,
          });
        } else {
          // POST, PUT 등은 두 번째 인자로 data, 세 번째 인자로 config를 받음
          response = await axiosInstance[request.method](
            request.url,
            request.options.data || {},
            {
              ...(request.options.params
                ? { params: request.options.params }
                : {}),
              ...request.options,
              withCredentials: true,
            }
          );
        }

        // 응답 데이터와 헤더 저장
        setData(response.data);
        setHeaders(response.headers);

        // 로그인 엔드포인트 처리
        if (request.url === "/user/login" && response.data) {
          const tokens = getTokens(response.headers);

          // 토큰이 존재하고 응답 데이터에 사용자 정보가 있다면 로그인 처리
          if (tokens.accessToken && response.data) {
            login(response.data, tokens);
          }
        }

        // 디버깅용 로그
        if (process.env.NODE_ENV === "development") {
          console.log(`API 응답 (${request.url}):`, {
            data: response.data,
            headers: response.headers,
          });
        }

        setError(null);
      } catch (err) {
        setError(err);
        console.error(`API ${request.method} 호출 에러 (${request.url}):`, err);

        // 401 오류 처리 (인증 만료)
        if (
          err.response &&
          err.response.status === 401 &&
          requiresAuth(request.url)
        ) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [request, login, logout, requiresAuth, getTokens]);

  return {
    data,
    loading,
    error,
    headers,
    getTokens,
    get,
    post,
    put,
    delete: del,
  };
};
