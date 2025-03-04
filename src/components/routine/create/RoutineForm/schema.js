// src/components/routine/create/RoutineForm/schema.js
import * as z from "zod";

export const formSchema = z.object({
  planTitle: z.string().min(1, "루틴 제목을 입력해주세요"),
  userIdx: z.number().nullable(),
  endTo: z.number().min(7, "최소 7일 이상 설정해주세요"),
  targetIdx: z.number().nullable(),
  isShared: z.number(),
  planImp: z.number().min(1, "중요도를 선택해주세요"),
  jobIdx: z.number().nullable(),
  repeatDays: z.array(z.string()),
  activities: z
    .array(
      z.object({
        activityName: z.string().min(1, "활동 이름을 입력해주세요"),
        setTime: z.string(),
        description: z.string(),
        activityImp: z.number().min(1).max(5).default(3), // 중요도 필드 추가 (1-5 범위, 기본값 3)
      })
    )
    .default([]),
});
