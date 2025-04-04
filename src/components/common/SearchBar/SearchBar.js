import React, { useState, useRef, useEffect } from "react";
import { Search, X } from "lucide-react";
import axiosInstance from "@/api/axiosInstance";
import { Button } from "@/components/ui/button";

const SearchBar = ({ onSearch, onClear, initialSearchTerm = "" }) => {
  const [searchInputTerm, setSearchInputTerm] = useState(initialSearchTerm);
  const [searchLogs, setSearchLogs] = useState([]);
  const [isSearchLogOpen, setIsSearchLogOpen] = useState(false);
  const searchInputRef = useRef(null);
  const searchLogRef = useRef(null);

  // 검색 로그 불러오기 함수
  const fetchSearchLogs = async () => {
    try {
      const response = await axiosInstance.get("/search/log");
      const searchLogs = response.data.message || [];
      setSearchLogs(searchLogs);
    } catch (error) {
      console.error("검색 로그 불러오기 실패:", error);
      setSearchLogs([]);
    }
  };

  // 검색바 클릭 시 로그 불러오기
  const handleSearchInputFocus = () => {
    fetchSearchLogs();
    setIsSearchLogOpen(true);
  };

  // 외부 클릭 시 드롭다운 닫기
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target) &&
        searchLogRef.current &&
        !searchLogRef.current.contains(event.target)
      ) {
        setIsSearchLogOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 초기 검색어가 변경될 경우 상태 업데이트
  // useEffect(() => {
  //   setSearchInputTerm(initialSearchTerm);
  // }, [initialSearchTerm]);

  // 검색어 선택 핸들러
  const handleSearchLogSelect = (log) => {
    setSearchInputTerm(log);
    onSearch(log);
    setIsSearchLogOpen(false);
  };

  // 검색 로그 삭제 함수
  const handleDeleteSearchLog = async (logIdx) => {
    try {
      await axiosInstance.patch(`/search/log/${logIdx}`);
      setSearchLogs((prevLogs) =>
        prevLogs.filter((log) => log.logIdx !== logIdx)
      );
    } catch (error) {
      console.error("검색 로그 삭제 실패:", error);
    }
  };

  // 검색 핸들러
  const handleSearch = async (e) => {
    e.preventDefault();

    if (!searchInputTerm.trim()) {
      // 검색어가 비어있으면 검색 실행하지 않음
      return;
    }

    try {
      // 검색 로그 API 호출
      await axiosInstance.get(`/search/log?keyword=${searchInputTerm}`);

      // 검색 실행
      onSearch(searchInputTerm);
      setIsSearchLogOpen(false); // 검색 로그 드롭다운 닫기
    } catch (error) {
      console.error("검색 로그 저장 실패:", error);
      // 에러가 발생해도 검색은 수행
      onSearch(searchInputTerm);
    }
  };

  // 검색어 지우기 핸들러
  const handleClearSearch = () => {
    setSearchInputTerm("");
    if (onClear) {
      onClear();
    }
    // 지우기 후 검색창에 포커스 유지
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  return (
    <div className="flex-1 relative">
      <form onSubmit={handleSearch}>
        <input
          ref={searchInputRef}
          type="text"
          placeholder="루틴 제목, 작성자, 직업 등 검색..."
          value={searchInputTerm}
          onChange={(e) => setSearchInputTerm(e.target.value)}
          onFocus={handleSearchInputFocus}
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        />
        <Search
          className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
          size={18}
        />
        {searchInputTerm && (
          <button
            type="button"
            onClick={handleClearSearch}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <X size={16} />
          </button>
        )}

        {/* 검색 버튼 추가 */}
        {/* <Button
          type="submit"
          className="bg-blue-500 hover:bg-blue-600 text-white rounded-r-lg px-4"
        >
          검색
        </Button> */}
      </form>

      {/* 검색 로그 드롭다운 */}
      {isSearchLogOpen && (
        <div
          ref={searchLogRef}
          className="absolute z-10 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-lg"
        >
          <div className="p-2 border-b border-gray-200">
            <h4 className="text-sm font-medium text-gray-600">최근 검색어</h4>
          </div>
          {searchLogs.length > 0 ? (
            <ul className="max-h-60 overflow-y-auto">
              {searchLogs.map((log) => (
                <li
                  key={log.logIdx}
                  className="px-4 py-2 hover:bg-gray-100 flex justify-between items-center cursor-pointer"
                >
                  <span
                    onClick={() => handleSearchLogSelect(log.searchKeyword)}
                    className="text-sm text-gray-700 flex-grow"
                  >
                    {log.searchKeyword}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteSearchLog(log.logIdx);
                    }}
                    className="text-gray-400 hover:text-red-500 ml-2"
                  >
                    <X size={16} />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-4 text-center text-gray-500 text-sm">
              최근 검색어가 없습니다.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SearchBar;
