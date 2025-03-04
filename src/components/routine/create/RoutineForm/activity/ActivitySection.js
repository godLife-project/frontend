// src/components/routine/create/RoutineForm/ActivitiesSection.js
import React, { useState } from "react";
import { useFieldArray } from "react-hook-form";
import { Plus, Clock, Trash2, AlarmClock, FileText, Star } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import StarRating from "@/components/common/starRating/StarRating";
import ActivitiesTimeline from "./ActivitiesTimeline";

function ActivitiesSection({ control }) {
  const { fields, append, remove } = useFieldArray({
    control,
    name: "activities",
  });

  // 새 활동 추가
  const addActivity = () => {
    append({
      activityName: "",
      startTime: "08:00",
      duration: 30,
      memo: "",
      importance: 3, // 기본 중요도 3으로 설정
    });
  };

  return (
    <div className="space-y-4">
      {/* 헤더 제거하고 버튼만 오른쪽 정렬 */}
      <div className="flex justify-end">
        <Button
          type="button"
          size="sm"
          onClick={addActivity}
          className="flex items-center gap-1 bg-blue-500"
        >
          <Plus className="h-4 w-4" />새 활동 추가
        </Button>
      </div>

      {fields.length === 0 && (
        <div className="text-center py-8 border border-dashed rounded-lg bg-muted/50">
          <AlarmClock className="mx-auto h-12 w-12 text-muted-foreground mb-2" />
          <p className="text-muted-foreground">
            활동을 추가하여 루틴을 만들어보세요
          </p>
        </div>
      )}

      {fields.map((field, index) => (
        <Card key={field.id} className="p-4 relative">
          <div className="flex justify-between items-center mb-2">
            <Badge className="bg-blue-500">{index + 1}번 활동</Badge>
            {/* 삭제 버튼을 오른쪽으로 이동 */}
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="text-red-500 hover:text-red-700 hover:bg-red-50 p-2"
              onClick={() => remove(index)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* 활동 이름 */}
            <FormField
              control={control}
              name={`activities.${index}.activityName`}
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>활동 이름</FormLabel>
                  <FormControl>
                    <Input placeholder="예: 아침 운동, 독서 등" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 시작 시간 */}
            <FormField
              control={control}
              name={`activities.${index}.setTime`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>시작 시간</FormLabel>
                  <FormControl>
                    <Input type="time" placeholder="HH:MM" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* 중요도 표시 */}
            <FormField
              control={control}
              name={`activities.${index}.activityImp`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                    중요도
                  </FormLabel>
                  <FormControl>
                    <div className="pt-1">
                      <StarRating
                        control={control}
                        name={`activities.${index}.activityImp`}
                        maxRating={5}
                        required={true}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* 한줄 메모 필드 */}
          <FormField
            control={control}
            name={`activities.${index}.description`}
            render={({ field }) => (
              <FormItem>
                <FormLabel className="flex items-center gap-1">
                  <FileText className="h-3.5 w-3.5" />
                  한줄 메모
                </FormLabel>
                <FormControl>
                  <Input
                    placeholder="활동에 대한 간단한 메모를 남겨보세요"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </Card>
      ))}

      {/* 타임라인 미리보기 */}
      {fields.length > 0 && (
        <>
          <Separator className="my-4" />
          <ActivitiesTimeline control={control} />
        </>
      )}
    </div>
  );
}

export default ActivitiesSection;
