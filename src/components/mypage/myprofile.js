import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import {
  User,
  Mail,
  Phone,
  Calendar,
  UserCheck,
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
import axiosInstance from "@/api/axiosInstance";

export default function MyProfileForm({ userData, setUserData }) {
  // userData에 초기값을 설정합니다
  useEffect(() => {
    if (!userData.userJobName && userData.userJob) {
      // 기본 작업 이름 설정
      setUserData((prev) => ({
        ...prev,
        userJobName: `${userData.userJob}`,
      }));
    }

    if (!userData.targetName && userData.targetIdx) {
      // 기본 목표 이름 설정
      setUserData((prev) => ({
        ...prev,
        targetName: `${userData.targetIdx}`,
      }));
    }
  }, []);

  // 비밀번호 표시 여부
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // 회원탈퇴 확인 모달
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // 이메일 인증 관련 상태
  const [verificationCode, setVerificationCode] = useState("");
  const [inputVerificationCode, setInputVerificationCode] = useState("");
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);

  // 비밀번호 변경 관련 상태
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // 카테고리 상태 관리
  const [jobCategories, setJobCategories] = useState([]);
  const [targetCategories, setTargetCategories] = useState([]);

  const accessToken = localStorage.getItem("accessToken");
  const { toast } = useToast();

  //개인정보(이름,전화번호,성별) 상태 관리
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getGenderCode = (genderText) => {
    switch (genderText) {
      case "남성":
        return 1;
      case "여성":
        return 2;
      case "선택 안함":
        return 3;
      default:
        return 0;
    }
  };

  //직업 카테고리
  useEffect(() => {
    const fetchJobCategories = async () => {
      try {
        const response = await axiosInstance.get(`categories/job`);
        console.log("직업 카테고리 데이터:", response.data);
        const categories = response.data.map((item) => ({
          jobIdx: item.idx,
          jobName: item.name,
        }));
        setJobCategories(categories);

        // 현재 선택된 직업의 이름 미리 설정
        if (userData.userJob && categories.length > 0) {
          const currentJob = categories.find(
            (job) => job.jobIdx.toString() === userData.userJob.toString()
          );
          if (currentJob && currentJob.jobName) {
            setUserData((prev) => ({
              ...prev,
              userJobName: currentJob.jobName,
            }));
          }
        }
      } catch (error) {
        console.error("직업 카테고리 데이터 가져오기 실패:", error);
      }
    };

    fetchJobCategories();
  }, [userData.userJob]);

  //관심사 카테고리
  useEffect(() => {
    const fetchTargetCategories = async () => {
      try {
        const response = await axiosInstance.get(`categories/target`);
        console.log("관심사 카테고리 데이터:", response.data);
        const categories = response.data.map((item) => ({
          targetIdx: item.idx,
          targetName: item.name,
        }));
        setTargetCategories(categories);

        // 현재 선택된 목표의 이름 미리 설정
        if (userData.targetIdx && categories.length > 0) {
          const currentTarget = categories.find(
            (target) =>
              target.targetIdx.toString() === userData.targetIdx.toString()
          );
          if (currentTarget && currentTarget.targetName) {
            setUserData((prev) => ({
              ...prev,
              targetName: currentTarget.targetName,
            }));
          }
        }
      } catch (error) {
        console.error("관심사 카테고리 데이터 가져오기 실패:", error);
      }
    };

    fetchTargetCategories();
  }, [userData.targetIdx]);

  // 수정 상태를 관리하는 state
  const [editing, setEditing] = useState({
    personalInfo: false, // 이름, 성별, 전화번호 통합 수정
    careerInfo: false, // 직업, 목표 통합 수정
    userNick: false,
    userEmail: false,
    password: false,
  });

  // 수정 중인 데이터를 저장할 임시 state
  const [tempData, setTempData] = useState({ ...userData });

  // 편집 상태가 변경될 때 tempData 업데이트
  useEffect(() => {
    if (editing.careerInfo) {
      console.log("편집 상태 변경 감지, 현재 userData:", userData);
      setTempData((prev) => ({
        ...prev,
        userJob: userData.userJob,
        targetIdx: userData.targetIdx,
      }));
    }
  }, [editing.careerInfo, userData]);

  // 수정 시작 핸들러
  const handleEdit = (field) => {
    if (field === "userEmail") {
      // 이메일 필드 수정 시 인증 상태 초기화
      setEmailVerificationSent(false);
      setEmailVerified(false);
      setVerificationCode("");
      setInputVerificationCode("");
      setTempData({ ...userData });
    } else if (field === "password") {
      // 비밀번호 필드 수정 시 입력값 초기화
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setTempData({ ...userData });
    } else if (field === "careerInfo") {
      // 커리어 정보 편집 시 현재 선택된 값으로 초기화
      console.log("커리어 정보 수정 시작, 현재 userData:", userData);

      // 명시적으로 현재 선택된 값으로 초기화
      const initialTempData = {
        ...userData,
        userJob: userData.userJob, // 명시적으로 현재 값 설정
        targetIdx: userData.targetIdx, // 명시적으로 현재 값 설정
      };
      console.log("초기화할 tempData:", initialTempData);
      setTempData(initialTempData);
    } else {
      // 다른 필드들은 일반적인 방식으로 처리
      setTempData({ ...userData });
    }

    // 편집 상태 활성화
    setEditing({ ...editing, [field]: true });
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
    } else if (field === "password") {
      // 비밀번호 수정 취소 시 입력값 초기화
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    }
  };

  // 필드 변경 핸들러
  const handleChange = (field, value) => {
    console.log(`${field} 필드 변경: ${value}`);
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
    } else {
      // 이메일 또는 다른 필드 저장
      setUserData({ ...userData, ...tempData });
    }

    // 수정 상태 종료
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

  // 이메일 인증번호 확인 핸들러
  const handleVerifyCode = () => {
    if (inputVerificationCode === verificationCode) {
      setEmailVerified(true);
      alert("이메일 인증이 완료되었습니다.");
      // 인증 성공 시 이메일 즉시 업데이트
      setUserData({ ...userData, userEmail: tempData.userEmail });
      setEditing({ ...editing, userEmail: false });
      // 인증 상태 초기화
      setEmailVerificationSent(false);
      setVerificationCode("");
      setInputVerificationCode("");
    } else {
      alert("인증번호가 일치하지 않습니다.");
    }
  };

  // 닉네임 수정 저장 핸들러
  const NickNameSave = async (field) => {
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
      if (field === "userNick") {
        const updatedUserInfo = { userNick: tempData.userNick };
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

  // 개인정보(이름, 성별, 전화번호) 저장 핸들러
  const PersonalInfoSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      // 개인정보(이름, 성별, 전화번호) 변경 API 호출
      await axiosInstance.patch(
        "/myPage/auth/myAccount/modify/personal",
        {
          userName: tempData.userName,
          userGender: getGenderCode(tempData.userGender),
          userPhone: tempData.userPhone,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          timeout: 5000, // 5초 타임아웃 설정
        }
      );

      // 업데이트된 userData 상태 설정
      setUserData({
        ...userData,
        userName: tempData.userName,
        userGender: tempData.userGender,
        userPhone: tempData.userPhone,
      });

      setEditing({ ...editing, personalInfo: false });

      toast({
        title: "개인정보 변경 완료",
        description: "개인정보가 성공적으로 변경되었습니다.",
      });
    } catch (err) {
      console.error("개인정보 업데이트 중 오류 발생:", err);
      toast({
        variant: "destructive",
        title: "업데이트 실패",
        description: "개인정보를 업데이트하는 데 문제가 발생했습니다.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 커리어저장(직업,목표) 저장 핸들러
  const CareerlInfoSave = async () => {
    if (isSubmitting) return;
    setIsSubmitting(true);
    try {
      console.log("커리어 정보 저장 시작, tempData:", tempData);

      // 변경된 필드만 업데이트하고, 변경되지 않은 필드는 기존 값 유지
      const jobIdxValue = Number(tempData.userJob || userData.userJob);
      const targetIdxValue = Number(tempData.targetIdx || userData.targetIdx);

      console.log("전송할 값:", { jobIdxValue, targetIdxValue });

      // API 호출
      const response = await axiosInstance.patch(
        "/myPage/auth/myAccount/modify/job-target",
        {
          jobIdx: jobIdxValue,
          targetIdx: targetIdxValue,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          timeout: 5000,
        }
      );

      console.log("API 응답:", response.data);

      // 업데이트된 직업 이름과 목표 이름 찾기
      const updatedJobName =
        jobCategories.find(
          (job) => job.jobIdx.toString() === jobIdxValue.toString()
        )?.jobName || userData.userJobName;

      const updatedTargetName =
        targetCategories.find(
          (target) => target.targetIdx.toString() === targetIdxValue.toString()
        )?.targetName || userData.targetName;

      // userData 상태 업데이트 (문자열로 저장)
      const updatedUserData = {
        ...userData,
        userJob: jobIdxValue.toString(),
        targetIdx: targetIdxValue.toString(),
        userJobName: updatedJobName,
        targetName: updatedTargetName,
      };

      console.log("업데이트된 userData:", updatedUserData);
      setUserData(updatedUserData);

      setEditing({ ...editing, careerInfo: false });

      toast({
        title: "커리어정보 변경 완료",
        description: "커리어정보가 성공적으로 변경되었습니다.",
      });
    } catch (err) {
      console.error("커리어정보 업데이트 중 오류 발생:", err);
      console.error("오류 상세 정보:", err.response?.data);

      toast({
        variant: "destructive",
        title: "업데이트 실패",
        description:
          err.message || "커리어정보를 업데이트하는 데 문제가 발생했습니다.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 비밀번호 수정 저장 핸들러
  const PasswordSave = async () => {
    try {
      // 비밀번호 일치 확인
      if (newPassword !== confirmPassword) {
        toast({
          variant: "destructive",
          title: "비밀번호 불일치",
          description: "새 비밀번호와 확인 비밀번호가 일치하지 않습니다.",
        });
        return;
      }

      // 비밀번호 업데이트 요청
      await axiosInstance.patch(
        "/myPage/auth/security/change/password",
        {
          originalPw: currentPassword,
          userPw: newPassword,
          userPwConfirm: confirmPassword,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          timeout: 5000, // 5초 타임아웃 설정
        }
      );

      // 성공 메시지
      toast({
        title: "비밀번호가 업데이트되었습니다",
        description: "성공적으로 비밀번호가 변경되었습니다.",
      });

      // 입력 필드 초기화
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");

      // 편집 모드 종료
      setEditing({ ...editing, password: false });
    } catch (err) {
      console.error("비밀번호 업데이트 중 오류 발생:", err);

      // 오류 메시지 처리
      const errorMessage =
        err.response?.data?.message ||
        "비밀번호를 업데이트하는 데 문제가 발생했습니다.";

      toast({
        variant: "destructive",
        title: "업데이트 실패",
        description: errorMessage,
      });
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

  // 직업명 가져오기
  const getJobName = (jobIdx) => {
    // 카테고리가 로딩 중이고 userData에 userJob가 있는 경우 기존 데이터 표시
    if (!jobCategories.length && userData.userJob) {
      return userData.userJobName || userData.userJob;
    }

    if (!jobIdx) return "직업을 선택하세요";

    const job = jobCategories.find(
      (job) => job.jobIdx.toString() === jobIdx.toString()
    );
    return job ? job.jobName : userData.userJobName || "직업을 선택하세요";
  };

  // 목표명 가져오기
  const getTargetName = (targetIdx) => {
    // 카테고리가 로딩 중이고 userData에 targetIdx가 있는 경우 기존 데이터 표시
    if (!targetCategories.length && userData.targetIdx) {
      return userData.targetName || `목표 ${userData.targetIdx}`;
    }

    if (!targetIdx) return "목표를 선택하세요";

    const target = targetCategories.find(
      (target) => target.targetIdx.toString() === targetIdx.toString()
    );
    return target
      ? target.targetName
      : userData.targetName || "목표를 선택하세요";
  };

  return (
    <div className="rounded-2xl shadow-md bg-white overflow-hidden">
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-white">
        <h1 className="text-xl font-bold">내프로필</h1>
      </div>

      <div className="p-6">
        <div className="space-y-6">
          <div>
            {/* 가입일 필드 (수정 불가) */}
            <div className="flex items-center p-4">
              <Calendar className="text-indigo-500 mr-3" size={20} />
              <div>
                <div className="text-sm text-gray-500">가입일</div>
                <div className="font-medium">{userData.userJoin}</div>
              </div>
            </div>

            <div className="border-t border-gray-200 mx-4"></div>
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
                        onClick={() => NickNameSave("userNick")}
                        className="text-green-500 flex items-center"
                      >
                        <Save size={16} className="mr-1" />
                        <span className="text-sm">저장하기</span>
                      </button>
                      <button
                        onClick={() => handleCancel("userNick")}
                        className="text-red-500 flex items-center"
                      >
                        <X size={16} className="mr-1" />
                        <span className="text-sm">취소하기</span>
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
                      className="text-indigo-500 hover:text-indigo-700 flex items-center"
                    >
                      <Edit size={16} className="mr-1" />
                      <span className="text-sm">수정하기</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 mx-4" />

            {/* 개인정보 섹션 (이름, 성별, 전화번호) - 한번에 수정 */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-gray-700">개인정보</div>
                {!editing.personalInfo && (
                  <button
                    onClick={() => handleEdit("personalInfo")}
                    className="text-indigo-500 hover:text-indigo-700 flex items-center"
                  >
                    <Edit size={16} className="mr-1" />
                    <span className="text-sm">수정하기</span>
                  </button>
                )}
              </div>

              {editing.personalInfo ? (
                <>
                  {/* 이름 필드 */}
                  <div className="flex items-center py-2">
                    <User className="text-indigo-500 mr-3" size={20} />
                    <div className="flex-1">
                      <div className="text-sm text-gray-500">이름</div>
                      <div className="flex items-center">
                        <input
                          type="text"
                          className="border-b border-indigo-300 bg-transparent mr-2 focus:outline-none"
                          value={tempData.userName}
                          onChange={(e) =>
                            handleChange("userName", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  {/* 성별 필드 */}
                  <div className="flex items-center py-2">
                    <UserCheck className="text-indigo-500 mr-3" size={20} />
                    <div className="flex-1">
                      <div className="text-sm text-gray-500">성별</div>
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
                          <option value="선택 안함">선택 안함</option>
                        </select>
                      </div>
                    </div>
                  </div>

                  {/* 전화번호 필드 */}
                  <div className="flex items-center py-2">
                    <Phone className="text-indigo-500 mr-3" size={20} />
                    <div className="flex-1">
                      <div className="text-sm text-gray-500">전화번호</div>
                      <div className="flex items-center">
                        <input
                          type="tel"
                          className="border-b border-indigo-300 bg-transparent mr-2 focus:outline-none"
                          value={tempData.userPhone}
                          onChange={(e) =>
                            handleChange("userPhone", e.target.value)
                          }
                        />
                      </div>
                    </div>
                  </div>

                  <div className="flex justify-end space-x-1 mt-2">
                    <button
                      onClick={() => PersonalInfoSave("personalInfo")}
                      className="text-green-500 flex items-center"
                      disabled={isSubmitting}
                    >
                      <Save size={16} className="mr-1" />
                      <span className="text-sm">저장하기</span>
                    </button>
                    <button
                      onClick={() => handleCancel("personalInfo")}
                      className="text-red-500 flex items-center"
                      disabled={isSubmitting}
                    >
                      <X size={16} className="mr-1" />
                      <span className="text-sm">취소하기</span>
                    </button>
                  </div>
                </>
              ) : (
                <>
                  {/* 이름 필드 */}
                  <div className="flex items-center py-2">
                    <User className="text-indigo-500 mr-3" size={20} />
                    <div className="flex-1">
                      <div className="text-sm text-gray-500">이름</div>
                      <div className="font-medium">{userData.userName}</div>
                    </div>
                  </div>

                  {/* 성별 필드 */}
                  <div className="flex items-center py-2">
                    <UserCheck className="text-indigo-500 mr-3" size={20} />
                    <div className="flex-1">
                      <div className="text-sm text-gray-500">성별</div>
                      <div className="font-medium">{userData.userGender}</div>
                    </div>
                  </div>

                  {/* 전화번호 필드 */}
                  <div className="flex items-center py-2">
                    <Phone className="text-indigo-500 mr-3" size={20} />
                    <div className="flex-1">
                      <div className="text-sm text-gray-500">전화번호</div>
                      <div className="font-medium">{userData.userPhone}</div>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="border-t border-gray-200 mx-4" />

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

                    {emailVerificationSent && !emailVerified && (
                      <div className="flex items-center mt-2">
                        <input
                          type="text"
                          placeholder="인증번호 6자리 입력"
                          className="border-b border-indigo-300 bg-transparent mr-2 focus:outline-none flex-1"
                          value={inputVerificationCode}
                          onChange={(e) =>
                            setInputVerificationCode(e.target.value)
                          }
                        />
                        <button
                          onClick={handleVerifyCode}
                          className="px-2 py-1 text-xs rounded bg-indigo-500 text-white hover:bg-indigo-600 mr-1"
                        >
                          <span className="flex items-center">확인</span>
                        </button>
                        <button
                          onClick={() => handleCancel("userEmail")}
                          className="px-2 py-1 text-xs rounded bg-gray-500 text-white hover:bg-gray-600"
                        >
                          <span className="flex items-center">취소</span>
                        </button>
                      </div>
                    )}

                    {emailVerified && (
                      <div className="flex items-center mt-2">
                        <span className="text-green-500 flex items-center">
                          <Check size={12} className="mr-1" />
                          인증완료
                        </span>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{userData.userEmail}</span>
                    <button
                      onClick={() => handleEdit("userEmail")}
                      className="text-indigo-500 hover:text-indigo-700 flex items-center"
                    >
                      <Edit size={16} className="mr-1" />
                      <span className="text-sm">수정하기</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="border-t border-gray-200 mx-4" />

            {/* 커리어 정보 섹션 (직업, 목표) - 한번에 수정 */}
            <div className="p-4">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-gray-700">커리어 정보</div>
                {!editing.careerInfo && (
                  <button
                    onClick={() => handleEdit("careerInfo")}
                    className="text-indigo-500 hover:text-indigo-700 flex items-center"
                  >
                    <Edit size={16} className="mr-1" />
                    <span className="text-sm">수정하기</span>
                  </button>
                )}
              </div>

              {/* 직업 필드 */}
              <div className="flex items-center py-2">
                <Briefcase className="text-indigo-500 mr-3" size={20} />
                <div className="flex-1">
                  <div className="text-sm text-gray-500">직업</div>
                  {editing.careerInfo ? (
                    <div className="flex items-center">
                      <select
                        className="border-b border-indigo-300 bg-transparent mr-2 focus:outline-none"
                        value={tempData.userJob || ""}
                        onChange={(e) =>
                          handleChange("userJob", e.target.value)
                        }
                      >
                        {jobCategories.map((category) => (
                          <option key={category.jobIdx} value={category.jobIdx}>
                            {category.jobName}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="font-medium">
                      {getJobName(userData.userJob)}
                    </div>
                  )}
                </div>
              </div>

              {/* 목표 필드 (targetIdx) */}
              <div className="flex items-center py-2">
                <Target className="text-indigo-500 mr-3" size={20} />
                <div className="flex-1">
                  <div className="text-sm text-gray-500">목표</div>
                  {editing.careerInfo ? (
                    <div className="flex items-center">
                      <select
                        className="border-b border-indigo-300 bg-transparent mr-2 focus:outline-none"
                        value={tempData.targetIdx || ""}
                        onChange={(e) =>
                          handleChange("targetIdx", e.target.value)
                        }
                      >
                        {targetCategories.map((category) => (
                          <option
                            key={category.targetIdx}
                            value={category.targetIdx}
                          >
                            {category.targetName}
                          </option>
                        ))}
                      </select>
                    </div>
                  ) : (
                    <div className="font-medium">
                      {getTargetName(userData.targetIdx)}
                    </div>
                  )}
                </div>
              </div>

              {/* 수정 버튼 그룹 */}
              {editing.careerInfo && (
                <div className="flex justify-end space-x-1 mt-2">
                  <button
                    onClick={() => CareerlInfoSave("careerInfo")}
                    className="text-green-500 flex items-center"
                  >
                    <Save size={16} className="mr-1" />
                    <span className="text-sm">저장하기</span>
                  </button>
                  <button
                    onClick={() => handleCancel("careerInfo")}
                    className="text-red-500 flex items-center"
                  >
                    <X size={16} className="mr-1" />
                    <span className="text-sm">취소하기</span>
                  </button>
                </div>
              )}
            </div>

            <div className="border-t border-gray-200 mx-4" />

            {/* 비밀번호 필드 */}
            <div className="flex items-center p-4">
              <Lock className="text-indigo-500 mr-3" size={20} />
              <div className="flex-1">
                <div className="text-sm text-gray-500">비밀번호</div>
                {editing.password ? (
                  <div className="space-y-3">
                    {/* 현재 비밀번호 */}
                    <div className="flex items-center">
                      <div className="relative flex-1">
                        <input
                          type={showPassword ? "text" : "password"}
                          placeholder="현재 비밀번호"
                          className="w-full border-b border-indigo-300 bg-transparent focus:outline-none pr-8"
                          value={currentPassword}
                          onChange={(e) => setCurrentPassword(e.target.value)}
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
                    </div>

                    {/* 새 비밀번호 */}
                    <div className="flex items-center">
                      <div className="relative flex-1">
                        <input
                          type={showNewPassword ? "text" : "password"}
                          placeholder="새 비밀번호"
                          className="w-full border-b border-indigo-300 bg-transparent focus:outline-none pr-8"
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                        />
                        <button
                          onClick={() => setShowNewPassword(!showNewPassword)}
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500"
                          type="button"
                        >
                          {showNewPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* 새 비밀번호 확인 */}
                    <div className="flex items-center">
                      <div className="relative flex-1">
                        <input
                          type={showConfirmPassword ? "text" : "password"}
                          placeholder="새 비밀번호 확인"
                          className="w-full border-b border-indigo-300 bg-transparent focus:outline-none pr-8"
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                        <button
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-0 top-1/2 -translate-y-1/2 text-gray-500"
                          type="button"
                        >
                          {showConfirmPassword ? (
                            <EyeOff size={16} />
                          ) : (
                            <Eye size={16} />
                          )}
                        </button>
                      </div>
                    </div>

                    <div className="flex justify-end space-x-1 mt-2">
                      <button
                        onClick={PasswordSave}
                        className="text-green-500 flex items-center"
                      >
                        <Save size={16} className="mr-1" />
                        <span className="text-sm">저장하기</span>
                      </button>
                      <button
                        onClick={() => handleCancel("password")}
                        className="text-red-500 flex items-center"
                      >
                        <X size={16} className="mr-1" />
                        <span className="text-sm">취소하기</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{maskPassword()}</span>
                    <button
                      onClick={() => handleEdit("password")}
                      className="text-indigo-500 hover:text-indigo-700 flex items-center"
                    >
                      <Edit size={16} className="mr-1" />
                      <span className="text-sm">수정하기</span>
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
              className="text-sm text-red-500 hover:text-red-700"
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
