// src/components/routine/RoutineForm/hooks/useFormSections.js
import { useState, useEffect } from "react";
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

  // 제목 섹션 컴포넌트
  const TitleSectionCard = () => (
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

  // 직업 선택 섹션 컴포넌트
  const JobSectionCard = () => (
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
  );

  // 루틴 지속 기간과 중요도 섹션
  const DurationAndImportanceSection = () => (
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

  // 반복 요일 섹션
  const RepeatDaysCard = () => (
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

  // 관심사 선택 섹션 - 직접 입력 옵션 제거
  const InterestSectionCard = () => (
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
          />
        )}
      </CardContent>
    </Card>
  );

  // 공유 설정 섹션
  const ShareSettingsCard = () => (
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

  // 활동 목록 섹션
  const ActivitiesSectionCard = () => (
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
