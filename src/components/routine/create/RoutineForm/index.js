// src/components/routine/RoutineForm/index.js
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { formSchema } from "./schema";
import TitleSection from "./TitleSection";
import BadgeSelector from "@/components/common/badge-selector";
import DateInput from "@/components/common/dateInput/DateInput";
import StarRating from "@/components/common/starRating/StarRating";
import DaySelector from "@/components/common/daySelector/DaySelector";
import ActivitiesSection from "./activity/ActivitySection";
import axiosInstance from "../../../../api/axiosInstance";
import ShareSetSection from "./ShareSetSection";

// isReadOnly와 routineData 프롭스 추가
export default function RoutineForm({
  isReadOnly = false,
  routineData = null,
}) {
  const [jobs, setJobs] = useState([]);
  const [targets, setTargets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jobIcons, setJobIcons] = useState([]);
  const [targetIcons, setTargetIcons] = useState([]);
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [createdPlanIdx, setCreatedPlanIdx] = useState(null);
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

  // 토큰 재발급 함수
  const reissueToken = async () => {
    try {
      // 토큰 재발급 요청
      const response = await axiosInstance.post("/reissue", {});

      if (response.data && response.data.success) {
        // 새 토큰 저장
        const newAccessToken = response.data.accessToken;
        localStorage.setItem("accessToken", newAccessToken);

        console.log("토큰이 성공적으로 재발급되었습니다.");
        return newAccessToken;
      } else {
        throw new Error("토큰 재발급에 실패했습니다.");
      }
    } catch (error) {
      console.error("토큰 재발급 오류:", error);
      // 로그인 페이지로 리다이렉트하거나 다른 처리를 할 수 있음
      alert("세션이 만료되었습니다. 다시 로그인해주세요.");
      // 필요시 로그인 페이지로 리다이렉트
      // navigate("/login");
      throw error;
    }
  };

  // 사용자 정보 로드 (읽기 전용 모드가 아닐 때만)
  useEffect(() => {
    if (!isReadOnly) {
      try {
        const userInfo = JSON.parse(localStorage.getItem("userInfo") || "{}");
        if (userInfo.userIdx) {
          form.setValue("userIdx", userInfo.userIdx);
        }
        if (userInfo.jobIdx) {
          form.setValue("jobIdx", userInfo.jobIdx);
        }
      } catch (e) {
        console.error("사용자 정보 로딩 실패:", e);
      }
    }
  }, [form, isReadOnly]);

  // 카테고리 및 아이콘 데이터 로드
  useEffect(() => {
    const fetchCategories = async () => {
      setIsLoading(true);
      try {
        const [jobsResponse, targetsResponse, jobIconsResponse] =
          await Promise.all([
            axiosInstance.get("/categories/job"),
            axiosInstance.get("/categories/target"),
            axiosInstance.get("/categories/icon"),
          ]);

        setJobs(jobsResponse.data);
        setTargets(targetsResponse.data);
        setJobIcons(jobIconsResponse.data);

        localStorage.setItem(
          "jobCategories",
          JSON.stringify(jobsResponse.data)
        );
        localStorage.setItem(
          "targetCategories",
          JSON.stringify(targetsResponse.data)
        );
        localStorage.setItem("jobIcons", JSON.stringify(jobIconsResponse.data));
      } catch (error) {
        console.error("카테고리 데이터 로드 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, []);

  const handleJobChange = (jobIdx) => {
    // jobIdx가 999가 아닌 경우(일반 옵션 선택) jobEtcCateDTO를 null로 설정
    if (jobIdx !== 999) {
      form.setValue("jobEtcCateDTO", null);
    }
  };

  const handleCustomJobSelected = (jobEtcData) => {
    if (jobEtcData) {
      // 직접 입력 시에는 jobIdx를 999로 설정
      form.setValue("jobIdx", 999);
      form.setValue("jobEtcCateDTO", jobEtcData);
    }
  };

  async function onSubmit(values) {
    // 읽기 전용 모드에서는 제출 불가능
    if (isReadOnly) return;

    console.log("제출할 데이터:", values);

    // 폼 데이터 저장하고 모달 표시
    setFormData(values);
    setShowCreateDialog(true);

    // 여기서 API 호출은 하지 않음
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
            // 토큰 재발급
            const newToken = await reissueToken();
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
      navigate("/routines");
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

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 제목 섹션 */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>
              루틴 제목
              {!isReadOnly && <span className="text-red-500 ml-1">*</span>}
            </CardTitle>
            <CardDescription>
              {isReadOnly ? "루틴 제목" : "루틴에 적절한 제목을 입력해주세요."}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TitleSection
              control={form.control}
              required={!isReadOnly}
              readOnly={isReadOnly}
            />
          </CardContent>
        </Card>

        {/* 직업 선택 섹션 */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>추천 직업</CardTitle>
            <CardDescription>
              {isReadOnly
                ? "이 루틴의 추천 직업"
                : "루틴에 맞는 직업을 선택하면 다른 사람들이 루틴을 찾아보기 좋아요!"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-4 text-center">로딩 중...</div>
            ) : (
              <BadgeSelector
                control={form.control}
                name="jobIdx"
                options={jobs}
                availableIcons={jobIcons}
                maxVisible={10}
                onCustomJobSelected={handleCustomJobSelected}
                onChange={handleJobChange}
                readOnly={isReadOnly}
                customIdxValue={999} // 직접 입력 시 사용할 인덱스 값 지정
              />
            )}
          </CardContent>
        </Card>

        {/* 루틴 지속 기간과 중요도 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 루틴 지속 기간 섹션 */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>루틴 지속 기간(일)</CardTitle>
              <CardDescription>
                {isReadOnly
                  ? "루틴의 지속 기간"
                  : "루틴을 지속할 기간을 설정해 주세요."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DateInput
                control={form.control}
                name="endTo"
                min={7}
                required={!isReadOnly}
                readOnly={isReadOnly}
              />
            </CardContent>
          </Card>

          {/* 루틴 중요도 섹션 */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>루틴 중요도</CardTitle>
              <CardDescription>
                {isReadOnly ? "루틴의 중요도" : "루틴의 중요도를 선택하세요"}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <StarRating
                control={form.control}
                name="planImp"
                maxRating={10}
                required={!isReadOnly}
                readOnly={isReadOnly}
              />
            </CardContent>
          </Card>
        </div>

        {/* 반복 요일 섹션 */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>반복 요일</CardTitle>
            <CardDescription>
              {isReadOnly
                ? "루틴의 반복 요일"
                : "루틴의 반복 주기를 선택하세요"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DaySelector
              control={form.control}
              name="repeatDays"
              required={!isReadOnly}
              readOnly={isReadOnly}
            />
          </CardContent>
        </Card>

        {/* 관심사 선택 섹션 */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>
              추천 관심사
              {!isReadOnly && <span className="text-red-500 ml-1">*</span>}
            </CardTitle>
            <CardDescription>
              {isReadOnly
                ? "이 루틴의 추천 관심사"
                : "루틴에 맞는 관심사를 선택해주세요"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-4 text-center">로딩 중...</div>
            ) : (
              <BadgeSelector
                control={form.control}
                name="targetIdx"
                options={targets}
                availableIcons={jobIcons}
                maxVisible={10}
                required={true}
                readOnly={isReadOnly}
              />
            )}
          </CardContent>
        </Card>

        {/* 공유 설정 섹션 */}
        {!isReadOnly && (
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>공유설정</CardTitle>
              <CardDescription>
                다른 사용자에게 루틴을 공유하고 싶다면 switch on 해주세요
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ShareSetSection control={form.control} />
            </CardContent>
          </Card>
        )}

        {/* 활동 목록 섹션 */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>
              활동 목록
              {!isReadOnly && <span className="text-red-500 ml-1">*</span>}
            </CardTitle>
            <CardDescription>
              {isReadOnly
                ? "이 루틴에 포함된 활동들"
                : "루틴에 포함할 활동들을 추가해주세요"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivitiesSection control={form.control} readOnly={isReadOnly} />
          </CardContent>
        </Card>

        {/* 제출 버튼 (읽기 전용 모드가 아닐 때만) */}
        {!isReadOnly && (
          <Button type="submit" className="w-full bg-blue-500">
            루틴 생성하기
          </Button>
        )}
      </form>

      {/* 루틴 시작 확인 다이얼로그 */}
      {/* 루틴 시작 확인 다이얼로그 */}
      <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>루틴 생성</DialogTitle>
            <DialogDescription>
              루틴을 생성하고 바로 시작하시겠습니까?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex items-center justify-end space-x-2">
            <Button
              variant="outline"
              onClick={() => handleCreateRoutine(false)}
            >
              아니오, 나중에 시작할게요
            </Button>
            <Button onClick={() => handleCreateRoutine(true)}>
              예, 지금 시작합니다
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </Form>
  );
}
