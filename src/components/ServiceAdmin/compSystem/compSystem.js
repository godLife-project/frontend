// import React, { useState, useEffect } from "react";
// import { Search } from "lucide-react";
// import axiosInstance from "@/api/axiosInstance";
// import ItemTable from "./ItemTable";
// import DeleteConfirmModal from "./delete";
// import EditItemModal from "./edit";
// import AddItemModal from "./add";

// const CompSystem = () => {
//   // 기존 상태들
//   const [activeTab, setActiveTab] = useState("목표");
//   const [currentPage, setCurrentPage] = useState(1);
//   const [itemData, setItemData] = useState([]);
//   const [iconData, setIconData] = useState([]);
//   const [isLoading, setIsLoading] = useState(false);
//   const [error, setError] = useState(null);
//   const [searchTerm, setSearchTerm] = useState("");
//   const [isAddModalOpen, setIsAddModalOpen] = useState(false);
//   const [isEditModalOpen, setIsEditModalOpen] = useState(false);
//   const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
//   const [selectedItem, setSelectedItem] = useState(null);

//   // API 경로 설정 (기존과 동일)
//   const getApiPath = () => {
//     switch (activeTab) {
//       case "목표":
//         return "/categories/target";
//       case "직업":
//         return "/categories/job";
//       case "아이콘":
//         return "/categories/admin/icon";
//       default:
//         return "/categories/target";
//     }
//   };

//   // 수정된: 아이콘 데이터 가져오기 함수
//   const fetchIconData = async () => {
//     try {
//       // 이미 데이터가 있으면 다시 불러오지 않음
//       if (iconData && iconData.length > 0) return;

//       console.log("아이콘 데이터 가져오기 요청...");
//       const accessToken = localStorage.getItem("accessToken");
//       const response = await axiosInstance.get("/categories/admin/icon", {
//         headers: { Authorization: `Bearer ${accessToken}` },
//       });

//       // 디버깅을 위해 전체 응답 구조 로깅
//       console.log("아이콘 API 응답 전체:", response.data);
//       console.log("아이콘 API 응답 키들:", Object.keys(response.data || {}));

//       // 여러 가능한 경로 확인
//       let iconDataArray = null;

//       if (response?.data?.ICON && Array.isArray(response.data.ICON)) {
//         iconDataArray = response.data.ICON;
//       } else if (response?.data?.icons && Array.isArray(response.data.icons)) {
//         iconDataArray = response.data.icons;
//       } else if (response?.data?.data && Array.isArray(response.data.data)) {
//         iconDataArray = response.data.data;
//       } else if (Array.isArray(response.data)) {
//         iconDataArray = response.data;
//       }

//       if (iconDataArray) {
//         console.log(
//           "아이콘 데이터 로드 완료:",
//           iconDataArray.length,
//           "개 항목"
//         );
//         setIconData(iconDataArray);
//       } else {
//         console.error(
//           "아이콘 데이터를 찾을 수 없습니다. 응답 구조:",
//           response.data
//         );
//       }
//     } catch (err) {
//       console.error("아이콘 데이터 로드 실패:", err);
//     }
//   };

//   // 수정된: API에서 데이터 가져오기
//   const fetchData = async () => {
//     setIsLoading(true);
//     setError(null);

//     try {
//       const accessToken = localStorage.getItem("accessToken");
//       const apiPath = getApiPath();

//       const response = await axiosInstance.get(apiPath, {
//         headers: { Authorization: `Bearer ${accessToken}` },
//       });

//       // 디버깅을 위해 전체 응답 구조 로깅
//       console.log(`${activeTab} API 응답 전체:`, response.data);
//       console.log(
//         `${activeTab} API 응답 키들:`,
//         Object.keys(response.data || {})
//       );

//       if (response?.data) {
//         // 아이콘 탭인 경우
//         if (activeTab === "아이콘") {
//           // 여러 가능한 경로 확인
//           let iconDataArray = null;

//           if (response.data.ICON && Array.isArray(response.data.ICON)) {
//             iconDataArray = response.data.ICON;
//           } else if (
//             response.data.icons &&
//             Array.isArray(response.data.icons)
//           ) {
//             iconDataArray = response.data.icons;
//           } else if (response.data.data && Array.isArray(response.data.data)) {
//             iconDataArray = response.data.data;
//           } else if (Array.isArray(response.data)) {
//             iconDataArray = response.data;
//           }

