import { useState, useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";
import { Input } from "@/components/ui/input";
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
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

  // 이메일 인증 관련 상태
  const [verificationCode, setVerificationCode] = useState("");
  const [inputVerificationCode, setInputVerificationCode] = useState("");
  const [emailVerificationSent, setEmailVerificationSent] = useState(false);
  const [emailVerified, setEmailVerified] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);

  // 카테고리 상태 관리
  const [jobCategories, setJobCategories] = useState([]);
  const [targetCategories, setTargetCategories] = useState([]);

  // 닉네임 수정 관련 상태
  const [showNickModal, setShowNickModal] = useState(false);
  const [tempNickname, setTempNickname] = useState("");
  const [isUpdatingNick, setIsUpdatingNick] = useState(false);

  const accessToken = localStorage.getItem("accessToken");
  const { toast } = useToast();

  //개인정보(이름,전화번호,성별) 상태 관리
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 개인정보 상태 관리
  const [showPersonalModal, setShowPersonalModal] = useState(false);
  const [tempPersonalData, setTempPersonalData] = useState({
    userName: userData.userName || "",
    userGender: userData.userGender || "",
    userPhone: userData.userPhone || "",
  });
  const [isUpdatingPersonal, setIsUpdatingPersonal] = useState(false);

  // 커리어 상태 관리
  const [showCareerModal, setShowCareerModal] = useState(false);
  const [tempCareerData, setTempCareerData] = useState({
    userJob: userData.userJob || "",
    targetIdx: userData.targetIdx || "",
  });
  const [isUpdatingCareer, setIsUpdatingCareer] = useState(false);

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
    } else if (field === "personalInfo") {
      // 개인정보 모달 열기
      setTempPersonalData({
        userName: userData.userName,
        userGender: userData.userGender,
        userPhone: userData.userPhone,
      });
      setShowPersonalModal(true);
    } else if (field === "careerInfo") {
      // 커리어 정보 모달 열기
      setTempCareerData({
        userJob: userData.userJob,
        targetIdx: userData.targetIdx,
      });
      setShowCareerModal(true);
    } else if (field === "userNick") {
      // 닉네임 수정을 위한 모달 열기 (AlertDialog 사용)
      setTempNickname(userData.userNick);
      setShowNickModal(true);
    } else {
      // 다른 필드들은 일반적인 방식으로 처리
      setTempData({ ...userData });
    }

    // 편집 상태 활성화 (닉네임은 모달로 변경했으므로 제외)
    if (field !== "userNick") {
      setEditing({ ...editing, [field]: true });
    }
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
  const handleSendVerification = async () => {
    try {
      // API 호출하여 인증코드 발송
      await axiosInstance.post(
        "/verify/emails/send/verification-requests",
        {
          userEmail: tempData.userEmail,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 5000, // 5초 타임아웃 설정
        }
      );

      setEmailVerificationSent(true);
      toast({
        title: "인증번호 전송 완료",
        description:
          "이메일로 인증번호가 발송되었습니다. 메일함을 확인해주세요.",
      });
    } catch (err) {
      console.error("이메일 인증번호 발송 중 오류 발생:", err);
      toast({
        variant: "destructive",
        title: "인증번호 발송 실패",
        description:
          err.response?.data?.message ||
          "인증번호를 발송하는 데 문제가 발생했습니다.",
      });
    }
  };

  // 이메일 인증번호 확인 핸들러
  const handleVerifyCode = async () => {
    if (!inputVerificationCode) {
      alert("인증번호를 입력해주세요.");
      return;
    }

    setIsVerifying(true);

    try {
      // API 호출하여 인증코드 검증
      await axiosInstance.post(
        `/verify/emails/verifications?code=${inputVerificationCode}`,
        {
          userEmail: tempData.userEmail,
        },
        {
          headers: {
            "Content-Type": "application/json",
          },
          timeout: 5000, // 5초 타임아웃 설정
        }
      );

      setEmailVerified(true);
      toast({
        title: "이메일 인증 완료",
        description:
          "이메일 인증이 성공적으로 완료되었습니다. 변경하기 버튼을 눌러 이메일을 변경하세요.",
      });

      // 인증코드 입력필드 초기화
      setInputVerificationCode("");
    } catch (err) {
      console.error("이메일 인증코드 확인 중 오류 발생:", err);
      toast({
        variant: "destructive",
        title: "인증코드 확인 실패",
        description:
          err.response?.data?.message || "인증번호가 일치하지 않습니다.",
      });
    } finally {
      setIsVerifying(false);
    }
  };

  // 이메일 수정 저장 핸들러
  const handleEmailUpdate = async () => {
    if (!emailVerified) {
      toast({
        variant: "destructive",
        title: "이메일 인증 필요",
        description: "이메일 변경을 위해 먼저 인증을 완료해주세요.",
      });
      return;
    }

    try {
      // 이메일 수정 API 호출
      await axiosInstance.patch(
        "/myPage/auth/myAccount/modify/email",
        {
          userEmail: tempData.userEmail,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          timeout: 5000, // 5초 타임아웃 설정
        }
      );

      // 이메일 업데이트 성공 시 상태 업데이트
      setUserData({ ...userData, userEmail: tempData.userEmail });
      setEditing({ ...editing, userEmail: false });

      toast({
        title: "이메일 변경 완료",
        description: "이메일이 성공적으로 변경되었습니다.",
      });

      // 인증 상태 초기화
      setEmailVerificationSent(false);
      setEmailVerified(false);
    } catch (err) {
      console.error("이메일 업데이트 중 오류 발생:", err);
      toast({
        variant: "destructive",
        title: "이메일 변경 실패",
        description:
          err.response?.data?.message ||
          "이메일을 변경하는 데 문제가 발생했습니다.",
      });
    }
  };

  // 닉네임 수정 저장 핸들러 (AlertDialog와 함께 사용)
  const handleNickNameSave = async () => {
    setIsUpdatingNick(true);
    try {
      // 닉네임 업데이트 요청
      await axiosInstance.patch(
        "/myPage/auth/myAccount/modify/nickName",
        { userNick: tempNickname },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
          timeout: 5000, // 5초 타임아웃 설정
        }
      );

      // 업데이트 성공 시 상태 업데이트
      setUserData({ ...userData, userNick: tempNickname });
      setShowNickModal(false);

      toast({
        title: "닉네임 변경 완료",
        description: "닉네임이 성공적으로 변경되었습니다.",
      });

      // 로컬 스토리지 업데이트
      const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
      userInfo.userNick = tempNickname;
      localStorage.setItem("userInfo", JSON.stringify(userInfo));
    } catch (err) {
      console.error("닉네임 업데이트 중 오류 발생:", err);
      toast({
        variant: "destructive",
        title: "닉네임 변경 실패",
        description:
          err.response?.data?.message ||
          "닉네임을 변경하는 데 문제가 발생했습니다.",
      });
    } finally {
      setIsUpdatingNick(false);
    }
  };

  // 개인정보(이름, 성별, 전화번호) 저장 핸들러
  const handlePersonalSave = async () => {
    setIsUpdatingPersonal(true);
    try {
      // 개인정보(이름, 성별, 전화번호) 변경 API 호출
      await axiosInstance.patch(
        "/myPage/auth/myAccount/modify/personal",
        {
          userName: tempPersonalData.userName,
          userGender: getGenderCode(tempPersonalData.userGender),
          userPhone: tempPersonalData.userPhone,
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
        userName: tempPersonalData.userName,
        userGender: tempPersonalData.userGender,
        userPhone: tempPersonalData.userPhone,
      });

      setShowPersonalModal(false);

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
      setIsUpdatingPersonal(false);
    }
  };

  // 커리어저장(직업,목표) 저장 핸들러
  const handleCareerSave = async () => {
    setIsUpdatingCareer(true);
    try {
      console.log("커리어 정보 저장 시작, tempCareerData:", tempCareerData);

      // 변경된 필드만 업데이트하고, 변경되지 않은 필드는 기존 값 유지
      const jobIdxValue = Number(tempCareerData.userJob || userData.userJob);
      const targetIdxValue = Number(
        tempCareerData.targetIdx || userData.targetIdx
      );

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

      setShowCareerModal(false);

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
      setIsUpdatingCareer(false);
    }
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
      {/* <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-5 py-3 text-white">
        <h1 className="text-xl font-bold">내프로필</h1>
      </div> */}

      <div className="p-3">
        <div className="space-y-6">
          <div>
            {/* 가입일 필드 (수정 불가) */}
            <div className="flex items-center p-4">
              <Calendar className="text-indigo-500 mr-3" size={20} />
              <div>
                <div className="text-sm text-left text-gray-500">가입일</div>
                <div className="font-medium">{userData.userJoin}</div>
              </div>
            </div>

            <div className="border-t border-gray-200 mx-4"></div>
            {/* 닉네임 필드 - AlertDialog 사용 */}
            <div className="flex items-center p-4">
              <User className="text-indigo-500 mr-3" size={20} />
              <div className="flex-1">
                <div className="text-sm text-left  text-gray-500">닉네임</div>
                <div className="flex items-center justify-between">
                  <div>
                    <span className="font-medium">{userData.userNick}</span>
                    <span className="ml-1 text-gray-500 text-sm">
                      {userData.nickTag}
                    </span>
                  </div>

                  {/* AlertDialog 컴포넌트로 변경 */}
                  <AlertDialog
                    open={showNickModal}
                    onOpenChange={setShowNickModal}
                  >
                    <AlertDialogTrigger asChild>
                      <button
                        onClick={() => handleEdit("userNick")}
                        className="text-indigo-500 hover:text-indigo-700 flex items-center"
                      >
                        <Edit size={16} className="mr-1" />
                        <span className="text-sm">수정하기</span>
                      </button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>닉네임 변경</AlertDialogTitle>
                        <AlertDialogDescription>
                          변경할 닉네임을 입력해주세요.
                        </AlertDialogDescription>
                      </AlertDialogHeader>

                      <div className="py-4">
                        <Input
                          type="text"
                          placeholder="새 닉네임 입력"
                          value={tempNickname}
                          onChange={(e) => setTempNickname(e.target.value)}
                        />
                      </div>

                      <AlertDialogFooter>
                        <AlertDialogCancel disabled={isUpdatingNick}>
                          취소
                        </AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleNickNameSave}
                          disabled={isUpdatingNick}
                          className="bg-indigo-500 hover:bg-indigo-600"
                        >
                          {isUpdatingNick ? "처리 중..." : "변경하기"}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>

            <div className="border-t border-gray-200 mx-4" />

            {/* 개인정보 섹션 (이름, 성별, 전화번호) - 한번에 수정 */}
            <div className="p-4 text-left">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-gray-700">개인정보</div>
                <AlertDialog
                  open={showPersonalModal}
                  onOpenChange={setShowPersonalModal}
                >
                  <AlertDialogTrigger asChild>
                    <button
                      onClick={() => handleEdit("personalInfo")}
                      className="text-indigo-500 hover:text-indigo-700 flex items-center"
                    >
                      <Edit size={16} className="mr-1" />
                      <span className="text-sm">수정하기</span>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>개인정보 변경</AlertDialogTitle>
                      <AlertDialogDescription>
                        변경할 개인정보를 입력해주세요.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4 space-y-4">
                      {/* 이름 입력 */}
                      <div className="space-y-2">
                        <label className="text-sm text-left font-medium">
                          이름
                        </label>
                        <Input
                          type="text"
                          value={tempPersonalData.userName}
                          onChange={(e) =>
                            setTempPersonalData({
                              ...tempPersonalData,
                              userName: e.target.value,
                            })
                          }
                          className="w-full"
                        />
                      </div>

                      {/* 성별 선택 */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">성별</label>
                        <select
                          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={tempPersonalData.userGender}
                          onChange={(e) =>
                            setTempPersonalData({
                              ...tempPersonalData,
                              userGender: e.target.value,
                            })
                          }
                        >
                          <option value="남성">남성</option>
                          <option value="여성">여성</option>
                          <option value="선택 안함">선택 안함</option>
                        </select>
                      </div>

                      {/* 전화번호 입력 */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">전화번호</label>
                        <Input
                          type="tel"
                          value={tempPersonalData.userPhone}
                          onChange={(e) =>
                            setTempPersonalData({
                              ...tempPersonalData,
                              userPhone: e.target.value,
                            })
                          }
                          className="w-full"
                        />
                      </div>
                    </div>

                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isUpdatingPersonal}>
                        취소
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handlePersonalSave}
                        disabled={isUpdatingPersonal}
                        className="bg-indigo-500 hover:bg-indigo-600"
                      >
                        {isUpdatingPersonal ? "처리 중..." : "변경하기"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* 이름 필드 - 읽기 전용 표시 */}
              <div className="flex items-center py-2">
                <User className="text-indigo-500 mr-3" size={20} />
                <div className="flex-1">
                  <div className="text-sm text-gray-500">이름</div>
                  <div className="font-medium">{userData.userName}</div>
                </div>
              </div>

              {/* 성별 필드 - 읽기 전용 표시 */}
              <div className="flex items-center py-2">
                <UserCheck className="text-indigo-500 mr-3" size={20} />
                <div className="flex-1">
                  <div className="text-sm text-gray-500">성별</div>
                  <div className="font-medium">{userData.userGender}</div>
                </div>
              </div>

              {/* 전화번호 필드 - 읽기 전용 표시 */}
              <div className="flex items-center py-2">
                <Phone className="text-indigo-500 mr-3" size={20} />
                <div className="flex-1">
                  <div className="text-sm text-gray-500">전화번호</div>
                  <div className="font-medium">{userData.userPhone}</div>
                </div>
              </div>
            </div>
            <div className="border-t border-gray-200 mx-4" />

            {/* 이메일 필드 - 인증 기능 추가 */}
            <div className="flex items-center p-4">
              <Mail className="text-indigo-500 mr-3" size={20} />
              <div className="flex-1">
                <div className="text-sm text-left text-gray-500">이메일</div>
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
                          disabled={isVerifying}
                          className="px-2 py-1 text-xs rounded bg-indigo-500 text-white hover:bg-indigo-600 mr-1"
                        >
                          <span className="flex items-center">
                            {isVerifying ? "확인 중..." : "확인"}
                          </span>
                        </button>
                        <button
                          onClick={() => handleCancel("userEmail")}
                          disabled={isVerifying}
                          className="px-2 py-1 text-xs rounded bg-gray-500 text-white hover:bg-gray-600"
                        >
                          <span className="flex items-center">취소</span>
                        </button>
                      </div>
                    )}

                    {emailVerified && (
                      <div className="flex items-center mt-2">
                        <span className="text-green-500 flex items-center mr-2">
                          <Check size={12} className="mr-1" />
                          인증완료
                        </span>
                        <button
                          onClick={handleEmailUpdate}
                          className="px-2 py-1 text-xs rounded bg-green-500 mr-1"
                        >
                          <span className="flex items-center">
                            <Save size={16} className="mr-1" />
                            변경하기
                          </span>
                        </button>
                        <button
                          onClick={() => handleCancel("userEmail")}
                          className="px-2 py-1 text-xs rounded bg-gray-500"
                        >
                          <span className="flex items-center">취소</span>
                        </button>
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
            <div className="p-4 text-left">
              <div className="flex items-center justify-between mb-2">
                <div className="font-medium text-gray-700">커리어 정보</div>
                <AlertDialog
                  open={showCareerModal}
                  onOpenChange={setShowCareerModal}
                >
                  <AlertDialogTrigger asChild>
                    <button
                      onClick={() => handleEdit("careerInfo")}
                      className="text-indigo-500 hover:text-indigo-700 flex items-center"
                    >
                      <Edit size={16} className="mr-1" />
                      <span className="text-sm">수정하기</span>
                    </button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>커리어 정보 변경</AlertDialogTitle>
                      <AlertDialogDescription>
                        변경할 직업과 목표를 선택해주세요.
                      </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="py-4 space-y-4">
                      {/* 직업 선택 */}
                      <div className="space-y-2 ">
                        <label className="text-sm font-medium">직업</label>
                        <select
                          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={tempCareerData.userJob || ""}
                          onChange={(e) =>
                            setTempCareerData({
                              ...tempCareerData,
                              userJob: e.target.value,
                            })
                          }
                        >
                          {jobCategories.map((category) => (
                            <option
                              key={category.jobIdx}
                              value={category.jobIdx}
                            >
                              {category.jobName}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* 목표 선택 */}
                      <div className="space-y-2">
                        <label className="text-sm font-medium">목표</label>
                        <select
                          className="w-full p-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          value={tempCareerData.targetIdx || ""}
                          onChange={(e) =>
                            setTempCareerData({
                              ...tempCareerData,
                              targetIdx: e.target.value,
                            })
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
                    </div>

                    <AlertDialogFooter>
                      <AlertDialogCancel disabled={isUpdatingCareer}>
                        취소
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={handleCareerSave}
                        disabled={isUpdatingCareer}
                        className="bg-indigo-500 hover:bg-indigo-600"
                      >
                        {isUpdatingCareer ? "처리 중..." : "변경하기"}
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>

              {/* 직업 필드 - 읽기 전용 표시 */}
              <div className="flex items-center py-2">
                <Briefcase className="text-indigo-500 mr-3" size={20} />
                <div className="flex-1">
                  <div className="text-sm text-gray-500">직업</div>
                  <div className="font-medium">
                    {getJobName(userData.userJob)}
                  </div>
                </div>
              </div>

              {/* 목표 필드 - 읽기 전용 표시 */}
              <div className="flex items-center py-2">
                <Target className="text-indigo-500 mr-3" size={20} />
                <div className="flex-1">
                  <div className="text-sm text-gray-500">목표</div>
                  <div className="font-medium">
                    {getTargetName(userData.targetIdx)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
