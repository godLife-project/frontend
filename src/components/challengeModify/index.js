import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import * as z from "zod";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, useParams } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 유효성 검사 스키마
const challengeEditSchema = z.object({
  challIdx: z.number(),
  challTitle: z.string().min(1, "제목을 입력해주세요"),
  challDescription: z.string().min(1, "설명을 입력해주세요"),
  challCategoryIdx: z.string().min(1, "카테고리를 선택해주세요"),
  minParticipationTime: z.string().min(1, "최소 참여 시간을 입력해주세요"),
  maxParticipants: z.string().min(1, "최대 참여 인원을 입력해주세요"),
  challStartTime: z.string().optional(),
  challEndTime: z.string().optional(),
});

const ChallengeModifyForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { challIdx } = useParams(); // URL에서 챌린지 ID 가져오기

  const [challengeCategories, setChallengeCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleLength, setTitleLength] = useState(0);
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [challengeData, setChallengeData] = useState(null);

  useEffect(() => {
    // 챌린지 카테고리 가져오기
    const fetchChallengeCategories = async () => {
      try {
        const response = await axiosInstance.get(`/categories/challenge`);
        setChallengeCategories(response.data);
      } catch (error) {
        console.error("챌린지 카테고리 데이터 가져오기 실패:", error);
        toast({
          variant: "destructive",
          title: "카테고리 로딩 실패",
          description: "카테고리 정보를 불러오는데 실패했습니다.",
        });
      }
    };

    // 특정 챌린지 데이터 가져오기
    const fetchChallengeDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `/challenges/detail/${challIdx}`
        );
        setChallengeData(response.data);
      } catch (error) {
        console.error("챌린지 데이터 가져오기 실패:", error);
        toast({
          variant: "destructive",
          title: "챌린지 로딩 실패",
          description: "챌린지 정보를 불러오는데 실패했습니다.",
        });
        navigate("/challenge");
      }
    };

    fetchChallengeCategories();
    fetchChallengeDetails();
  }, [challIdx, navigate, toast]);

  const form = useForm({
    resolver: zodResolver(challengeEditSchema),
    mode: "onChange",
    defaultValues: challengeData
      ? {
          challIdx: challengeData.challIdx,
          challTitle: challengeData.challTitle,
          challDescription: challengeData.challDescription,
          challCategoryIdx: String(challengeData.challCategoryIdx),
          minParticipationTime: String(challengeData.minParticipationTime),
          maxParticipants: String(challengeData.maxParticipants),
          challStartTime: challengeData.challStartTime
            ? challengeData.challStartTime.split("T")[0]
            : undefined,
          challEndTime: challengeData.challEndTime
            ? challengeData.challEndTime.split("T")[0]
            : undefined,
        }
      : {},
  });

  // 폼 값 변경 시 길이 추적 핸들러
  const handleTitleChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue.length <= 50) {
      setTitleLength(inputValue.length);
    }
  };

  const handleDescriptionChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue.length <= 500) {
      setDescriptionLength(inputValue.length);
    }
  };

  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // 로그인 상태 확인
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        toast({
          variant: "destructive",
          title: "로그인이 필요합니다",
          description: "챌린지 수정을 위해 로그인해주세요.",
        });
        navigate("/user/login");
        return;
      }

      // 데이터 형식 변환
      const submitData = {
        challIdx: data.challIdx,
        challTitle: data.challTitle,
        challDescription: data.challDescription,
        challCategoryIdx: parseInt(data.challCategoryIdx, 10),
        minParticipationTime: parseInt(data.minParticipationTime, 10),
        maxParticipants: parseInt(data.maxParticipants, 10),
        challStartTime: data.challStartTime
          ? `${data.challStartTime}T10:00:00`
          : undefined,
        challEndTime: data.challEndTime
          ? `${data.challEndTime}T12:00:00`
          : undefined,
      };

      console.log("제출할 챌린지 수정 데이터:", submitData);

      // 챌린지 수정 API 요청
      const response = await axiosInstance.patch(
        `/challenges/admin/modify`,
        submitData,
        {
          headers: { Authorization: `${accessToken}` },
        }
      );

      console.log("챌린지 수정 성공:", response.data);

      toast({
        title: "챌린지 수정 성공",
        description: "챌린지가 성공적으로 수정되었습니다!",
      });

      // 성공 시 챌린지 목록 또는 상세 페이지로 이동
      // navigate("/challenge");
    } catch (error) {
      console.error("챌린지 수정 중 오류 발생:", error);
      toast({
        variant: "destructive",
        title: "챌린지 수정 실패",
        description: "챌린지 수정 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // 데이터 로딩 중일 때 로딩 표시
  if (!challengeData) {
    return <div>로딩 중...</div>;
  }

  return (
    <Form {...form}>
      <div className="max-w-4xl mx-auto py-6 space-y-8">
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => {
            console.log("유효성 검사 실패:", errors);
            toast({
              variant: "destructive",
              title: "입력 오류",
              description: "모든 필수 항목을 올바르게 입력해주세요.",
            });
          })}
          className="space-y-6"
        >
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>카테고리</CardTitle>
              <CardDescription>
                챌린지의 카테고리를 선택해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="challCategoryIdx"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="선택" />
                        </SelectTrigger>
                        <SelectContent className="bg-white">
                          {challengeCategories.map((category) => (
                            <SelectItem
                              key={category.challCategoryIdx}
                              value={String(category.challCategoryIdx)}
                            >
                              {category.challName}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>제목</CardTitle>
              <CardDescription>
                챌린지에 적절한 제목을 입력해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="challTitle"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        placeholder="예: 하루 독서 3시간 챌린지"
                        className="w-full"
                        maxLength={50}
                        onChange={(e) => {
                          field.onChange(e);
                          handleTitleChange(e);
                        }}
                      />
                    </FormControl>
                    <p className="text-sm text-gray-500 mt-2">
                      {titleLength}/50자
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>소개</CardTitle>
              <CardDescription>
                챌린지에 대한 자세한 설명을 적어주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="challDescription"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Textarea
                        {...field}
                        className="w-full"
                        maxLength={500}
                        onChange={(e) => {
                          field.onChange(e);
                          handleDescriptionChange(e);
                        }}
                      />
                    </FormControl>
                    <p className="text-sm text-gray-500 mt-2">
                      {descriptionLength}/500자
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>최소 참여 가능 시간 및 최대 참여 인원</CardTitle>
              <CardDescription>
                최소 참여 가능 시간과 최대 참여 인원을 설정해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="minParticipationTime"
                  render={({ field }) => (
                    <FormItem>
                      <Label className="text-gray-700">
                        참여 가능한 최소 시간
                      </Label>
                      <FormControl>
                        <Input {...field} type="number" min="1" />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="maxParticipants"
                  render={({ field }) => (
                    <FormItem>
                      <Label className="text-gray-700">최대 참여 인원</Label>
                      <FormControl>
                        <Input {...field} type="number" min="1" />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>챌린지 기간 설정</CardTitle>
              <CardDescription>
                챌린지의 시작일과 종료일을 설정해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="challStartTime">시작일</Label>
                  <Controller
                    control={form.control}
                    name="challStartTime"
                    render={({ field }) => (
                      <Input {...field} type="date" id="challStartTime" />
                    )}
                  />
                </div>
                <div className="flex-1 space-y-2">
                  <Label htmlFor="challEndTime">종료일</Label>
                  <Controller
                    control={form.control}
                    name="challEndTime"
                    render={({ field }) => (
                      <Input {...field} type="date" id="challEndTime" />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end space-x-4">
            {/* <Button
              variant="outline"
              type="button"
              onClick={() => navigate(-1)}
            >
              취소
            </Button> */}
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "수정 중..." : "수정하기"}
            </Button>
          </div>
        </form>
      </div>
    </Form>
  );
};

export default ChallengeModifyForm;

// import { useState, useEffect } from "react";
// import {
//   Card,
//   CardContent,
//   CardHeader,
//   CardTitle,
//   CardDescription,
// } from "@/components/ui/card";
// import { Input } from "@/components/ui/input";
// import { Button } from "@/components/ui/button";
// import { Label } from "@/components/ui/label";
// import { Textarea } from "@/components/ui/textarea";
// import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// import * as z from "zod";
// import { useForm, Controller } from "react-hook-form";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useNavigate, useParams } from "react-router-dom";
// import axiosInstance from "@/api/axiosInstance";
// import {
//   Form,
//   FormField,
//   FormItem,
//   FormControl,
//   FormMessage,
// } from "@/components/ui/form";
// import { useToast } from "@/components/ui/use-toast";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "@/components/ui/select";

// // 유효성 검사 스키마
// const challengeEditSchema = z.object({
//   challIdx: z.number(),
//   challTitle: z.string().min(1, "제목을 입력해주세요"),
//   challDescription: z.string().min(1, "설명을 입력해주세요"),
//   challCategoryIdx: z.string().min(1, "카테고리를 선택해주세요"),
//   minParticipationTime: z.string().min(1, "최소 참여 시간을 입력해주세요"),
//   maxParticipants: z.string().min(1, "최대 참여 인원을 입력해주세요"),
//   challStartTime: z.string().optional(),
//   challEndTime: z.string().optional(),
// });

// const ChallengeModifyForm = () => {
//   const navigate = useNavigate();
//   const { toast } = useToast();
//   const { challIdx } = useParams(); // URL에서 챌린지 ID 가져오기

//   const [challengeCategories, setChallengeCategories] = useState([]);
//   const [isSubmitting, setIsSubmitting] = useState(false);
//   const [titleLength, setTitleLength] = useState(0);
//   const [descriptionLength, setDescriptionLength] = useState(0);

//   // 더미 데이터
//   const dummyData = {
//     challIdx: 81,
//     challTitle: "수정한 챌린지입니다",
//     challDescription: "가나다가가가ㅋㅋ",
//     challCategoryIdx: 5,
//     minParticipationTime: 1,
//     maxParticipants: 2,
//     challStartTime: "2025-02-15T12:00:00",
//     challEndTime: "2025-02-16T12:00:00",
//   };

//   const form = useForm({
//     resolver: zodResolver(challengeEditSchema),
//     mode: "onChange",
//     defaultValues: {
//       challIdx: dummyData.challIdx,
//       challTitle: dummyData.challTitle,
//       challDescription: dummyData.challDescription,
//       challCategoryIdx: String(dummyData.challCategoryIdx),
//       minParticipationTime: String(dummyData.minParticipationTime),
//       maxParticipants: String(dummyData.maxParticipants),
//       challStartTime: dummyData.challStartTime.split("T")[0],
//       challEndTime: dummyData.challEndTime.split("T")[0],
//     },
//   });

//   useEffect(() => {
//     // 챌린지 카테고리 가져오기
//     const fetchChallengeCategories = async () => {
//       try {
//         const response = await axiosInstance.get(`/categories/challenge`);
//         setChallengeCategories(response.data);
//       } catch (error) {
//         console.error("챌린지 카테고리 데이터 가져오기 실패:", error);
//         toast({
//           variant: "destructive",
//           title: "카테고리 로딩 실패",
//           description: "카테고리 정보를 불러오는데 실패했습니다.",
//         });
//       }
//     };

//     fetchChallengeCategories();
//   }, [toast]);

//   const handleTitleChange = (e) => {
//     const inputValue = e.target.value;
//     if (inputValue.length <= 50) {
//       setTitleLength(inputValue.length);
//     }
//   };

//   const handleDescriptionChange = (e) => {
//     const inputValue = e.target.value;
//     if (inputValue.length <= 500) {
//       setDescriptionLength(inputValue.length);
//     }
//   };

//   const onSubmit = async (data) => {
//     setIsSubmitting(true);

//     try {
//       // 로그인 상태 확인
//       const accessToken = localStorage.getItem("accessToken");
//       if (!accessToken) {
//         toast({
//           variant: "destructive",
//           title: "로그인이 필요합니다",
//           description: "챌린지 수정을 위해 로그인해주세요.",
//         });
//         navigate("/user/login");
//         return;
//       }

//       // 데이터 형식 변환
//       const submitData = {
//         challIdx: data.challIdx,
//         challTitle: data.challTitle,
//         challDescription: data.challDescription,
//         challCategoryIdx: parseInt(data.challCategoryIdx, 10),
//         minParticipationTime: parseInt(data.minParticipationTime, 10),
//         maxParticipants: parseInt(data.maxParticipants, 10),
//         challStartTime: data.challStartTime
//           ? `${data.challStartTime}T10:00:00`
//           : undefined,
//         challEndTime: data.challEndTime
//           ? `${data.challEndTime}T12:00:00`
//           : undefined,
//       };

//       console.log("제출할 챌린지 수정 데이터:", submitData);

//       // 챌린지 수정 API 요청
//       const response = await axiosInstance.patch(
//         "/challenges/admin/modify",
//         submitData,
//         {
//           headers: { Authorization: `${accessToken}` },
//         }
//       );

//       console.log("챌린지 수정 성공:", response.data);

//       toast({
//         title: "챌린지 수정 성공",
//         description: "챌린지가 성공적으로 수정되었습니다!",
//       });

//       // 성공 시 챌린지 목록 또는 상세 페이지로 이동
//       navigate("/challenge");
//     } catch (error) {
//       console.error("챌린지 수정 중 오류 발생:", error);
//       toast({
//         variant: "destructive",
//         title: "챌린지 수정 실패",
//         description: "챌린지 수정 중 오류가 발생했습니다. 다시 시도해주세요.",
//       });
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   return (
//     <Form {...form}>
//       <div className="max-w-4xl mx-auto py-6 space-y-8">
//         <form
//           onSubmit={form.handleSubmit(onSubmit, (errors) => {
//             console.log("유효성 검사 실패:", errors);
//             toast({
//               variant: "destructive",
//               title: "입력 오류",
//               description: "모든 필수 항목을 올바르게 입력해주세요.",
//             });
//           })}
//           className="space-y-6"
//         >
//           <Card className="bg-white shadow-sm">
//             <CardHeader>
//               <CardTitle>카테고리</CardTitle>
//               <CardDescription>
//                 챌린지의 카테고리를 선택해주세요.
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <FormField
//                 control={form.control}
//                 name="challCategoryIdx"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormControl>
//                       <Select
//                         value={field.value}
//                         onValueChange={field.onChange}
//                       >
//                         <SelectTrigger>
//                           <SelectValue placeholder="선택" />
//                         </SelectTrigger>
//                         <SelectContent className="bg-white">
//                           {challengeCategories.map((category) => (
//                             <SelectItem
//                               key={category.challCategoryIdx}
//                               value={String(category.challCategoryIdx)}
//                             >
//                               {category.challName}
//                             </SelectItem>
//                           ))}
//                         </SelectContent>
//                       </Select>
//                     </FormControl>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </CardContent>
//           </Card>

//           <Card className="bg-white shadow-sm">
//             <CardHeader>
//               <CardTitle>제목</CardTitle>
//               <CardDescription>
//                 챌린지에 적절한 제목을 입력해주세요.
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <FormField
//                 control={form.control}
//                 name="challTitle"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormControl>
//                       <Input
//                         {...field}
//                         placeholder="예: 하루 독서 3시간 챌린지"
//                         className="w-full"
//                         maxLength={50}
//                         onChange={(e) => {
//                           field.onChange(e);
//                           handleTitleChange(e);
//                         }}
//                       />
//                     </FormControl>
//                     <p className="text-sm text-gray-500 mt-2">
//                       {titleLength}/50자
//                     </p>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </CardContent>
//           </Card>

//           <Card className="bg-white shadow-sm">
//             <CardHeader>
//               <CardTitle>소개</CardTitle>
//               <CardDescription>
//                 챌린지에 대한 자세한 설명을 적어주세요.
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <FormField
//                 control={form.control}
//                 name="challDescription"
//                 render={({ field }) => (
//                   <FormItem>
//                     <FormControl>
//                       <Textarea
//                         {...field}
//                         className="w-full"
//                         maxLength={500}
//                         onChange={(e) => {
//                           field.onChange(e);
//                           handleDescriptionChange(e);
//                         }}
//                       />
//                     </FormControl>
//                     <p className="text-sm text-gray-500 mt-2">
//                       {descriptionLength}/500자
//                     </p>
//                     <FormMessage />
//                   </FormItem>
//                 )}
//               />
//             </CardContent>
//           </Card>

//           <Card className="bg-white shadow-sm">
//             <CardHeader>
//               <CardTitle>최소 참여 가능 시간 및 최대 참여 인원</CardTitle>
//               <CardDescription>
//                 최소 참여 가능 시간과 최대 참여 인원을 설정해주세요.
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//                 <FormField
//                   control={form.control}
//                   name="minParticipationTime"
//                   render={({ field }) => (
//                     <FormItem>
//                       <Label className="text-gray-700">
//                         참여 가능한 최소 시간
//                       </Label>
//                       <FormControl>
//                         <Input {...field} type="number" min="1" />
//                       </FormControl>
//                       <FormMessage className="text-red-500 text-sm" />
//                     </FormItem>
//                   )}
//                 />

//                 <FormField
//                   control={form.control}
//                   name="maxParticipants"
//                   render={({ field }) => (
//                     <FormItem>
//                       <Label className="text-gray-700">최대 참여 인원</Label>
//                       <FormControl>
//                         <Input {...field} type="number" min="1" />
//                       </FormControl>
//                       <FormMessage className="text-red-500 text-sm" />
//                     </FormItem>
//                   )}
//                 />
//               </div>
//             </CardContent>
//           </Card>

//           <Card className="bg-white shadow-sm">
//             <CardHeader>
//               <CardTitle>챌린지 기간 설정</CardTitle>
//               <CardDescription>
//                 챌린지의 시작일과 종료일을 설정해주세요.
//               </CardDescription>
//             </CardHeader>
//             <CardContent>
//               <div className="flex flex-col md:flex-row gap-6">
//                 <div className="flex-1 space-y-2">
//                   <Label htmlFor="challStartTime">시작일</Label>
//                   <Controller
//                     control={form.control}
//                     name="challStartTime"
//                     render={({ field }) => (
//                       <Input {...field} type="date" id="challStartTime" />
//                     )}
//                   />
//                 </div>
//                 <div className="flex-1 space-y-2">
//                   <Label htmlFor="challEndTime">종료일</Label>
//                   <Controller
//                     control={form.control}
//                     name="challEndTime"
//                     render={({ field }) => (
//                       <Input {...field} type="date" id="challEndTime" />
//                     )}
//                   />
//                 </div>
//               </div>
//             </CardContent>
//           </Card>

//           <div className="flex justify-end space-x-4">
//             {/* <Button
//               variant="outline"
//               type="button"
//               onClick={() => navigate(-1)}
//             >
//               취소
//             </Button> */}
//             <Button type="submit" disabled={isSubmitting}>
//               {isSubmitting ? "수정 중..." : "수정하기"}
//             </Button>
//           </div>
//         </form>
//       </div>
//     </Form>
//   );
// };

// export default ChallengeModifyForm;