//           if (iconDataArray) {
//             console.log(
//               `${activeTab} 데이터 로드 성공:`,
//               iconDataArray.length,
//               "개 항목"
//             );
//             setItemData(iconDataArray);
//             setIconData(iconDataArray); // 아이콘 데이터도 업데이트
//           } else {
//             console.error(
//               "아이콘 데이터를 찾을 수 없습니다. 응답 구조:",
//               response.data
//             );
//             setItemData([]);
//             setError("아이콘 데이터 형식이 올바르지 않습니다");
//           }
//         }
//         // 목표/직업 탭인 경우
//         else {
//           // 여러 가능한 경로 확인
//           let categoryData = null;

//           if (
//             response.data.categories &&
//             Array.isArray(response.data.categories)
//           ) {
//             categoryData = response.data.categories;
//           } else if (response.data.data && Array.isArray(response.data.data)) {
//             categoryData = response.data.data;
//           } else if (
//             response.data.items &&
//             Array.isArray(response.data.items)
//           ) {
//             categoryData = response.data.items;
//           } else if (Array.isArray(response.data)) {
//             categoryData = response.data;
//           }

//           if (categoryData) {
//             console.log(
//               `${activeTab} 데이터 로드 성공:`,
//               categoryData.length,
//               "개 항목"
//             );
//             setItemData(categoryData);
//           } else {
//             console.error(
//               `${activeTab} 데이터를 찾을 수 없습니다. 응답 구조:`,
//               response.data
//             );
//             setItemData([]);
//             setError("데이터 형식이 올바르지 않습니다");
//           }
//         }
//       } else {
//         setItemData([]);
//         setError("응답 데이터가 없습니다");
//       }
//     } catch (err) {
//       console.error(`${activeTab} 카테고리 조회 실패:`, err);
//       setError(`${activeTab} 카테고리 데이터를 불러오는데 실패했습니다.`);
//       setItemData([]);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // 핵심: 컴포넌트 마운트 시 우선 아이콘 데이터 로드 후 탭 데이터 로드
//   useEffect(() => {
//     const loadData = async () => {
//       await fetchIconData(); // 먼저 아이콘 데이터 로드
//       fetchData(); // 그 다음 현재 탭 데이터 로드
//     };

//     loadData();
//   }, []);

//   // 핵심: 탭이 변경될 때마다 데이터 다시 가져오기
//   useEffect(() => {
//     fetchData();
//   }, [activeTab]);

//   // 핵심: 아이콘 데이터가 변경될 때마다 로그
//   useEffect(() => {
//     console.log("iconData 상태 업데이트:", iconData?.length || 0);
//   }, [iconData]);

//   // 기존 핸들러들
//   const handleTabChange = (tab) => {
//     setActiveTab(tab);
//     setSearchTerm("");
//   };
//   const handleSearchChange = (e) => {
//     setSearchTerm(e.target.value);
//   };

//   // 핵심: 모달 열기 전에 아이콘 데이터 확인
//   const handleOpenAddModal = async () => {
//     await fetchIconData(); // 아이콘 데이터 확인 및 필요시 로드
//     setIsAddModalOpen(true);
//   };

//   // 핵심: 편집 모달 열기 전 아이콘 데이터 확인
//   const openEditModal = async (item) => {
//     setSelectedItem(item);
//     await fetchIconData(); // 아이콘 데이터 확인 및 필요시 로드
//     setIsEditModalOpen(true);
//   };

//   // 기존 삭제 모달 열기
//   const openDeleteModal = (item) => {
//     setSelectedItem(item);
//     setIsDeleteModalOpen(true);
//   };

//   // 추가된 함수: 항목 추가 처리
//   const handleAddItem = async (newItem) => {
//     setIsLoading(true);

//     try {
//       const accessToken = localStorage.getItem("accessToken");
//       const apiPath = getApiPath();

//       const response = await axiosInstance.post(apiPath, newItem, {
//         headers: { Authorization: `Bearer ${accessToken}` },
//       });

//       if (response?.status === 200 || response?.status === 201) {
//         console.log(`${activeTab} 항목 추가 성공:`, response.data);
//         fetchData(); // 데이터 다시 불러오기
//         setIsAddModalOpen(false);
//       } else {
//         console.error(`${activeTab} 항목 추가 실패:`, response);
//         setError(`${activeTab} 항목 추가에 실패했습니다.`);
//       }
//     } catch (err) {
//       console.error(`${activeTab} 항목 추가 오류:`, err);
//       setError(`${activeTab} 항목 추가 중 오류가 발생했습니다.`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // 수정된 함수: 항목 수정 처리
//   const handleEditItem = async (updatedItem) => {
//     setIsLoading(true);

