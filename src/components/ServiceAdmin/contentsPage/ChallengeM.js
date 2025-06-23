// import React, { useState } from "react";

// // 🔥 수정: import와 사용하는 컴포넌트명 통일
// import ChallengeListForm from "@/components/challengeList";
// import ChallengModifyPage from "@/pages/Challenge/Modify";
// import ChallengeDetailForm from "@/components/challengeDetail";
// import ChallengeForm from "@/components/challenge";

// const IntegratedChallengeManager = () => {
//   const [viewMode, setViewMode] = useState("list"); // 'list', 'detail', 'create', 'edit'
//   const [selectedChallenge, setSelectedChallenge] = useState(null);

//   const handleChallengeSelect = (challenge) => {
//     setSelectedChallenge(challenge);
//     setViewMode("detail");
//   };

//   const handleCreateNew = () => {
//     setViewMode("create");
//     setSelectedChallenge(null);
//   };

//   const handleEdit = () => {
//     setViewMode("edit");
//   };

//   const handleBackToList = () => {
//     setViewMode("list");
//     setSelectedChallenge(null);
//   };

//   const handleSaveComplete = () => {
//     setViewMode("list");
//     setSelectedChallenge(null);
//   };

//   const renderRightPanel = () => {
//     switch (viewMode) {
//       case "detail":
//         return (
//           <div className="w-1/2 bg-white overflow-y-auto flex justify-center">
//             <div className="max-w-lg w-full p-6">
//               <ChallengeDetailForm
//                 challIdx={selectedChallenge?.challIdx}
//                 isIntegrated={true}
//                 onEdit={handleEdit}
//                 onBack={handleBackToList}
//               />
//             </div>
//           </div>
//         );
//       case "create":
//         return (
//           <div className="w-1/2 bg-white overflow-y-auto flex justify-center">
//             <div className="max-w-2xl w-full p-4">
//               <ChallengeForm
//                 isIntegrated={true}
//                 onSaveComplete={handleSaveComplete}
//                 onCancel={handleBackToList}
//               />
//             </div>
//           </div>
//         );
//       case "edit":
//         return (
//           <div className="w-1/2 bg-white overflow-y-auto flex justify-center">
//             <div className="max-w-2xl w-full p-4">
//               <ChallengModifyPage
//                 challIdx={selectedChallenge?.challIdx}
//                 isIntegrated={true}
//                 onSaveComplete={handleSaveComplete}
//                 onCancel={handleBackToList}
//               />
//             </div>
//           </div>
//         );
//       default:
//         return (
//           <div className="w-1/2 bg-white flex flex-col items-center justify-center text-gray-500">
//             <div className="text-center">
//               <h3 className="text-xl font-medium mb-2">
//                 선택된 챌린지가 없습니다.
//               </h3>
//               <p className="mb-6">
//                 챌린지를 자세히 보고 싶을 경우,
//                 <br />
//                 왼쪽에서 챌린지를 선택해주세요.
//               </p>
//             </div>
//           </div>
//         );
//     }
//   };

//   return (
//     <div className="flex h-screen bg-gray-50">
//       <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
//         <ChallengeListForm
//           onChallengeSelect={handleChallengeSelect}
//           onCreateNew={handleCreateNew}
//         />
//       </div>

//       {/* 오른쪽 패널 - 선택된 뷰에 따라 다른 컴포넌트 */}
//       {renderRightPanel()}
//     </div>
//   );
// };

// export default IntegratedChallengeManager;
import React, { useState } from "react";

// 실제 컴포넌트들 import
import ChallengeListForm from "@/components/challengeList";
import ChallengeModifyForm from "@/components/challengeModify"; // 🔥 직접 import
import ChallengeDetailForm from "@/components/challengeDetail";
import ChallengeForm from "@/components/challenge";

const IntegratedChallengeManager = () => {
  const [viewMode, setViewMode] = useState("list"); // 'list', 'detail', 'create', 'edit'
  const [selectedChallenge, setSelectedChallenge] = useState(null);

  const handleChallengeSelect = (challenge) => {
    setSelectedChallenge(challenge);
    setViewMode("detail");
  };

  const handleCreateNew = () => {
    setViewMode("create");
    setSelectedChallenge(null);
  };

  const handleEdit = () => {
    setViewMode("edit");
  };

  const handleBackToList = () => {
    setViewMode("list");
    setSelectedChallenge(null);
  };

  const handleSaveComplete = () => {
    setViewMode("list");
    setSelectedChallenge(null);
  };

  const renderRightPanel = () => {
    switch (viewMode) {
      case "detail":
        return (
          <div className="w-1/2 bg-white overflow-y-auto flex justify-center">
            <div className="max-w-lg w-full p-6">
              <ChallengeDetailForm
                challIdx={selectedChallenge?.challIdx}
                isIntegrated={true}
                onEdit={handleEdit}
                onBack={handleBackToList}
              />
            </div>
          </div>
        );
      case "create":
        return (
          <div className="w-1/2 bg-white overflow-y-auto flex justify-center">
            <div className="max-w-2xl w-full p-4">
              <ChallengeForm
                isIntegrated={true}
                onSaveComplete={handleSaveComplete}
                onCancel={handleBackToList}
              />
            </div>
          </div>
        );
      case "edit":
        return (
          <div className="w-1/2 bg-white overflow-y-auto flex justify-center">
            <div className="max-w-2xl w-full p-4">
              {/* 🔥 직접 ChallengeModifyForm 사용 */}
              <ChallengeModifyForm
                challIdx={selectedChallenge?.challIdx}
                isIntegrated={true}
                onSaveComplete={handleSaveComplete}
                onCancel={handleBackToList}
              />
            </div>
          </div>
        );
      default:
        return (
          <div className="w-1/2 bg-white flex flex-col items-center justify-center text-gray-500">
            <div className="text-center">
              <h3 className="text-xl font-medium mb-2">
                선택된 챌린지가 없습니다.
              </h3>
              <p className="mb-6">
                챌린지를 자세히 보고 싶을 경우,
                <br />
                왼쪽에서 챌린지를 선택해주세요.
              </p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      {/* 왼쪽 패널 - ChallengeListForm */}
      <div className="w-1/2 border-r border-gray-200 overflow-y-auto">
        <ChallengeListForm
          onChallengeSelect={handleChallengeSelect}
          onCreateNew={handleCreateNew}
        />
      </div>

      {/* 오른쪽 패널 - 선택된 뷰에 따라 다른 컴포넌트 */}
      {renderRightPanel()}
    </div>
  );
};

export default IntegratedChallengeManager;
