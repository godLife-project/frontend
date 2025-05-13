import React, { useState, useEffect } from "react";
import { Search } from "lucide-react";
import axiosInstance from "@/api/axiosInstance";
import ItemTable from "./ItemTable";
import DeleteConfirmModal from "./delete";
import EditItemModal from "./edit";
import AddItemModal from "./add";

const CompSystem = () => {
  const [activeTab, setActiveTab] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemData, setItemData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // 모달 상태 관리
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // API 경로 설정 (탭에 따라 다르게 설정)
  const getApiPath = () => {
    switch (activeTab) {
      case "목표":
        return "/admin/component/targetCategory";
      case "직업":
        return "/admin/component/jobCategory";
      case "아이콘":
        return "/admin/compSystem/icon"; //주소 확인 필요
      default:
        return "/admin/component/targetCategory";
    }
  };

  // API에서 데이터 가져오기
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // localStorage에서 accessToken 가져오기
      const accessToken = localStorage.getItem("accessToken");
      const apiPath = getApiPath();

      // API 요청
      const response = await axiosInstance.get(apiPath, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // 응답 데이터 구조 디버깅
      console.log("API 응답:", response);

      // 응답 데이터 확인 및 처리
      if (response?.data) {
        if (
          response.data.categories &&
          Array.isArray(response.data.categories)
        ) {
          // API 응답에서 categories 배열 사용
          setItemData(response.data.categories);
        } else if (Array.isArray(response.data)) {
          // 응답 데이터가 직접 배열인 경우
          setItemData(response.data);
        } else if (response.data.data && Array.isArray(response.data.data)) {
          // 응답이 { data: [...] } 형태인 경우
          setItemData(response.data.data);
        } else {
          console.error("예상치 못한 응답 형식:", response.data);
          setItemData([]);
          setError("데이터 형식이 올바르지 않습니다");
        }
      } else {
        console.error("응답 데이터가 없습니다:", response);
        setItemData([]);
        setError("응답 데이터가 없습니다");
      }
    } catch (err) {
      console.error(`${activeTab} 카테고리 조회 실패:`, err);
      setError(`${activeTab} 카테고리 데이터를 불러오는데 실패했습니다.`);
      setItemData([]);
    } finally {
      setIsLoading(false);
    }
  };

  // 탭이 변경될 때마다 데이터 다시 가져오기
  useEffect(() => {
    fetchData();
  }, [activeTab]);

  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm(""); // 탭 변경 시 검색어 초기화
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  // 항목 추가 처리
  const handleAddItem = async (newItem) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const apiPath = getApiPath();

      await axiosInstance.post(apiPath, newItem, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // 성공 후 데이터 다시 불러오기
      fetchData();
      setIsAddModalOpen(false);
    } catch (err) {
      console.error(`${activeTab} 추가 실패:`, err);
      alert(`항목 추가에 실패했습니다: ${err.message}`);
    }
  };

  // 항목 수정 처리
  const handleEditItem = async (updatedItem) => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const apiPath = `${getApiPath()}/${selectedItem.idx}`;

      await axiosInstance.patch(apiPath, updatedItem, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // 성공 후 데이터 다시 불러오기
      fetchData();
      setIsEditModalOpen(false);
      setSelectedItem(null);
    } catch (err) {
      console.error(`${activeTab} 수정 실패:`, err);
      alert(`항목 수정에 실패했습니다: ${err.message}`);
    }
  };

  // 항목 삭제 처리
  const handleDeleteItem = async () => {
    try {
      const accessToken = localStorage.getItem("accessToken");
      const apiPath = `${getApiPath()}/${selectedItem.idx}`;

      await axiosInstance.delete(apiPath, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      // 성공 후 데이터 다시 불러오기
      fetchData();
      setIsDeleteModalOpen(false);
      setSelectedItem(null);
    } catch (err) {
      console.error(`${activeTab} 삭제 실패:`, err);
      alert(`항목 삭제에 실패했습니다: ${err.message}`);
    }
  };

  // 편집 모달 열기
  const openEditModal = (item) => {
    setSelectedItem(item);
    setIsEditModalOpen(true);
  };

  // 삭제 모달 열기
  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  // 검색어로 필터링된 데이터
  const filteredData = itemData.filter(
    (item) =>
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.iconKey &&
        item.iconKey.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <>
      {/* 탭 네비게이션 */}
      <div className="flex mb-6 space-x-2">
        <button
          className={`px-6 py-3 rounded-md ${
            activeTab === "목표" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => handleTabChange("목표")}
        >
          목표
        </button>
        <button
          className={`px-6 py-3 rounded-md ${
            activeTab === "직직업" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => handleTabChange("직업")}
        >
          직업
        </button>
        <button
          className={`px-6 py-3 rounded-md ${
            activeTab === "아이콘" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => handleTabChange("아이콘")}
        >
          아이콘
        </button>
        <div className="flex-grow"></div>
        <button
          className="px-6 py-3 bg-blue-500 text-white rounded-md"
          onClick={() => setIsAddModalOpen(true)}
        >
          새 항목 추가
        </button>
      </div>

      {/* 검색 */}
      <div className="mb-6">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
            <Search size={20} className="text-gray-400" />
          </div>
          <input
            type="text"
            className="w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="검색"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
      </div>

      {/* 로딩 상태 */}
      {isLoading && (
        <div className="flex justify-center py-8">
          <p className="text-gray-500">데이터를 불러오는 중...</p>
        </div>
      )}

      {/* 에러 메시지 */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* 테이블 컴포넌트 */}
      {!isLoading && !error && (
        <ItemTable
          items={filteredData}
          currentPage={currentPage}
          setCurrentPage={setCurrentPage}
          searchTerm={searchTerm}
          onEdit={openEditModal}
          onDelete={openDeleteModal}
          itemType={activeTab}
        />
      )}

      {/* 모달 컴포넌트들 */}
      {isAddModalOpen && (
        <AddItemModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddItem}
          itemType={activeTab}
        />
      )}

      {isEditModalOpen && selectedItem && (
        <EditItemModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedItem(null);
          }}
          onEdit={handleEditItem}
          item={selectedItem}
          itemType={activeTab}
        />
      )}

      {isDeleteModalOpen && selectedItem && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedItem(null);
          }}
          onDelete={handleDeleteItem}
          item={selectedItem}
          itemType={activeTab}
        />
      )}
    </>
  );
};

export default CompSystem;