//     try {
//       const accessToken = localStorage.getItem("accessToken");
//       const apiPath = getApiPath();
//       let endpoint;
//       let itemToUpdate = { ...updatedItem };

//       // 아이콘 탭인 경우와 그렇지 않은 경우를 구분
//       if (activeTab === "아이콘") {
//         // 아이콘은 idx가 아닌 iconKey를 식별자로 사용
//         // originalIconKey를 사용하여 원래 아이콘을 식별
//         if (!itemToUpdate.originalIconKey && selectedItem?.iconKey) {
//           itemToUpdate.originalIconKey = selectedItem.iconKey;
//         }

//         // 아이콘은 iconKey로 API 엔드포인트 구성
//         endpoint = `${apiPath}/${itemToUpdate.originalIconKey}`;
//       } else {
//         // 목표/직업 탭의 경우 idx를 사용
//         if (selectedItem && selectedItem.idx) {
//           itemToUpdate.idx = selectedItem.idx;
//           endpoint = `${apiPath}/${selectedItem.idx}`;
//         } else {
//           throw new Error(`${activeTab} 항목의 idx가 없습니다.`);
//         }
//       }

//       console.log("수정 요청 데이터:", itemToUpdate);
//       console.log("요청 엔드포인트:", endpoint);

//       const response = await axiosInstance.patch(endpoint, itemToUpdate, {
//         headers: { Authorization: `Bearer ${accessToken}` },
//       });

//       if (response?.status === 200) {
//         console.log(`${activeTab} 항목 수정 성공:`, response.data);
//         fetchData(); // 데이터 다시 불러오기
//         setIsEditModalOpen(false);
//         setSelectedItem(null);
//       } else {
//         console.error(`${activeTab} 항목 수정 실패:`, response);
//         setError(`${activeTab} 항목 수정에 실패했습니다.`);
//       }
//     } catch (err) {
//       console.error(`${activeTab} 항목 수정 오류:`, err);
//       setError(`${activeTab} 항목 수정 중 오류가 발생했습니다. ${err.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // 수정된 함수: 항목 삭제 처리
//   const handleDeleteItem = async () => {
//     if (!selectedItem) {
//       setError("삭제할 항목을 선택해주세요.");
//       return;
//     }

//     // 아이콘 탭인 경우 iconKey 확인, 목표/직업 탭인 경우 idx 확인
//     if (activeTab === "아이콘" && !selectedItem.iconKey) {
//       setError("삭제할 아이콘의 iconKey가 없습니다.");
//       return;
//     } else if (activeTab !== "아이콘" && !selectedItem.idx) {
//       setError("삭제할 항목의 idx가 없습니다.");
//       return;
//     }

//     setIsLoading(true);

//     try {
//       const accessToken = localStorage.getItem("accessToken");
//       const apiPath = getApiPath();
//       let endpoint;

//       // 아이콘 탭인 경우와 그렇지 않은 경우를 구분
//       if (activeTab === "아이콘") {
//         // 아이콘은 iconKey로 API 엔드포인트 구성
//         endpoint = `${apiPath}/${selectedItem.iconKey}`;
//       } else {
//         // 목표/직업 탭의 경우 idx를 사용
//         endpoint = `${apiPath}/${selectedItem.idx}`;
//       }

//       console.log("삭제 요청 엔드포인트:", endpoint);

//       const response = await axiosInstance.delete(endpoint, {
//         headers: { Authorization: `Bearer ${accessToken}` },
//       });

//       if (response?.status === 200) {
//         console.log(`${activeTab} 항목 삭제 성공:`, response.data);
//         fetchData(); // 데이터 다시 불러오기
//         setIsDeleteModalOpen(false);
//         setSelectedItem(null);
//       } else {
//         console.error(`${activeTab} 항목 삭제 실패:`, response);
//         setError(`${activeTab} 항목 삭제에 실패했습니다.`);
//       }
//     } catch (err) {
//       console.error(`${activeTab} 항목 삭제 오류:`, err);
//       setError(`${activeTab} 항목 삭제 중 오류가 발생했습니다. ${err.message}`);
//     } finally {
//       setIsLoading(false);
//     }
//   };

