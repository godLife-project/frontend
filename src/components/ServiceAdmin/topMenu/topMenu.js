import React, { useState, useEffect, useRef } from "react";
import { Search, X, Clock, Trash2 } from "lucide-react";
import { MdOutlineMode, MdOutlineDelete } from "react-icons/md";
import axiosInstance from "@/api/axiosInstance";
import DeleteConfirmModal from "../compSystem/delete";
import EditItemModal from "../compSystem/edit"; // EditItemModal 추가

const TopMenu = () => {
  // 상태 관리
  const [currentPage, setCurrentPage] = useState(1);
  const [itemData, setItemData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false); // 편집 모달 상태 추가

  // 최근 검색어 관련 상태
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const searchInputRef = useRef(null);
  const recentSearchesRef = useRef(null);

  const RECENT_SEARCH_KEY = "recentSearches_topMenu";

  // 모달 상태 (필요시 구현)
  const [selectedItem, setSelectedItem] = useState(null);

  // 최근 검색어 관련 함수들
  const loadRecentSearches = () => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCH_KEY);
      if (stored) {
        const searches = JSON.parse(stored);
        setRecentSearches(Array.isArray(searches) ? searches : []);
      } else {
        setRecentSearches([]);
      }
    } catch (error) {
      console.error("최근 검색어 불러오기 실패:", error);
      setRecentSearches([]);
    }
  };

  const saveRecentSearch = (term) => {
    if (!term.trim()) return;

    try {
      const trimmedTerm = term.trim();
      let searches = [...recentSearches];
      searches = searches.filter((search) => search !== trimmedTerm);
      searches.unshift(trimmedTerm);
      searches = searches.slice(0, 10);

      setRecentSearches(searches);
      localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(searches));
    } catch (error) {
      console.error("최근 검색어 저장 실패:", error);
    }
  };

  const removeRecentSearch = (termToRemove) => {
    try {
      const updatedSearches = recentSearches.filter(
        (term) => term !== termToRemove
      );
      setRecentSearches(updatedSearches);
      localStorage.setItem(RECENT_SEARCH_KEY, JSON.stringify(updatedSearches));
    } catch (error) {
      console.error("검색어 삭제 실패:", error);
    }
  };

  const clearAllRecentSearches = () => {
    try {
      setRecentSearches([]);
      localStorage.removeItem(RECENT_SEARCH_KEY);
    } catch (error) {
      console.error("전체 검색어 삭제 실패:", error);
    }
  };

  // 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        recentSearchesRef.current &&
        !recentSearchesRef.current.contains(event.target) &&
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target)
      ) {
        setShowRecentSearches(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    loadRecentSearches();
    fetchData();
  }, []);

  // 데이터 가져오기
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem("accessToken");
      const response = await axiosInstance.get("/categories/topMenu", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      console.log("탑메뉴 API 응답:", response.data);

      if (response?.data) {
        let topMenuData = null;

        if (response.data.TopMenu && Array.isArray(response.data.TopMenu)) {
          topMenuData = response.data.TopMenu;
        } else if (response.data.data && Array.isArray(response.data.data)) {
          topMenuData = response.data.data;
        } else if (Array.isArray(response.data)) {
          topMenuData = response.data;
        }

        if (topMenuData) {
          // ordCol 순서로 정렬
          topMenuData.sort((a, b) => a.ordCol - b.ordCol);
          console.log(
            "탑메뉴 데이터 로드 성공:",
            topMenuData.length,
            "개 항목"
          );
          setItemData(topMenuData);
        } else {
          console.error(
            "탑메뉴 데이터를 찾을 수 없습니다. 응답 구조:",
            response.data
          );
          setItemData([]);
          setError("탑메뉴 데이터 형식이 올바르지 않습니다");
        }
      } else {
        setItemData([]);
        setError("응답 데이터가 없습니다");
      }
    } catch (err) {
      console.error("탑메뉴 조회 실패:", err);
      setError("탑메뉴 데이터를 불러오는데 실패했습니다.");
      setItemData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 검색 관련 핸들러들
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    if (value.length === 0 && recentSearches.length > 0) {
      setShowRecentSearches(true);
    } else {
      setShowRecentSearches(false);
    }
  };

  const handleSearchFocus = () => {
    if (recentSearches.length > 0) {
      setShowRecentSearches(true);
    }
  };

  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      saveRecentSearch(searchTerm);
      setShowRecentSearches(false);
    }
  };

  const handleRecentSearchClick = (term) => {
    setSearchTerm(term);
    setShowRecentSearches(false);
    saveRecentSearch(term);
  };

  // 편집 모달 관련 핸들러들
  const openEditModal = (item) => {
    console.log("편집 모달 열기:", item);
    // TopMenu API 응답 구조에 맞춰 데이터 매핑 - parentIdx, categoryLevel 추가
    const mappedItem = {
      topIdx: item.topIdx,
      topName: item.name,
      topAddr: item.addr,
      parentIdx: item.parentIdx,
      categoryLevel: item.categoryLevel,
      ordCol: item.ordCol,
    };
    setSelectedItem(mappedItem);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setIsEditModalOpen(false);
    setSelectedItem(null);
  };

  // 편집 처리 - parentIdx, categoryLevel 추가
  const handleEdit = async (updatedItem) => {
    if (!selectedItem) return;

    setIsLoading(true);
    try {
      const accessToken = localStorage.getItem("accessToken");

      const response = await axiosInstance.patch(
        `/admin/compSystem/topMenu/${selectedItem.topIdx}`,
        {
          topName: updatedItem.topName,
          topAddr: updatedItem.topAddr,
          parentIdx: updatedItem.parentIdx,
          categoryLevel: updatedItem.categoryLevel,
          ordCol: updatedItem.ordCol,
        },
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      if (response?.status === 200) {
        console.log("탑메뉴 수정 성공:", response.data);
        fetchData(); // 데이터 새로고침
        closeEditModal();
      } else {
        console.error("탑메뉴 수정 실패:", response);
        alert("수정에 실패했습니다.");
      }
    } catch (err) {
      console.error("수정 실패:", err);
      alert("수정 중 오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setSelectedItem(null);
  };

  const handleDelete = async () => {
    if (!selectedItem) return;

    try {
      const accessToken = localStorage.getItem("accessToken");
      await axiosInstance.delete(
        `/admin/compSystem/topMenu/${selectedItem.topIdx}`,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      fetchData(); // 목록 새로고침
      closeDeleteModal();
    } catch (err) {
      console.error("삭제 실패:", err);
      alert("삭제에 실패했습니다.");
    }
  };

  // 검색어로 필터링된 데이터
  const filteredData = itemData.filter((item) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      item.name?.toLowerCase().includes(searchLower) ||
      item.addr?.toLowerCase().includes(searchLower)
    );
  });

  // 페이지네이션
  const itemsPerPage = 10;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedItems = filteredData.slice(startIndex, endIndex);

  // 테이블 행 렌더링
  const renderTableRows = () => {
    if (!filteredData || filteredData.length === 0) {
      return (
        <tr>
          <td colSpan="5" className="px-6 py-4 text-center">
            {searchTerm ? "검색 결과가 없습니다." : "데이터가 없습니다."}
          </td>
        </tr>
      );
    }

    return paginatedItems.map((item, index) => (
      <tr key={item.topIdx || index} className="border-b hover:bg-gray-50">
        <td className="px-6 py-4">{item.topIdx}</td>
        <td className="px-6 py-4 font-medium">{item.name}</td>
        <td className="px-6 py-4">
          <code className="bg-gray-100 px-2 py-1 rounded text-sm">
            {item.addr || "-"}
          </code>
        </td>
        <td className="px-6 py-4">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            {item.ordCol}
          </span>
        </td>
        <td className="px-6 py-4 space-x-2">
          <div className="flex gap-3">
            <button
              className="flex items-center rounded-md shadow px-3 py-1 hover:bg-gray-50 transition-colors"
              onClick={() => openEditModal(item)}
            >
              <MdOutlineMode className="mr-1" />
              수정
            </button>
            <button
              className="flex items-center bg-red-500 text-white rounded-md px-3 py-1 hover:bg-red-600 transition-colors"
              onClick={() => openDeleteModal(item)}
            >
              <MdOutlineDelete className="mr-1" />
              삭제
            </button>
          </div>
        </td>
      </tr>
    ));
  };

  return (
    <div className="space-y-6">
      {/* 검색 */}
      <div className="relative">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            ref={searchInputRef}
            type="text"
            className="w-full pl-10 pr-10 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="메뉴명 또는 주소로 검색..."
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onKeyDown={handleSearchKeyDown}
          />
          {searchTerm && (
            <button
              onClick={() => {
                setSearchTerm("");
                setShowRecentSearches(false);
                searchInputRef.current?.focus();
              }}
              className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition-colors"
              title="검색어 지우기"
            >
              <X size={20} />
            </button>
          )}
        </div>

        {/* 최근 검색어 드롭다운 */}
        {showRecentSearches && recentSearches.length > 0 && (
          <div
            ref={recentSearchesRef}
            className="absolute top-full left-0 right-0 mt-1 bg-white border rounded-md shadow-lg z-50 max-h-60 overflow-y-auto"
          >
            <div className="p-3 border-b bg-gray-50">
              <div className="flex items-center justify-between">
                <div className="flex items-center text-sm text-gray-600">
                  <Clock size={16} className="mr-1" />
                  <span>최근 검색어</span>
                </div>
                <button
                  onClick={clearAllRecentSearches}
                  className="text-xs text-gray-500 hover:text-red-500 flex items-center"
                  title="전체 삭제"
                >
                  <Trash2 size={12} className="mr-1" />
                  전체삭제
                </button>
              </div>
            </div>
            <div className="py-1">
              {recentSearches.map((term, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between px-3 py-2 hover:bg-gray-50 group"
                >
                  <button
                    className="flex-1 text-left text-sm text-gray-700 hover:text-blue-600"
                    onClick={() => handleRecentSearchClick(term)}
                  >
                    {term}
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecentSearch(term);
                    }}
                    className="opacity-0 group-hover:opacity-100 ml-2 text-gray-400 hover:text-red-500 transition-opacity"
                    title="삭제"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 로딩 및 에러 상태 */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <p className="text-gray-500">데이터를 불러오는 중...</p>
        </div>
      )}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          <p>{error}</p>
        </div>
      )}

      {/* 테이블 */}
      {!isLoading && !error && (
        <div className="bg-white rounded-md shadow overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="px-6 py-3 text-left  text-gray-900">ID</th>
                <th className="px-6 py-3 text-left  text-gray-900">메뉴명</th>
                <th className="px-6 py-3  text-gray-900">주소</th>
                <th className="px-6 py-3   text-gray-900">순서</th>
                <th className="px-6 py-3   text-gray-900">작업</th>
              </tr>
            </thead>
            <tbody>{renderTableRows()}</tbody>
          </table>

          {/* 페이지네이션 */}
          <div className="flex justify-center p-4 border-t">
            <button
              className="px-4 py-2 mx-1 rounded-md border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              이전
            </button>
            <button className="px-4 py-2 mx-1 rounded-md bg-blue-500 text-white">
              {currentPage}
            </button>
            <button
              className="px-4 py-2 mx-1 rounded-md border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
              onClick={() => setCurrentPage(currentPage + 1)}
              disabled={endIndex >= filteredData.length}
            >
              다음
            </button>
          </div>
        </div>
      )}

      {/* 편집 모달 */}
      {isEditModalOpen && selectedItem && (
        <EditItemModal
          isOpen={isEditModalOpen}
          onClose={closeEditModal}
          onEdit={handleEdit}
          item={selectedItem}
          itemType="탑메뉴"
          iconData={[]} // 탑메뉴는 아이콘 데이터 불필요
        />
      )}

      {/* 삭제 확인 모달 */}
      <DeleteConfirmModal
        isOpen={isDeleteModalOpen}
        onClose={closeDeleteModal}
        onDelete={handleDelete}
        item={selectedItem}
        itemType="탑메뉴"
      />
    </div>
  );
};

export default TopMenu;
