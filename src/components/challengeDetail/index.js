import { useState, useEffect, useCallback } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { useForm } from "react-hook-form";
import axiosInstance from "@/api/axiosInstance";
import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { GoPeople, GoClock, GoTrophy } from "react-icons/go";
import { MdOutlineDateRange, MdVerified, MdCheck } from "react-icons/md";
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
  const [verifying, setVerifying] = useState(false);
  const [isParticipant, setIsParticipant] = useState(false);

  // 인증 관련 상태
  const [verificationRecords, setVerificationRecords] = useState([]);

  // 인증 폼을 위한 React Hook Form
  const verificationForm = useForm({
    defaultValues: {
      startTime: "",
      endTime: "",
      activity: "",
    },
  });

  // localStorage에서 accessToken과 userIdx 가져오기
  const accessToken = localStorage.getItem("accessToken");
  const userInfoString = localStorage.getItem("userInfo");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const userIdx = userInfo?.userIdx || "21";
  const roleStatus = userInfo?.roleStatus || false;

  // 현재 사용자가 참여자인지 확인하는 함수
  const checkUserParticipation = useCallback(
    (challengeData) => {
      if (!challengeData?.participants || !userIdx) {
        setIsParticipant(false);
        return;
      }

      const isUserParticipant = challengeData.participants.some(
        (participant) => participant.userIdx === parseInt(userIdx)
      );
      setIsParticipant(isUserParticipant);
    },
    [userIdx]
  );

  // 챌린지 기간 내 날짜들 생성
  const generateChallengeDates = useCallback(() => {
    if (!challengeData) return [];

    const startDate = new Date(challengeData.challStartTime);
    const endDate = new Date(challengeData.challEndTime);
    const dates = [];

    const currentDate = new Date(startDate);
    while (currentDate <= endDate) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }

    return dates;
  }, [challengeData]);

  // 날짜가 인증 완료된 날인지 확인
  const isDateVerified = useCallback(
    (date) => {
      const dateString = date.toISOString().split("T")[0];
      return verificationRecords.some((record) => record.date === dateString);
    },
    [verificationRecords]
  );

  // 오늘 날짜인지 확인
  const isToday = useCallback((date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  }, []);

  // 인증 가능한 날짜인지 확인 (오늘 날짜만)
  const canVerifyDate = useCallback(
    (date) => {
      return isToday(date) && !isDateVerified(date);
    },
    [isToday, isDateVerified]
  );

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
        checkUserParticipation(response.data);
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
  }, [challIdx, userJoin, duration, checkUserParticipation]);

  // 인증 기록 불러오기
  useEffect(() => {
    const fetchVerificationRecords = async () => {
      if (!isParticipant || !challIdx) return;

      try {
        // 실제 API 엔드포인트로 교체 필요
        const response = await axiosInstance.get(
          `/challenges/auth/records/${challIdx}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );
        setVerificationRecords(response.data || []);
      } catch (err) {
        console.error("인증 기록 불러오기 실패:", err);
        // API가 없는 경우 임시 데이터 (실제 구현시 제거)
        setVerificationRecords([]);
      }
    };

    fetchVerificationRecords();
  }, [isParticipant, challIdx, accessToken]);

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

  // 날짜 선택 핸들러 (달력에서 날짜 클릭 시 - 정보 표시용)
  const handleDateSelect = (date) => {
    const dateString = date.toLocaleDateString();
    const isVerified = isDateVerified(date);
    const isTodayDate = isToday(date);

    if (isVerified) {
      toast({
        title: "인증 완료",
        description: `${dateString}에 이미 인증을 완료했습니다.`,
      });
    } else if (!isTodayDate) {
      toast({
        title: "인증 불가",
        description: "오늘 날짜만 인증할 수 있습니다.",
        variant: "destructive",
      });
    } else {
      toast({
        title: "인증 가능",
        description: `${dateString} 인증이 가능합니다. 아래 폼을 작성해주세요.`,
      });
    }
  };

  // 챌린지 참여 함수
  const joinChallenge = async () => {
    try {
      setJoining(true);

      const now = new Date();
      const startTime = now.toISOString();
      const endTime = new Date(now.getTime() + 30 * 60000).toISOString();

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
      checkUserParticipation(updatedResponse.data);
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

  // 챌린지 인증 함수
  const verifyChallenge = async (data) => {
    try {
      setVerifying(true);

      // 오늘 날짜인지 확인
      const today = new Date();
      const todayString = today.toISOString().split("T")[0];

      // 오늘 이미 인증했는지 확인
      const isAlreadyVerified = verificationRecords.some(
        (record) => record.date === todayString
      );

      if (isAlreadyVerified) {
        toast({
          title: "이미 인증 완료",
          description: "오늘은 이미 인증을 완료했습니다.",
          variant: "destructive",
        });
        return;
      }

      if (!data.startTime || !data.endTime || !data.activity) {
        toast({
          title: "입력 오류",
          description: "모든 필드를 입력해주세요.",
          variant: "destructive",
        });
        return;
      }

      // 시간 비교 (시:분 형식)
      const [startHour, startMinute] = data.startTime.split(":").map(Number);
      const [endHour, endMinute] = data.endTime.split(":").map(Number);

      const startTotalMinutes = startHour * 60 + startMinute;
      const endTotalMinutes = endHour * 60 + endMinute;

      if (startTotalMinutes >= endTotalMinutes) {
        toast({
          title: "시간 오류",
          description: "종료 시간이 시작 시간보다 늦어야 합니다.",
          variant: "destructive",
        });
        return;
      }

      // 오늘 날짜와 시간을 결합하여 ISO 문자열 생성
      const startDateTime = `${todayString}T${data.startTime}:00`;
      const endDateTime = `${todayString}T${data.endTime}:00`;

      await axiosInstance.post(
        `/challenges/auth/verify/${challIdx}`,
        {
          startTime: startDateTime,
          endTime: endDateTime,
          activity: data.activity,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        }
      );

      // 인증 기록에 추가
      const newRecord = {
        date: todayString,
        startTime: startDateTime,
        endTime: endDateTime,
        activity: data.activity,
        verifiedAt: new Date().toISOString(),
      };

      setVerificationRecords((prev) => [...prev, newRecord]);

      toast({
        title: "성공",
        description: "챌린지 인증이 완료되었습니다.",
      });

      verificationForm.reset({
        startTime: "",
        endTime: "",
        activity: "",
      });
    } catch (err) {
      console.error("챌린지 인증 실패:", err);
      toast({
        title: "오류",
        description: "챌린지 인증에 실패했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    } finally {
      setVerifying(false);
    }
  };

  // 챌린지 삭제 함수
  const deleteChallenge = async () => {
    try {
      setDeleting(true);

      await axiosInstance.patch(
        "/admin/challenges/delete",
        { challIdx: challIdx },
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

  // 인증 폼 입력 핸들러들 제거 (React Hook Form 사용으로 불필요)

  if (loading) return <div>챌린지 정보를 불러오는 중입니다...</div>;
  if (error) return <div>에러 발생: {error}</div>;

  // 달력 컴포넌트
  const ChallengeCalendar = () => {
    const challengeDates = generateChallengeDates();

    if (!challengeDates.length) return null;

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">챌린지 달력</h3>
        <Card className="p-4">
          <div className="grid grid-cols-7 gap-2 text-center">
            {["일", "월", "화", "수", "목", "금", "토"].map((day) => (
              <div key={day} className="font-semibold text-gray-600 p-2">
                {day}
              </div>
            ))}

            {challengeDates.map((date, index) => {
              const isVerified = isDateVerified(date);
              const isTodayDate = isToday(date);
              const canVerify = canVerifyDate(date);

              return (
                <div
                  key={index}
                  onClick={() => handleDateSelect(date)}
                  className={`
                    relative p-3 border rounded-lg cursor-pointer transition-all
                    ${
                      isTodayDate
                        ? "border-blue-500 bg-blue-50"
                        : "border-gray-200"
                    }
                    ${isVerified ? "bg-green-100 border-green-500" : ""}
                    ${
                      canVerify
                        ? "hover:bg-blue-100"
                        : "cursor-not-allowed opacity-50"
                    }
                  `}
                >
                  <span className="text-sm">{date.getDate()}</span>
                  {isVerified && (
                    <div className="absolute top-1 right-1">
                      <MdCheck className="text-green-600 text-lg" />
                    </div>
                  )}
                  {isTodayDate && !isVerified && (
                    <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                  )}
                </div>
              );
            })}
          </div>

          <div className="flex items-center gap-4 mt-4 text-sm text-gray-600">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
              <span>오늘</span>
            </div>
            <div className="flex items-center gap-1">
              <MdCheck className="text-green-600" />
              <span>인증 완료</span>
            </div>
          </div>
        </Card>
      </div>
    );
  };

  // 인증 기록 컴포넌트
  const VerificationHistory = () => {
    if (!verificationRecords.length) return null;

    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-4">인증 기록</h3>
        <div className="space-y-3">
          {verificationRecords.map((record, index) => (
            <Card key={index} className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MdCheck className="text-green-600" />
                  <span className="font-medium">
                    {new Date(record.date).toLocaleDateString()}
                  </span>
                </div>
                <span className="text-sm text-gray-500">
                  {new Date(record.startTime).toLocaleTimeString()} -{" "}
                  {new Date(record.endTime).toLocaleTimeString()}
                </span>
              </div>
              <div className="mt-2 text-gray-700">{record.activity}</div>
            </Card>
          ))}
        </div>
      </div>
    );
  };

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
    return null;
  };

  // 참여 버튼 (일반유저만, 참여하지 않은 경우)
  const JoinButtons = () => {
    if (roleStatus === false && !isParticipant) {
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
    return null;
  };

  // 인증 폼
  const VerificationForm = () => {
    // 오늘 이미 인증했는지 확인
    const today = new Date();
    const todayString = today.toISOString().split("T")[0];
    const isAlreadyVerified = verificationRecords.some(
      (record) => record.date === todayString
    );

    if (isAlreadyVerified) {
      return (
        <Card className="mt-4">
          <CardHeader>
            <div className="text-center py-4">
              <MdCheck className="mx-auto text-green-600 text-4xl mb-2" />
              <h3 className="text-lg font-semibold text-green-600">
                오늘 인증 완료!
              </h3>
              <p className="text-gray-600 mt-1">
                {today.toLocaleDateString("ko-KR", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
                에 인증을 완료했습니다.
              </p>
            </div>
          </CardHeader>
        </Card>
      );
    }

    return (
      <Card className="mt-4">
        <CardHeader>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center">
              <MdVerified className="mr-2" />
              {today.toLocaleDateString("ko-KR", {
                month: "long",
                day: "numeric",
              })}{" "}
              기록
            </h3>

            <form onSubmit={verificationForm.handleSubmit(verifyChallenge)}>
              <div className="space-y-3">
                <div>
                  <Label htmlFor="startTime">시작 시간</Label>
                  <Input
                    id="startTime"
                    type="time"
                    className="w-full"
                    {...verificationForm.register("startTime")}
                  />
                </div>

                <div>
                  <Label htmlFor="endTime">종료 시간</Label>
                  <Input
                    id="endTime"
                    type="time"
                    className="w-full "
                    {...verificationForm.register("endTime")}
                  />
                </div>

                <div>
                  <Label htmlFor="activity">활동 내용</Label>
                  <Input
                    id="activity"
                    type="text"
                    placeholder="예: 러닝 5km, 독서 2시간 등"
                    {...verificationForm.register("activity")}
                  />
                </div>
              </div>

              <div className="flex space-x-2 mt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => {
                    verificationForm.reset({
                      startTime: "",
                      endTime: "",
                      activity: "",
                    });
                  }}
                >
                  초기화
                </Button>
                <Button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white border-indigo-600 hover:bg-blue-700 active:bg-blue-800"
                  disabled={verifying}
                >
                  {verifying ? "인증 중..." : "인증하기"}
                </Button>
              </div>
            </form>
          </div>
        </CardHeader>
      </Card>
    );
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

      {/* 참여자만 볼 수 있는 섹션 */}
      {roleStatus === false && isParticipant && (
        <>
          <ChallengeCalendar />
          <VerificationForm />
          <VerificationHistory />
        </>
      )}
    </div>
  );
};

export default ChallengeDetailForm;
