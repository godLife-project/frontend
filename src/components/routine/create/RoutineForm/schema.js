import * as z from "zod";

export const formSchema = z.object({
  planTitle: z.string().min(1, "루틴 제목을 입력해주세요"),
  userIdx: z.number(),
  endTo: z.number(),
  targetIdx: z.number(),
  isShared: z.number(),
  planImp: z.number(),
  jobIdx: z.number(),
  activities: z.array(
    z.object({
      activityName: z.string().min(1, "활동 이름을 입력해주세요"),
      setTime: z.string().nullable(),
      description: z.string().optional(),
      activityImp: z.string()
    })
  )
});