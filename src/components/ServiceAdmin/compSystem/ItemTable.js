// import React from "react";
// import { MdOutlineMode } from "react-icons/md";
// import { MdOutlineDelete } from "react-icons/md";
// import { renderIcon } from "@/components/common/badge-selector/icon-utils";

// const ItemTable = ({
//   items,
//   currentPage,
//   setCurrentPage,
//   searchTerm,
//   onEdit,
//   onDelete,
//   itemType,
//   iconItems, // 아이콘 탭의 모든 아이콘 데이터를 전달받음
// }) => {
//   // 테이블 헤더 생성 함수
//   const renderTableHeader = () => {
//     if (itemType === "아이콘") {
//       return (
//         <tr className="border-b">
//           <th className="px-6 py-3 text-left">아이콘키</th>
//           <th className="px-6 py-3 text-left">아이콘</th>
//           <th className="px-6 py-3 text-left">색상</th>
//           <th className="px-6 py-3 text-left">사용처</th>
//           <th className="px-6 py-3 text-left"></th>
//         </tr>
//       );
//     } else {
//       return (
//         <tr className="border-b">
//           <th className="px-6 py-3 text-left">ID</th>
//           <th className="px-6 py-3 text-left">이름</th>
//           <th className="px-6 py-3 text-left">아이콘키</th>
//           <th className="px-6 py-3 text-left">아이콘</th>
//           <th className="px-6 py-3 text-left">아이콘 색상</th>
//           <th className="px-6 py-3 text-left"></th>
//         </tr>
//       );
//     }
//   };

//   // 아이콘 키에 해당하는 아이콘 정보 찾기
//   const findIconInfo = (iconKey) => {
//     if (!iconItems || !iconKey) return null;
//     return iconItems.find((icon) => icon.iconKey === iconKey);
//   };

//   // 페이지당 아이템 수
//   const itemsPerPage = 10;
//   // 페이지네이션 계산
//   const startIndex = (currentPage - 1) * itemsPerPage;
//   const endIndex = startIndex + itemsPerPage;
//   // 현재 페이지에 표시할 아이템들
//   const paginatedItems = items.slice(startIndex, endIndex);

//   // 테이블 행 생성 함수
//   const renderTableRows = () => {
//     if (!items || items.length === 0) {
//       return (
//         <tr>
//           <td colSpan="6" className="px-6 py-4 text-center">
//             {searchTerm ? "검색 결과가 없습니다." : "데이터가 없습니다."}
//           </td>
//         </tr>
//       );
//     }

//     return paginatedItems.map((item, index) => {
//       // 개발용 디버깅 로그
//       console.log(`Row ${index}:`, item);

//       if (itemType === "아이콘") {
//         return (
//           <tr key={item.idx || index} className="border-b hover:bg-gray-50">
//             <td className="px-6 py-4">{item.iconKey}</td>
//             <td className="px-6 py-4">
//               <div className="flex items-center">
//                 {/* 실제 아이콘 표시 */}
//                 <div className="mr-3">
//                   {renderIcon(item.iconKey, 20, "", false, item.color)}
//                 </div>
//               </div>
//             </td>
//             <td className="px-6 py-4">
//               <div className="flex items-center">
//                 <div
//                   className="w-6 h-6 mr-2 rounded-full"
//                   style={{ backgroundColor: item.color }}
//                 ></div>
//                 {item.color}
//               </div>
//             </td>
//             <td className="px-6 py-4">{item.visible ? "사용자" : "관리자"}</td>
//             <td className="px-6 py-4 space-x-2">
//               <div className="flex gap-3">
//                 <div className="flex items-center rounded-md shadow px-3 py-1">
//                   <MdOutlineMode />
//                   <button className="hover" onClick={() => onEdit(item)}>
//                     수정
//                   </button>
//                 </div>
//                 <div className="flex items-center bg-red-500 text-white rounded-md px-3 py-1 hover:bg-red-600 transition-colors">
//                   <MdOutlineDelete />
//                   <button onClick={() => onDelete(item)}>삭제</button>
//                 </div>
//               </div>
//             </td>
//           </tr>
//         );
//       } else {
//         // 목표나 직업 탭인 경우
//         // API 응답에 iconKey와 icon 값이 있는지 확인 후 처리
//         // iconKey는 있지만 icon이 없는 경우 iconItems에서 찾음
//         const iconInfo = findIconInfo(item.iconKey);

