import React from "react";
import { MdOutlineMode } from "react-icons/md";
import { MdOutlineDelete } from "react-icons/md";

const ItemTable = ({
  items,
  currentPage,
  setCurrentPage,
  searchTerm,
  onEdit,
  onDelete,
  itemType,
}) => {
  return (
    <div className="bg-white rounded-md shadow overflow-hidden">
      <table className="w-full">
        <thead>
          <tr className="border-b">
            <th className="px-6 py-3 text-left">ID</th>
            <th className="px-6 py-3 text-left">이름</th>
            <th className="px-6 py-3 text-left">아이콘키</th>
            <th className="px-6 py-3 text-left">아이콘</th>
            <th className="px-6 py-3 text-left">색상</th>
          </tr>
        </thead>
        <tbody>
          {items.length > 0 ? (
            items.map((item, index) => (
              <tr key={item.idx || index} className="border-b hover:bg-gray-50">
                <td className="px-6 py-4">{item.idx}</td>
                <td className="px-6 py-4">{item.name}</td>
                <td className="px-6 py-4">{item.iconKey}</td>
                <td className="px-6 py-4">{item.icon}</td>
                <td className="px-6 py-4">{item.color}</td>
                <td className="px-6 py-4 space-x-2">
                  <div className="flex gap-3">
                    <div className="flex items-center rounded-md shadow px-3 py-1">
                      <MdOutlineMode />
                      <button className="hover" onClick={() => onEdit(item)}>
                        수정
                      </button>
                    </div>
                    <div className="flex items-center bg-red-500 text-white rounded-md px-3 py-1 hover:bg-red-600 transition-colors">
                      <MdOutlineDelete />
                      <button onClick={() => onDelete(item)}>삭제</button>
                    </div>
                  </div>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="px-6 py-4 text-center">
                {searchTerm ? "검색 결과가 없습니다." : "데이터가 없습니다."}
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 페이지네이션 */}
      <div className="flex justify-center p-4">
        <button
          className="px-4 py-2 mx-1 rounded-md border hover:bg-gray-100"
          onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
        >
          이전
        </button>
        <button className="px-4 py-2 mx-1 rounded-md bg-blue-500 text-white">
          {currentPage}
        </button>
        <button
          className="px-4 py-2 mx-1 rounded-md border hover:bg-gray-100"
          onClick={() => setCurrentPage(currentPage + 1)}
          disabled={items.length === 0}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default ItemTable;
