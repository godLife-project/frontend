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
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 로그인 상태 확인
  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast({
        variant: "destructive",
        title: "로그인이 필요합니다",
        description: "챌린지 작성을 위해 로그인해주세요.",
      });
      navigate("/user/login");
    }
  }, [navigate, toast]);

  // 챌린지 데이터 가져오기
  useEffect(() => {
    console.log("challIdx:", challIdx); // 값 확인용 콘솔 출력
    console.log("userJoin:", userJoin);
    console.log("duration:", duration);

    const fetchChallengeDetail = async () => {
      try {
        setLoading(true);

        const response = await axiosInstance.get(
          `challenges/detail/${challIdx}`,
          {
            params: {
              userJoin: Number(userJoin), // 숫자로 변환
              duration: Number(duration), // 숫자로 변환
            },
          }
        );

        console.log("API 응답 데이터:", response.data); // 응답 데이터 출력
        setChallengeData(response.data);
      } catch (err) {
        console.error("API 호출 에러:", err.response?.status, err.message);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (challIdx) {
      fetchChallengeDetail();
    }
  }, [challIdx, userJoin, duration]);

  // 로딩 중 표시
  // if (loading) return <div>로딩 중...</div>;

  // 에러 발생 시 표시
  if (error) return <div>에러 발생: {error}</div>;

  // 데이터가 없을 경우 표시
  if (!challengeData) return <div>챌린지 정보를 찾을 수 없습니다</div>;

  return (
    <div>
      <div>
        <div className="mb-20">
          {/* 카테고리 */}
          <div className="flex flex-col items-center">
            <div className="border border-gray-300 px-2 py-1 rounded-lg text-xs inline-flex">
              {challengeData.challCategoryIdx || "카테고리 정보 없음"}
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

// import { useState, useRef, useEffect } from "react";
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

//   // URL 파라미터에서 챌린지 인덱스(CHALL_IDX) 가져오기
//   const { challIdx } = useParams();
//   const location = useLocation();
//   const queryParams = new URLSearchParams(location.search);

//   // 유저 참여 형태 (0:관리자 개입형, 1:유저참여형)
//   const userJoin = queryParams.get("userJoin") || 1;

//   // 챌린지 유지기간
//   const duration = queryParams.get("duration") || 60;

//   // 테스트용 관리자 상태 토글 (실제 구현에서는 API로 확인)
//   const [isAdmin, setIsAdmin] = useState(true); // 기본값을 true로 설정하여 관리자 버튼이 보이게 함

//   // 테스트용 토글 버튼 핸들러
//   const toggleAdminStatus = () => {
//     setIsAdmin(!isAdmin);
//   };

//   // 테스트용 더미 데이터
//   const [challengeData, setChallengeData] = useState({
//     challCategoryName: "운동",
//     challTitle: "30일 플랭크 챌린지",
//     challCreatedAt: new Date().toISOString(),
//     currentParticipants: 42,
//     maxParticipants: 100,
//     challStartTime: new Date().toISOString(),
//     challEndTime: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
//     minParticipationTime: 5,
//     totalClearTime: 150,
//     challDescription:
//       "매일 5분씩 플랭크를 하며 코어 근육을 강화하는 챌린지입니다. 매일 인증샷을 올리고 함께 건강한 습관을 만들어보세요!",
//   });

//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   // 수정하기 버튼 클릭 핸들러
//   const handleEdit = () => {
//     // navigate(`/challenge/write/${challIdx}`);
//   };

//   // 삭제하기 버튼 클릭 핸들러
//   // 삭제하기 버튼 클릭 핸들러
//   const handleDelete = async () => {
//     // 삭제 확인
//     if (window.confirm("정말로 이 챌린지를 삭제하시겠습니까?")) {
//       try {
//         setLoading(true);
//         // API 호출하여 챌린지 삭제 요청
//         await axiosInstance.patch(`/api/challenges/admin/delete/${challIdx}`);

//         toast({
//           title: "챌린지 삭제 완료",
//           description: "챌린지가 성공적으로 삭제되었습니다.",
//           variant: "success",
//         });

//         // 삭제 후 챌린지 목록 페이지로 이동
//         navigate("/challenges");
//       } catch (error) {
//         console.error("챌린지 삭제 실패:", error);
//         toast({
//           title: "챌린지 삭제 실패",
//           description: "챌린지를 삭제하는 중 오류가 발생했습니다.",
//           variant: "destructive",
//         });
//         setError(error.message || "챌린지 삭제 중 오류가 발생했습니다");
//       } finally {
//         setLoading(false);
//       }
//     }
//   };

//   // 로딩 중 표시
//   if (loading) return <div>로딩 중...</div>;

//   // 에러 발생 시 표시
//   if (error) return <div>에러 발생: {error}</div>;

//   // 데이터가 없을 경우 표시
//   if (!challengeData) return <div>챌린지 정보를 찾을 수 없습니다</div>;

//   return (
//     <div>
//       {/* 테스트용 관리자 토글 버튼 */}
//       <div className="mb-4 p-2 bg-gray-100 rounded">
//         <p className="text-sm text-gray-700 mb-2">
//           테스트 모드: 현재 {isAdmin ? "관리자" : "일반 사용자"} 모드입니다.
//         </p>
//         <Button variant="outline" size="sm" onClick={toggleAdminStatus}>
//           {isAdmin ? "일반 사용자로 보기" : "관리자로 보기"}
//         </Button>
//       </div>

//       <div>
//         <div className="mb-20">
//           {/* 카테고리 */}
//           <div className="flex flex-col items-center">
//             <div className="border border-gray-300 px-2 py-1 rounded-lg text-xs inline-flex">
//               {challengeData.challCategoryName || "카테고리 정보 없음"}
//             </div>
//           </div>
//           {/* 제목 */}
//           <div className="text-center text-2xl font-bold mb-2 mt-1">
//             {challengeData.challTitle || "제목 정보 없음"}
//           </div>
//           <div className="text-center text-gray-500">
//             등록일 :{" "}
//             {new Date(challengeData.challCreatedAt).toLocaleDateString()}
//           </div>
//         </div>
//         {/* 참여인원 */}
//         <div className="flex items-center justify-between mt-10">
//           <div className="flex items-center">
//             <GoPeople />
//             <span className="ml-1">참여 인원</span>
//           </div>
//           <span>
//             {challengeData.currentParticipants || 0}/
//             {challengeData.maxParticipants || 0}명
//           </span>
//         </div>
//         <hr className="my-3 border-gray-200" />

//         {/* 기간 */}
//         <div className="flex items-center justify-between mt-3">
//           <div className="flex items-center">
//             <MdOutlineDateRange />
//             <span className="ml-1">기간</span>
//           </div>
//           <span>
//             {new Date(challengeData.challStartTime).toLocaleDateString()} ~
//             {new Date(challengeData.challEndTime).toLocaleDateString()}
//           </span>
//         </div>

//         <hr className="my-3 border-gray-200" />
//         {/* 최소 참여 시간 */}
//         <div className="flex items-center justify-between mt-3">
//           <div className="flex items-center">
//             <GoClock />
//             <span className="ml-1">최소 참여 시간</span>
//           </div>
//           <span>{challengeData.minParticipationTime || 0}시간</span>
//         </div>

//         <hr className="my-3 border-gray-200" />
//         {/* 총 클리어 시간 */}
//         <div className="flex items-center justify-between mt-3">
//           <div className="flex items-center">
//             <GoTrophy />
//             <span className="ml-1">총 클리어 시간</span>
//           </div>
//           <span>{challengeData.totalClearTime || 0}시간</span>
//         </div>

//         <hr className="my-3 border-gray-200" />
//         {/* 챌린지 소개 */}
//         <div className="mt-3">
//           챌린지 소개
//           <Card className="bg-white shadow-sm mt-3">
//             <CardHeader>
//               {challengeData.challDescription || "챌린지 설명이 없습니다."}
//             </CardHeader>
//           </Card>
//         </div>
//         {!isAdmin && <Button className="w-full mt-10">지금 참여하기</Button>}
//         {/* 관리자만 볼 수 있는 수정/삭제 버튼 */}
//         {isAdmin && (
//           <div className="flex justify-end mt-4 space-x-2">
//             <Button variant="outline" onClick={handleEdit}>
//               수정하기
//             </Button>
//             <Button variant="destructive" onClick={handleDelete}>
//               삭제하기
//             </Button>
//           </div>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ChallengeDetailForm;
