// import React, { useState, useEffect } from "react";
// import { renderIcon } from "@/components/common/badge-selector/icon-utils";
// const AddItemModal = ({ isOpen, onClose, onAdd, itemType, iconList = [] }) => {
//   const [formData, setFormData] = useState({
//     name: "",
//     iconKey: "",
//     color: "#3B82F6", // 색상 필드 추가
//   });

//   // 디버깅용: iconList 확인
//   useEffect(() => {
//     console.log("AddItemModal - iconList:", iconList);
//   }, [iconList]);

//   // 탭 변경시 폼 초기화
//   useEffect(() => {
//     // iconList가 있으면 첫 번째 아이콘을 기본값으로 설정
//     const initialIconKey =
//       Array.isArray(iconList) && iconList.length > 0 ? iconList[0].iconKey : "";

//     setFormData({
//       name: "",
//       iconKey: initialIconKey,
//       color: "#3B82F6", // 기본 색상
//     });
//   }, [itemType, iconList]);

//   // 폼 데이터 변경 처리
//   const handleChange = (e) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({
//       ...prev,
//       [name]: value,
//     }));
//   };

//   // 폼 제출 처리
//   const handleSubmit = (e) => {
//     e.preventDefault();

//     // 데이터 유효성 검사
//     if (!formData.name.trim()) {
//       alert("이름은 필수 입력사항입니다.");
//       return;
//     }

//     if (!formData.iconKey) {
//       alert("아이콘키는 필수 입력사항입니다.");
//       return;
//     }

//     if (itemType === "아이콘") {
//       if (!formData.color.trim()) {
//         alert("색상은 필수 입력사항입니다.");
//         return;
//       }

//       // 아이콘 탭에서는 name, iconKey, icon, color 필드 전송
//       onAdd({
//         name: formData.name, // 사용자가 입력한 이름
//         iconKey: formData.iconKey,
//         icon: formData.name, // 아이콘 이름을 사용자 입력값으로 사용
//         color: formData.color,
//       });
//     } else {
//       // 목표/직업 탭에서는 name과 iconKey만 필요
//       onAdd({
//         name: formData.name,
//         iconKey: formData.iconKey,
//       });
//     }
//   };

//   // 현재 선택된 아이콘의 색상 찾기
//   const getCurrentIconColor = (iconKey) => {
//     if (!iconKey) return "#3B82F6"; // 기본 색상

//     // 아이콘 탭에서는 사용자가 선택한 색상을 우선으로 사용
//     if (itemType === "아이콘" && formData.color) {
//       return formData.color;
//     }

//     const iconInfo = iconList.find((icon) => icon.iconKey === iconKey);
//     return iconInfo ? iconInfo.color : "#3B82F6";
//   };

//   // 모달이 닫혀있으면 렌더링하지 않음
//   if (!isOpen) return null;

//   // 모달 타이틀 설정
//   const getModalTitle = () => {
//     switch (itemType) {
//       case "목표":
//         return "목표 추가";
//       case "직업":
//         return "직업 추가";
//       case "아이콘":
//         return "아이콘 추가";
//       default:
//         return "항목 추가";
//     }
//   };

//   // iconList가 비어있는지 확인
//   const hasIconList = Array.isArray(iconList) && iconList.length > 0;

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-6 w-full max-w-md">
//         <h2 className="text-xl font-semibold mb-4">{getModalTitle()}</h2>

//         <form onSubmit={handleSubmit}>
//           {/* 이름 필드 - 모든 탭에서 표시 */}
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               {itemType === "아이콘" ? "아이콘 이름" : "이름"}
//             </label>
//             <input
//               type="text"
//               name="name"
//               value={formData.name}
//               onChange={handleChange}
//               className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//               placeholder={
//                 itemType === "아이콘"
//                   ? "예: 업무용 아이콘"
//                   : `${itemType} 이름을 입력하세요`
//               }
//               required
//             />
//           </div>

