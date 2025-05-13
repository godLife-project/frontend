import { useState, useEffect } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { GoPeople, GoClock, GoTrophy } from "react-icons/go";
import { MdOutlineDateRange } from "react-icons/md";
import { useToast } from "@/components/ui/use-toast";

const ChallengeDetailForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { challIdx } = useParams();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const userJoin = queryParams.get("userJoin") || 1;
  const duration = queryParams.get("duration") || 60;

  const [userAuthority, setUserAuthority] = useState(null);
  const [challengeData, setChallengeData] = useState(null);
  const [categoryName, setCategoryName] = useState("카테고리 정보 없음");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [joining, setJoining] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // localStorage에서 accessToken과 userIdx 가져오기
  const accessToken = localStorage.getItem("accessToken");
  const userInfoString = localStorage.getItem("userInfo");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const userIdx = userInfo?.userIdx || "21";
  const roleStatus = userInfo?.roleStatus || false; // 기본값은 false

  // 챌린지 상세정보
  useEffect(() => {
    const fetchChallengeDetail = async () => {
      try {
        setLoading(true);
        const challIdxNumber = Number(challIdx);
        if (!challIdxNumber || isNaN(challIdxNumber)) return;

        const response = await axiosInstance.get(
          `/challenges/detail/${challIdxNumber}`,
          {
            params: {
              userJoin: Number(userJoin),
              duration: Number(duration),
            },
          }
        );
        setChallengeData(response.data);
      } catch (err) {
        console.error("API 호출 에러:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    if (challIdx) {
      fetchChallengeDetail();
    }
  }, [challIdx, userJoin, duration]);

  // 카테고리명 불러오기
  useEffect(() => {
    const fetchCategoryName = async (categoryIdx) => {
      try {
        const response = await axiosInstance.get(`/categories/challenge`);
        const matchedCategory = response.data.find(
          (category) => category.challCategoryIdx === categoryIdx
        );
        if (matchedCategory) {
          setCategoryName(matchedCategory.challName);
        }
      } catch (error) {
        console.error("카테고리 정보 불러오기 실패:", error);
      }
    };

    if (challengeData?.challCategoryIdx) {
      fetchCategoryName(challengeData.challCategoryIdx);
    }
  }, [challengeData]);

  // 챌린지 참여 함수
  const joinChallenge = async () => {
    try {
      setJoining(true);

      // 현재 시간 가져오기
      const now = new Date();

      // 챌린지 참가 시간 설정 (예: 현재로부터 30분 후)
      const startTime = now.toISOString();
      const endTime = new Date(now.getTime() + 30 * 60000).toISOString();

      // API 요청 파라미터
      const params = {
        challIdx: challIdx,
        userIdx: userIdx,
        duration: duration,
        challStartTime: startTime,
        challEndTime: endTime,
      };

      await axiosInstance.post(
        `/challenges/auth/join/${challIdx}`,
        {
          activity: challengeData.challTitle,
          activityTime: challengeData.totalClearTime,
        },
        {
          params: params,
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      toast({
        title: "성공",
        description: "챌린지 참여 신청이 완료되었습니다.",
      });

      // 참여 후 상세 정보 다시 불러오기
      const updatedResponse = await axiosInstance.get(
        `/challenges/detail/${challIdx}`,
        {
          params: {
            userJoin: Number(userJoin),
            duration: Number(duration),
          },
        }
      );
      setChallengeData(updatedResponse.data);
    } catch (err) {
      console.error("챌린지 참여 실패:", err);
      toast({
        title: "오류",
        description: "챌린지 참여에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setJoining(false);
    }
  };

  // 챌린지 삭제 함수
  const deleteChallenge = async () => {
    try {
      setDeleting(true);

      // PATCH 요청으로 챌린지 삭제
      await axiosInstance.patch(
        "/challenges/admin/delete",
        { challIdx: challIdx }, // 요청 본문에 challIdx 포함
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      toast({
        title: "성공",
        description: "챌린지가 성공적으로 삭제되었습니다.",
      });

      // 삭제 후 챌린지 목록 페이지로 이동
      navigate("/challenge");
    } catch (err) {
      console.error("챌린지 삭제 실패:", err);
      toast({
        title: "오류",
        description: "챌린지 삭제에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setDeleting(false);
    }
  };

  if (loading) return <div>챌린지 정보를 불러오는 중입니다...</div>;
  if (error) return <div>에러 발생: {error}</div>;

  // 수정/삭제 버튼 (관리자만)
  const ModifyDeleteButtons = () => {
    if (roleStatus === true) {
      return (
        <div className="flex space-x-2 mt-4">
          <Button
            variant="outline"
            className="w-1/2"
            onClick={() => navigate(`/challenge/modify/${challIdx}`)}
          >
            수정하기
          </Button>
          <Button
            variant="destructive"
            className="w-1/2"
            onClick={() => {
              if (window.confirm("정말 이 챌린지를 삭제하시겠습니까?")) {
                deleteChallenge();
              }
            }}
            disabled={deleting}
          >
            {deleting ? "삭제 중..." : "삭제하기"}
          </Button>
        </div>
      );
    }
    return;
  };

  // 참여 버튼 (일반유저만)
  const JoinButtons = () => {
    if (roleStatus === false) {
      return (
        <Button
          className="w-full mt-4"
          onClick={joinChallenge}
          disabled={joining}
        >
          {joining ? "참여 신청 중..." : "지금 참여하기"}
        </Button>
      );
    }
    return;
  };

  return (
    <div>
      <div className="mb-20">
        {/* 카테고리 및 상태 */}
        <div className="flex flex-row items-center justify-center gap-1">
          <div className="border border-gray-300 px-2 py-1 rounded-lg text-xs inline-flex h-full">
            {challengeData.challState}
          </div>
          <div className="border border-gray-300 px-2 py-1 rounded-lg text-xs inline-flex h-full">
            {categoryName}
          </div>
        </div>

        {/* 제목 */}
        <div className="text-center text-2xl font-bold mb-2 mt-1">
          {challengeData.challTitle || "제목 정보 없음"}
        </div>
        <div className="text-center text-gray-500">
          등록일 : {new Date(challengeData.challCreatedAt).toLocaleDateString()}
        </div>
      </div>

      {/* 참여 인원 */}
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
          {new Date(challengeData.challStartTime).toLocaleDateString()} ~{" "}
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

      {/* 버튼 렌더링 */}
      <ModifyDeleteButtons />
      <JoinButtons />
    </div>
  );
};

export default ChallengeDetailForm;
