// src/components/routine/list/RoutineList.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Calendar,
  Video,
  Code,
  BookOpen,
  Clock,
  PlusCircle,
  Flame,
  Eye,
  Heart,
  GitFork,
  CheckCircle,
  XCircle,
  Leaf,
  Activity,
  Target,
  Calendar as CalendarIcon,
} from "lucide-react";

// API
import axiosInstance from "../../../api/axiosInstance";
import { reissueToken } from "../../../utils/routineUtils";

// 동적으로 아이콘 렌더링하는 컴포넌트
const DynamicIcon = ({ iconName, color = "#000", size = 16 }) => {
  const icons = {
    Video: <Video size={size} color={color} />,
    Code: <Code size={size} color={color} />,
    BookOpen: <BookOpen size={size} color={color} />,
    Leaf: <Leaf size={size} color={color} />,
    // 필요한 아이콘들 추가
  };

  return icons[iconName] || <Leaf size={size} color={color} />;
};

// 루틴 카드 컴포넌트
const RoutineCard = ({ routine, onCardClick, isActive }) => {
  const {
    myPlanInfos,
    myActivities,
    jobDefaultInfos,
    jobAddedInfos,
    targetInfos,
  } = routine;

  // 직업 정보 (기본 또는 추가)
  const jobInfo = jobDefaultInfos || jobAddedInfos;

  // 반복 요일 포맷팅
  const formatRepeatDays = (repeatDays) => {
    if (!repeatDays) return "없음";

    const dayMap = {
      mon: "월",
      tue: "화",
      wed: "수",
      thu: "목",
      fri: "금",
      sat: "토",
      sun: "일",
    };

    return repeatDays
      .split(",")
      .map((day) => dayMap[day] || day)
      .join(", ");
  };

  // 루틴 그라데이션 색상
  const getGradientStyle = () => {
    const baseColor = jobInfo?.color || "#4F46E5";

    if (isActive) {
      return {
        background: `linear-gradient(135deg, ${baseColor} 0%, ${adjustColor(
          baseColor,
          20
        )} 100%)`,
        opacity: 1,
      };
    } else {
      // 비활성 루틴도 직업 색상을 유지하되 더 밝고 부드럽게
      return {
        background: `linear-gradient(135deg, ${adjustColor(
          baseColor,
          40
        )} 0%, ${adjustColor(baseColor, 60)} 100%)`,
        opacity: 0.9,
      };
    }
  };

  // 색상 조정 헬퍼 함수 (밝게/어둡게)
  const adjustColor = (hex, percent) => {
    const num = parseInt(hex.replace("#", ""), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) + amt;
    const G = ((num >> 8) & 0x00ff) + amt;
    const B = (num & 0x0000ff) + amt;

    return `#${(
      0x1000000 +
      (R < 255 ? (R < 0 ? 0 : R) : 255) * 0x10000 +
      (G < 255 ? (G < 0 ? 0 : G) : 255) * 0x100 +
      (B < 255 ? (B < 0 ? 0 : B) : 255)
    )
      .toString(16)
      .slice(1)}`;
  };

  return (
    <Card
      className={`mb-4 overflow-hidden hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1 ${
        isActive ? "border-l-4" : "border-l-4 border"
      }`}
      style={{
        borderLeftColor: isActive
          ? jobInfo?.color || "#4F46E5"
          : adjustColor(jobInfo?.color || "#4F46E5", 40),
      }}
      onClick={() => onCardClick(myPlanInfos.planIdx)}
    >
      <div className="relative p-5 border-b" style={getGradientStyle()}>
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-white drop-shadow-sm">
              {myPlanInfos.planTitle}
            </h3>
            <div className="flex items-center mt-2">
              <div className="bg-white p-1.5 rounded-full mr-2 shadow-sm">
                {jobInfo && (
                  <DynamicIcon
                    iconName={jobInfo.icon}
                    color={jobInfo.color}
                    size={18}
                  />
                )}
              </div>
              <span className="text-white text-sm font-medium drop-shadow-sm">
                {jobInfo?.name || "직업 없음"}
              </span>
            </div>
          </div>
          <div className="flex flex-col items-end">
            <Badge
              variant="outline"
              className={`${
                isActive
                  ? "bg-green-100 text-green-600 border-green-300"
                  : "bg-gray-100 text-gray-500 border-gray-300"
              } font-medium px-3 py-1 shadow-sm`}
            >
              {isActive ? (
                <CheckCircle className="w-3.5 h-3.5 mr-1.5" />
              ) : (
                <XCircle className="w-3.5 h-3.5 mr-1.5" />
              )}
              {isActive ? "활성" : "비활성"}
            </Badge>
            <div className="flex mt-3">
              <Badge
                variant="outline"
                className="bg-white bg-opacity-90 text-gray-700 font-medium px-2 py-1 shadow-sm"
              >
                <CalendarIcon className="w-3.5 h-3.5 mr-1.5" />
                {formatRepeatDays(myPlanInfos.repeatDays)}
              </Badge>
            </div>
          </div>
        </div>
      </div>
      <CardContent
        className={`p-5 ${
          isActive ? "bg-gradient-to-b from-white to-gray-50" : "bg-white"
        }`}
      >
        <div className="mb-4">
          <div className="flex items-center mb-3">
            <div
              className="p-1.5 rounded-full bg-teal-50 mr-2.5"
              style={{ color: targetInfos?.color || "#008080" }}
            >
              <Target className="w-5 h-5" />
            </div>
            <span className="text-sm font-medium text-gray-800">
              {targetInfos?.name || "목표 없음"}
            </span>
          </div>

          <div className="ml-2 mb-3">
            <div className="flex items-center text-gray-600 mb-2">
              <Activity className="w-4 h-4 mr-2" />
              <span className="text-sm">활동 {myActivities.length}개</span>
            </div>
            <div className="bg-white rounded-md p-2.5 shadow-sm border border-gray-100">
              {myActivities.slice(0, 2).map((activity) => (
                <div
                  key={activity.activityIdx}
                  className="flex items-center mb-2 last:mb-0"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></div>
                  <span className="text-sm text-gray-700 font-medium mr-2">
                    {activity.activityName}
                  </span>
                  {activity.setTime && (
                    <span className="text-gray-500 text-xs ml-auto bg-gray-100 px-2 py-0.5 rounded-full flex items-center">
                      <Clock className="w-3 h-3 mr-1" />
                      {activity.setTime}
                    </span>
                  )}
                </div>
              ))}
              {myActivities.length > 2 && (
                <div className="text-xs text-blue-500 font-medium mt-1.5 text-center">
                  + {myActivities.length - 2}개 더 보기...
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-gray-200">
          <div className="flex flex-col items-center justify-center p-2 rounded-md bg-blue-50">
            <div className="flex items-center text-blue-600 mb-1">
              <Flame className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">경험치</span>
            </div>
            <span className="text-sm font-bold text-gray-800">
              {myPlanInfos.certExp || 0}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-md bg-orange-50">
            <div className="flex items-center text-orange-500 mb-1">
              <Flame className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">중요도</span>
            </div>
            <span className="text-sm font-bold text-gray-800">
              {myPlanInfos.planImp || 0}
            </span>
          </div>
          <div className="flex flex-col items-center justify-center p-2 rounded-md bg-green-50">
            <div className="flex items-center text-green-600 mb-1">
              <Eye className="w-4 h-4 mr-1" />
              <span className="text-xs font-medium">공개여부</span>
            </div>
            <span className="text-sm font-bold text-gray-800">
              {myPlanInfos.isShared ? "공개" : "비공개"}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

// 메인 루틴 리스트 컴포넌트
const RoutineList = () => {
  const [routines, setRoutines] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // 데이터 가져오기
  useEffect(() => {
    const fetchRoutineData = async () => {
      setIsLoading(true);
      setError(null);

      let token = localStorage.getItem("accessToken");

      try {
        const getRoutines = async (authToken) => {
          try {
            const response = await axiosInstance.get("/list/auth/myPlans", {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            });
            return response;
          } catch (error) {
            // 토큰 만료 처리
            if (error.response && error.response.status === 401) {
              const newToken = await reissueToken(navigate);
              return await axiosInstance.get("/list/auth/myPlans", {
                headers: {
                  Authorization: `Bearer ${newToken}`,
                },
              });
            }
            throw error;
          }
        };

        const response = await getRoutines(token);
        console.log("루틴 리스트 데이터:", response.data);

        if (response.data && response.data.status === "success") {
          setRoutines(response.data.message || []);
        } else {
          setError("데이터를 불러오는데 실패했습니다.");
        }
      } catch (error) {
        console.error("루틴 리스트 조회 실패:", error);
        setError("루틴 목록을 불러오는데 문제가 발생했습니다.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutineData();
  }, [navigate]);

  // 루틴 카드 클릭 핸들러
  const handleRoutineCardClick = (planIdx) => {
    navigate(`/routine/detail/${planIdx}`);
  };

  // 새 루틴 추가 핸들러
  const handleAddNewRoutine = () => {
    navigate("/routine/create");
  };

  // 활성 루틴과 비활성 루틴 분류
  const activeRoutines = routines.filter(
    (routine) => routine.myPlanInfos.isActive
  );
  const inactiveRoutines = routines.filter(
    (routine) => !routine.myPlanInfos.isActive
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="w-12 h-12 bg-blue-200 rounded-full mb-4"></div>
          <div className="text-lg text-blue-500 font-medium">로딩 중...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col justify-center items-center min-h-screen text-red-500">
        <p className="mb-4 text-lg">{error}</p>
        <Button
          onClick={() => window.location.reload()}
          className="bg-red-100 text-red-600 hover:bg-red-200"
        >
          다시 시도
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">나의 루틴 목록</h1>
          <p className="text-gray-500 mt-1">총 {routines.length}개의 루틴</p>
        </div>
        <Button
          onClick={handleAddNewRoutine}
          className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 font-medium py-2 px-4 shadow-md transition-all hover:shadow-lg"
        >
          <PlusCircle className="w-4 h-4 mr-2" />새 루틴
        </Button>
      </div>

      {routines.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg shadow-sm border border-gray-100">
          <div className="mb-6 text-gray-300">
            <Calendar className="w-16 h-16 mx-auto" />
          </div>
          <h3 className="text-xl font-medium text-gray-700 mb-3">
            루틴이 없습니다
          </h3>
          <p className="text-gray-500 mb-6 max-w-md mx-auto">
            첫 번째 루틴을 만들어 습관을 형성하고 목표를 달성해보세요!
          </p>
          <Button
            onClick={handleAddNewRoutine}
            className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 font-medium py-2 px-6 shadow-md"
          >
            <PlusCircle className="w-4 h-4 mr-2" />
            루틴 만들기
          </Button>
        </div>
      ) : (
        <div className="space-y-10">
          {/* 활성 루틴 섹션 */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-green-100 p-1.5 rounded-md mr-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">활성 루틴</h2>
              <span className="bg-green-100 text-green-700 text-sm font-medium ml-3 px-2.5 py-0.5 rounded-full">
                {activeRoutines.length}
              </span>
            </div>

            {activeRoutines.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border border-dashed border-gray-300">
                <p className="text-gray-500">활성화된 루틴이 없습니다.</p>
                <Button
                  onClick={handleAddNewRoutine}
                  variant="link"
                  className="text-blue-600 mt-2"
                >
                  새 루틴 만들기
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {activeRoutines.map((routine) => (
                  <RoutineCard
                    key={routine.myPlanInfos.planIdx}
                    routine={routine}
                    onCardClick={handleRoutineCardClick}
                    isActive={true}
                  />
                ))}
              </div>
            )}
          </div>

          {/* 비활성 루틴 섹션 */}
          <div>
            <div className="flex items-center mb-4">
              <div className="bg-blue-100 p-1.5 rounded-md mr-2">
                <XCircle className="w-5 h-5 text-blue-500" />
              </div>
              <h2 className="text-xl font-bold text-gray-800">비활성 루틴</h2>
              <span className="bg-blue-100 text-blue-700 text-sm font-medium ml-3 px-2.5 py-0.5 rounded-full">
                {inactiveRoutines.length}
              </span>
            </div>

            {inactiveRoutines.length === 0 ? (
              <div className="text-center py-8 bg-white rounded-lg border border-dashed border-blue-200">
                <p className="text-blue-500">비활성화된 루틴이 없습니다.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {inactiveRoutines.map((routine) => (
                  <RoutineCard
                    key={routine.myPlanInfos.planIdx}
                    routine={routine}
                    onCardClick={handleRoutineCardClick}
                    isActive={false}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default RoutineList;