//           {/* 아이콘키 선택 */}
//           <div className="mb-4">
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               아이콘키
//             </label>
//             {hasIconList ? (
//               <div className="space-y-3">
//                 {/* 드롭다운 선택 */}
//                 <select
//                   name="iconKey"
//                   value={formData.iconKey}
//                   onChange={handleChange}
//                   className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 >
//                   <option value="">아이콘을 선택하세요</option>
//                   {iconList.map((icon) => (
//                     <option key={icon.idx} value={icon.iconKey}>
//                       {icon.iconKey} ({icon.icon || "이름없음"})
//                     </option>
//                   ))}
//                 </select>
//               </div>
//             ) : (
//               // iconList가 없는 경우 직접 입력으로 대체
//               <div className="flex items-center space-x-3">
//                 <input
//                   type="text"
//                   name="iconKey"
//                   value={formData.iconKey}
//                   onChange={handleChange}
//                   className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
//                   required
//                 />
//                 {/* 미리보기 */}
//                 <div className="flex items-center justify-center w-10 h-10 border rounded-md bg-gray-50">
//                   {formData.iconKey ? (
//                     renderIcon(
//                       formData.iconKey,
//                       20,
//                       "",
//                       false,
//                       getCurrentIconColor(formData.iconKey)
//                     )
//                   ) : (
//                     <span className="text-gray-400 text-xs">미리보기</span>
//                   )}
//                 </div>
//               </div>
//             )}
//           </div>

//           {/* 아이콘 탭인 경우 색상 선택 */}
//           {itemType === "아이콘" && (
//             <div className="mb-4">
//               <div className="space-y-3">
//                 {/* 색상 선택 도구들 */}
//                 <div className="flex items-center space-x-3">
//                   {/* 색상 picker */}
//                   <div className="flex items-center space-x-2">
//                     <label className="text-sm text-gray-600">색상 선택:</label>
//                     <input
//                       type="color"
//                       name="color"
//                       value={formData.color}
//                       onChange={handleChange}
//                       className="w-10 h-10 border rounded cursor-pointer"
//                       title="색상을 클릭해서 선택하세요"
//                     />
//                   </div>

//                   {/* 직접 입력 */}
//                   <div className="flex-1">
//                     <input
//                       type="text"
//                       name="color"
//                       value={formData.color}
//                       onChange={handleChange}
//                       placeholder="#3B82F6"
//                       className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
//                       pattern="^#[0-9A-Fa-f]{6}$"
//                       title="예: #3B82F6"
//                     />
//                   </div>
//                 </div>
//                 {/* 아이콘 미리보기 */}
//                 <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border">
//                   <span className="text-sm text-gray-600">
//                     아이콘 미리보기:
//                   </span>
//                   <div className="flex items-center space-x-2">
//                     {formData.iconKey &&
//                       renderIcon(
//                         formData.iconKey,
//                         28,
//                         "",
//                         false,
//                         formData.color
//                       )}
//                     <div className="flex flex-col">
//                       {formData.name && (
//                         <span className="text-xs text-gray-500">
//                           {formData.name}
//                         </span>
//                       )}
//                     </div>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           )}

//           <div className="flex justify-end space-x-2 mt-6">
//             <button
//               type="button"
//               onClick={onClose}
//               className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
//             >
//               취소
//             </button>
//             <button
//               type="submit"
//               className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
//             >
//               추가
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// };

// export default AddItemModal;
import React, { useState, useEffect } from "react";
import { renderIcon } from "@/components/common/badge-selector/icon-utils";

