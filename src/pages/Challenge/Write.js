import React from "react";

// shadcn/ui 컴포넌트
import { Card, CardContent } from "@/components/ui/card";
import RoutineForm from "../../components/routine/create/RoutineForm";
import ChallengeForm from "@/components/challenge";

const ChallengeWritePage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <h1 className="text-3xl font-bold">챌린지 만들기</h1>
          </div>

          <CardContent className="p-8">
            <div className="space-y-4">
              <h2 className="text-xl font-semibold">챌린지 작성</h2>
              <ChallengeForm />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChallengeWritePage;
