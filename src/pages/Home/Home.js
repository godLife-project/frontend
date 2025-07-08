// import React from "react";

// function Home(props) {
//   return <div>홈</div>;
// }

// export default Home;

import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Heart,
  GitFork,
  Users,
  Calendar,
  BookOpen,
  Code,
  Star,
  Clock,
  Flame,
  Share,
  Lock,
  Plus,
  LogIn,
  Tag,
} from "lucide-react";
import axiosInstance from "@/api/axiosInstance";

function Home(props) {
  const navigate = useNavigate();
  const [plans, setPlans] = useState([]);
  const [challenges, setChallenges] = useState([]);
  const [challengeCategories, setChallengeCategories] = useState([]); // 🔥 배열로 변경
  const [myplans, setMyPlans] = useState([]);
  const [currentPlanIndex, setCurrentPlanIndex] = useState(0);
  const [currentChallengeIndex, setCurrentChallengeIndex] = useState(0);
  const [currentMyPlanIndex, setCurrentMyPlanIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    setLoading(true);

    // 토큰 가져오기
    const accessToken = localStorage.getItem("accessToken");
    const loggedIn =
      accessToken && accessToken !== "null" && accessToken.trim() !== "";
    setIsLoggedIn(loggedIn);

    // 공통 헤더 설정
    const authHeaders = loggedIn
      ? {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      : {};

    // 기본 API들 (토큰 없이 호출)
    const apiPromises = [
      axiosInstance.get("/list/plan/latest"),
      // 챌린지는 search API 사용 (파라미터 없이 기본 데이터)
      axiosInstance.get("/challenges/search"),
      axiosInstance.get("/categories/challenge"),
    ];

    // 토큰이 있을 때만 내 루틴 API 추가
    if (loggedIn) {
      apiPromises.push(
        axiosInstance.get("/list/auth/myPlans", {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          timeout: 5000,
        })
      );
    }

    Promise.all(apiPromises)
      .then((responses) => {
        console.log("=== API 응답 디버깅 ===");
        console.log("전체 응답 개수:", responses.length);

        // 플랜 데이터 설정
        console.log("플랜 API 응답:", responses[0].data);
        setPlans(responses[0].data.plans || []);

        // 챌린지 데이터 처리 (search API 방식으로 변경)
        const challengeResponse = responses[1].data;
        console.log("챌린지 API 상태:", responses[1].status);
        console.log("챌린지 API 응답:", challengeResponse);

        let challengeData = [];
        // search API 응답 구조에 맞게 처리
        if (challengeResponse && typeof challengeResponse === "object") {
          if (
            challengeResponse.content &&
            Array.isArray(challengeResponse.content)
          ) {
            challengeData = challengeResponse.content;
          } else if (Array.isArray(challengeResponse)) {
            challengeData = challengeResponse;
          } else {
            // 다른 가능한 필드들 확인
            const possibleArrays = ["challenges", "data", "items", "list"];
            for (const field of possibleArrays) {
              if (Array.isArray(challengeResponse[field])) {
                challengeData = challengeResponse[field];
                break;
              }
            }
          }
        }

        console.log("처리된 챌린지 데이터:", challengeData);
        console.log("챌린지 데이터 길이:", challengeData.length);
        setChallenges(challengeData);

        const categoryResponse = responses[2].data;
        console.log("카테고리 API 상태:", responses[2].status);
        console.log("카테고리 API 응답:", categoryResponse);

        let categoryData = [];
        if (Array.isArray(categoryResponse)) {
          categoryData = categoryResponse;
        } else if (categoryResponse && Array.isArray(categoryResponse.data)) {
          categoryData = categoryResponse.data;
        } else if (
          categoryResponse &&
          Array.isArray(categoryResponse.content)
        ) {
          categoryData = categoryResponse.content;
        }

        const categoryOptions = categoryData
          .map((category, index) => {
            const value = index;
            const label = category.challName || "이름 없음";
            return { value: value.toString(), label };
          })
          .filter((option) => option.label && option.label.trim() !== "");

        console.log("처리된 카테고리 옵션:", categoryOptions);
        setChallengeCategories(categoryOptions);

        // 내 루틴은 토큰이 있을 때만 설정
        if (loggedIn && responses[3]) {
          console.log("내 루틴 API 응답:", responses[3].data);
          setMyPlans(responses[3].data.message || []);
        } else if (loggedIn && responses.length > 3) {
          console.log(
            "내 루틴 API 응답:",
            responses[responses.length - 1].data
          );
          setMyPlans(responses[responses.length - 1].data.message || []);
        }
      })
      .catch((error) => {
        console.error("Error fetching data:", error);

        if (error.response) {
          console.error("에러 응답 데이터:", error.response.data);
          console.error("에러 상태 코드:", error.response.status);
        }

        setPlans([]);
        setChallenges([]);
        setChallengeCategories([]);
        setMyPlans([]);
      })
      .finally(() => setLoading(false));
  }, []);

  // 네비게이션 함수들
  const mynextPlan = () => {
    setCurrentMyPlanIndex((prev) => (prev + 1) % myplans.length);
  };

  const myprevPlan = () => {
    setCurrentMyPlanIndex(
      (prev) => (prev - 1 + myplans.length) % myplans.length
    );
  };

  const nextPlan = () => {
    setCurrentPlanIndex((prev) => (prev + 1) % plans.length);
  };

  const prevPlan = () => {
    setCurrentPlanIndex((prev) => (prev - 1 + plans.length) % plans.length);
  };

  const nextChallenge = () => {
    setCurrentChallengeIndex((prev) => (prev + 1) % challenges.length);
  };

  const prevChallenge = () => {
    setCurrentChallengeIndex(
      (prev) => (prev - 1 + challenges.length) % challenges.length
    );
  };

  // 카드 클릭 핸들러 함수
  const handlePlanClick = (plan) => {
    const planIdx = plan.planInfos.planIdx;

    if (planIdx) {
      navigate(`/routine/detail/${planIdx}`);
    } else {
      console.error("planIdx를 찾을 수 없습니다:", plan);
    }
  };

  const handleChallengeClick = (challenge) => {
    const challIdx = challenge.challIdx;

    if (challIdx) {
      navigate(`/challenge/detail/${challIdx}`);
    } else {
      console.error("challIdx를 찾을 수 없습니다:", challenge);
    }
  };

  // 날짜 포맷팅
  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString("ko-KR");
  };

  // 요일 포맷팅
  const formatRepeatDays = (repeatDays) => {
    if (!repeatDays) return "";
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
      .map((day) => dayMap[day.trim()])
      .filter(Boolean)
      .join(", ");
  };

  const getCategoryName = (categoryValue) => {
    if (!categoryValue && categoryValue !== 0) return "미분류";

    // 카테고리 배열에서 해당 값 찾기
    const category = challengeCategories.find(
      (cat) => cat.value === categoryValue.toString()
    );
    return category ? category.label : `카테고리 ${categoryValue}`;
  };

  // 공통 스와이프 카드 컴포넌트
  const SwipeCard = ({
    children,
    currentIndex,
    totalCount,
    onPrev,
    onNext,
    className = "",
  }) => {
    const [swipeState, setSwipeState] = useState({
      isDragging: false,
      startX: 0,
      currentX: 0,
      dragOffset: 0,
    });

    const handleTouchStart = (e) => {
      if (totalCount <= 1) return;
      setSwipeState((prev) => ({
        ...prev,
        isDragging: true,
        startX: e.touches[0].clientX,
        currentX: e.touches[0].clientX,
      }));
    };

    const handleTouchMove = (e) => {
      if (!swipeState.isDragging || totalCount <= 1) return;
      const currentX = e.touches[0].clientX;
      setSwipeState((prev) => ({
        ...prev,
        currentX,
        dragOffset: currentX - prev.startX,
      }));
    };

    const handleTouchEnd = () => {
      if (!swipeState.isDragging || totalCount <= 1) return;

      const threshold = 50;
      const offset = swipeState.currentX - swipeState.startX;

      if (Math.abs(offset) > threshold) {
        if (offset > 0) {
          onPrev();
        } else {
          onNext();
        }
      }

      setSwipeState((prev) => ({
        ...prev,
        isDragging: false,
        dragOffset: 0,
        startX: 0,
        currentX: 0,
      }));
    };

    const handleMouseDown = (e) => {
      if (totalCount <= 1) return;
      setSwipeState((prev) => ({
        ...prev,
        isDragging: true,
        startX: e.clientX,
        currentX: e.clientX,
      }));
    };

    const handleMouseMove = (e) => {
      if (!swipeState.isDragging || totalCount <= 1) return;
      const currentX = e.clientX;
      setSwipeState((prev) => ({
        ...prev,
        currentX,
        dragOffset: currentX - prev.startX,
      }));
    };

    const handleMouseUp = () => {
      if (!swipeState.isDragging || totalCount <= 1) return;

      const threshold = 50;
      const offset = swipeState.currentX - swipeState.startX;

      if (Math.abs(offset) > threshold) {
        if (offset > 0) {
          onPrev();
        } else {
          onNext();
        }
      }

      setSwipeState((prev) => ({
        ...prev,
        isDragging: false,
        dragOffset: 0,
        startX: 0,
        currentX: 0,
      }));
    };

    return (
      <div
        className={`bg-white rounded-xl shadow-lg p-6 min-h-[200px] border border-gray-100 relative cursor-grab ${
          swipeState.isDragging ? "cursor-grabbing" : ""
        } transition-transform duration-200 select-none ${className}`}
        style={{
          transform: `translateX(${swipeState.dragOffset}px)`,
          opacity: swipeState.isDragging ? 0.9 : 1,
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        {/* 페이지 인디케이터 */}
        {totalCount > 1 && (
          <div className="absolute top-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-1 bg-gray-100 px-3 py-1 rounded-full">
              <span className="text-xs text-gray-600">
                {currentIndex + 1} / {totalCount}
              </span>
            </div>
          </div>
        )}

        {/* 스와이프 힌트 */}
        {totalCount > 1 && !swipeState.isDragging && (
          <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2">
            <div className="flex items-center space-x-2 text-xs text-gray-400">
              <ChevronLeft size={12} />
              <span>옆으로 넘기기</span>
              <ChevronRight size={12} />
            </div>
          </div>
        )}

        {/* 실제 카드 내용 */}
        <div className="mt-8 mb-6">{children}</div>
      </div>
    );
  };

  // 내 루틴 카드 내용
  const MyPlanCardContent = ({ myplan }) => (
    <>
      {/* 불꽃 표시 */}
      {myplan.myPlanInfos.fireState && (
        <div className="absolute top-4 right-4">
          <Flame size={20} className="text-orange-500" />
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center ${
              myplan.myPlanInfos.isActive ? "bg-green-100" : "bg-gray-100"
            }`}
          >
            <BookOpen
              size={20}
              className={
                myplan.myPlanInfos.isActive ? "text-green-600" : "text-gray-500"
              }
            />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">
              {myplan.myPlanInfos.planTitle}
            </h3>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {/* 상태 표시 */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">상태:</span>
          <span
            className={`px-2 py-1 rounded-full text-xs ${
              myplan.myPlanInfos.isActive
                ? "bg-green-100 text-green-700"
                : "bg-gray-100 text-gray-700"
            }`}
          >
            {myplan.myPlanInfos.isActive ? "활성" : "비활성"}
          </span>
        </div>

        {/* 반복 요일 */}
        {myplan.myPlanInfos.repeatDays && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">반복:</span>
            <span className="text-sm text-gray-700">
              {formatRepeatDays(myplan.myPlanInfos.repeatDays)}
            </span>
          </div>
        )}

        {/* 유지 기간 */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">기간:</span>
          <div className="flex items-center space-x-1">
            <Clock size={14} className="text-gray-500" />
            <span className="text-sm text-gray-700">
              {myplan.myPlanInfos.endTo}일
            </span>
          </div>
        </div>

        {/* 경험치 */}
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">경험치:</span>
          <span className="text-sm font-semibold text-blue-600">
            {myplan.myPlanInfos.certExp} XP
          </span>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
        <div className="flex items-center space-x-1">
          <Calendar size={14} />
          <span>종료: {formatDate(myplan.myPlanInfos.planSubEnd)}</span>
        </div>
      </div>
    </>
  );

  // 공개 루틴 카드 내용
  const PlanCardContent = ({ plan, onClick }) => (
    <div
      className="cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-2 -m-2"
      onClick={() => onClick && onClick(plan)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center"
            style={{ backgroundColor: plan.targetInfos.color + "20" }}
          >
            <BookOpen size={20} style={{ color: plan.targetInfos.color }} />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">
              {plan.planInfos.planTitle}
            </h3>
            <p className="text-sm text-gray-500">{plan.planInfos.userNick}</p>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        <div className="flex items-center space-x-2">
          <Tag size={12} className="text-gray-500" />
          <span className="text-sm" style={{ color: plan.targetInfos.color }}>
            {plan.targetInfos.name}
          </span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">추천직업</span>
          <div className="flex items-center space-x-1 text-sm text-gray-700">
            <span>{plan.jobDefault.name}</span>
          </div>
        </div>
        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">생성일</span>
          <div className="flex items-center space-x-1 text-sm text-gray-700">
            <Calendar size={14} />
            <span>{formatDate(plan.planInfos.planSubDate)}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between text-sm text-gray-500 pt-4 border-t">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1">
            <Eye size={14} />
            <span>{plan.planInfos.viewCount}</span>
          </div>
          <div className="flex items-center space-x-1">
            <Heart size={14} />
            <span>{plan.planInfos.likeCount}</span>
          </div>
          <div className="flex items-center space-x-1">
            <GitFork size={14} />
            <span>{plan.planInfos.forkCount}</span>
          </div>
        </div>
      </div>
    </div>
  );

  // 챌린지 카드
  const ChallengeCardContent = ({ challenge, onClick }) => (
    <div
      className="cursor-pointer hover:bg-gray-50 transition-colors rounded-lg p-2 -m-2"
      onClick={() => onClick && onClick(challenge)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
            <Users size={20} className="text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg text-gray-800">
              {challenge.challTitle}
            </h3>
          </div>
        </div>
      </div>

      <div className="space-y-3 mb-4">
        {/* 카테고리 정보를 별도 행으로도 표시 */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            <Tag size={14} className="text-gray-500" />
            <span className="text-sm text-gray-700">
              {getCategoryName(challenge.challCategoryIdx)}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-sm font-medium text-gray-600">참가자</span>
          <span className="text-sm font-semibold text-blue-600">
            {challenge.currentParticipants} / {challenge.maxParticipants}명
          </span>
        </div>

        {challenge.challEndTime && (
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600">종료일</span>
            <div className="flex items-center space-x-1 text-sm text-gray-700">
              <Calendar size={14} />
              <span>{formatDate(challenge.challEndTime)}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // 로그인 안내 컴포넌트
  const LoginPrompt = () => (
    <div className="text-center py-8 bg-white rounded-xl shadow-lg border border-gray-100">
      <div className="mb-4">
        <BookOpen size={48} className="text-gray-300 mx-auto mb-3" />
        <p className="text-gray-500 mb-2">나만의 루틴을 관리하려면</p>
        <p className="text-gray-600 font-medium">로그인이 필요합니다</p>
      </div>
      <div className="flex justify-center space-x-3">
        <button
          onClick={() => navigate("/user/login")}
          className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
        >
          <LogIn size={16} />
          <span>로그인</span>
        </button>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">데이터를 불러오는 중...</p>
        </div>
      </div>
    );
  }

  // 렌더링 시점 디버깅
  console.log("=== 렌더링 시점 디버깅 ===");
  console.log("isLoggedIn:", isLoggedIn);
  console.log("plans.length:", plans.length);
  console.log("challenges.length:", challenges.length);
  console.log("myplans.length:", myplans.length);
  console.log("challengeCategories:", challengeCategories);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-6xl mx-auto">
        {/* 내 루틴 섹션 */}
        <div className="mb-12">
          {!isLoggedIn ? (
            <LoginPrompt />
          ) : myplans.length > 0 ? (
            <div className="w-full overflow-hidden">
              <SwipeCard
                currentIndex={currentMyPlanIndex}
                totalCount={myplans.length}
                onPrev={myprevPlan}
                onNext={mynextPlan}
              >
                <MyPlanCardContent myplan={myplans[currentMyPlanIndex]} />
              </SwipeCard>
            </div>
          ) : (
            <div className="text-center py-8 bg-white rounded-xl shadow-lg border border-gray-100">
              <div className="mb-4">
                <BookOpen size={48} className="text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500 mb-2">
                  아직 진행중인 루틴이 없습니다
                </p>
              </div>
              <button
                onClick={() => navigate("/routine/list")}
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
              >
                <span>루틴 둘러보기</span>
              </button>
            </div>
          )}
        </div>

        {/* 공개 루틴 섹션 */}
        <div className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">공개 루틴</h2>
          </div>

          {plans.length > 0 ? (
            <div className="w-full overflow-hidden">
              <SwipeCard
                currentIndex={currentPlanIndex}
                totalCount={plans.length}
                onPrev={prevPlan}
                onNext={nextPlan}
              >
                <PlanCardContent
                  plan={plans[currentPlanIndex]}
                  onClick={handlePlanClick}
                />
              </SwipeCard>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              루틴 데이터가 없습니다.
            </div>
          )}
        </div>

        {/* 챌린지 섹션 */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-800">챌린지</h2>
          </div>

          {challenges.length > 0 ? (
            <div className="w-full overflow-hidden">
              <SwipeCard
                currentIndex={currentChallengeIndex}
                totalCount={challenges.length}
                onPrev={prevChallenge}
                onNext={nextChallenge}
              >
                <ChallengeCardContent
                  challenge={challenges[currentChallengeIndex]}
                  onClick={handleChallengeClick}
                />
              </SwipeCard>
            </div>
          ) : (
            <div className="text-center text-gray-500 py-8">
              챌린지 데이터가 없습니다.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Home;