const AddItemModal = ({ isOpen, onClose, onAdd, itemType, iconList = [] }) => {
  const [formData, setFormData] = useState({
    name: "",
    iconKey: "",
    color: "#3B82F6", // 기본 색상
    addr: "", // 탑메뉴용 주소 필드
    ordCol: "", // 탑메뉴용 순서 필드
    parentIdx: "", // 탑메뉴용 부모 인덱스
    categoryLevel: "1", // 탑메뉴용 카테고리 레벨
  });

  // 모달이 열릴 때마다 폼 초기화
  useEffect(() => {
    if (isOpen) {
      if (itemType === "탑메뉴") {
        setFormData({
          name: "",
          addr: "",
          ordCol: "",
          parentIdx: "",
          categoryLevel: "1",
          iconKey: "",
          color: "#3B82F6",
        });
      } else {
        setFormData({
          name: "",
          iconKey: "",
          color: "#3B82F6",
          addr: "",
          ordCol: "",
          parentIdx: "",
          categoryLevel: "1",
        });
      }
    }
  }, [isOpen, itemType]);

  // 폼 데이터 변경 처리
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // 폼 제출 처리
  const handleSubmit = (e) => {
    e.preventDefault();

    // 데이터 유효성 검사
    if (itemType === "아이콘") {
      if (!formData.iconKey.trim()) {
        alert("아이콘키는 필수 입력사항입니다.");
        return;
      }

      if (!formData.color.trim()) {
        alert("색상은 필수 입력사항입니다.");
        return;
      }

      // 아이콘 탭에서는 iconKey, color 전송
      onAdd({
        iconKey: formData.iconKey,
        color: formData.color,
      });
    } else if (itemType === "탑메뉴") {
      if (!formData.name.trim()) {
        alert("메뉴명은 필수 입력사항입니다.");
        return;
      }

      if (!formData.addr.trim()) {
        alert("주소는 필수 입력사항입니다.");
        return;
      }

      if (!formData.ordCol || isNaN(Number(formData.ordCol))) {
        alert("순서는 숫자로 입력해주세요.");
        return;
      }

      // 탑메뉴 탭에서는 API 형식에 맞게 변환해서 전송 - 5개 필드 모두 포함
      onAdd({
        topName: formData.name,
        topAddr: formData.addr,
        parentIdx: formData.parentIdx ? Number(formData.parentIdx) : null,
        categoryLevel: Number(formData.categoryLevel),
        ordCol: Number(formData.ordCol),
      });
    } else {
      // 목표/직업 탭
      if (!formData.name.trim()) {
        alert("이름은 필수 입력사항입니다.");
        return;
      }

      if (!formData.iconKey.trim()) {
        alert("아이콘키는 필수 입력사항입니다.");
        return;
      }

      onAdd({
        name: formData.name,
        iconKey: formData.iconKey,
      });
    }
  };

  // 현재 선택된 아이콘의 색상 찾기
  const getCurrentIconColor = (iconKey) => {
    if (!iconKey) return "#3B82F6"; // 기본 색상

    // 아이콘 탭에서는 사용자가 입력한 색상을 우선으로 사용
    if (itemType === "아이콘" && formData.color) {
      return formData.color;
    }

    const iconInfo = iconList.find((icon) => icon.iconKey === iconKey);
    return iconInfo ? iconInfo.color : "#3B82F6";
  };

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  // 모달 타이틀 설정
  const getModalTitle = () => {
    switch (itemType) {
      case "목표":
        return "새 목표 추가";
      case "직업":
        return "새 직업 추가";
      case "아이콘":
        return "새 아이콘 추가";
      case "탑메뉴":
        return "새 탑메뉴 추가";
      default:
        return "새 항목 추가";
    }
  };

  // iconList가 비어있는지 확인
  const hasIconData = Array.isArray(iconList) && iconList.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">{getModalTitle()}</h2>

        <form onSubmit={handleSubmit}>
          {/* 아이콘 탭이 아닌 경우 이름/메뉴명 필드 표시 */}
          {itemType !== "아이콘" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                {itemType === "탑메뉴" ? "메뉴명" : "이름"}
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            </div>
          )}

          {/* 탑메뉴 전용 필드들 */}
          {itemType === "탑메뉴" && (
            <>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  주소
                </label>
                <input
                  type="text"
                  name="addr"
                  value={formData.addr}
                  onChange={handleChange}
                  placeholder="/example"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  부모 인덱스
                </label>
                <input
                  type="number"
                  name="parentIdx"
                  value={formData.parentIdx}
                  onChange={handleChange}
                  placeholder="부모가 없으면 비워두세요"
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  카테고리 레벨
                </label>
                <select
                  name="categoryLevel"
                  value={formData.categoryLevel}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  <option value="1">1 (최상위)</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  순서
                </label>
                <input
                  type="number"
                  name="ordCol"
                  value={formData.ordCol}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                  min="1"
                />
              </div>
            </>
          )}

          {/* 아이콘 탭인 경우 */}
          {itemType === "아이콘" && (
            <>
              {/* 아이콘키 입력 */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  아이콘키
                </label>
                {hasIconData ? (
                  <div className="space-y-3">
                    {/* 드롭다운 선택 */}
                    <select
                      name="iconKey"
                      value={formData.iconKey}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    >
                      <option value="">아이콘을 선택하세요</option>
                      {iconList.map((icon) => (
                        <option key={icon.idx} value={icon.iconKey}>
                          {icon.iconKey} ({icon.icon || "이름없음"})
                        </option>
                      ))}
                    </select>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <input
                      type="text"
                      name="iconKey"
                      value={formData.iconKey}
                      onChange={handleChange}
                      className="flex-1 px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                    {/* 미리보기 */}
                    <div className="flex items-center justify-center w-10 h-10 border rounded-md bg-gray-50">
                      {formData.iconKey ? (
                        renderIcon(
                          formData.iconKey,
                          20,
                          "",
                          false,
                          getCurrentIconColor(formData.iconKey)
                        )
                      ) : (
                        <span className="text-gray-400 text-xs">미리보기</span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              {/* 색상 선택 */}
              <div className="mb-4">
                <div className="space-y-3">
                  {/* 색상 선택 도구들 */}
                  <div className="flex items-center space-x-3">
                    {/* 색상 picker */}
                    <div className="flex items-center space-x-2">
                      <label className="text-sm text-gray-600">
                        색상 선택:
                      </label>
                      <input
                        type="color"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        className="w-10 h-10 border rounded cursor-pointer"
                        title="색상을 클릭해서 선택하세요"
                      />
                    </div>

                    {/* 직접 입력 */}
                    <div className="flex-1">
                      <input
                        type="text"
                        name="color"
                        value={formData.color}
                        onChange={handleChange}
                        placeholder="#3B82F6"
                        className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono text-sm"
                        pattern="^#[0-9A-Fa-f]{6}$"
                        title="예: #3B82F6"
                      />
                    </div>
                  </div>
                  {/* 색상 미리보기 */}
                  <div className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md border">
                    <span className="text-sm text-gray-600">
                      아이콘 미리보기:
                    </span>
                    <div className="flex items-center space-x-2">
                      {formData.iconKey &&
                        renderIcon(
                          formData.iconKey,
                          28,
                          "",
                          false,
                          formData.color
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* 목표/직업 탭인 경우 아이콘키 선택 */}
          {itemType !== "아이콘" && itemType !== "탑메뉴" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                아이콘키
              </label>
              {hasIconData ? (
                <div className="space-y-3">
                  {/* 현재 선택된 아이콘 미리보기 */}
                  {formData.iconKey && (
                    <div className="flex items-center space-x-2 p-3 bg-blue-50 rounded-md border">
                      <span className="text-sm text-gray-600">
                        선택된 아이콘:
                      </span>
                      <div className="flex items-center space-x-2">
                        {renderIcon(
                          formData.iconKey,
                          24,
                          "",
                          false,
                          getCurrentIconColor(formData.iconKey)
                        )}
                      </div>
                    </div>
                  )}

                  {/* 드롭다운 선택 */}
                  <select
                    name="iconKey"
                    value={formData.iconKey}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  >
                    <option value="">아이콘을 선택하세요</option>
                    {iconList.map((icon) => (
                      <option key={icon.idx} value={icon.iconKey}>
                        {icon.iconKey} ({icon.icon || "이름없음"})
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                <div className="flex items-center">
                  <input
                    type="text"
                    name="iconKey"
                    value={formData.iconKey}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    required
                  />
                  <span className="ml-2 text-red-500 text-xs">
                    아이콘 데이터를 불러오지 못했습니다. 직접 입력해주세요.
                  </span>
                </div>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-2 mt-6">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
            >
              취소
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600"
            >
              추가
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddItemModal;