//         // API 응답에서 가져온 icon 값 또는 iconItems에서 찾은 icon 값 사용
//         const iconName = item.icon || (iconInfo ? iconInfo.icon : "-");

//         // 아이콘 색상 결정 (iconInfo 우선, 없으면 item.color, 그것도 없으면 기본값)
//         const iconColor = iconInfo ? iconInfo.color : item.color || "#3B82F6";

//         console.log(`Row ${index} icon data:`, {
//           itemIcon: item.icon,
//           iconInfoIcon: iconInfo ? iconInfo.icon : null,
//           displayedIcon: iconName,
//           iconColor: iconColor,
//         });

//         return (
//           <tr key={item.idx || index} className="border-b hover:bg-gray-50">
//             <td className="px-6 py-4">{item.idx}</td>
//             <td className="px-6 py-4">{item.name}</td>
//             <td className="px-6 py-4">{item.iconKey}</td>
//             <td className="px-6 py-4">
//               <div className="flex items-center">
//                 {/* 실제 아이콘 표시 */}
//                 <div className="mr-3">
//                   {renderIcon(item.iconKey, 20, "", false, iconColor)}
//                 </div>
//                 <span>{iconName}</span>
//               </div>
//             </td>
//             <td className="px-6 py-4">
//               <div className="flex items-center">
//                 <div
//                   className="w-6 h-6 mr-2 rounded-full"
//                   style={{
//                     backgroundColor: iconInfo
//                       ? iconInfo.color
//                       : item.color || "#CCCCCC",
//                   }}
//                 ></div>
//                 {iconInfo ? iconInfo.color : item.color || "-"}
//                 {iconInfo && item.color && iconInfo.color !== item.color && (
//                   <span className="ml-2 text-xs text-gray-500">
//                     (원본 색상: {item.color})
//                   </span>
//                 )}
//               </div>
//             </td>
//             <td className="px-6 py-4 space-x-2">
//               <div className="flex gap-3">
//                 <div className="flex items-center rounded-md shadow px-3 py-1">
//                   <MdOutlineMode />
//                   <button className="hover" onClick={() => onEdit(item)}>
//                     수정
//                   </button>
//                 </div>
//                 <div className="flex items-center bg-red-500 text-white rounded-md px-3 py-1 hover:bg-red-600 transition-colors">
//                   <MdOutlineDelete />
//                   <button onClick={() => onDelete(item)}>삭제</button>
//                 </div>
//               </div>
//             </td>
//           </tr>
//         );
//       }
//     });
//   };

//   return (
//     <div className="bg-white rounded-md shadow overflow-hidden">
//       <table className="w-full">
//         <thead>{renderTableHeader()}</thead>
//         <tbody>{renderTableRows()}</tbody>
//       </table>

//       {/* 페이지네이션 */}
//       <div className="flex justify-center p-4">
//         <button
//           className="px-4 py-2 mx-1 rounded-md border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
//           onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
//           disabled={currentPage === 1}
//         >
//           이전
//         </button>
//         <button className="px-4 py-2 mx-1 rounded-md bg-blue-500 text-white">
//           {currentPage}
//         </button>
//         <button
//           className="px-4 py-2 mx-1 rounded-md border hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed"
//           onClick={() => setCurrentPage(currentPage + 1)}
//           disabled={endIndex >= items.length}
//         >
//           다음
//         </button>
//       </div>
//     </div>
//   );
// };

// export default ItemTable;
import React from "react";
import { MdOutlineMode } from "react-icons/md";
import { MdOutlineDelete } from "react-icons/md";
import { renderIcon } from "@/components/common/badge-selector/icon-utils";

