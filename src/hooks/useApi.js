import { useState, useEffect, useCallback } from 'react';
import axiosInstance from '../api/axiosInstance';

export const useApi = (initialUrl = null, initialMethod = 'get', initialOptions = {}) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(initialUrl !== null);
  const [error, setError] = useState(null);
  const [headers, setHeaders] = useState(null); // 응답 헤더를 저장할 상태 추가
  const [request, setRequest] = useState({
    url: initialUrl,
    method: initialMethod,
    options: initialOptions
  });

  const makeRequest = useCallback((method, url, options = {}) => {
    setRequest({ method, url, options });
    setLoading(true);
    setError(null);
  }, []);

  // 편의를 위한 메서드별 함수들
  const get = useCallback((url, params = {}) => 
    makeRequest('get', url, { params, withCredentials: true }), [makeRequest]);
    
  const post = useCallback((url, data = {}, config = {}) => 
    makeRequest('post', url, { 
      data, 
      ...config,
      withCredentials: true // 쿠키를 받기 위해 항상 설정
    }), [makeRequest]);
    
  const put = useCallback((url, data = {}, config = {}) => 
    makeRequest('put', url, { 
      data, 
      ...config,
      withCredentials: true 
    }), [makeRequest]);
    
  const del = useCallback((url, config = {}) => 
    makeRequest('delete', url, { 
      ...config,
      withCredentials: true 
    }), [makeRequest]);

  useEffect(() => {
    // 요청 정보가 없으면 아무것도 하지 않음
    if (!request.url) return;

    const fetchData = async () => {
      try {
        let response;
        
        // HTTP 메서드에 따라 다른 방식으로 요청
        if (request.method === 'get' || request.method === 'delete') {
          // GET과 DELETE는 두 번째 인자로 config 객체를 받음
          response = await axiosInstance[request.method](
            request.url, 
            {
              ...request.options,
              withCredentials: true
            }
          );
        } else {
          // POST, PUT 등은 두 번째 인자로 data, 세 번째 인자로 config를 받음
          response = await axiosInstance[request.method](
            request.url,
            request.options.data || {}, 
            {
              ...(request.options.params ? { params: request.options.params } : {}),
              withCredentials: true
            }
          );
        }
        
        // 응답 데이터와 헤더 저장
        setData(response.data);
        setHeaders(response.headers);
        
        // 토큰 정보 출력 (디버깅용)
        const accessToken = response.headers['authorization'] || response.headers['Authorization'];
        console.log('API 응답 헤더:', response.headers);
        console.log('액세스 토큰:', accessToken);
        console.log('쿠키:', document.cookie);
        
        setError(null);
      } catch (err) {
        setError(err);
        console.error(`API ${request.method} 호출 에러 (${request.url}):`, err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [request]);

  // 추출된 토큰 정보를 반환하는 함수
  const getTokens = useCallback(() => {
    const accessToken = headers ? (headers['authorization'] || headers['Authorization']) : null;
    
    // 쿠키에서 리프레시 토큰 찾기 시도
    const cookies = document.cookie.split(';');
    const refreshTokenCookie = cookies.find(cookie => cookie.trim().startsWith('refresh_token='));
    const refreshToken = refreshTokenCookie ? refreshTokenCookie.split('=')[1] : null;
    
    return { accessToken, refreshToken };
  }, [headers]);

  return { 
    data, 
    loading, 
    error, 
    headers,
    getTokens, // 토큰 정보를 반환하는 함수 추가
    get, 
    post, 
    put, 
    delete: del 
  };
};