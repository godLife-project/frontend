import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { formSchema } from "./schema";
import TitleSection from "./TitleSection";
import BadgeSelector from "@/components/common/BadgeSelector";
// 나중에 추가할 섹션들
// import TargetSection from "./TargetSection";
// import JobSection from "./JobSection";
// import ActivitiesSection from "./ActivitiesSection";

export default function RoutineForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planTitle: "",
      userIdx: null, // 현재 로그인한 사용자 ID
      endTo: 14, // 기본값
      targetIdx: null, // 기본값
      isShared: 1, // 기본값
      planImp: null, // 기본값
      jobIdx: null, // 기본값
      activities: [] // 활동 목록 (빈 배열로 시작)
    }
  });

  // 컴포넌트 마운트 시 기본 직업 설정
  useEffect(() => {
    form.setValue('jobIdx', 1); // "사무직"을 기본값으로 설정
  }, []);

  function onSubmit(values) {
    console.log(values);
    // API 호출 로직
    fetch('http://localhost:9090/api/plan/write', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('accessToken')}` // 토큰은 로컬 스토리지에서 가져옴
      },
      body: JSON.stringify(values)
    })
    .then(response => response.json())
    .then(data => {
      console.log('Success:', data);
      // 성공 처리 (예: 리다이렉트 또는 메시지 표시)
    })
    .catch((error) => {
      console.error('Error:', error);
      // 오류 처리
    });
  }

  // 직업 옵션 (API에서 받아올 수 있음)
const jobOptions = [
  { value: 1, label: "사무직", icon: "💼" },
  { value: 2, label: "학생", icon: "🎓" },
  { value: 3, label: "자영업", icon: "🏪" },
  { value: 4, label: "프리랜서", icon: "💻" },
  { value: 5, label: "교직/공무원", icon: "📚" },
  { value: 6, label: "의료직", icon: "⚕️" },
  { value: 7, label: "서비스직", icon: "🍽️" },
  { value: 8, label: "기술직", icon: "🔧" },
  { value: 9, label: "예술/디자인", icon: "🎨" },
  { value: 10, label: "IT/개발", icon: "🖥️" }
];

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <TitleSection control={form.control} />
        <BadgeSelector 
          control={form.control} 
          name="jobIdx" 
          label="추천 직업" 
          options={jobOptions}
        />
        {/* 나중에 추가할 섹션들 */}
        {/* <TargetSection control={form.control} /> */}
        {/* <JobSection control={form.control} /> */}
        {/* <ActivitiesSection control={form.control} form={form} /> */}
        <Button type="submit" className="w-full">루틴 생성하기</Button>
      </form>
    </Form>
  );
}