const ItemTable = ({
  items,
  currentPage,
  setCurrentPage,
  searchTerm,
  onEdit,
  onDelete,
  itemType,
  iconItems, // 아이콘 탭의 모든 아이콘 데이터를 전달받음
}) => {
  // 테이블 헤더 생성 함수
  const renderTableHeader = () => {
    if (itemType === "아이콘") {
      return (
        <tr className="border-b">
          <th className="px-6 py-3 text-left">아이콘키</th>
          <th className="px-6 py-3 text-left">아이콘</th>
          <th className="px-6 py-3 text-left">색상</th>
          <th className="px-6 py-3 text-left">사용처</th>
          <th className="px-6 py-3 text-left"></th>
        </tr>
      );
    } else {
      return (
        <tr className="border-b">
          <th className="px-6 py-3 text-left">ID</th>
          <th className="px-6 py-3 text-left">이름</th>
          <th className="px-6 py-3 text-left">아이콘키</th>
          <th className="px-6 py-3 text-left">아이콘</th>
          <th className="px-6 py-3 text-left">아이콘 색상</th>
          <th className="px-6 py-3 text-left"></th>
        </tr>
      );
    }
  };

  // 아이콘 키에 해당하는 아이콘 정보 찾기
  const findIconInfo = (iconKey) => {
    if (!iconItems || !iconKey) return null;
    return iconItems.find((icon) => icon.iconKey === iconKey);
  };

  // 페이지당 아이템 수
  const itemsPerPage = 10;
  // 페이지네이션 계산
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  // 현재 페이지에 표시할 아이템들
  const paginatedItems = items.slice(startIndex, endIndex);

  // 테이블 행 생성 함수
  const renderTableRows = () => {
    if (!items || items.length === 0) {
      return (
        <tr>
          <td colSpan="6" className="px-6 py-4 text-center">
            {searchTerm ? "검색 결과가 없습니다." : "데이터가 없습니다."}
          </td>
        </tr>
      );
    }

    return paginatedItems.map((item, index) => {
      // 개발용 디버깅 로그
      console.log(`Row ${index}:`, item);

      if (itemType === "아이콘") {
        return (
          <tr key={item.idx || index} className="border-b hover:bg-gray-50">
            <td className="px-6 py-4">{item.iconKey}</td>
            <td className="px-6 py-4">
              <div className="flex items-center">
                {/* 실제 아이콘 표시 */}
                <div className="mr-3">
                  {renderIcon(item.iconKey, 20, "", false, item.color)}
                </div>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center">
                <div
                  className="w-6 h-6 mr-2 rounded-full"
                  style={{ backgroundColor: item.color }}
                ></div>
                {item.color}
              </div>
            </td>
            <td className="px-6 py-4">{item.visible ? "사용자" : "관리자"}</td>
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
        );
      } else {
        // 목표나 직업 탭인 경우
        // API 응답에 iconKey와 icon 값이 있는지 확인 후 처리
        // iconKey는 있지만 icon이 없는 경우 iconItems에서 찾음
        const iconInfo = findIconInfo(item.iconKey);

        // API 응답에서 가져온 icon 값 또는 iconItems에서 찾은 icon 값 사용
        const iconName = item.icon || (iconInfo ? iconInfo.icon : "-");

        // 아이콘 색상 결정 (iconInfo 우선, 없으면 item.color, 그것도 없으면 기본값)
        const iconColor = iconInfo ? iconInfo.color : item.color || "#3B82F6";

        console.log(`Row ${index} icon data:`, {
          itemIcon: item.icon,
          iconInfoIcon: iconInfo ? iconInfo.icon : null,
          displayedIcon: iconName,
          iconColor: iconColor,
        });

        return (
          <tr key={item.idx || index} className="border-b hover:bg-gray-50">
            <td className="px-6 py-4">{item.idx}</td>
            <td className="px-6 py-4">{item.name}</td>
            <td className="px-6 py-4">{item.iconKey}</td>
            <td className="px-6 py-4">
              <div className="flex items-center">
                {/* 실제 아이콘 표시 */}
                <div className="mr-3">
                  {renderIcon(item.iconKey, 20, "", false, iconColor)}
                </div>
                <span>{iconName}</span>
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex items-center">
                <div
                  className="w-6 h-6 mr-2 rounded-full"
                  style={{
                    backgroundColor: iconInfo
                      ? iconInfo.color
                      : item.color || "#CCCCCC",
                  }}
                ></div>
                {iconInfo ? iconInfo.color : item.color || "-"}
                {iconInfo && item.color && iconInfo.color !== item.color && (
                  <span className="ml-2 text-xs text-gray-500">
                    (원본 색상: {item.color})
                  </span>
                )}
              </div>
            </td>
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
        );
      }
    });
  };

  return (
    <div className="bg-white rounded-md shadow overflow-hidden">
      <table className="w-full">
        <thead>{renderTableHeader()}</thead>
        <tbody>{renderTableRows()}</tbody>
      </table>

      {/* 페이지네이션 */}
      <div className="flex justify-center p-4">
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
          disabled={endIndex >= items.length}
        >
          다음
        </button>
      </div>
    </div>
  );
};

export default ItemTable;
