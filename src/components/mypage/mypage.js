import { useState } from "react";
import {
  User,
  Mail,
  Phone,
  Calendar,
  UserCheck,
  Award,
  Target,
  Briefcase,
  Edit,
  Lock,
  Save,
  X,
  Eye,
  EyeOff,
  Heart,
  CheckCircle,
  Trophy,
  ChevronRight,
  ChevronDown,
} from "lucide-react";
import MyProfileForm from "./myprofile";
import { useNavigate } from "react-router-dom";

export default function MyPageForm() {
  const navigate = useNavigate();
  // 유저 데이터를 상위 컴포넌트로 이동하여 공유
  const [userData, setUserData] = useState({
    userId: "user123",
    userNick: "사용자",
    nickTag: "#9876",
    userExp: 7800,
    maxExp: 10000,
    combo: 12,
    userLv: 42,
    userName: "김철수",
    userEmail: "user123@example.com",
    userJoin: "2023-06-15",
    userPhone: "010-1234-5678",
    userGender: "남성",
    userJob: "개발자",
    userGoal: "풀스택 개발자 되기",
    password: "myStrongPassword123",
  });

  const [activeSideTab, setActiveSideTab] = useState("routines");
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false);
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
  const handleSave = (field) => {
    setUserData({ ...userData, [field]: tempData[field] });
    setEditing({ ...editing, [field]: false });
  };

  // 추가 정보 표시 토글
  const toggleAdditionalInfo = () => {
    setShowAdditionalInfo(!showAdditionalInfo);
  };

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

          <div className="mt-4 flex items-center justify-center bg-indigo-100 p-2 rounded-lg">
            <Award className="text-yellow-500 mr-2" size={20} />
            <span className="font-bold">{userData.combo}일 연속 달성!</span>
          </div>
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
            </ul>
          </div>

          {/* 루틴/좋아요/챌린지 컨텐츠 */}
          {activeSideTab === "routines" && (
            <div className="p-5 text-center">
              <CheckCircle size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">
                아직 등록된 루틴이 없습니다.
              </p>
              <button className="mt-3 text-xs px-3 py-1 bg-blue-600 text-white rounded-lg">
                루틴 만들기
              </button>
            </div>
          )}

          {activeSideTab === "likes" && (
            <div className="p-5 text-center">
              <Heart size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">좋아요한 루틴이 없습니다.</p>
              <button className="mt-3 text-xs px-3 py-1 bg-blue-600 text-white rounded-lg">
                루틴 찾아보기
              </button>
            </div>
          )}

          {activeSideTab === "challenges" && (
            <div className="p-5 text-center">
              <Trophy size={32} className="mx-auto text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">참여한 챌린지가 없습니다.</p>
              <button
                className="mt-3 text-xs px-3 py-1 bg-blue-600 text-white rounded-lg "
                onClick={() => navigate(`/challenges/list`)}
              >
                챌린지 참여하기
              </button>
            </div>
          )}
        </div>
      </div>

      {/* userData와 setUserData를 프로필 컴포넌트에 전달 */}
      <MyProfileForm userData={userData} setUserData={setUserData} />
    </div>
  );
}
