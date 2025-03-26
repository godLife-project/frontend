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

  // 권한 더미 데이터
  const [userAuthority] = useState({
    // 시나리오 1: 관리자 권한 (수정/삭제 버튼 보임)
    authorityIdx: 2, // 일반 유저가 아닌 권한
    authorityName: "관리자",
    authorityDescription: "모든 기능 접근 가능",
  });

  // 수정 삭제 버튼 컴포넌트
  const ModifyDeleteButtons = () => {
    if (userAuthority.authorityIdx !== 1) {
      return (
        <div className="flex space-x-2 mt-4">
          <Button
            variant="outline"
            className="w-1/2"
            onClick={() => navigate("/challenge/modify")}
          >
            수정하기
          </Button>
          <Button variant="destructive" className="w-1/2">
            삭제하기
          </Button>
        </div>
      );
    } else {
      return null;
    }
  };

  // 참여하기 버튼 컴포넌트
  const JoinButtons = () => {
    if (userAuthority.authorityIdx === 1) {
      return <Button className="w-full mt-4">지금 참여하기</Button>;
    } else {
      return null;
    }
  };

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

  // 챌린지 데이터 가져오기
  const fetchChallengeDetail = async () => {
    try {
      setLoading(true);

      const challIdxNumber = Number(challIdx);

      console.log("challIdx:", challIdxNumber);
      console.log("userJoin:", userJoin);
      console.log("duration:", duration);

      if (!challIdxNumber || isNaN(challIdxNumber)) {
        console.error(" challIdx 값이 정의되지 않았습니다.");
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

// import { useState, useEffect } from "react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Button } from "@/components/ui/button";
// import { GoPeople } from "react-icons/go";
// import { GoClock } from "react-icons/go";
// import { MdOutlineDateRange } from "react-icons/md";
// import { BiAward } from "react-icons/bi";
// import { useToast } from "@/components/ui/use-toast";
// import { useNavigate } from "react-router-dom";
// import axiosInstance from "@/api/axiosInstance";
// import { useParams, useLocation } from "react-router-dom";
// import { GoTrophy } from "react-icons/go";

// const ChallengeDetailForm = () => {
//   const navigate = useNavigate();
//   const { toast } = useToast();

//   // 사용자 권한 상태
//   const [userAuthority, setUserAuthority] = useState(null);

//   // URL 파라미터에서 챌린지 인덱스(CHALL_IDX) 가져오기
//   const { challIdx } = useParams();
//   const location = useLocation();
//   const queryParams = new URLSearchParams(location.search);

//   // 유저 참여 형태 (0:관리자 개입형, 1:유저참여형)
//   const userJoin = queryParams.get("userJoin") || 1;

//   // 챌린지 유지기간
//   const duration = queryParams.get("duration") || 60;

//   const [challengeData, setChallengeData] = useState(null);
//   const [categoryName, setCategoryName] = useState("카테고리 정보 없음");
//   const [loading, setLoading] = useState(true);
//   const [error, setError] = useState(null);

//   // 챌린지 데이터 가져오기
//   const fetchChallengeDetail = async () => {
//     try {
//       setLoading(true);

//       const challIdxNumber = Number(challIdx);

//       console.log("challIdx:", challIdxNumber);
//       console.log("userJoin:", userJoin);
//       console.log("duration:", duration);

//       if (!challIdxNumber || isNaN(challIdxNumber)) {
//         console.error(" challIdx 값이 정의되지 않았습니다.");
//         return;
//       }

//       const response = await axiosInstance.get(
//         `/challenges/detail/${challIdxNumber}`,
//         {
//           params: {
//             userJoin: Number(userJoin),
//             duration: Number(duration),
//           },
//         }
//       );

//       console.log("API 응답 데이터:", response.data);
//       setChallengeData(response.data);
//     } catch (err) {
//       console.error("API 호출 에러:", err.response?.status, err.message);
//       setError(err.message);
//     } finally {
//       setLoading(false);
//     }
//   };
//   // 사용자 권한 확인 함수
//   const fetchUserAuthority = async () => {
//     try {
//       const response = await axiosInstance.get("categories/admin/authority"); //api/categories/auth/authority
//       setUserAuthority(response.data);
//     } catch (err) {
//       console.error("사용자 권한 확인 실패:", err);
//       setError(err.message);
//     }
//   };

//   // 챌린지 데이터와 사용자 권한 동시에 불러오기
//   useEffect(() => {
//     fetchChallengeDetail();
//     fetchUserAuthority();
//   }, [challIdx, userJoin, duration]);

//   // 권한에 따른 버튼 렌더링 예시
//   const isAdminUser =
//     userAuthority?.authorityIdx >= 2 && userAuthority?.authorityIdx <= 7;

//   // 수정 삭제 버튼 컴포넌트
//   const ModifyDeleteButtons = () => {
//     const isAdminUser =
//       userAuthority &&
//       userAuthority.authorityIdx >= 2 &&
//       userAuthority.authorityIdx <= 7;

//     if (isAdminUser) {
//       return (
//         <div className="flex space-x-2 mt-4">
//           <Button
//             variant="outline"
//             className="w-1/2"
//             // onClick={() => navigate(`/challenge/modify/${challIdx}`)}
//           >
//             수정하기
//           </Button>
//           <Button
//             variant="destructive"
//             className="w-1/2"
//             // onClick={handleDeleteChallenge}
//           >
//             삭제하기
//           </Button>
//         </div>
//       );
//     }
//     return null;
//   };

//   // // 삭제 핸들러 추가
//   // const handleDeleteChallenge = async () => {
//   //   try {
//   //     await axiosInstance.delete(`/challenges/${challIdx}`);
//   //     toast({
//   //       title: "챌린지 삭제 성공",
//   //       description: "챌린지가 성공적으로 삭제되었습니다.",
//   //     });
//   //     navigate("/challenges");
//   //   } catch (err) {
//   //     console.error("챌린지 삭제 실패:", err);
//   //     toast({
//   //       title: "챌린지 삭제 실패",
//   //       description: "챌린지 삭제 중 오류가 발생했습니다.",
//   //       variant: "destructive",
//   //     });
//   //   }
//   // };

//   // 참여하기 버튼 컴포넌트
//   const JoinButton = () => {
//     if (userAuthority && userAuthority.authorityIdx === 1) {
//       return (
//         <Button
//           className="w-full mt-4"
//           // onClick={handleJoinChallenge}
//         >
//           지금 참여하기
//         </Button>
//       );
//     }
//     return null;
//   };

//   // // 참여하기 핸들러
//   // const handleJoinChallenge = async () => {
//   //   try {
//   //     await axiosInstance.post(`/challenges/${challIdx}/join`);
//   //     toast({
//   //       title: "챌린지 참여 성공",
//   //       description: "챌린지에 성공적으로 참여했습니다.",
//   //     });
//   //     // 필요하다면 추가 로직 구현 (예: 참여 상태 새로고침)
//   //   } catch (err) {
//   //     console.error("챌린지 참여 실패:", err);
//   //     toast({
//   //       title: "챌린지 참여 실패",
//   //       description: "챌린지 참여 중 오류가 발생했습니다.",
//   //       variant: "destructive",
//   //     });
//   //   }
//   // };

//   // 에러 및 로딩 처리
//   if (loading) return <div>로딩 중...</div>;
//   if (error) return <div>에러 발생: {error}</div>;
//   if (!challengeData) return <div>챌린지 정보를 찾을 수 없습니다</div>;

//   return (
//     <div>
//       <ModifyDeleteButtons />
//       <JoinButton />
//     </div>
//   );
// };

// export default ChallengeDetailForm;
