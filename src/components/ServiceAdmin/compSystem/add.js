import React, { useState, useEffect } from "react";

const AddItemModal = ({ isOpen, onClose, onAdd, itemType, iconList = [] }) => {
  const [formData, setFormData] = useState({
    name: "",
    iconKey: "",
  });

  // 디버깅용: iconList 확인
  useEffect(() => {
    console.log("AddItemModal - iconList:", iconList);
  }, [iconList]);

  // 탭 변경시 폼 초기화
  useEffect(() => {
    // iconList가 있으면 첫 번째 아이콘을 기본값으로 설정
    const initialIconKey =
      Array.isArray(iconList) && iconList.length > 0 ? iconList[0].iconKey : "";

    setFormData({
      name: "",
      iconKey: initialIconKey,
    });
  }, [itemType, iconList]);

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
    if (itemType !== "아이콘" && !formData.name.trim()) {
      alert("이름은 필수 입력사항입니다.");
      return;
    }

    if (!formData.iconKey) {
      alert("아이콘키는 필수 입력사항입니다.");
      return;
    }

    if (itemType === "아이콘") {
      // 아이콘 탭에서는 iconKey와 icon 필드를 동일하게 설정
      onAdd({
        iconKey: formData.iconKey,
        icon: formData.iconKey, // 아이콘 이름을 그대로 사용
      });
    } else {
      // 목표/직업 탭에서는 name과 iconKey만 필요
      onAdd({
        name: formData.name,
        iconKey: formData.iconKey,
      });
    }
  };

  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  // 모달 타이틀 설정
  const getModalTitle = () => {
    switch (itemType) {
      case "목표":
        return "목표 추가";
      case "직업":
        return "직업 추가";
      case "아이콘":
        return "아이콘 추가";
      default:
        return "항목 추가";
    }
  };

  // iconList가 비어있는지 확인
  const hasIconList = Array.isArray(iconList) && iconList.length > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">{getModalTitle()}</h2>

        <form onSubmit={handleSubmit}>
          {/* 아이콘 탭이 아닌 경우에만 이름 필드 표시 */}
          {itemType !== "아이콘" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                이름
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

          {/* 아이콘 탭인 경우 직접 입력, 목표/직업 탭인 경우 선택 */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              아이콘키
            </label>
            {itemType === "아이콘" ? (
              // 아이콘 탭에서는 직접 입력
              <input
                type="text"
                name="iconKey"
                value={formData.iconKey}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              />
            ) : hasIconList ? (
              // 목표/직업 탭에서는 드롭다운 선택 (iconList가 있는 경우)
              <select
                name="iconKey"
                value={formData.iconKey}
                onChange={handleChange}
                className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                required
              >
                {iconList.map((icon) => (
                  <option key={icon.idx} value={icon.iconKey}>
                    {icon.iconKey}
                  </option>
                ))}
              </select>
            ) : (
              // iconList가 없는 경우 직접 입력으로 대체
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