//   // 검색어로 필터링된 데이터
//   const filteredData = itemData.filter((item) => {
//     return (
//       item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.iconKey?.toLowerCase().includes(searchTerm.toLowerCase()) ||
//       item.icon?.toLowerCase().includes(searchTerm.toLowerCase())
//     );
//   });

//   return (
//     <>
//       {/* 탭 네비게이션 */}
//       <div className="flex mb-6 space-x-2">
//         <button
//           className={`px-6 py-3 rounded-md ${
//             activeTab === "목표" ? "bg-blue-500 text-white" : "bg-gray-200"
//           }`}
//           onClick={() => handleTabChange("목표")}
//         >
//           목표
//         </button>
//         <button
//           className={`px-6 py-3 rounded-md ${
//             activeTab === "직업" ? "bg-blue-500 text-white" : "bg-gray-200"
//           }`}
//           onClick={() => handleTabChange("직업")}
//         >
//           직업
//         </button>
//         <button
//           className={`px-6 py-3 rounded-md ${
//             activeTab === "아이콘" ? "bg-blue-500 text-white" : "bg-gray-200"
//           }`}
//           onClick={() => handleTabChange("아이콘")}
//         >
//           아이콘
//         </button>
//         <div className="flex-grow"></div>
//         <button
//           className="px-6 py-3 bg-blue-500 text-white rounded-md"
//           onClick={handleOpenAddModal}
//         >
//           새 항목 추가
//         </button>
//       </div>

//       {/* 검색 */}
//       <div className="mb-6">
//         <div className="relative">
//           <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
//             <Search size={20} className="text-gray-400" />
//           </div>
//           <input
//             type="text"
//             className="w-full pl-10 pr-4 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//             placeholder="검색"
//             value={searchTerm}
//             onChange={handleSearchChange}
//           />
//         </div>
//       </div>

//       {/* 로딩 및 에러 상태 */}
//       {isLoading && (
//         <div className="flex justify-center py-8">
//           <p className="text-gray-500">데이터를 불러오는 중...</p>
//         </div>
//       )}
//       {error && (
//         <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
//           <p>{error}</p>
//         </div>
//       )}

//       {/* 테이블 컴포넌트 */}
//       {!isLoading && !error && (
//         <ItemTable
//           items={filteredData}
//           currentPage={currentPage}
//           setCurrentPage={setCurrentPage}
//           searchTerm={searchTerm}
//           onEdit={openEditModal}
//           onDelete={openDeleteModal}
//           itemType={activeTab}
//           iconItems={iconData} // 아이콘 데이터 전달
//         />
//       )}

//       {/* 모달 컴포넌트들 */}
//       {isAddModalOpen && (
//         <AddItemModal
//           isOpen={isAddModalOpen}
//           onClose={() => setIsAddModalOpen(false)}
//           onAdd={handleAddItem} // 수정된 부분: 추가 핸들러 연결
//           itemType={activeTab}
//           iconList={iconData}
//         />
//       )}

//       {isEditModalOpen && selectedItem && (
//         <EditItemModal
//           isOpen={isEditModalOpen}
//           onClose={() => {
//             setIsEditModalOpen(false);
//             setSelectedItem(null);
//           }}
//           onEdit={handleEditItem} // 수정된 부분: 수정 핸들러 연결
//           item={selectedItem}
//           itemType={activeTab}
//           iconData={iconData}
//         />
//       )}

//       {isDeleteModalOpen && selectedItem && (
//         <DeleteConfirmModal
//           isOpen={isDeleteModalOpen}
//           onClose={() => {
//             setIsDeleteModalOpen(false);
//             setSelectedItem(null);
//           }}
//           onDelete={handleDeleteItem} // 수정된 부분: 삭제 핸들러 연결
//           item={selectedItem}
//           itemType={activeTab}
//         />
//       )}
//     </>
//   );
// };

// export default CompSystem;
import React, { useState, useEffect, useRef } from "react";
import { Search, X, Clock, Trash2 } from "lucide-react";
import axiosInstance from "@/api/axiosInstance";
import ItemTable from "./ItemTable";
import DeleteConfirmModal from "./delete";
import EditItemModal from "./edit";
import AddItemModal from "./add";
import TopMenu from "../topMenu/topMenu";

