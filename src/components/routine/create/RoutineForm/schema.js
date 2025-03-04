import * as z from "zod";

export const formSchema = z.object({
  planTitle: z.string().min(1, "루틴 제목을 입력해주세요"),
  userIdx: z.number().nullable(),
  endTo: z.number().min(7, "최소 7일 이상 설정해주세요"),
  targetIdx: z.number().nullable().refine(val => val !== null && val > 0, {
    message: "관심사를 선택해주세요.",
  }),
  isShared: z.number(),
  planImp: z.number().min(1, "중요도를 선택해주세요"),
  jobIdx: z.number().nullable(),
  // jobEtcCateDTO 필드 추가
  jobEtcCateDTO: z.object({
    name: z.string(),
    iconKey: z.string()
  }).nullable().optional(),
  repeatDays: z.array(z.string()),
  activities: z
    .array(
      z.object({
        activityName: z.string().min(1, "활동 이름을 입력해주세요"),
        setTime: z.string(),
        description: z.string(),
        activityImp: z.number().min(1).max(5).default(3),
      })
    )
    .min(1, "최소 1개 이상의 활동을 추가해주세요") 
    .default([]),
});