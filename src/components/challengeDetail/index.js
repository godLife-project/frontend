import { useState, useRef, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoPeople } from "react-icons/go";
import { GoClock } from "react-icons/go";
import { MdOutlineDateRange } from "react-icons/md";
import { BiAward } from "react-icons/bi";
import { useToast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import { useParams, useLocation } from "react-router-dom";
import { GoTrophy } from "react-icons/go";

const ChallengeDetailForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  // URL 파라미터에서 챌린지 인덱스(CHALL_IDX) 가져오기
  const { challIdx } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  // 유저 참여 형태 (0:관리자 개입형, 1:유저참여형)
  const userJoin = queryParams.get("userJoin") || 1;

  // 챌린지 유지기간
  const duration = queryParams.get("duration") || 60;

  const [challengeData, setChallengeData] = useState(null);
  const [categoryName, setCategoryName] = useState("카테고리 정보 없음");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 카테고리 정보를 가져오는 함수
  const fetchCategoryName = async (categoryIdx) => {
    try {
      const response = await axiosInstance.get(`/categories/challenge`);

      // 받아온 카테고리 목록에서 일치하는 카테고리 찾기
      const matchedCategory = response.data.find(
        (category) => category.challCategoryIdx === categoryIdx
      );

      // 찾은 카테고리의 이름 설정
      if (matchedCategory) {
        setCategoryName(matchedCategory.challName);
      }
    } catch (error) {
      console.error("카테고리 정보 불러오기 실패:", error);
    }
  };

  // 관리자 정보를 가져오는 함수

  // 챌린지 데이터 가져오기
  const fetchChallengeDetail = async () => {
    try {
      setLoading(true);

      const challIdxNumber = Number(challIdx);

      console.log("challIdx:", challIdxNumber);
      console.log("userJoin:", userJoin);
      console.log("duration:", duration);

      if (!challIdxNumber || isNaN(challIdxNumber)) {
        console.error("❌ challIdx 값이 정의되지 않았습니다.");
        return;
      }

      const response = await axiosInstance.get(
        `/challenges/detail/${challIdxNumber}`,
        {
          params: {
            userJoin: Number(userJoin),
            duration: Number(duration),
          },
        }
      );

      console.log("API 응답 데이터:", response.data);
      setChallengeData(response.data);
    } catch (err) {
      console.error("API 호출 에러:", err.response?.status, err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // 챌린지 데이터와 카테고리 동시에 불러오기
  useEffect(() => {
    fetchChallengeDetail();
  }, [challIdx, userJoin, duration]);

  // 챌린지 데이터 로드 시 카테고리 이름도 함께 불러오기
  useEffect(() => {
    if (challengeData && challengeData.challCategoryIdx) {
      fetchCategoryName(challengeData.challCategoryIdx);
    }
  }, [challengeData]);

  // 에러 발생 시 표시
  if (error) return <div>에러 발생: {error}</div>;

  // 데이터가 없을 경우 표시
  if (!challengeData) return <div>챌린지 정보를 찾을 수 없습니다</div>;

  return (
    <div>
      <div>
        <div className="mb-20">
          {/* 카테고리 */}
          <div className="flex flex-row items-center justify-center gap-1">
            {/* 상태 */}
            <div className="border border-gray-300 px-2 py-1 rounded-lg text-xs inline-flex h-full">
              {challengeData.challState}
            </div>

            {/* 카테고리 */}
            <div className="border border-gray-300 px-2 py-1 rounded-lg text-xs inline-flex h-full">
              {categoryName}
            </div>
          </div>

          {/* 제목 */}

          <div className="text-center text-2xl font-bold mb-2 mt-1">
            {challengeData.challTitle || "제목 정보 없음"}
          </div>
          <div className="text-center text-gray-500">
            등록일 :{" "}
            {new Date(challengeData.challCreatedAt).toLocaleDateString()}
          </div>
        </div>
        {/* 참여인원 */}
        <div className="flex items-center justify-between mt-10">
          <div className="flex items-center">
            <GoPeople />
            <span className="ml-1">참여 인원</span>
          </div>
          <span>
            {challengeData.currentParticipants || 0}/
            {challengeData.maxParticipants || 0}명
          </span>
        </div>
        <hr className="my-3 border-gray-200" />

        {/* 기간 */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center">
            <MdOutlineDateRange />
            <span className="ml-1">기간</span>
          </div>
          <span>
            {new Date(challengeData.challStartTime).toLocaleDateString()} ~
            {new Date(challengeData.challEndTime).toLocaleDateString()}
          </span>
        </div>

        <hr className="my-3 border-gray-200" />
        {/* 최소 참여 시간 */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center">
            <GoClock />
            <span className="ml-1">최소 참여 시간</span>
          </div>
          <span>{challengeData.minParticipationTime || 0}시간</span>
        </div>

        <hr className="my-3 border-gray-200" />
        {/* 총 클리어 시간 */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center">
            <GoTrophy />
            <span className="ml-1">총 클리어 시간</span>
          </div>
          <span>{challengeData.totalClearTime || 0}시간</span>
        </div>

        <hr className="my-3 border-gray-200" />
        {/* 챌린지 소개 */}
        <div className="mt-3">
          챌린지 소개
          <Card className="bg-white shadow-sm mt-3">
            <CardHeader>
              {challengeData.challDescription || "챌린지 설명이 없습니다."}
            </CardHeader>
          </Card>
        </div>
        <Button className="w-full mt-10">지금 참여하기</Button>
      </div>
    </div>
  );
};

export default ChallengeDetailForm;

// import { useState } from "react";
// import { Card, CardHeader } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { GoPeople } from "react-icons/go";
// import { GoClock } from "react-icons/go";
// import { MdOutlineDateRange } from "react-icons/md";
// import { GoTrophy } from "react-icons/go";
// import { useNavigate } from "react-router-dom";

// const ChallengeDetailForm = () => {
//   const navigate = useNavigate();
//   // 챌린지 더미 데이터 (상세 정보 포함)
//   const [challengeData] = useState({
//     challCategoryIdx: "건강/운동",
//     challTitle: "30일 런닝 챌린지",
//     challCreatedAt: new Date(2024, 2, 25).toISOString(), // 2024년 3월 25일
//     currentParticipants: 15,
//     maxParticipants: 30,
//     challStartTime: new Date(2024, 3, 1).toISOString(), // 2024년 4월 1일
//     challEndTime: new Date(2024, 3, 30).toISOString(), // 2024년 4월 30일
//     minParticipationTime: 1,
//     totalClearTime: 45,
//     challDescription:
//       "매일 30분 이상 달리기를 통해 건강과 체력을 증진시키는 챌린지입니다. 함께 목표를 향해 달려봐요!",
//   });

//   // 권한 더미 데이터
//   const [userAuthority] = useState({
//     // 시나리오 1: 관리자 권한 (수정/삭제 버튼 보임)
//     authorityIdx: 2, // 일반 유저가 아닌 권한
//     authorityName: "관리자",
//     authorityDescription: "모든 기능 접근 가능",
//   });

//   // 수정 삭제 버튼 컴포넌트
//   const ModifyDeleteButtons = () => {
//     if (userAuthority.authorityIdx !== 1) {
//       return (
//         <div className="flex space-x-2 mt-4">
//           <Button
//             variant="outline"
//             className="w-1/2"
//             onClick={() => navigate("/challenge/modify")}
//           >
//             수정하기
//           </Button>
//           <Button variant="destructive" className="w-1/2">
//             삭제하기
//           </Button>
//         </div>
//       );
//     } else {
//       return null;
//     }
//   };

//   // 참여하기 버튼 컴포넌트
//   const JoinButtons = () => {
//     if (userAuthority.authorityIdx === 1) {
//       return <Button className="w-full mt-4">지금 참여하기</Button>;
//     } else {
//       return null;
//     }
//   };

//   return (
//     <div className="p-4 max-w-md mx-auto">
//       <div>
//         <div>
//           <div className="mb-20">
//             {/* 카테고리 */}
//             <div className="flex flex-col items-center">
//               <div className="border border-gray-300 px-2 py-1 rounded-lg text-xs inline-flex">
//                 {challengeData.challCategoryIdx || "카테고리 정보 없음"}
//               </div>
//             </div>
//             {/* 제목 */}
//             <div className="text-center text-2xl font-bold mb-2 mt-1">
//               {challengeData.challTitle || "제목 정보 없음"}
//             </div>
//             <div className="text-center text-gray-500">
//               등록일 :{" "}
//               {new Date(challengeData.challCreatedAt).toLocaleDateString()}
//             </div>
//           </div>
//           {/* 참여인원 */}
//           <div className="flex items-center justify-between mt-10">
//             <div className="flex items-center">
//               <GoPeople />
//               <span className="ml-1">참여 인원</span>
//             </div>
//             <span>
//               {challengeData.currentParticipants || 0}/
//               {challengeData.maxParticipants || 0}명
//             </span>
//           </div>
//           <hr className="my-3 border-gray-200" />

//           {/* 기간 */}
//           <div className="flex items-center justify-between mt-3">
//             <div className="flex items-center">
//               <MdOutlineDateRange />
//               <span className="ml-1">기간</span>
//             </div>
//             <span>
//               {new Date(challengeData.challStartTime).toLocaleDateString()} ~
//               {new Date(challengeData.challEndTime).toLocaleDateString()}
//             </span>
//           </div>
//           <hr className="my-3 border-gray-200" />

//           {/* 최소 참여 시간 */}
//           <div className="flex items-center justify-between mt-3">
//             <div className="flex items-center">
//               <GoClock />
//               <span className="ml-1">최소 참여 시간</span>
//             </div>
//             <span>{challengeData.minParticipationTime || 0}시간</span>
//           </div>
//           <hr className="my-3 border-gray-200" />

//           {/* 총 클리어 시간 */}
//           <div className="flex items-center justify-between mt-3">
//             <div className="flex items-center">
//               <GoTrophy />
//               <span className="ml-1">총 클리어 시간</span>
//             </div>
//             <span>{challengeData.totalClearTime || 0}시간</span>
//           </div>
//           <hr className="my-3 border-gray-200" />

//           {/* 챌린지 소개 */}
//           <div className="mt-3 mb-8">
//             챌린지 소개
//             <Card className="bg-white shadow-sm mt-3">
//               <CardHeader>
//                 {challengeData.challDescription || "챌린지 설명이 없습니다."}
//               </CardHeader>
//             </Card>
//           </div>

//           {/* 권한에 따른 수정/삭제 버튼 조건부 렌더링 */}
//           <ModifyDeleteButtons />

//           {/* 권한에 따른 참여하기 버튼 조건부 렌더링 */}
//           <JoinButtons />
//         </div>
//       </div>
//     </div>
//   );
// };

// export default ChallengeDetailForm;
