import React from "react";
import ChallengeListForm from "@/components/challengeList";
// shadcn/ui 컴포넌트
import { Card, CardContent } from "@/components/ui/card";
import RoutineForm from "../../components/routine/create/RoutineForm";
import ChallengeForm from "@/components/challenge";

const ChallengeListPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <Card className="overflow-hidden">
          {/* 헤더 */}
          <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-8 text-white">
            <h1 className="text-3xl font-bold">챌린지 리스트</h1>
          </div>

          <CardContent className="p-1">
            <div className="space-y-4">
              <ChallengeListForm />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ChallengeListPage;
