// src/components/routine/create/RoutineForm/index.js
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
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
import { formSchema } from "./schema";
import TitleSection from "./TitleSection";
import BadgeSelector from "@/components/common/badge-selector";
import DateInput from "@/components/common/dateInput/DateInput";
import StarRating from "@/components/common/starRating/StarRating";
import DaySelector from "@/components/common/daySelector/DaySelector";
import ActivitiesSection from "./activity/ActivitySection";
import axiosInstance from '../../../../api/axiosInstance';
import ShareSetSection from "./ShareSetSection";

export default function RoutineForm() {
  const [jobs, setJobs] = useState([]);
  const [targets, setTargets] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [jobIcons, setJobIcons] = useState([]); // 직업용 아이콘 리스트
  const [targetIcons, setTargetIcons] = useState([]); // 관심사용 아이콘 리스트

  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planTitle: "",
      userIdx: null, // 현재 로그인한 사용자 ID
      endTo: 7, // 기본값
      targetIdx: null, // 기본값
      isShared: 0, // 기본값
      planImp: 5, // 기본값
      jobIdx: null, // 기본값
      jobEtcCateDTO: null, // 직접 입력 직업 정보
      activities: [], // 활동 목록 (빈 배열로 시작)
      repeatDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"],
    },
  });

  useEffect(() => {
    try {
      const userInfo = JSON.parse(localStorage.getItem('userInfo') || '{}');

      // userIdx 설정
      if (userInfo.userIdx) {
        form.setValue('userIdx', userInfo.userIdx);
      }

      // jobIdx 설정 (직업)
      if (userInfo.jobIdx) {
        form.setValue('jobIdx', userInfo.jobIdx);
      }
    } catch (e) {
      console.error("사용자 정보 로딩 실패:", e);
    }
  }, [form]);

  // 카테고리 및 아이콘 데이터 로드
  useEffect(() => {
    setIsLoading(true);
    // 여러 API 호출을 병렬로 처리
    Promise.all([
      axiosInstance.get("/categories/job"),
      axiosInstance.get("/categories/target"),
      axiosInstance.get("/categories/icon"),
      // axiosInstance.get("/categories/icon")
    ])
      .then(([jobsResponse, targetsResponse, jobIconsResponse, targetIconsResponse]) => {
        setJobs(jobsResponse.data);
        setTargets(targetsResponse.data);
        setJobIcons(jobIconsResponse.data);
        // setTargetIcons(targetIconsResponse.data);

        // 필요하다면 로컬 스토리지에 저장
        localStorage.setItem('jobCategories', JSON.stringify(jobsResponse.data));
        localStorage.setItem('targetCategories', JSON.stringify(targetsResponse.data));
        localStorage.setItem('jobIcons', JSON.stringify(jobIconsResponse.data));
        // localStorage.setItem('targetIcons', JSON.stringify(targetIconsResponse.data));
      })
      .catch(/* 오류 처리 */)
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  // 직업 변경 감지 핸들러
  const handleJobChange = (jobIdx) => {
    // jobIdx가 100이 아닌 경우(일반 옵션 선택) jobEtcCateDTO를 null로 설정
    if (jobIdx !== 100) {
      form.setValue('jobEtcCateDTO', null);
    }
  };

  // 직접 입력 직업 정보 처리 핸들러
  const handleCustomJobSelected = (jobEtcData) => {
    if (jobEtcData) {
      form.setValue('jobEtcCateDTO', jobEtcData);
    }
  };

  function onSubmit(values) {
    console.log("제출할 데이터:", values);
    
    // Authorization 헤더에 토큰 추가
    const token = localStorage.getItem("accessToken");
    
    // API 요청 데이터 준비 (기존 values에 필요한 추가 필드 병합)
    const requestData = {
      ...values,
      isActive: 0, // 기본적으로 생성된 루틴은 비활성화 상태로 설정
    };
    
    // jobIdx가 100이 아니고 jobEtcCateDTO가 설정된 경우 null로 변경
    if (requestData.jobIdx !== 100 && requestData.jobEtcCateDTO) {
      requestData.jobEtcCateDTO = null;
    }
    
    // API 요청 보내기
    axiosInstance.post("/plan/write", requestData, {
      headers: {
        Authorization: `Bearer ${token}`
      }
    })
      .then((response) => {
        console.log("루틴 생성 성공:", response.data);
        // 여기에 성공 처리 로직 추가
        // 예: 알림 표시
        alert("루틴이 성공적으로 생성되었습니다!");
        
        // 예: 다른 페이지로 이동
        // window.location.href = "/routines";
        // 또는 React Router 사용 시
        // navigate("/routines");
      })
      .catch((error) => {
        console.error("루틴 생성 실패:", error);
        // 오류 세부 정보 확인
        if (error.response) {
          // 서버가 응답을 반환했지만 2xx 범위가 아닌 경우
          console.error("응답 데이터:", error.response.data);
          console.error("응답 상태:", error.response.status);
          
          // 사용자에게 구체적인 오류 메시지 표시
          alert(`루틴 생성 실패: ${error.response.data.message || "알 수 없는 오류가 발생했습니다."}`);
        } else if (error.request) {
          // 요청은 보냈지만 응답을 받지 못한 경우
          console.error("요청 실패:", error.request);
          alert("서버에 연결할 수 없습니다. 네트워크 연결을 확인해주세요.");
        } else {
          // 요청 설정 중 오류가 발생한 경우
          console.error("오류 메시지:", error.message);
          alert("요청 중 오류가 발생했습니다.");
        }
      });
  }


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 제목 섹션을 카드로 감싸기 */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>
              루틴 제목
              <span className="text-red-500 ml-1">*</span>
            </CardTitle>
            <CardDescription>
              루틴에 적절한 제목을 입력해주세요.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TitleSection control={form.control} required={true} />
          </CardContent>
        </Card>

        {/* 직업 선택 섹션 */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>추천 직업</CardTitle>
            <CardDescription>
              루틴에 맞는 직업을 선택하면 다른 사람들이 루틴을 찾아보기 좋아요!
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
                availableIcons={jobIcons}  // 직업용 아이콘 리스트 전달
                maxVisible={10}
                onCustomJobSelected={handleCustomJobSelected}
                onChange={handleJobChange}
              />
            )}
          </CardContent>
        </Card>

        {/* 루틴 지속 기간과 중요도 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 루틴 지속 기간 섹션 */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>
                루틴 지속 기간(일)
                {/* <span className="text-red-500 ml-1">*</span> */}
              </CardTitle>
              <CardDescription>
                루틴을 지속할 기간을 설정해 주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <DateInput
                control={form.control}
                name="endTo"
                min={7}
                required={true}
              />
            </CardContent>
          </Card>

          {/* 루틴 중요도 섹션 */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>
                루틴 중요도
                {/* <span className="text-red-500 ml-1">*</span> */}
              </CardTitle>
              <CardDescription>루틴의 중요도를 선택하세요</CardDescription>
            </CardHeader>
            <CardContent>
              <StarRating
                control={form.control}
                name="planImp"
                maxRating={10}
                required={true}
              />
            </CardContent>
          </Card>
        </div>
        {/* 반복 요일 섹션 */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>
              반복 요일
              {/* <span className="text-red-500 ml-1">*</span> */}
            </CardTitle>
            <CardDescription>루틴의 반복 주기를 선택하세요</CardDescription>
          </CardHeader>
          <CardContent>
            <DaySelector
              control={form.control}
              name="repeatDays"
              required={true}
            />
          </CardContent>
        </Card>

        {/* 관심사 선택 섹션 */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>
              추천 관심사
              <span className="text-red-500 ml-1">*</span>
            </CardTitle>
            <CardDescription>루틴에 맞는 관심사를 선택해주세요</CardDescription>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-4 text-center">로딩 중...</div>
            ) : (
              <BadgeSelector
                control={form.control}
                name="targetIdx"
                options={targets}
                availableIcons={jobIcons}  // 관심사용 아이콘 리스트 전달
                maxVisible={10}
                required={true}
              />
            )}
          </CardContent>
        </Card>

        {/* 공유 설정 섹션 */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>
              공유설정
            </CardTitle>
            <CardDescription>
              다른 사용자에게 루틴을 공유하고 싶다면 switch on 해주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ShareSetSection control={form.control} />
          </CardContent>
        </Card>

        {/* 활동 목록 섹션 */}
        <Card className="bg-white">
          <CardHeader>
            <CardTitle>
              활동 목록
              <span className="text-red-500 ml-1">*</span>
            </CardTitle>
            <CardDescription>
              루틴에 포함할 활동들을 추가해주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ActivitiesSection control={form.control} />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full bg-blue-500">
          루틴 생성하기
        </Button>
      </form>
    </Form>
  );
}