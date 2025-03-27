// src/components/routine/RoutineForm/index.js
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { formSchema } from "./schema";
import useFormSections from "./hooks/useFormSections";
import CreateRoutineDialog from "./dialogs/CreateRoutineDialog";
import axiosInstance from "../../../../api/axiosInstance";
// utils 함수 import
import { reissueToken } from "../../../../utils/routineUtils";

export default function RoutineForm({
  isReadOnly = false,
  routineData = null,
  isActive = false,
  certifiedActivities = {},
  onCertifyActivity = null,
  onSubmit = null,
  isEditMode = false, // 수정 모드 prop 추가
}) {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [formData, setFormData] = useState(null);
  const navigate = useNavigate();

  // 기본값 설정 - 읽기 전용 모드에서는 routineData 사용
  const defaultValues = routineData || {
    planTitle: "",
    userIdx: null,
    endTo: 7,
    targetIdx: null,
    isShared: 0,
    planImp: 5,
    jobIdx: null,
    jobEtcCateDTO: null,
    activities: [],
    repeatDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
  };

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues,
    mode: "onSubmit",
  });

  // 사용자 정보 로드 (읽기 전용 모드가 아닐 때만)
  // RoutineForm 컴포넌트 내의 useEffect 수정

  // 사용자 정보 로드 (읽기 전용 모드가 아닐 때만)
  // 사용자 정보 및 포크 데이터 로드
  useEffect(() => {
    if (!isReadOnly) {
      try {
        // 1. 세션스토리지에서 포크된 루틴 데이터 확인
        const forkData = sessionStorage.getItem("forkRoutineData");

        if (forkData) {
          // 포크 데이터가 있으면 파싱하여 폼 값 설정
          const parsedForkData = JSON.parse(forkData);
          console.log("포크된 루틴 데이터 불러옴:", parsedForkData);

          // 폼 값 설정
          form.reset(parsedForkData);

          // 개별 필드 설정 (필요한 경우)
          form.setValue("planTitle", parsedForkData.planTitle);
          form.setValue("endTo", parsedForkData.endTo);
          form.setValue("targetIdx", parsedForkData.targetIdx);
          form.setValue("isShared", parsedForkData.isShared);
          form.setValue("planImp", parsedForkData.planImp);
          form.setValue("jobIdx", parsedForkData.jobIdx);
          form.setValue("jobEtcCateDTO", parsedForkData.jobEtcCateDTO);
          form.setValue("activities", parsedForkData.activities);
          form.setValue("repeatDays", parsedForkData.repeatDays);

          // 사용자 정보는 덮어쓰지 않음 (포크된 데이터에 없을 수 있음)
          const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
          if (userInfo.userIdx) {
            form.setValue("userIdx", userInfo.userIdx);
          }

          // 사용 후 세션스토리지에서 데이터 삭제 (선택사항)
          sessionStorage.removeItem("forkRoutineData");
          return;
        }

        // 2. 포크된 데이터가 없고 수정 모드인 경우 루틴 데이터 사용
        if (routineData) {
          return; // 이미 defaultValues로 설정되어 있음
        }

        // 3. 새로운 루틴 생성 모드일 때 사용자 정보 적용
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        if (userInfo.userIdx) {
          form.setValue("userIdx", userInfo.userIdx);
        }
        if (userInfo.jobIdx) {
          form.setValue("jobIdx", userInfo.jobIdx);
        }
      } catch (e) {
        console.error("데이터 로딩 실패:", e);
      }
    }
  }, [form, isReadOnly, routineData]);

  // 폼 제출 핸들러
  async function handleFormSubmit(values) {
    if (isReadOnly) return;

    // 활동의 description이 null인 경우 빈 문자열로 변환
    const processedValues = {
      ...values,
      activities: values.activities.map((activity) => ({
        ...activity,
        description: activity.description || "", // null이면 빈 문자열로 변환
      })),
    };

    // 수정 모드일 경우 onSubmit 콜백 실행
    if (isEditMode && onSubmit) {
      console.log("수정 모드에서 폼 제출됨, 부모 onSubmit 호출");
      onSubmit(processedValues);
      return;
    }

    // 일반 생성 모드 로직
    console.log("생성 모드에서 폼 제출됨");
    setFormData(processedValues);
    setShowCreateDialog(true);
  }

  // 루틴 생성 함수 (모달에서 선택 시 호출)
  const handleCreateRoutine = async (startNow) => {
    setShowCreateDialog(false);

    if (!formData) return;

    const requestData = {
      ...formData,
      isActive: startNow ? 1 : 0, // 시작 여부에 따라 isActive 설정
    };

    // jobIdx가 999가 아니고 jobEtcCateDTO가 설정된 경우 null로 변경
    if (requestData.jobIdx !== 999 && requestData.jobEtcCateDTO) {
      requestData.jobEtcCateDTO = null;
    }

    let token = localStorage.getItem("accessToken");

    try {
      // 루틴 생성 API 호출 함수
      const createRoutine = async (authToken) => {
        try {
          const response = await axiosInstance.post(
            "/plan/auth/write",
            requestData,
            {
              headers: {
                Authorization: `Bearer ${authToken}`,
              },
            }
          );
          return response;
        } catch (error) {
          // 토큰 만료 오류 (401) 처리
          if (error.response && error.response.status === 401) {
            console.log("토큰이 만료되었습니다. 재발급을 시도합니다.");
            // 토큰 재발급 - utils의 함수 사용
            const newToken = await reissueToken(navigate);
            // 새 토큰으로 다시 요청
            return await axiosInstance.post("/plan/auth/write", requestData, {
              headers: {
                Authorization: `Bearer ${newToken}`,
              },
            });
          }
          // 다른 오류는 그대로 던지기
          throw error;
        }
      };

      // API 호출
      const response = await createRoutine(token);
      console.log("루틴 생성 성공:", response.data);

      // 성공 메시지
      alert(
        startNow
          ? "루틴이 성공적으로 생성되었고 지금부터 시작됩니다!"
          : "루틴이 성공적으로 생성되었습니다. 나중에 시작할 수 있습니다."
      );

      // 루틴 목록 페이지로 이동
      navigate("/routine/mylist");
    } catch (error) {
      console.error("루틴 생성 실패:", error);
      if (error.response) {
        console.error("응답 데이터:", error.response.data);
        console.error("응답 상태:", error.response.status);
        alert(
          `루틴 생성 실패: ${
            error.response.data.message || "알 수 없는 오류가 발생했습니다."
          }`
        );
      } else if (error.request) {
        console.error("요청 실패:", error.request);
        alert("서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.");
      } else {
        console.error("오류 메시지:", error.message);
        alert("요청 중 오류가 발생했습니다.");
      }
    }
  };

  // 폼 섹션들 가져오기
  const {
    TitleSectionCard,
    JobSectionCard,
    DurationAndImportanceSection,
    RepeatDaysCard,
    InterestSectionCard,
    ShareSettingsCard,
    ActivitiesSectionCard,
  } = useFormSections({
    form,
    isReadOnly,
    isActive,
    certifiedActivities,
    onCertifyActivity,
  });

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit)}
        className="space-y-6"
      >
        {/* 각 섹션 렌더링 */}
        <TitleSectionCard />
        <JobSectionCard />
        <DurationAndImportanceSection />
        <RepeatDaysCard />
        <InterestSectionCard />
        {!isReadOnly && <ShareSettingsCard />}
        <ActivitiesSectionCard />

        {/* 제출 버튼 (읽기 전용 모드가 아닐 때만) */}
        {!isReadOnly && (
          <Button type="submit" className="w-full bg-blue-500">
            {isEditMode ? "루틴 저장하기" : "루틴 생성하기"}
          </Button>
        )}
      </form>

      {/* 루틴 시작 확인 다이얼로그 - 수정 모드가 아닌 경우에만 표시 */}
      {!isEditMode && (
        <CreateRoutineDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onConfirm={handleCreateRoutine}
        />
      )}
    </Form>
  );
}
