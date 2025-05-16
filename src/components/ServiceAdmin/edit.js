import React, { useState, useEffect } from "react";

const EditItemModal = ({
  isOpen,
  onClose,
  onEdit,
  item,
  itemType,
  iconData = [],
}) => {
  const [formData, setFormData] = useState({
    name: "",
    iconKey: "",
    originalIconKey: "",
  });

  // 디버깅용: iconData 확인
  useEffect(() => {
    console.log("EditItemModal - iconData:", iconData);
  }, [iconData]);

  // 항목 데이터가 변경될 때 폼 데이터 업데이트
  useEffect(() => {
    if (item) {
      if (itemType === "아이콘") {
        // 아이콘 탭일 경우 현재 iconKey를 originalIconKey로 저장
        setFormData({
          iconKey: item.iconKey || "", // 변경할 새 아이콘키 (사용자 입력용)
          originalIconKey: item.iconKey || "", // 원래 아이콘키 (수정 불가)
        });
      } else {
        // 목표/직업 탭일 경우
        setFormData({
          name: item.name || "",
          iconKey: item.iconKey || "",
        });
      }
    }
  }, [item, itemType]);

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

    if (itemType === "아이콘") {
      if (!formData.iconKey.trim()) {
        alert("아이콘키는 필수 입력사항입니다.");
        return;
      }

      // 아이콘 탭에서는 iconKey와 originalIconKey 모두 API로 전송
      onEdit({
        iconKey: formData.iconKey,
        originalIconKey: formData.originalIconKey,
      });
    } else {
      // 목표/직업 탭에서는 name과 iconKey만 전송
      onEdit({
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
        return "목표 수정";
      case "직업":
        return "직업 수정";
      case "아이콘":
        return "아이콘 수정";
      default:
        return "항목 수정";
    }
  };

  // iconData가 비어있는지 확인
  const hasIconData = Array.isArray(iconData) && iconData.length > 0;

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

          {/* 아이콘 탭인 경우 */}
          {itemType === "아이콘" && (
            <>
              {/* 새 아이콘키 (사용자 입력) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  새 아이콘키
                </label>
                <input
                  type="text"
                  name="iconKey"
                  value={formData.iconKey}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                />
              </div>

              {/* 원래 아이콘키 (자동 포함, 표시는 하지만 수정 불가) */}
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  원래 아이콘키 (자동 포함)
                </label>
                <input
                  type="text"
                  name="originalIconKey"
                  value={formData.originalIconKey}
                  className="w-full px-3 py-2 border rounded-md bg-gray-100"
                  readOnly
                />
              </div>
            </>
          )}

          {/* 목표/직업 탭인 경우 아이콘키 선택 */}
          {itemType !== "아이콘" && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                아이콘키
              </label>
              {hasIconData ? (
                <select
                  name="iconKey"
                  value={formData.iconKey}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  required
                >
                  {iconData.map((icon) => (
                    <option key={icon.idx} value={icon.iconKey}>
                      {icon.iconKey}
                    </option>
                  ))}
                </select>
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
              수정
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal;
