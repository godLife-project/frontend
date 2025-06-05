import React, { useState, useEffect } from "react";
import { renderIcon } from "@/components/common/badge-selector/icon-utils";

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
    color: "", // 색상 필드 추가
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
          color: item.color || "#3B82F6", // 현재 색상
        });
      } else {
        // 목표/직업 탭일 경우
        setFormData({
          name: item.name || "",
          iconKey: item.iconKey || "",
          color: "", // 목표/직업에서는 색상 수정 안함
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

      if (!formData.color.trim()) {
        alert("색상은 필수 입력사항입니다.");
        return;
      }

      // 아이콘 탭에서는 iconKey, originalIconKey, color 모두 API로 전송
      onEdit({
        iconKey: formData.iconKey,
        originalIconKey: formData.originalIconKey,
        color: formData.color,
      });
    } else {
      // 목표/직업 탭에서는 name과 iconKey만 전송
      onEdit({
        name: formData.name,
        iconKey: formData.iconKey,
      });
    }
  };

  // 현재 선택된 아이콘의 색상 찾기
  const getCurrentIconColor = (iconKey) => {
    if (!iconKey) return "#3B82F6"; // 기본 색상

    // 아이콘 탭에서는 사용자가 수정한 색상을 우선으로 사용
    if (itemType === "아이콘" && formData.color) {
      return formData.color;
    }

    const iconInfo = iconData.find((icon) => icon.iconKey === iconKey);
    return iconInfo ? iconInfo.color : "#3B82F6";
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
              {/* 새 아이콘키 선택 */}
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
                      {iconData.map((icon) => (
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
          {itemType !== "아이콘" && (
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
                    {iconData.map((icon) => (
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
              수정
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditItemModal;
