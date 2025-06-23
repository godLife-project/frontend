// import { Card, CardContent } from "@/components/ui/card";
// import { BiChevronLeftCircle } from "react-icons/bi";
// import ChallengeModifyForm from "@/components/challengeModify";
// import { useNavigate } from "react-router-dom";

// const ChallengModifyPage = () => {
//   const navigate = useNavigate();
//   return (
//     <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8">
//       <div className="max-w-3xl mx-auto px-4">
//         <Card className="overflow-hidden">
//           {/* 헤더 */}
//           <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white relative">
//             <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
//               <BiChevronLeftCircle
//                 className="cursor-pointer text-white"
//                 onClick={() => navigate(-1)}
//                 size={30}
//               />
//             </div>
//           </div>
//           <CardContent className="p-8">
//             <div className="space-y-4">
//               <h2 className="text-xl font-semibold">챌린지 수정</h2>
//               <ChallengeModifyForm />
//             </div>
//           </CardContent>
//         </Card>
//       </div>
//     </div>
//   );
// };

// export default ChallengModifyPage;
import { Card, CardContent } from "@/components/ui/card";
import { BiChevronLeftCircle } from "react-icons/bi";
import ChallengeModifyForm from "@/components/challengeModify";
import { useNavigate, useParams } from "react-router-dom";

const ChallengModifyPage = ({
  challIdx: propChallIdx,
  onSaveComplete,
  onCancel,
  isIntegrated = false,
}) => {
  const navigate = useNavigate();
  const { challIdx: paramChallIdx } = useParams();

  // 🔥 challIdx는 props에서 우선 가져오고, 없으면 useParams에서 가져옴
  const challIdx = propChallIdx || paramChallIdx;

  const handleBack = () => {
    if (isIntegrated && onCancel) {
      onCancel();
    } else {
      navigate(-1);
    }
  };

  // 🔥 통합 모드일 때는 간단한 스타일
  if (isIntegrated) {
    return (
      <div className="space-y-4">
        <ChallengeModifyForm
          challIdx={challIdx}
          isIntegrated={true}
          onSaveComplete={onSaveComplete}
          onCancel={onCancel}
        />
      </div>
    );
  }

  // 독립 페이지 모드일 때는 기존 스타일
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white relative">
            <div className="absolute left-4 top-1/2 transform -translate-y-1/2">
              <BiChevronLeftCircle
                className="cursor-pointer text-white hover:text-gray-200 transition-colors"
                onClick={handleBack}
                size={30}
              />
            </div>
            <div className="text-center">
              <h1 className="text-2xl font-bold">챌린지 수정</h1>
            </div>
          </div>
          <CardContent className="p-8">
            <div className="space-y-4">
              <ChallengeModifyForm
                challIdx={challIdx}
                isIntegrated={false}
                onSaveComplete={() => navigate("/challenge")}
                onCancel={handleBack}
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChallengModifyPage;
