import React from "react";

const DeleteConfirmModal = ({ isOpen, onClose, onDelete, item, itemType }) => {
  // 모달이 닫혀있으면 렌더링하지 않음
  if (!isOpen) return null;

  // 삭제 확인 메시지 설정
  const getDeleteMessage = () => {
    const itemName = item?.name || "항목";
    switch (itemType) {
      //   case "목표":
      //     return `정말로 '${itemName}' 목표를 삭제하시겠습니까?`;
      case "직업":
        return `정말로 '${itemName}' 직업을 삭제하시겠습니까?`;
      //   case "아이콘":
      //     return `정말로 '${itemName}' 아이콘을 삭제하시겠습니까?`;
      default:
        return `정말로 '${itemName}'을(를) 삭제하시겠습니까?`;
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-semibold mb-4">삭제 확인</h2>

        <p className="mb-6 text-gray-700">
          {getDeleteMessage()}
          <br />
          <span className="text-red-600 text-sm">
            이 작업은 되돌릴 수 없습니다.
          </span>
        </p>

        <div className="flex justify-end space-x-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-md hover:bg-gray-300"
          >
            취소
          </button>
          <button
            type="button"
            onClick={onDelete}
            className="px-4 py-2 text-white bg-red-500 rounded-md hover:bg-red-600"
          >
            삭제
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmModal;
