// src/components/routine/create/RoutineForm/index.js
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from "@/components/ui/card";
import { formSchema } from "./schema";
import TitleSection from "./TitleSection";
import BadgeSelector from "@/components/common/badge-selector";
import DateInput from "@/components/common/dateInput/DateInput";
import StarRating from "@/components/common/starRating/StarRating";
import DaySelector from "@/components/common/daySelector/DaySelector";
import ActivitiesSection from "./activity/ActivitySection";


export default function RoutineForm() {
  const form = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      planTitle: "",
      userIdx: null, // 현재 로그인한 사용자 ID
      endTo: 7, // 기본값
      targetIdx: null, // 기본값
      isShared: 1, // 기본값
      planImp: 5, // 기본값
      jobIdx: null, // 기본값
      activities: [], // 활동 목록 (빈 배열로 시작)
      repeatDays: ["mon", "tue", "wed", "thu", "fri", "sat", "sun"]
    }
  });

  // 컴포넌트 마운트 시 기본 직업 설정
  useEffect(() => {
    form.setValue('jobIdx', 1); // 추후 변경 필요요
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
    {
      "idx": 1,
      "name": "무직",
      "iconKey": "coffee" // Lucide에서 사용 가능
    },
    {
      "idx": 2,
      "name": "학생",
      "iconKey": "book" // Lucide 학생 아이콘
    },
    {
      "idx": 3,
      "name": "개발자",
      "iconKey": "code" // Lucide 코드 아이콘
    },
    {
      "idx": 4,
      "name": "디자이너",
      "iconKey": "pen-tool" // Lucide 디자인 도구 아이콘
    },
    {
      "idx": 5,
      "name": "크리에이터",
      "iconKey": "video" // Lucide 비디오 아이콘
    },
    {
      "idx": 6,
      "name": "연예인",
      "iconKey": "star" // Lucide 별 아이콘
    },
    {
      "idx": 7,
      "name": "가수",
      "iconKey": "mic" // Lucide 마이크 아이콘
    },
    {
      "idx": 8,
      "name": "엔지니어",
      "iconKey": "wrench" // Lucide 렌치 아이콘
    },
    {
      "idx": 9,
      "name": "공무원",
      "iconKey": "building" // Lucide 빌딩 아이콘
    },
    {
      "idx": 10,
      "name": "교사",
      "iconKey": "book-open" // Lucide 열린 책 아이콘
    },
    {
      "idx": 11,
      "name": "의사",
      "iconKey": "stethoscope" // Lucide 청진기 아이콘
    },
    {
      "idx": 12,
      "name": "변호사",
      "iconKey": "scale" // Lucide 저울 아이콘
    },
    {
      "idx": 13,
      "name": "경찰",
      "iconKey": "shield" // Lucide 방패 아이콘
    },
    {
      "idx": 14,
      "name": "간호사",
      "iconKey": "handHeart" // Lucide 심장박동 아이콘
    },
    {
      "idx": 15,
      "name": "자영업자",
      "iconKey": "store" // Lucide 상점 아이콘
    },
    {
      "idx": 16,
      "name": "요리사",
      "iconKey": "utensils" // Lucide 식기 아이콘
    },
    {
      "idx": 17,
      "name": "운동선수",
      "iconKey": "trophy" // Lucide 트로피 아이콘
    },
    {
      "idx": 18,
      "name": "기타",
      "iconKey": "more-horizontal" // Lucide 가로 점 세 개 아이콘
    }
  ];

  // 관심사 옵션 (API에서 받아올 수 있음)
  const targetOptions = [
    {
      "idx": 1,
      "name": "미라클 모닝",
      "iconKey": "sunrise"
    },
    {
      "idx": 2,
      "name": "꿀잠",
      "iconKey": "moon"
    },
    {
      "idx": 3,
      "name": "다이어트/체중 관리",
      "iconKey": "scale"
    },
    {
      "idx": 4,
      "name": "운동/피트니스",
      "iconKey": "dumbbell"
    },
    {
      "idx": 5,
      "name": "공부/자기개발",
      "iconKey": "book-open"
    },
    {
      "idx": 6,
      "name": "심신안정/명상",
      "iconKey": "flower2"
    },
    {
      "idx": 7,
      "name": "능률 향상",
      "iconKey": "line-chart"
    },
    {
      "idx": 8,
      "name": "창의력/취미",
      "iconKey": "palette"
    },
    {
      "idx": 9,
      "name": "자기 관리",
      "iconKey": "user-cog"
    },
    {
      "idx": 10,
      "name": "일반 계획",
      "iconKey": "calendar-days"
    }
  ]


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        {/* 제목 섹션을 카드로 감싸기 */}
        <Card>
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
        <Card>
          <CardHeader>
            <CardTitle>추천 직업</CardTitle>
            <CardDescription>
              루틴에 맞는 직업을 선택하면 다른 사람들이 루틴을 찾아보기 좋아요!
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BadgeSelector
              control={form.control}
              name="jobIdx"
              options={jobOptions}
              maxVisible={10}
            />
          </CardContent>
        </Card>

        {/* 루틴 지속 기간과 중요도 섹션 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* 루틴 지속 기간 섹션 */}
          <Card>
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
          <Card>
            <CardHeader>
              <CardTitle>
                루틴 중요도
                {/* <span className="text-red-500 ml-1">*</span> */}
              </CardTitle>
              <CardDescription>
                루틴의 중요도를 선택하세요
              </CardDescription>
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
        <Card>
          <CardHeader>
            <CardTitle>
              반복 요일
              {/* <span className="text-red-500 ml-1">*</span> */}
            </CardTitle>
            <CardDescription>
              루틴의 반복 주기를 선택하세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <DaySelector
              control={form.control}
              name="repeatDays"
              required={true}
            />
          </CardContent>
        </Card>

        {/* 관심사사 선택 섹션 */}
        <Card>
          <CardHeader>
            <CardTitle>
              추천 관심사
              <span className="text-red-500 ml-1">*</span>
            </CardTitle>
            <CardDescription>
              루틴에 맞는 관심사를 선택해주세요
            </CardDescription>
          </CardHeader>
          <CardContent>
            <BadgeSelector
              control={form.control}
              name="targetIdx"
              options={targetOptions}
              maxVisible={10}
            />
          </CardContent>
        </Card>

        {/* 활동 목록 섹션 */}
        <Card>
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
            <ActivitiesSection 
              control={form.control} 
            />
          </CardContent>
        </Card>

        <Button type="submit" className="w-full bg-blue-500">루틴 생성하기</Button>
      </form>
    </Form>
  );
}