const CompSystem = () => {
  // 기존 상태들
  const [activeTab, setActiveTab] = useState("목표");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemData, setItemData] = useState([]);
  const [iconData, setIconData] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null);

  // 최근 검색어 관련 상태
  const [recentSearches, setRecentSearches] = useState([]);
  const [showRecentSearches, setShowRecentSearches] = useState(false);
  const searchInputRef = useRef(null);
  const recentSearchesRef = useRef(null);

  // 최근 검색어 키 (탭별로 다르게 저장)
  const getRecentSearchKey = () => `recentSearches_${activeTab}`;

  // 최근 검색어 불러오기
  const loadRecentSearches = () => {
    try {
      const stored = localStorage.getItem(getRecentSearchKey());
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

  // 최근 검색어 저장
  const saveRecentSearch = (term) => {
    if (!term.trim()) return;

    try {
      const trimmedTerm = term.trim();
      let searches = [...recentSearches];

      // 중복 제거
      searches = searches.filter((search) => search !== trimmedTerm);

      // 맨 앞에 추가
      searches.unshift(trimmedTerm);

      // 최대 10개까지만 저장
      searches = searches.slice(0, 10);

      setRecentSearches(searches);
      localStorage.setItem(getRecentSearchKey(), JSON.stringify(searches));
    } catch (error) {
      console.error("최근 검색어 저장 실패:", error);
    }
  };

  // 개별 검색어 삭제
  const removeRecentSearch = (termToRemove) => {
    try {
      const updatedSearches = recentSearches.filter(
        (term) => term !== termToRemove
      );
      setRecentSearches(updatedSearches);
      localStorage.setItem(
        getRecentSearchKey(),
        JSON.stringify(updatedSearches)
      );
    } catch (error) {
      console.error("검색어 삭제 실패:", error);
    }
  };

  // 전체 검색어 삭제
  const clearAllRecentSearches = () => {
    try {
      setRecentSearches([]);
      localStorage.removeItem(getRecentSearchKey());
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

  // 탭 변경 시 최근 검색어 다시 로드
  useEffect(() => {
    loadRecentSearches();
  }, [activeTab]);

  // 컴포넌트 마운트 시 최근 검색어 로드
  useEffect(() => {
    loadRecentSearches();
  }, []);

  // API 경로 설정 (탑메뉴 추가)
  const getApiPath = () => {
    switch (activeTab) {
      case "목표":
        return "/categories/target";
      case "직업":
        return "/categories/job";
      case "아이콘":
        return "/categories/admin/icon";
      case "탑메뉴":
        return "/categories/topMenu";
    }
  };

  // 수정된: 아이콘 데이터 가져오기 함수
  const fetchIconData = async () => {
    try {
      // 이미 데이터가 있으면 다시 불러오지 않음
      if (iconData && iconData.length > 0) return;

      console.log("아이콘 데이터 가져오기 요청...");
      const accessToken = localStorage.getItem("accessToken");
      const response = await axiosInstance.get("/categories/admin/icon", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // 디버깅을 위해 전체 응답 구조 로깅
      console.log("아이콘 API 응답 전체:", response.data);
      console.log("아이콘 API 응답 키들:", Object.keys(response.data || {}));

      // 여러 가능한 경로 확인
      let iconDataArray = null;

      if (response?.data?.ICON && Array.isArray(response.data.ICON)) {
        iconDataArray = response.data.ICON;
      } else if (response?.data?.icons && Array.isArray(response.data.icons)) {
        iconDataArray = response.data.icons;
      } else if (response?.data?.data && Array.isArray(response.data.data)) {
        iconDataArray = response.data.data;
      } else if (Array.isArray(response.data)) {
        iconDataArray = response.data;
      }

      if (iconDataArray) {
        console.log(
          "아이콘 데이터 로드 완료:",
          iconDataArray.length,
          "개 항목"
        );
        setIconData(iconDataArray);
      } else {
        console.error(
          "아이콘 데이터를 찾을 수 없습니다. 응답 구조:",
          response.data
        );
      }
    } catch (err) {
      console.error("아이콘 데이터 로드 실패:", err);
    }
  };

  // 수정된: API에서 데이터 가져오기 (탑메뉴 처리 제거)
  const fetchData = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const accessToken = localStorage.getItem("accessToken");
      const apiPath = getApiPath();

      const response = await axiosInstance.get(apiPath, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      // 디버깅을 위해 전체 응답 구조 로깅
      console.log(`${activeTab} API 응답 전체:`, response.data);
      console.log(
        `${activeTab} API 응답 키들:`,
        Object.keys(response.data || {})
      );

      if (response?.data) {
        // 아이콘 탭인 경우
        if (activeTab === "아이콘") {
          // 여러 가능한 경로 확인
          let iconDataArray = null;

          if (response.data.ICON && Array.isArray(response.data.ICON)) {
            iconDataArray = response.data.ICON;
          } else if (
            response.data.icons &&
            Array.isArray(response.data.icons)
          ) {
            iconDataArray = response.data.icons;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            iconDataArray = response.data.data;
          } else if (Array.isArray(response.data)) {
            iconDataArray = response.data;
          }

          if (iconDataArray) {
            console.log(
              `${activeTab} 데이터 로드 성공:`,
              iconDataArray.length,
              "개 항목"
            );
            setItemData(iconDataArray);
            setIconData(iconDataArray); // 아이콘 데이터도 업데이트
          } else {
            console.error(
              "아이콘 데이터를 찾을 수 없습니다. 응답 구조:",
              response.data
            );
            setItemData([]);
            setError("아이콘 데이터 형식이 올바르지 않습니다");
          }
        }
        // 목표/직업 탭인 경우
        else {
          // 여러 가능한 경로 확인
          let categoryData = null;

          if (
            response.data.categories &&
            Array.isArray(response.data.categories)
          ) {
            categoryData = response.data.categories;
          } else if (response.data.data && Array.isArray(response.data.data)) {
            categoryData = response.data.data;
          } else if (
            response.data.items &&
            Array.isArray(response.data.items)
          ) {
            categoryData = response.data.items;
          } else if (Array.isArray(response.data)) {
            categoryData = response.data;
          }

          if (categoryData) {
            console.log(
              `${activeTab} 데이터 로드 성공:`,
              categoryData.length,
              "개 항목"
            );
            setItemData(categoryData);
          } else {
            console.error(
              `${activeTab} 데이터를 찾을 수 없습니다. 응답 구조:`,
              response.data
            );
            setItemData([]);
            setError("데이터 형식이 올바르지 않습니다");
          }
        }
      } else {
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

  // 핵심: 컴포넌트 마운트 시 우선 아이콘 데이터 로드 후 탭 데이터 로드
  useEffect(() => {
    const loadData = async () => {
      await fetchIconData(); // 먼저 아이콘 데이터 로드
      // 탑메뉴가 아닌 경우에만 fetchData 호출 (탑메뉴는 TopMenu 컴포넌트에서 처리)
      if (activeTab !== "탑메뉴") {
        fetchData(); // 그 다음 현재 탭 데이터 로드
      }
    };

    loadData();
  }, []);

  // 핵심: 탭이 변경될 때마다 데이터 다시 가져오기 (탑메뉴 제외)
  useEffect(() => {
    if (activeTab !== "탑메뉴") {
      fetchData();
    }
  }, [activeTab]);

  // 핵심: 아이콘 데이터가 변경될 때마다 로그
  useEffect(() => {
    console.log("iconData 상태 업데이트:", iconData?.length || 0);
  }, [iconData]);

  // 기존 핸들러들
  const handleTabChange = (tab) => {
    setActiveTab(tab);
    setSearchTerm("");
    setShowRecentSearches(false);
  };

  // 수정된 검색 변경 핸들러
  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);

    // 검색어가 있고 포커스가 있을 때만 최근 검색어 표시
    if (value.length === 0 && recentSearches.length > 0) {
      setShowRecentSearches(true);
    } else {
      setShowRecentSearches(false);
    }
  };

  // 검색 입력란 포커스 핸들러
  const handleSearchFocus = () => {
    if (recentSearches.length > 0) {
      setShowRecentSearches(true);
    }
  };

  // 엔터 키 검색 핸들러
  const handleSearchKeyDown = (e) => {
    if (e.key === "Enter" && searchTerm.trim()) {
      saveRecentSearch(searchTerm);
      setShowRecentSearches(false);
    }
  };

  // 최근 검색어 클릭 핸들러
  const handleRecentSearchClick = (term) => {
    setSearchTerm(term);
    setShowRecentSearches(false);
    saveRecentSearch(term);
  };

  // 핵심: 모달 열기 전에 아이콘 데이터 확인 (탑메뉴는 아이콘 데이터 불필요)
  const handleOpenAddModal = async () => {
    if (activeTab !== "탑메뉴") {
      await fetchIconData(); // 아이콘 데이터 확인 및 필요시 로드
    }
    setIsAddModalOpen(true);
  };

  // 핵심: 편집 모달 열기 전 아이콘 데이터 확인
  const openEditModal = async (item) => {
    setSelectedItem(item);
    await fetchIconData(); // 아이콘 데이터 확인 및 필요시 로드
    setIsEditModalOpen(true);
  };

  // 기존 삭제 모달 열기
  const openDeleteModal = (item) => {
    setSelectedItem(item);
    setIsDeleteModalOpen(true);
  };

  // 추가된 함수: 항목 추가 처리 (탑메뉴 지원 추가)
  const handleAddItem = async (newItem) => {
    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem("accessToken");
      const apiPath = getApiPath();

      const response = await axiosInstance.post(apiPath, newItem, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response?.status === 200 || response?.status === 201) {
        console.log(`${activeTab} 항목 추가 성공:`, response.data);

        // 탭메뉴인 경우 페이지 새로고침으로 TopMenu 컴포넌트 데이터 갱신
        if (activeTab === "탑메뉴") {
          window.location.reload();
        } else {
          fetchData(); // 데이터 다시 불러오기
        }

        setIsAddModalOpen(false);
      } else {
        console.error(`${activeTab} 항목 추가 실패:`, response);
        setError(`${activeTab} 항목 추가에 실패했습니다.`);
      }
    } catch (err) {
      console.error(`${activeTab} 항목 추가 오류:`, err);
      setError(`${activeTab} 항목 추가 중 오류가 발생했습니다.`);
    } finally {
      setIsLoading(false);
    }
  };

  // 수정된 함수: 항목 수정 처리
  const handleEditItem = async (updatedItem) => {
    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem("accessToken");
      const apiPath = getApiPath();
      let endpoint;
      let itemToUpdate = { ...updatedItem };

      // 아이콘 탭인 경우
      if (activeTab === "아이콘") {
        // 아이콘은 idx가 아닌 iconKey를 식별자로 사용
        // originalIconKey를 사용하여 원래 아이콘을 식별
        if (!itemToUpdate.originalIconKey && selectedItem?.iconKey) {
          itemToUpdate.originalIconKey = selectedItem.iconKey;
        }

        // 아이콘은 iconKey로 API 엔드포인트 구성
        endpoint = `${apiPath}/${itemToUpdate.originalIconKey}`;
      }
      // 탑메뉴 탭인 경우
      else if (activeTab === "탑메뉴") {
        if (selectedItem && selectedItem.topIdx) {
          endpoint = `${apiPath}/${selectedItem.topIdx}`;
        } else {
          throw new Error("탑메뉴 항목의 topIdx가 없습니다.");
        }
      }
      // 목표/직업 탭인 경우
      else {
        if (selectedItem && selectedItem.idx) {
          itemToUpdate.idx = selectedItem.idx;
          endpoint = `${apiPath}/${selectedItem.idx}`;
        } else {
          throw new Error(`${activeTab} 항목의 idx가 없습니다.`);
        }
      }

      console.log("수정 요청 데이터:", itemToUpdate);
      console.log("요청 엔드포인트:", endpoint);

      const response = await axiosInstance.patch(endpoint, itemToUpdate, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response?.status === 200) {
        console.log(`${activeTab} 항목 수정 성공:`, response.data);

        // 탑메뉴인 경우 페이지 새로고침으로 데이터 갱신
        if (activeTab === "탑메뉴") {
          window.location.reload();
        } else {
          fetchData(); // 데이터 다시 불러오기
        }

        setIsEditModalOpen(false);
        setSelectedItem(null);
      } else {
        console.error(`${activeTab} 항목 수정 실패:`, response);
        setError(`${activeTab} 항목 수정에 실패했습니다.`);
      }
    } catch (err) {
      console.error(`${activeTab} 항목 수정 오류:`, err);
      setError(`${activeTab} 항목 수정 중 오류가 발생했습니다. ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 수정된 함수: 항목 삭제 처리
  const handleDeleteItem = async () => {
    if (!selectedItem) {
      setError("삭제할 항목을 선택해주세요.");
      return;
    }

    // 아이콘 탭인 경우 iconKey 확인, 목표/직업 탭인 경우 idx 확인
    if (activeTab === "아이콘" && !selectedItem.iconKey) {
      setError("삭제할 아이콘의 iconKey가 없습니다.");
      return;
    } else if (activeTab !== "아이콘" && !selectedItem.idx) {
      setError("삭제할 항목의 idx가 없습니다.");
      return;
    }

    setIsLoading(true);

    try {
      const accessToken = localStorage.getItem("accessToken");
      const apiPath = getApiPath();
      let endpoint;

      // 아이콘 탭인 경우와 그렇지 않은 경우를 구분
      if (activeTab === "아이콘") {
        // 아이콘은 iconKey로 API 엔드포인트 구성
        endpoint = `${apiPath}/${selectedItem.iconKey}`;
      } else {
        // 목표/직업 탭의 경우 idx를 사용
        endpoint = `${apiPath}/${selectedItem.idx}`;
      }

      console.log("삭제 요청 엔드포인트:", endpoint);

      const response = await axiosInstance.delete(endpoint, {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (response?.status === 200) {
        console.log(`${activeTab} 항목 삭제 성공:`, response.data);
        fetchData(); // 데이터 다시 불러오기
        setIsDeleteModalOpen(false);
        setSelectedItem(null);
      } else {
        console.error(`${activeTab} 항목 삭제 실패:`, response);
        setError(`${activeTab} 항목 삭제에 실패했습니다.`);
      }
    } catch (err) {
      console.error(`${activeTab} 항목 삭제 오류:`, err);
      setError(`${activeTab} 항목 삭제 중 오류가 발생했습니다. ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  // 검색어로 필터링된 데이터
  const filteredData = itemData.filter((item) => {
    return (
      item.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.iconKey?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.icon?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

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
            activeTab === "직업" ? "bg-blue-500 text-white" : "bg-gray-200"
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
        <button
          className={`px-6 py-3 rounded-md ${
            activeTab === "탑메뉴" ? "bg-blue-500 text-white" : "bg-gray-200"
          }`}
          onClick={() => handleTabChange("탑메뉴")}
        >
          탑메뉴
        </button>
        <div className="flex-grow"></div>
        <button
          className="px-6 py-3 bg-blue-500 text-white rounded-md"
          onClick={handleOpenAddModal}
        >
          새 항목 추가
        </button>
      </div>

      {/* 탑메뉴가 아닌 경우 검색 표시 */}
      {activeTab !== "탑메뉴" && (
        <div className="mb-6 relative">
          <div className="relative">
            <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search size={20} className="text-gray-400" />
            </div>
            <input
              ref={searchInputRef}
              type="text"
              className="w-full pl-10 pr-10 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="검색어를 입력하세요."
              value={searchTerm}
              onChange={handleSearchChange}
              onFocus={handleSearchFocus}
              onKeyDown={handleSearchKeyDown}
            />
            {/* 검색어 지우기 버튼 */}
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
      )}

      {/* 탑메뉴인 경우 TopMenu 컴포넌트, 아닌 경우 기존 로직 */}
      {activeTab === "탑메뉴" ? (
        <TopMenu />
      ) : (
        <>
          {/* 로딩 및 에러 상태 */}
          {isLoading && (
            <div className="flex justify-center py-8">
              <p className="text-gray-500">데이터를 불러오는 중...</p>
            </div>
          )}
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
              iconItems={iconData} // 아이콘 데이터 전달
            />
          )}
        </>
      )}

      {/* 모달 컴포넌트들 */}
      {isAddModalOpen && (
        <AddItemModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onAdd={handleAddItem} // 수정된 부분: 추가 핸들러 연결
          itemType={activeTab}
          iconList={iconData}
        />
      )}

      {isEditModalOpen && selectedItem && (
        <EditItemModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedItem(null);
          }}
          onEdit={handleEditItem} // 수정된 부분: 수정 핸들러 연결
          item={selectedItem}
          itemType={activeTab}
          iconData={iconData}
        />
      )}

      {isDeleteModalOpen && selectedItem && (
        <DeleteConfirmModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setSelectedItem(null);
          }}
          onDelete={handleDeleteItem} // 수정된 부분: 삭제 핸들러 연결
          item={selectedItem}
          itemType={activeTab}
        />
      )}
    </>
  );
};

export default CompSystem;
