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
  Send,
  Check,
} from "lucide-react";

export default function MyProfileForm({ userData, setUserData }) {
  // 비밀번호 표시 여부
  const [showPassword, setShowPassword] = useState(false);

  // 회원탈퇴 확인 모달
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 이메일 인증 관련 상태
  const [verificationCode, setVerificationCode] = useState("");
  const [inputVerificationCode, setInputVerificationCode] = useState("");
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // 수정 상태를 관리하는 state
  const [editing, setEditing] = useState({
    userName: false,
    userGender: false,
    userPhone: false,
    userNick: false,
    userEmail: false,
    userJob: false,
    userGoal: false,
    password: false,
  });

  // 수정 중인 데이터를 저장할 임시 state
  const [tempData, setTempData] = useState({ ...userData });

  // 수정 시작 핸들러
  const handleEdit = (field) => {
    if (field === "userEmail") {
      // 이메일 필드 수정 시 인증 상태 초기화
      setEmailVerificationSent(false);
      setEmailVerified(false);
      setVerificationCode("");
      setInputVerificationCode("");
    }
    setEditing({ ...editing, [field]: true });
    setTempData({ ...userData });
  };

  // 수정 취소 핸들러
  const handleCancel = (field) => {
    setEditing({ ...editing, [field]: false });
    setTempData({ ...userData });
    if (field === "userEmail") {
      // 이메일 수정 취소 시 인증 상태 초기화
      setEmailVerificationSent(false);
      setEmailVerified(false);
      setVerificationCode("");
      setInputVerificationCode("");
    }
  };

  // 필드 변경 핸들러
  const handleChange = (field, value) => {
    setTempData({ ...tempData, [field]: value });
    if (field === "userEmail") {
      // 이메일 변경 시 인증 상태 초기화
      setEmailVerified(false);
      setEmailVerificationSent(false);
    }
  };

  // 수정 저장 핸들러
  const handleSave = (field) => {
    // 이메일의 경우 인증이 완료되었을 때만 저장 가능
    if (field === "userEmail" && !emailVerified) {
      alert("이메일 인증을 완료해주세요.");
      return;
    }

    setUserData({ ...userData, [field]: tempData[field] });
    setEditing({ ...editing, [field]: false });

    // 이메일 필드 저장 후 인증 상태 초기화
    if (field === "userEmail") {
      setEmailVerificationSent(false);
      setEmailVerified(false);
      setVerificationCode("");
      setInputVerificationCode("");
    }
  };

  // 이메일 인증번호 발송 핸들러
  const handleSendVerification = () => {
    // 이메일 형식 검증
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(tempData.userEmail)) {
      alert("유효한 이메일 주소를 입력해주세요.");
      return;
    }

    // 실제 구현에서는 API를 통해 서버에서 인증번호 발급 및 발송
    // 테스트를 위해 간단한 랜덤 코드 생성
    const randomCode = Math.floor(100000 + Math.random() * 900000).toString();
    setVerificationCode(randomCode);
    setEmailVerificationSent(true);
    alert(`인증번호가 발송되었습니다: ${randomCode}`);
    // 실제 구현에서는 이 alert는 제거하고 서버에서 이메일로 발송
  };

  // 인증번호 확인 핸들러
  const handleVerifyCode = () => {
    if (inputVerificationCode === verificationCode) {
      setEmailVerified(true);
      alert("이메일 인증이 완료되었습니다.");
    } else {
      alert("인증번호가 일치하지 않습니다.");
    }
  };

  // 회원탈퇴 처리
  const handleDeleteAccount = () => {
    // 실제 구현에서는 API 호출이 필요합니다
    alert("회원탈퇴 처리가 완료되었습니다.");
    setShowDeleteModal(false);
  };

  // 비밀번호를 마스킹 처리하는 함수
  const maskPassword = () => {
    return "••••••••";
  };

  return (
    <div className="rounded-2xl shadow-md bg-white overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-white">
        <h1 className="text-xl font-bold">내프로필</h1>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          <div>
            {/* 닉네임 필드 */}
            <div className="flex items-center p-4">
              <User className="text-indigo-500 mr-3" size={20} />
              <div className="flex-1">
                <div className="text-sm text-gray-500">닉네임</div>
                {editing.userNick ? (
                  <div className="flex items-center">
                    <input
                      type="text"
                      className="border-b border-indigo-300 bg-transparent mr-2 focus:outline-none"
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
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{userData.userNick}</span>
                      <span className="ml-1 text-gray-500 text-sm">
                        {userData.nickTag}
                      </span>
                    </div>
                    <button
                      onClick={() => handleEdit("userNick")}
                      className="text-indigo-500 hover:text-indigo-700"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 mx-4"></div>

            {/* 이름 필드 */}
            <div className="flex items-center p-4">
              <User className="text-indigo-500 mr-3" size={20} />
              <div className="flex-1">
                <div className="text-sm text-gray-500">이름</div>
                {editing.userName ? (
                  <div className="flex items-center">
                    <input
                      type="text"
                      className="border-b border-indigo-300 bg-transparent mr-2 focus:outline-none"
                      value={tempData.userName}
                      onChange={(e) => handleChange("userName", e.target.value)}
                    />
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleSave("userName")}
                        className="text-green-500"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => handleCancel("userName")}
                        className="text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{userData.userName}</span>
                    <button
                      onClick={() => handleEdit("userName")}
                      className="text-indigo-500 hover:text-indigo-700"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 mx-4"></div>

            {/* 이메일 필드 - 인증 기능 추가 */}
            <div className="flex items-center p-4">
              <Mail className="text-indigo-500 mr-3" size={20} />
              <div className="flex-1">
                <div className="text-sm text-gray-500">이메일</div>
                {editing.userEmail ? (
                  <div className="space-y-2">
                    <div className="flex items-center">
                      <input
                        type="email"
                        className="border-b border-indigo-300 bg-transparent mr-2 focus:outline-none flex-1"
                        value={tempData.userEmail}
                        onChange={(e) =>
                          handleChange("userEmail", e.target.value)
                        }
                      />
                      <button
                        onClick={handleSendVerification}
                        className={`px-2 py-1 text-xs rounded ${
                          emailVerificationSent
                            ? "bg-gray-200 text-gray-500"
                            : "bg-indigo-500 text-white hover:bg-indigo-600"
                        }`}
                        disabled={emailVerificationSent && emailVerified}
                      >
                        <span className="flex items-center">
                          <Send size={12} className="mr-1" />
                          인증번호 발송
                        </span>
                      </button>
                    </div>

                    {emailVerificationSent && (
                      <div className="flex items-center mt-2">
                        <input
                          type="text"
                          placeholder="인증번호 6자리 입력"
                          className="border-b border-indigo-300 bg-transparent mr-2 focus:outline-none flex-1"
                          value={inputVerificationCode}
                          onChange={(e) =>
                            setInputVerificationCode(e.target.value)
                          }
                          disabled={emailVerified}
                        />
                        <button
                          onClick={handleVerifyCode}
                          className={`px-2 py-1 text-xs rounded ${
                            emailVerified
                              ? "bg-green-500 text-white"
                              : "bg-indigo-500 text-white hover:bg-indigo-600"
                          }`}
                          disabled={emailVerified}
                        >
                          <span className="flex items-center">
                            {emailVerified ? (
                              <>
                                <Check size={12} className="mr-1" />
                                인증완료
                              </>
                            ) : (
                              "확인"
                            )}
                          </span>
                        </button>
                      </div>
                    )}

                    <div className="flex justify-end space-x-1 mt-2">
                      <button
                        onClick={() => handleSave("userEmail")}
                        className={`text-green-500 ${
                          !emailVerified && "opacity-50"
                        }`}
                        disabled={!emailVerified}
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => handleCancel("userEmail")}
                        className="text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{userData.userEmail}</span>
                    <button
                      onClick={() => handleEdit("userEmail")}
                      className="text-indigo-500 hover:text-indigo-700"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 mx-4"></div>

            {/* 가입일 필드 (수정 불가) */}
            <div className="flex items-center p-4">
              <Calendar className="text-indigo-500 mr-3" size={20} />
              <div>
                <div className="text-sm text-gray-500">가입일</div>
                <div className="font-medium">{userData.userJoin}</div>
              </div>
            </div>

            <div className="border-t border-gray-200 mx-4"></div>

            {/* 전화번호 필드 */}
            <div className="flex items-center p-4">
              <Phone className="text-indigo-500 mr-3" size={20} />
              <div className="flex-1">
                <div className="text-sm text-gray-500">전화번호</div>
                {editing.userPhone ? (
                  <div className="flex items-center">
                    <input
                      type="tel"
                      className="border-b border-indigo-300 bg-transparent mr-2 focus:outline-none"
                      value={tempData.userPhone}
                      onChange={(e) =>
                        handleChange("userPhone", e.target.value)
                      }
                    />
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleSave("userPhone")}
                        className="text-green-500"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => handleCancel("userPhone")}
                        className="text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{userData.userPhone}</span>
                    <button
                      onClick={() => handleEdit("userPhone")}
                      className="text-indigo-500 hover:text-indigo-700"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 mx-4"></div>

            {/* 성별 필드 */}
            <div className="flex items-center p-4">
              <UserCheck className="text-indigo-500 mr-3" size={20} />
              <div className="flex-1">
                <div className="text-sm text-gray-500">성별</div>
                {editing.userGender ? (
                  <div className="flex items-center">
                    <select
                      className="border-b border-indigo-300 bg-transparent mr-2 focus:outline-none"
                      value={tempData.userGender}
                      onChange={(e) =>
                        handleChange("userGender", e.target.value)
                      }
                    >
                      <option value="남성">남성</option>
                      <option value="여성">여성</option>
                      <option value="기타">기타</option>
                    </select>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleSave("userGender")}
                        className="text-green-500"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => handleCancel("userGender")}
                        className="text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{userData.userGender}</span>
                    <button
                      onClick={() => handleEdit("userGender")}
                      className="text-indigo-500 hover:text-indigo-700"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 mx-4"></div>

            {/* 직업 필드 */}
            <div className="flex items-center p-4">
              <Briefcase className="text-indigo-500 mr-3" size={20} />
              <div className="flex-1">
                <div className="text-sm text-gray-500">직업</div>
                {editing.userJob ? (
                  <div className="flex items-center">
                    <input
                      type="text"
                      className="border-b border-indigo-300 bg-transparent mr-2 focus:outline-none"
                      value={tempData.userJob}
                      onChange={(e) => handleChange("userJob", e.target.value)}
                    />
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleSave("userJob")}
                        className="text-green-500"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => handleCancel("userJob")}
                        className="text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{userData.userJob}</span>
                    <button
                      onClick={() => handleEdit("userJob")}
                      className="text-indigo-500 hover:text-indigo-700"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 mx-4"></div>

            {/* 목표 필드 */}
            <div className="flex items-center p-4 ">
              <Target className="text-indigo-500 mr-3" size={20} />
              <div className="flex-1">
                <div className="text-sm text-gray-500">목표</div>
                {editing.userGoal ? (
                  <div className="flex items-center">
                    <input
                      type="text"
                      className="border-b border-indigo-300 bg-transparent mr-2 focus:outline-none"
                      value={tempData.userGoal}
                      onChange={(e) => handleChange("userGoal", e.target.value)}
                    />
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleSave("userGoal")}
                        className="text-green-500"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => handleCancel("userGoal")}
                        className="text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{userData.userGoal}</span>
                    <button
                      onClick={() => handleEdit("userGoal")}
                      className="text-indigo-500 hover:text-indigo-700"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 mx-4"></div>

            {/* 비밀번호 필드 */}
            <div className="flex items-center p-4">
              <Lock className="text-indigo-500 mr-3" size={20} />
              <div className="flex-1">
                <div className="text-sm text-gray-500">비밀번호</div>
                {editing.password ? (
                  <div className="flex items-center">
                    <div className="relative flex-1 mr-2">
                      <input
                        type={showPassword ? "text" : "password"}
                        className="w-full border-b border-indigo-300 bg-transparent focus:outline-none pr-8"
                        value={tempData.password}
                        onChange={(e) =>
                          handleChange("password", e.target.value)
                        }
                      />
                      <button
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500"
                        type="button"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                    <div className="flex space-x-1">
                      <button
                        onClick={() => handleSave("password")}
                        className="text-green-500"
                      >
                        <Save size={16} />
                      </button>
                      <button
                        onClick={() => handleCancel("password")}
                        className="text-red-500"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{maskPassword()}</span>
                    <button
                      onClick={() => handleEdit("password")}
                      className="text-indigo-500 hover:text-indigo-700"
                    >
                      <Edit size={16} />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 회원 탈퇴 버튼 - 오른쪽 정렬로 변경 */}
          <div className="flex justify-end">
            <button
              onClick={() => setShowDeleteModal(true)}
              className="text-sm hover:text-red-700"
            >
              회원 탈퇴
            </button>
          </div>
        </div>
      </div>

      {/* 회원탈퇴 확인 모달 */}
      {showDeleteModal && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">회원탈퇴</h3>
            <p className="text-gray-600 mb-4">
              정말로 탈퇴하시겠습니까? 이 작업은 되돌릴 수 없습니다.
            </p>
            <div className="flex justify-end space-x-2">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                취소
              </button>
              <button
                onClick={handleDeleteAccount}
                className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600"
              >
                탈퇴하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
