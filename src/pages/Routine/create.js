import React, { useState } from 'react';
import { PlusCircle, Calendar, Star, Repeat, Info } from 'lucide-react';
import ActivityCard from '../../components/routine/ActivityCard';
import InterestBadges from '../../components/routine/InterestBadges';
import WeekdaySelector from '../../components/routine/WeekdaySelector';

// shadcn/ui 컴포넌트
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import JobSelector from '@/components/routine/JobSelector';
import RoutineForm from '../../components/routine/create/RoutineForm';

const RoutineCreationPage = () => {

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <h1 className="text-3xl font-bold">새 루틴 만들기</h1>
            <p className="opacity-90 mt-2 text-blue-100">새로운 루틴으로 규칙적인 생활을 시작하세요</p>
          </div>

          <CardContent className="p-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">루틴 설정</h2>
              <RoutineForm />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default RoutineCreationPage;