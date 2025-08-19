// src/components/routine/RoutineForm/hooks/useFormSections.js
import { useState, useEffect, useMemo } from "react"; // useMemo 추가
import axiosInstance from "../../../../../api/axiosInstance";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import TitleSection from "../TitleSection";
import BadgeSelector from "@/components/common/badge-selector";
import DateInput from "@/components/common/dateInput/DateInput";
import StarRating from "@/components/common/starRating/StarRating";
import DaySelector from "@/components/common/daySelector/DaySelector";
import ActivitiesSection from "../activity/ActivitySection";
import ShareSetSection from "../ShareSetSection";

export default function useFormSections({
  form,
  isReadOnly,
  isActive,
  certifiedActivities,
  onCertifyActivity,
}) {
  const [jobs, setJobs] = useState([]);
  const [targets, setTargets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jobIcons, setJobIcons] = useState([]);

  // 로컬 스토리지에서 데이터 가져오기 함수
  const getDataFromLocalStorage = () => {
    try {
      const jobsFromStorage = JSON.parse(
        localStorage.getItem("jobCategories") || "[]"
      );
      const targetsFromStorage = JSON.parse(
        localStorage.getItem("targetCategories") || "[]"
      );
      const iconsFromStorage = JSON.parse(
        localStorage.getItem("jobIcons") || "[]"
      );

      // 유효한 데이터가 있으면 상태 업데이트
      if (jobsFromStorage.length > 0) setJobs(jobsFromStorage);
      if (targetsFromStorage.length > 0) setTargets(targetsFromStorage);
      if (iconsFromStorage.length > 0) setJobIcons(iconsFromStorage);

      // 모든 데이터가 있는지 확인
      return (
        jobsFromStorage.length > 0 &&
        targetsFromStorage.length > 0 &&
        iconsFromStorage.length > 0
      );
    } catch (error) {
      console.error("로컬 스토리지에서 데이터 가져오기 실패:", error);
      return false;
    }
  };

  // 카테고리 및 아이콘 데이터 가져오는 함수
  const fetchCategoryData = async () => {
    setIsLoading(true);
    try {
      // 로컬 스토리지에서 먼저 데이터 확인
      const hasLocalData = getDataFromLocalStorage();

      // 로컬 데이터가 없으면 API 호출
      if (!hasLocalData) {
        console.log("API에서 카테고리 데이터 가져오기");
        const [jobsResponse, targetsResponse, jobIconsResponse] =
          await Promise.all([
            axiosInstance.get("/categories/job"),
            axiosInstance.get("/categories/target"),
            axiosInstance.get("/categories/icon"),
          ]);

        // 상태 업데이트
        setJobs(jobsResponse.data);
        setTargets(targetsResponse.data);
        setJobIcons(jobIconsResponse.data);

        // 로컬 스토리지에 저장
        localStorage.setItem(
          "jobCategories",
          JSON.stringify(jobsResponse.data)
        );
        localStorage.setItem(
          "targetCategories",
          JSON.stringify(targetsResponse.data)
        );
        localStorage.setItem("jobIcons", JSON.stringify(jobIconsResponse.data));
      } else {
        console.log("로컬 스토리지에서 카테고리 데이터 가져옴");
      }
    } catch (error) {
      console.error("카테고리 데이터 로드 실패:", error);
      // 에러 발생 시 로컬 스토리지 데이터 사용 시도
      getDataFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  // 초기 데이터 로드
  useEffect(() => {
    fetchCategoryData();
  }, []);

  // isReadOnly가 변경될 때 아이콘 데이터 다시 로드하는 useEffect 추가
  useEffect(() => {
    if (!isReadOnly) {
      try {
        // localStorage에서 아이콘 데이터 가져오기
        const jobsFromStorage = JSON.parse(
          localStorage.getItem("jobCategories") || "[]"
        );
        const targetsFromStorage = JSON.parse(
          localStorage.getItem("targetCategories") || "[]"
        );
        const iconsFromStorage = JSON.parse(
          localStorage.getItem("jobIcons") || "[]"
        );

        // 데이터가 있으면 상태 업데이트
        if (jobsFromStorage.length > 0) setJobs(jobsFromStorage);
        if (targetsFromStorage.length > 0) setTargets(targetsFromStorage);
        if (iconsFromStorage.length > 0) setJobIcons(iconsFromStorage);

        console.log("수정 모드 전환: localStorage에서 아이콘 데이터 로드됨");
      } catch (error) {
        console.error("localStorage에서 데이터 로드 실패:", error);
      }
    }
  }, [isReadOnly]);

  const handleJobChange = useMemo(() => {
    return (jobIdx) => {
      // jobIdx가 999가 아닌 경우(일반 옵션 선택) jobEtcCateDTO를 null로 설정
      if (jobIdx !== 999) {
        form.setValue("jobEtcCateDTO", null);
      }
    };
  }, [form]);

  const handleCustomJobSelected = useMemo(() => {
    return (jobEtcData) => {
      if (jobEtcData) {
        // 직접 입력 시에는 jobIdx를 999로 설정
        form.setValue("jobIdx", 999);
        form.setValue("jobEtcCateDTO", jobEtcData);
      }
    };
  }, [form]);

  // 제목 섹션 컴포넌트
  const TitleSectionCard = useMemo(() => {
    return () => (
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
    );
  }, [form.control, isReadOnly]);

  // 직업 선택 섹션 컴포넌트
  const JobSectionCard = useMemo(() => {
    return () => {
      // 여기에 콘솔 로그 추가
      console.log("JobSectionCard 렌더링:", {
        isReadOnly,
        jobsLength: jobs.length,
        iconsLength: jobIcons.length,
        jobIconsData: jobIcons,
      });

      return (
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
                key={`job-selector-${isReadOnly}`}
              />
            )}
          </CardContent>
        </Card>
      );
    };
  }, [
    form.control,
    isReadOnly,
    jobs,
    jobIcons,
    isLoading,
    handleJobChange,
    handleCustomJobSelected,
  ]);

  // 루틴 지속 기간과 중요도 섹션
  const DurationAndImportanceSection = useMemo(() => {
    return () => (
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
    );
  }, [form.control, isReadOnly]);

  // 반복 요일 섹션
  const RepeatDaysCard = useMemo(() => {
    return () => (
      <Card className="bg-white">
        <CardHeader>
          <CardTitle>반복 요일</CardTitle>
          <CardDescription>
            {isReadOnly ? "루틴의 반복 요일" : "루틴의 반복 주기를 선택하세요"}
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
    );
  }, [form.control, isReadOnly]);

  // 관심사 선택 섹션
  const InterestSectionCard = useMemo(() => {
    return () => (
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
              allowCustomInput={false} // 직접 입력 기능 비활성화
              key={`interest-selector-${isReadOnly}`} // 읽기 모드 변경 시 컴포넌트 리렌더링
            />
          )}
        </CardContent>
      </Card>
    );
  }, [form.control, isReadOnly, targets, jobIcons, isLoading]);

  // 공유 설정 섹션
  const ShareSettingsCard = useMemo(() => {
    return () => (
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
    );
  }, [form.control]);

  // 활동 목록 섹션
  const ActivitiesSectionCard = useMemo(() => {
    return () => (
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
          <ActivitiesSection
            control={form.control}
            readOnly={isReadOnly}
            isActive={isActive}
            certifiedActivities={certifiedActivities}
            onCertifyActivity={onCertifyActivity}
          />
        </CardContent>
      </Card>
    );
  }, [
    form.control,
    isReadOnly,
    isActive,
    certifiedActivities,
    onCertifyActivity,
  ]);

  return {
    TitleSectionCard,
    JobSectionCard,
    DurationAndImportanceSection,
    RepeatDaysCard,
    InterestSectionCard,
    ShareSettingsCard,
    ActivitiesSectionCard,
  };
}
