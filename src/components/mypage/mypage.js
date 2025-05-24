import { useState, useEffect, useRef } from "react";
import { Award, Save, X, Heart, CheckCircle, Trophy } from "lucide-react";
import MyProfileForm from "./myprofile";
import PasswordSection from "./Security Settings";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import axiosInstance from "@/api/axiosInstance";
import RoutineTabContent from "./myroutine";
import LikedRoutineTabContent from "./myLike";

export default function MyPageForm() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // 에러 알림이 표시되었는지 추적하는 ref
  const errorNotifiedRef = useRef(false);
  // 재시도 횟수를 추적하는 ref 추가
  const retryCountRef = useRef(0);
  const MAX_RETRY_COUNT = 3; // 3번으로 변경

  // 로컬스토리지 - 사용자 기본 정보
  const userInfoString = localStorage.getItem("userInfo");
  const userInfo = userInfoString ? JSON.parse(userInfoString) : null;
  const accessToken = localStorage.getItem("accessToken");

  // 유저 데이터 상태 설정
  const [userData, setUserData] = useState({
    userId: "",
    userNick: "",
    nickTag: "",
    userExp: 0,
    maxExp: "",
    combo: 0,
    userLv: 1,
    userName: "",
    userEmail: "",
    userJoin: "",
    userPhone: "",
    userGender: "",
    userJob: "",
    targetIdx: "",
  });

  useEffect(() => {
    if (!accessToken) {
      toast({
        variant: "destructive",
        title: "로그인이 필요합니다",
        description: "마이페이지 접근을 위해 로그인해주세요.",
      });
      navigate("/user/login");
      return;
    }

    // 로컬스토리지 기본 정보 설정
    if (userInfo) {
      setUserData((prevData) => ({
        ...prevData,
        userId: userInfo.userIdx || "",
        userNick: userInfo.userNick || "",
        nickTag: userInfo.nickTag || "",
        userExp: userInfo.userExp || 0,
        combo: userInfo.combo || 0,
        userLv: userInfo.userLv || 1,
        userName: userInfo.userName || "",
        maxExp: userInfo.maxExp || 0,
      }));
    }

    // 재시도 카운트 초기화
    retryCountRef.current = 0;

    // 처음 데이터 로드 시도
    fetchUserData();
  }, []); // 의존성 배열 비움 - 컴포넌트 마운트 시 한 번만 실행

  const fetchUserData = async () => {
    setLoading(true);

    try {
      const response = await axiosInstance.get("/myPage/auth/myAccount", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        timeout: 5000, // 5초 타임아웃 설정
      });

      // 응답 구조 확인을 위한 로그
      console.log("전체 응답 구조:", JSON.stringify(response.data));

      // 응답 구조에 따라 데이터 추출 (message 객체 내부 또는 직접 데이터)
      const apiData = response.data.message || response.data;

      // API 응답 데이터로 userData 업데이트
      setUserData((prevData) => ({
        ...prevData,
        userId: apiData.userId || prevData.userId,
        userEmail: apiData.userEmail || prevData.userEmail,
        userJoin: apiData.userJoin || prevData.userJoin,
        userPhone: apiData.userPhone || prevData.userPhone,
        userGender: getGenderText(apiData.userGender),
        userJob: apiData.jobInfos?.name || "정보 없음",
        targetIdx: apiData.targetInfos?.name || "정보 없음",
        maxExp: apiData.maxExp || prevData.maxExp,
      }));

      console.log("응답데이터:", response.data);
      // 성공 시 에러 상태와 알림 플래그 초기화
      setError(null);
      errorNotifiedRef.current = false;
      // 성공 시 카운터 리셋
      retryCountRef.current = 0;

      setLoading(false);
    } catch (err) {
      console.error("사용자 정보를 불러오는 중 오류 발생:", err);

      // 500 에러인지 확인
      const is500Error = err.response?.status === 500;

      if (is500Error && retryCountRef.current < MAX_RETRY_COUNT) {
        // 시도 횟수 증가
        retryCountRef.current += 1;
        console.log(
          `500 에러 재시도 ${retryCountRef.current}/${MAX_RETRY_COUNT}`
        );

        // 1초 후 재시도
        setTimeout(() => {
          fetchUserData();
        }, 1000);

        return; // 여기서 return하여 아래 에러 처리 로직을 실행하지 않음
      }

      // 500 에러가 아니거나 최대 재시도 횟수에 도달한 경우
      let errorMessage = "사용자 정보를 불러오는 데 실패했습니다.";

      if (is500Error) {
        errorMessage = `서버 오류: 최대 시도 횟수(${MAX_RETRY_COUNT}회)에 도달했습니다.`;
      } else if (err.response?.status === 401) {
        errorMessage = "인증이 만료되었습니다. 다시 로그인해주세요.";
      } else if (err.response?.status === 403) {
        errorMessage = "접근 권한이 없습니다.";
      } else if (err.response?.status === 404) {
        errorMessage = "사용자 정보를 찾을 수 없습니다.";
      } else if (err.code === "ECONNABORTED") {
        errorMessage = "요청 시간이 초과되었습니다.";
      }

      setError(errorMessage);

      if (!errorNotifiedRef.current) {
        toast({
          variant: "destructive",
          title: "데이터 로딩 오류",
          description: errorMessage,
        });
        errorNotifiedRef.current = true;
      }

      setLoading(false);
    }
  };

  const getGenderText = (genderCode) => {
    switch (genderCode) {
      case 1:
        return "남성";
      case 2:
        return "여성";
      case 3:
        return "선택 안함";
      default:
        return "정보 없음";
    }
  };

  const [activeSideTab, setActiveSideTab] = useState("routines");
  const [editing, setEditing] = useState({
    userNick: false,
  });
  const [tempData, setTempData] = useState({ ...userData });

  // 수정 시작 핸들러
  const handleEdit = (field) => {
    setEditing({ ...editing, [field]: true });
    setTempData({ ...userData });
  };

  // 수정 취소 핸들러
  const handleCancel = (field) => {
    setEditing({ ...editing, [field]: false });
    setTempData({ ...userData });
  };

  // 필드 변경 핸들러
  const handleChange = (field, value) => {
    setTempData({ ...tempData, [field]: value });
  };

  // 수정 저장 핸들러
  const handleSave = async (field) => {
    try {
      // 닉네임 업데이트 요청
      if (field === "userNick") {
        await axiosInstance.patch(
          "/myPage/auth/myAccount/modify/nickName",
          { userNick: tempData.userNick },
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            timeout: 5000, // 5초 타임아웃 설정
          }
        );
      }

      setUserData({ ...userData, [field]: tempData[field] });
      setEditing({ ...editing, [field]: false });

      toast({
        title: "정보가 업데이트되었습니다",
        description: "성공적으로 변경사항이 저장되었습니다.",
      });

      // 로컬 스토리지 업데이트 (필요한 경우)
      if (field === "userNick" && userInfo) {
        const updatedUserInfo = { ...userInfo, userNick: tempData.userNick };
        localStorage.setItem("userInfo", JSON.stringify(updatedUserInfo));
      }
    } catch (err) {
      console.error("정보 업데이트 중 오류 발생:", err);
      toast({
        variant: "destructive",
        title: "업데이트 실패",
        description: "정보를 업데이트하는 데 문제가 발생했습니다.",
      });
    }
  };

  // 다시 시도 핸들러
  const handleRetry = () => {
    // 다시 시도할 때 에러 알림 플래그와 시도 카운트 초기화
    errorNotifiedRef.current = false;
    retryCountRef.current = 0;
    fetchUserData();
  };

  if (loading) {
    return (
      <div className="w-full flex justify-center items-center p-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">사용자 정보를 불러오는 중...</p>
          {retryCountRef.current > 0 && (
            <p className="text-sm text-gray-500">
              재시도 중... ({retryCountRef.current}/{MAX_RETRY_COUNT})
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="w-full p-8">
        <div className="text-center text-red-500">
          <p>{error}</p>
          <button
            onClick={handleRetry}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            다시 시도
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="text-center md:text-left">
        <div className="flex items-center justify-center mb-2">
          {editing.userNick ? (
            <div className="flex items-center">
              <input
                type="text"
                className="text-2xl font-bold text-indigo-700 border-b border-indigo-300 bg-transparent mr-2 focus:outline-none"
                value={tempData.userNick}
                onChange={(e) => handleChange("userNick", e.target.value)}
              />
              <div className="flex space-x-1">
                <button
                  onClick={() => handleSave("userNick")}
                  className="text-green-500"
                >
                  <Save size={16} />
                </button>
                <button
                  onClick={() => handleCancel("userNick")}
                  className="text-red-500"
                >
                  <X size={16} />
                </button>
              </div>
            </div>
          ) : (
            <>
              <h2 className="text-2xl font-bold text-blue-600">
                {userData.userNick}
              </h2>
              <span className="ml-2 text-gray-500 text-sm">
                {userData.nickTag}
              </span>
            </>
          )}
        </div>

        {/* 유저 아이디 */}
        <div className="flex items-center justify-center font-mono text-gray-500 mb-4">
          ID: {userData.userId}
        </div>

        <div className="mb-6 bg-gray-50 p-4 rounded-lg w-full">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-gray-700">
              레벨 {userData.userLv}
            </span>
            <span className="text-sm text-gray-500">
              {userData.userExp}/{userData.maxExp} EXP
            </span>
          </div>

          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div
              className="bg-blue-600 h-2.5 rounded-full"
              style={{
                width: `${(userData.userExp / userData.maxExp) * 100}%`,
              }}
            ></div>
          </div>

          {userData.combo > 0 && (
            <div className="mt-4 flex items-center justify-center bg-indigo-100 p-2 rounded-lg">
              <Award className="text-yellow-500 mr-2" size={20} />
              <span className="font-bold">{userData.combo}일 연속 달성!</span>
            </div>
          )}
        </div>

        {/* 루틴/좋아요/챌린지 탭 */}
        <div className="mb-6">
          <div className="border-b border-gray-200 mb-4">
            <ul className="flex flex-wrap -mb-px text-sm">
              <li className="mr-2">
                <button
                  className={`py-2 px-3 border-b-2 ${
                    activeSideTab === "routines"
                      ? "text-blue-600 border-blue-600"
                      : "border-transparent hover:text-gray-600 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveSideTab("routines")}
                >
                  나의 루틴기록
                </button>
              </li>
              <li className="mr-2">
                <button
                  className={`py-2 px-3 border-b-2 ${
                    activeSideTab === "likes"
                      ? "text-blue-600 border-blue-600"
                      : "border-transparent hover:text-gray-600 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveSideTab("likes")}
                >
                  좋아요
                </button>
              </li>
              <li>
                <button
                  className={`py-2 px-3 border-b-2 ${
                    activeSideTab === "challenges"
                      ? "text-blue-600 border-blue-600"
                      : "border-transparent hover:text-gray-600 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveSideTab("challenges")}
                >
                  챌린지
                </button>
              </li>
              <li className="mr-2">
                <button
                  className={`py-2 px-3 border-b-2 ${
                    activeSideTab === "mypage"
                      ? "text-blue-600 border-blue-600"
                      : "border-transparent hover:text-gray-600 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveSideTab("mypage")}
                >
                  내 프로필
                </button>
              </li>
              <li className="mr-2">
                <button
                  className={`py-2 px-3 border-b-2 ${
                    activeSideTab === "chat"
                      ? "text-blue-600 border-blue-600"
                      : "border-transparent hover:text-gray-600 hover:border-gray-300"
                  }`}
                  onClick={() => setActiveSideTab("chat")}
                >
                  1:1 문의
                </button>
              </li>
            </ul>
          </div>

          {/* 루틴/좋아요/챌린지 컨텐츠 */}
          {activeSideTab === "routines" && <RoutineTabContent />}

          {activeSideTab === "likes" && <LikedRoutineTabContent />}

          {activeSideTab === "challenges" && (
            <div className="p-5 text-center">
              <Trophy size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">참여한 챌린지가 없습니다.</p>
              <button
                className="mt-3 text-xs px-3 py-1 bg-blue-600 text-white rounded-lg"
                onClick={() => navigate(`/challenges/list`)}
              >
                챌린지 참여하기
              </button>
            </div>
          )}

          {activeSideTab === "mypage" && (
            //userData와 setUserData를 프로필 컴포넌트에 전달
            <MyProfileForm userData={userData} setUserData={setUserData} />
          )}
          <div className="pt-3">
            {activeSideTab === "mypage" && <PasswordSection />}
          </div>

          {activeSideTab === "chat" && (
            <div className="p-5 text-center">
              <Trophy size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">문의내역이 없습니다.</p>
              <button
                className="mt-3 text-xs px-3 py-1 bg-blue-600 text-white rounded-lg"
                // onClick={() => navigate(``)}
              >
                1:1 문의하기
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
