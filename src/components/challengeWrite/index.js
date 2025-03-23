import { useState, useRef, useEffect } from "react";
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
import { useNavigate } from "react-router-dom";
import axiosInstance from "@/api/axiosInstance";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 유효성 검사 스키마
const signupSchema = z.object({
  challTitle: z.string().min(1, "제목을 입력해주세요"),
  challDescription: z.string().min(1, "설명을 입력해주세요"),
  challCategoryIdx: z.string().min(1, "카테고리를 선택해주세요"),
  totalClearTime: z.string().min(1, "총 클리어 시간을 입력해주세요"),
  minParticipationTime: z.string().min(1, "최소 참여 시간을 입력해주세요"),
  maxParticipants: z.string().min(1, "최대 참여 인원을 입력해주세요"),
  challState: z.enum(["0", "1"]),
  challStartTime: z.string().optional(),
  duration: z.string().min(1, "유지 기간을 입력해주세요"),
  userJoin: z.string().optional(),
});

const ChallengeForm = () => {
  const navigate = useNavigate();
  const { toast } = useToast();

  const [challengeType, setChallengeType] = useState("0");
  const [titleLength, setTitleLength] = useState(0);
  const [descriptionLength, setDescriptionLength] = useState(0);
  const [challengeCategories, setChallengeCategories] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const accessToken = localStorage.getItem("accessToken");
    if (!accessToken) {
      toast({
        variant: "destructive",
        title: "로그인이 필요합니다",
        description: "챌린지 작성을 위해 로그인해주세요.",
      });
      navigate("/user/login");
    }
  }, [navigate, toast]);

  useEffect(() => {
    const fetchChallengeCategories = async () => {
      try {
        const response = await axiosInstance.get(`api/categories/challenge`);
        // console.log("챌린지 카테고리 데이터:", response.data);
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

    fetchChallengeCategories();
  }, [toast]);

  const form = useForm({
    resolver: zodResolver(signupSchema),
    mode: "onChange", // 변경: onSubmit에서 onChange로 변경하여 실시간 유효성 검사
    defaultValues: {
      challTitle: "",
      challDescription: "",
      challCategoryIdx: "",
      totalClearTime: "",
      minParticipationTime: "",
      maxParticipants: "",
      challState: "0",
      challStartTime: "",
      duration: "",
      userJoin: "",
    },
  });

  const {
    formState: { errors },
  } = form;

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

  // challengeType이 변경될 때마다 challState 값 업데이트
  useEffect(() => {
    form.setValue("challState", challengeType);
  }, [challengeType, form]);

  // 챌린지 작성 API 요청 함수
  const onSubmit = async (data) => {
    setIsSubmitting(true);

    try {
      // 로그인 상태 확인
      const accessToken = localStorage.getItem("accessToken");
      if (!accessToken) {
        toast({
          variant: "destructive",
          title: "로그인이 필요합니다",
          description: "챌린지 작성을 위해 로그인해주세요.",
        });
        navigate("/user/login");
        return;
      }

      // 데이터 형식 변환
      const submitData = {
        ...data,
        challState: "PUBLISHED", // "0" 또는 "1" 대신 항상 "PUBLISHED" 사용
        minParticipationTime: parseInt(data.minParticipationTime, 10),
        totalClearTime: parseInt(data.totalClearTime, 10),
        maxParticipants: parseInt(data.maxParticipants, 10),
        duration: parseInt(data.duration, 10),
        challCategoryIdx: isNaN(parseInt(data.challCategoryIdx, 10))
          ? null
          : parseInt(data.challCategoryIdx, 10),
        // 날짜 형식 올바르게 지정
        challStartTime:
          challengeType === "0" && data.challStartTime
            ? `${data.challStartTime}T10:00:00`
            : null,
        userJoin: challengeType === "0" ? 0 : 1,
      };

      console.log("제출할 챌린지 데이터:", submitData);

      const response = await axiosInstance.post(
        "/challenges/admin/create",
        submitData,
        {
          headers: { Authorization: `${accessToken}` },
        }
      );

      console.log("챌린지 생성 성공:", response.data);

      toast({
        title: "챌린지 생성 성공",
        description: "챌린지가 성공적으로 생성되었습니다!",
      });

      // 성공 시 챌린지 목록 페이지로 이동
      // navigate("/challenge");
    } catch (error) {
      console.error("챌린지 생성 중 오류 발생:", error);
      toast({
        variant: "destructive",
        title: "챌린지 생성 실패",
        description: "챌린지 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

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
                          {challengeCategories.length > 0 ? (
                            challengeCategories.map((category) => (
                              <SelectItem
                                key={category.challCategoryIdx}
                                value={String(category.challCategoryIdx)}
                              >
                                {category.challName}
                              </SelectItem>
                            ))
                          ) : (
                            <SelectGroup>
                              <SelectLabel>카테고리 없음</SelectLabel>
                            </SelectGroup>
                          )}
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
              <CardTitle>최소 참여 가능 시간 및 총 클리어 시간</CardTitle>
              <CardDescription>
                최소 참여 가능 시간과 총 클리어 시간을 설정해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <FormField
                  control={form.control}
                  name="minParticipationTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-gray-700">
                        참여 가능한 최소 시간
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="number"
                          id="minParticipationTime"
                          min="1"
                        />
                      </FormControl>
                      <FormMessage className="text-red-500 text-sm" />
                    </FormItem>
                  )}
                />

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
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white shadow-sm">
            <CardHeader>
              <CardTitle>최대 참여 가능 인원</CardTitle>
              <CardDescription>
                최대 참여 가능한 인원을 설정해주세요.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FormField
                control={form.control}
                name="maxParticipants"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        className="w-full"
                        type="number"
                        id="maxParticipants"
                        min="1"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
          </Card>

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

          <div className="flex justify-end space-x-4">
            <Button
              variant="outline"
              type="button"
              onClick={() => navigate(-1)}
            >
              취소
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "제출 중..." : "생성하기"}
            </Button>
          </div>
        </form>
      </div>
    </Form>
  );
};

export default ChallengeForm;
