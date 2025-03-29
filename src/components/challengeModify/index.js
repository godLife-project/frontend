import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axiosInstance from "@/api/axiosInstance";
import { useToast } from "@/components/ui/use-toast";
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
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

// 유효성 검사 스키마
const challengeEditSchema = z.object({
  challIdx: z.number(),
  challTitle: z.string().min(1, "제목을 입력해주세요"),
  challDescription: z.string().min(1, "설명을 입력해주세요"),
  challCategoryIdx: z.string().min(1, "카테고리를 선택해주세요"),
  minParticipationTime: z.string().min(1, "최소 참여 시간을 입력해주세요"),
  totalClearTime: z.string().min(1, "총 클리어 시간을 입력해주세요"),
  maxParticipants: z.string().min(1, "최대 참여 인원을 입력해주세요"),
  challState: z.enum(["0", "1"]),
  challStartTime: z.string().optional(),
  duration: z.string().min(1, "유지 기간을 입력해주세요"),
  userJoin: z.string().optional(),
});

const ChallengeModifyPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { challIdx } = useParams();

  const [challengeCategories, setChallengeCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [titleLength, setTitleLength] = useState(0);
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [challengeData, setChallengeData] = useState(null);
  const [challengeType, setChallengeType] = useState("0");

  // 챌린지 카테고리 및 상세 정보 로드
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 카테고리 정보 로드
        const categoriesResponse = await axiosInstance.get(
          "/categories/challenge"
        );
        setChallengeCategories(categoriesResponse.data);

        // 챌린지 상세 정보 로드
        const detailResponse = await axiosInstance.get(
          `/challenges/detail/${challIdx}`
        );
        const challengeDetails = detailResponse.data;

        setChallengeData(challengeDetails);
        setChallengeType(challengeDetails.userJoin === 0 ? "0" : "1");

        // 폼 기본값 설정
        form.reset({
          challIdx: challengeDetails.challIdx,
          challTitle: challengeDetails.challTitle,
          challDescription: challengeDetails.challDescription,
          challCategoryIdx: String(challengeDetails.challCategoryIdx),
          minParticipationTime: String(challengeDetails.minParticipationTime),
          totalClearTime: String(challengeDetails.totalClearTime || 0),
          maxParticipants: String(challengeDetails.maxParticipants),
          challState: challengeDetails.userJoin === 0 ? "0" : "1",
          challStartTime: challengeDetails.challStartTime
            ? challengeDetails.challStartTime.split("T")[0]
            : undefined,
          duration: String(challengeDetails.duration || 1),
          userJoin: String(challengeDetails.userJoin),
        });

        // 제목, 설명 길이 초기화
        setTitleLength(challengeDetails.challTitle.length);
        setDescriptionLength(challengeDetails.challDescription.length);
      } catch (error) {
        console.error("데이터 로딩 실패:", error);
        toast({
          variant: "destructive",
          title: "챌린지 정보 로딩 실패",
          description: "챌린지 정보를 불러오는 데 실패했습니다.",
        });
        navigate("/challenge");
      }
    };

    fetchData();
  }, [challIdx, navigate, toast]);

  // 폼 Hook 초기화
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
          totalClearTime: String(challengeData.totalClearTime || 0),
          maxParticipants: String(challengeData.maxParticipants),
          challState: challengeData.userJoin === 0 ? "0" : "1",
          challStartTime: challengeData.challStartTime
            ? challengeData.challStartTime.split("T")[0]
            : undefined,
          duration: String(challengeData.duration || 1),
          userJoin: String(challengeData.userJoin),
        }
      : {},
  });

  // 제목 길이 핸들러
  const handleTitleChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue.length <= 50) {
      setTitleLength(inputValue.length);
    }
  };

  // 설명 길이 핸들러
  const handleDescriptionChange = (e) => {
    const inputValue = e.target.value;
    if (inputValue.length <= 500) {
      setDescriptionLength(inputValue.length);
    }
  };

  // 챌린지 유형 및 챌린지 상태 변경 핸들러
  useEffect(() => {
    form.setValue("challState", challengeType);
    form.setValue("userJoin", challengeType === "0" ? "0" : "1");
  }, [challengeType, form]);

  // 폼 제출 핸들러
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
        challState: "PUBLISHED",
      };

      // 선택적으로 포함
      if (challengeType === "0" && data.challStartTime) {
        submitData.challStartTime = `${data.challStartTime}T10:00:00`;
      }

      if (data.totalClearTime) {
        submitData.totalClearTime = parseInt(data.totalClearTime, 10);
      }

      if (data.duration) {
        submitData.duration = parseInt(data.duration, 10);
      }

      submitData.userJoin = challengeType === "0" ? 0 : 1;

      // 챌린지 수정 API 요청
      const response = await axiosInstance.patch(
        `/challenges/admin/modify`,
        submitData,
        {
          headers: { Authorization: `Bearer ${accessToken}` },
        }
      );

      toast({
        title: "챌린지 수정 성공",
        description: "챌린지가 성공적으로 수정되었습니다!",
      });

      console.log("accessToken:", accessToken);

      // 성공 시 챌린지 상세 페이지로 이동
      navigate(`/challenges/detail/${challIdx}`);
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

  // 데이터 로딩 중 표시
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
          {/* 카테고리 선택 카드 */}
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

          {/* 제목 입력 카드 */}
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

          {/* 설명 입력 카드 */}
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

          {/* 최소 참여 시간 및 최대 참여 인원 카드 */}
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

          {/* 총 클리어 시간 카드 추가 */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>총 클리어 시간</CardTitle>
              <CardDescription>총 클리어 시간을 설정해주세요.</CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="totalClearTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">
                      총 클리어 시간
                    </FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        id="totalClearTime"
                        min="1"
                      />
                    </FormControl>
                    <FormMessage className="text-red-500 text-sm" />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 챌린지 유형 카드 추가 */}
          <Card className="bg-white">
            <CardHeader>
              <CardTitle>챌린지 유형</CardTitle>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="challState"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <RadioGroup
                        className="flex space-x-4"
                        value={challengeType}
                        onValueChange={(value) => {
                          setChallengeType(value);
                          field.onChange(value);
                        }}
                      >
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="0" id="admin-challenge" />
                          <Label htmlFor="admin-challenge">
                            관리자 개입형 챌린지
                          </Label>
                        </div>
                        <div className="flex items-center space-x-2">
                          <RadioGroupItem value="1" id="user-challenge" />
                          <Label htmlFor="user-challenge">
                            유저 참여형 챌린지
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

          {/* 챌린지 기간 설정 카드 추가 */}
          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>챌린지 기간 설정</CardTitle>
              <CardDescription>
                {challengeType === "0"
                  ? "시작일과 챌린지 유지 기간을 설정해주세요."
                  : "챌린지 유지 시간을 설정해주세요."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col md:flex-row gap-6">
                {challengeType === "0" && (
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
                )}

                <div className="flex-1 space-y-2">
                  <Label htmlFor="duration">유지 기간 (일)</Label>
                  <Controller
                    control={form.control}
                    name="duration"
                    render={({ field }) => (
                      <Input
                        {...field}
                        type="number"
                        id="duration"
                        min="1"
                        className="w-full"
                      />
                    )}
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 제출 버튼 */}
          <div className="flex justify-end space-x-4">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? "수정 중..." : "수정하기"}
            </Button>
          </div>
        </form>
      </div>
    </Form>
  );
};

export default ChallengeModifyPage;
